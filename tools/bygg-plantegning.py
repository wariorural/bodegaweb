"""
Gjør arkitektens CAD-eksport om til en tegning som hører hjemme på /utleie.
Kjøres på nytt hvis arkitekten sender en ny versjon.

Original: 3,7 MB, 57 602 <line>. Nesten alt er skravur i nær-hvitt (#dbdbdb,
#f0f0f0, #f4f4f4) — tresliten inni bordene og gulvmønster. Usynlig uansett, og
helt usynlig mot det røde.
"""
import re, sys, math, xml.etree.ElementTree as ET

SVG = 'http://www.w3.org/2000/svg'
ET.register_namespace('', SVG)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')

SKRAVUR   = {'st8', 'st4', 'st1'}   # nær-hvit tekstur
HJELP     = {'st3', 'st7'}          # grå målsettingslinjer
HVIT_MASK = {'st106'}               # hvite dekkflater, lå over skravuren
VENSTRE_GRENSE = 78                 # målsettingsapparatet ligger utenfor bygget
# Flater uten fill-attributt arver svart. Alle formtypene må med — det holdt
# ikke å ta rect og path: ett enkelt <polygon> var hele fasadebjelken.
FLATER = ('rect', 'path', 'polygon', 'polyline', 'circle', 'ellipse')

# Cremefargen arves fra siden via currentColor, så tegningen følger med hvis
# fargene på /utleie endrer seg.
STIL = """
    /* Legges etter arkitektens egne regler, så disse vinner. */
    .st0, .st5, .st6 { stroke: currentColor; }
    .st5, .st6 { stroke-width: .9px; }
    .st0 { stroke-width: .35px; opacity: .8; }
    text { fill: currentColor; }
  """

def navn(e):
    return e.tag.split('}')[-1]

def klasser(e):
    return set((e.get('class') or '').split())

def fjern(rot, test):
    n = 0
    for mor in rot.iter():
        for b in list(mor):
            if test(b):
                mor.remove(b); n += 1
    return n

def tomme_grupper(rot):
    n = 0
    while True:
        runde = fjern(rot, lambda e: navn(e) == 'g' and len(e) == 0)
        if not runde: break
        n += runde
    return n

def malekryss(rot):
    """
    Målsettingen markeres med små kryss: fire korte streker ut fra samme punkt.
    Ingenting i selve bygget ser slik ut, så mønsteret er trygt å gå etter —
    tryggere enn å kutte på område, for inngangspartiet nede til venstre ligger
    midt i det som ellers ser ut som utenfor.
    """
    from collections import defaultdict
    ut = defaultdict(list)
    for mor in rot.iter():
        for e in mor:
            if navn(e) != 'line': continue
            x1, y1, x2, y2 = (float(e.get(k, 0)) for k in ('x1', 'y1', 'x2', 'y2'))
            if math.hypot(x2 - x1, y2 - y1) < 7:
                ut[(round(x1, 1), round(y1, 1))].append((mor, e))

    sentre = [pkt for pkt, treff in ut.items() if len(treff) >= 4]
    n = 0
    for pkt in sentre:
        for mor, e in ut[pkt]:
            try: mor.remove(e); n += 1
            except ValueError: pass

    # Hjelpelinjene som går ut fra kryssene følger med.
    for mor in rot.iter():
        for e in list(mor):
            if navn(e) != 'line': continue
            x1, y1, x2, y2 = (float(e.get(k, 0)) for k in ('x1', 'y1', 'x2', 'y2'))
            if math.hypot(x2 - x1, y2 - y1) < 12: continue
            if any(math.hypot(x - cx, y - cy) < 3
                   for (cx, cy) in sentre for (x, y) in ((x1, y1), (x2, y2))):
                mor.remove(e); n += 1
    return n


def boks(rot):
    """Omtrentlig innholdsboks. Paths leses med regex — godt nok til en ramme."""
    xs, ys = [], []
    for e in rot.iter():
        t = navn(e)
        if t == 'line':
            xs += [float(e.get('x1', 0)), float(e.get('x2', 0))]
            ys += [float(e.get('y1', 0)), float(e.get('y2', 0))]
        elif t == 'rect':
            x, y = float(e.get('x', 0)), float(e.get('y', 0))
            xs += [x, x + float(e.get('width', 0))]
            ys += [y, y + float(e.get('height', 0))]
        elif t == 'text':
            m = re.search(r'translate\(([-\d.]+)[ ,]+([-\d.]+)\)', e.get('transform', ''))
            if m:
                xs.append(float(m.group(1))); ys.append(float(m.group(2)))
    return min(xs), min(ys), max(xs), max(ys)

def main(inn, ut):
    tre = ET.parse(inn); rot = tre.getroot()

    n1 = fjern(rot, lambda e: klasser(e) & (SKRAVUR | HJELP | HVIT_MASK))
    n2 = fjern(rot, lambda e: navn(e) == 'text' and 'rotate' in (e.get('transform') or ''))
    n3 = fjern(rot, lambda e: navn(e) == 'line'
               and min(float(e.get('x1', 0)), float(e.get('x2', 0))) < VENSTRE_GRENSE)
    n4b = malekryss(rot)
    n4 = tomme_grupper(rot)

    # Klippene røres ikke: de settes via CSS-klasser, ikke attributter, så det
    # er ikke mulig å se her hvilke som er i bruk. Fjerner man dem, renner
    # flatene utover hele tegningen.
    n5 = 0

    n6 = 0
    for e in rot.iter():
        if navn(e) in FLATER and not e.get('class') and not e.get('fill'):
            e.set('fill', 'currentColor'); n6 += 1

    # Illustrators egne fonter og farger ut — teksten skal arve Neureal.
    for e in rot.iter(f'{{{SVG}}}text'):
        for a in ('font-family', 'fill', 'style'):
            e.attrib.pop(a, None)

    for e in rot.iter(f'{{{SVG}}}style'):
        e.text = (e.text or '') + STIL

    x0, y0, x1, y1 = boks(rot)
    luft = 4
    rot.set('viewBox', f'{x0-luft:.1f} {y0-luft:.1f} {x1-x0+2*luft:.1f} {y1-y0+2*luft:.1f}')
    for a in ('width', 'height'):
        rot.attrib.pop(a, None)

    tre.write(ut, encoding='unicode', xml_declaration=True)
    print(f'skravur/hjelp/maske: {n1}  måltekst: {n2}  hjelpelinjer: {n3}  '
          f'målekryss: {n4b}  tomme grupper: {n4}  fylte flater: {n6}')
    print(f'viewBox: {rot.get("viewBox")}')

main(sys.argv[1], sys.argv[2])
