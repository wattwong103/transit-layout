"""Plan-only context check (pyproj + shapely); no station elevations are inferred."""
import hashlib
import json
import math
from pathlib import Path
from pyproj import Transformer
from shapely.geometry import Polygon
from shapely.ops import unary_union

source = json.loads(Path('public/evidence/ginza-jr-alignment.json').read_text())
city_path = Path('public/plateau/station-city.json')
city = json.loads(city_path.read_text())
origin = json.loads(Path('public/plateau/reference.json').read_text())['originWgs84']
transformer = Transformer.from_crs(4979, 4978, always_xy=True)
center = transformer.transform(*origin)
lon, lat = map(math.radians, origin[:2])

def local(point):
    x, y, z = [a-b for a, b in zip(transformer.transform(*point, 0), center)]
    return [-math.sin(lon)*x + math.cos(lon)*y,
            math.sin(lat)*math.cos(lon)*x + math.sin(lat)*math.sin(lon)*y - math.cos(lat)*z]

envelopes = [(b['id'], unary_union([Polygon(p[0], p[1:]) for p in b['parts']])) for b in city['buildings']]
rows = []
for record in source['platforms']:
    outer = next(r for r in record['rings'] if r['role'] == 'outer')
    holes = [list(map(local, r['coordinates'])) for r in record['rings'] if r['role'] == 'inner']
    polygon = Polygon(list(map(local, outer['coordinates'])), holes)
    assert polygon.is_valid and polygon.area > 0
    hits = [(identity, polygon.intersection(p)) for identity, p in envelopes if polygon.intersects(p)]
    hits = [(identity, p) for identity, p in hits if p.area > .01]
    union = unary_union([p for _, p in hits])
    box = list(polygon.minimum_rotated_rectangle.exterior.coords)
    lengths = [math.dist(box[i], box[i+1]) for i in range(4)]
    rows.append(dict(spaceId=record['spaceId'], areaM2=round(polygon.area, 2),
                     boundingLengthM=round(max(lengths), 2), boundingWidthM=round(min(lengths), 2),
                     mappedOpenings=len(holes),
                     projectedEnvelopeCoveragePercent=round(100*union.area/polygon.area, 2),
                     intersections=[dict(featureId=i, coveragePercent=round(100*p.area/polygon.area, 2))
                                    for i, p in sorted(hits, key=lambda hit: -hit[1].area)]))

result = dict(checkedOn='2026-10-11', citySha256=hashlib.sha256(city_path.read_bytes()).hexdigest(),
              sourceHashEncoding='UTF-8 with LF line endings',
              platformSourceSha256=hashlib.sha256(Path('public/evidence/ginza-jr-alignment.json').read_bytes().replace(b'\r\n', b'\n')).hexdigest(),
              method='Independent pyproj ECEF to east/south conversion; Shapely intersection with union of projected PLATEAU envelopes, preserving source holes.',
              limitation='Plan overlap only, not interior clearance, current construction or floor-height verification. Mostly 2021 surveys predate JR 2023/2024 changes. Bounding dimensions are polygon extents, not operational platform lengths.',
              platforms=rows)
target = Path('public/evidence/ginza-jr-plateau-check.json')
target.write_text(json.dumps(result, separators=(',', ':'))+'\n', encoding='utf-8', newline='\n')
print(json.dumps(result, indent=2))
