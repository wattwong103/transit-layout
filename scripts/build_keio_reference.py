"""Extract only the two reviewed Keio platform outlines; no live browser payload."""
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

source = Path('.cache/shibuya-osm.xml')
raw = source.read_bytes()
root = ET.fromstring(raw)
nodes = {n.get('id'): [float(n.get('lon')), float(n.get('lat'))] for n in root.findall('node')}
platforms = []
for way_id, space_id in [('1349961222', 'keio-platform'), ('1349961223', 'keio-arrival-platform')]:
    way = next(w for w in root.findall('way') if w.get('id') == way_id)
    platforms.append(dict(spaceId=space_id, wayId=way_id, version=int(way.get('version')),
                          updatedAt=way.get('timestamp'), sourceUrl=f'https://www.openstreetmap.org/way/{way_id}',
                          coordinates=[nodes[n.get('ref')] for n in way.findall('nd')][:-1]))
result = dict(checkedOn='2026-10-10', license='ODbL-1.0',
              attribution='OpenStreetMap contributors', licenseUrl='https://www.openstreetmap.org/copyright',
              sourceSha256=hashlib.sha256(raw).hexdigest(),
              floorSource='https://www.keio.co.jp/train/station/station_map/pdf/in01_shibuya_floor_map.pdf',
              buildingSectionSource='https://www.s-markcity.co.jp/office/pdf/office.pdf?up=20240311',
              note='Public-map platform outlines, not a survey. Gate and stair positions are inferred locally; elevations remain unverified.',
              platforms=platforms)
target = Path('public/evidence/keio-alignment.json')
target.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
print(f'{target}: {target.stat().st_size} bytes')
