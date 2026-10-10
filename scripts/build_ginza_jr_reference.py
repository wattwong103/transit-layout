"""Small, reproducible extract from the reviewed OSM full-API responses.

Fetch the three API URLs below into .cache/ginza-jr-alignment before running.
Operator floor plans establish floor names, not WGS84 positions or elevations.
"""
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

platforms = []
for kind, identity, space, floor in [
    ('way', '759134298', 'ginza-platform', '3F'),
    ('relation', '18546084', 'jr-west-platform', '2F'),
    ('relation', '18546085', 'jr-east-platform', '2F'),
]:
    raw = Path(f'.cache/ginza-jr-alignment/{kind}-{identity}.xml').read_bytes()
    root = ET.fromstring(raw)
    feature = next(e for e in root.findall(kind) if e.get('id') == identity)
    nodes = {n.get('id'): [float(n.get('lon')), float(n.get('lat'))] for n in root.findall('node')}
    ways = {w.get('id'): w for w in root.findall('way')}
    members = [(identity, 'outer')] if kind == 'way' else [(m.get('ref'), m.get('role')) for m in feature.findall('member')]
    rings = []
    for way_id, role in members:
        way = ways[way_id]
        coords = [nodes[n.get('ref')] for n in way.findall('nd')]
        assert coords[0] == coords[-1], 'Only complete closed rings are supported'
        rings.append(dict(role=role, wayId=way_id, version=int(way.get('version')),
                          updatedAt=way.get('timestamp'), coordinates=coords[:-1]))
    assert sum(r['role'] == 'outer' for r in rings) == 1
    platforms.append(dict(spaceId=space, floor=floor, kind=kind, id=identity,
                          version=int(feature.get('version')), updatedAt=feature.get('timestamp'),
                          sourceUrl=f'https://www.openstreetmap.org/{kind}/{identity}',
                          apiUrl=f'https://api.openstreetmap.org/api/0.6/{kind}/{identity}/full',
                          sha256=hashlib.sha256(raw).hexdigest(), rings=rings))

result = dict(checkedOn='2026-10-10', license='ODbL-1.0', attribution='OpenStreetMap contributors',
              licenseUrl='https://www.openstreetmap.org/copyright',
              floorSources=dict(ginza='https://www.tokyometro.jp/station/shibuya/index.html',
                                jr='https://www.jreast.co.jp/estation/stations/808.html'),
              note='Public-map outlines and mapped voids, not surveyed interior geometry. Gate and equipment coordinates remain inferred. All elevations are unverified. PLATEAU survey predates JR 2023/2024 changes.',
              platforms=platforms)
target = Path('public/evidence/ginza-jr-alignment.json')
target.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
print(f'{target}: {target.stat().st_size} bytes')
