"""Independent WGS84/geodesic and Shapely size checks for the five public platforms."""
import hashlib
import json
import math
from pathlib import Path
from pyproj import Geod, Transformer
from shapely.geometry import Polygon, LineString

paths = [Path('public/evidence/ginza-jr-alignment.json'), Path('public/evidence/keio-alignment.json')]
first, second = [json.loads(p.read_text()) for p in paths]
records = first['platforms'] + [dict(spaceId=p['spaceId'], rings=[dict(role='outer', coordinates=p['coordinates'])]) for p in second['platforms']]
origin = json.loads(Path('public/plateau/reference.json').read_text())['originWgs84']
transform = Transformer.from_crs(4979, 4978, always_xy=True)
center = transform.transform(*origin)
lon, lat = map(math.radians, origin[:2])
geod = Geod(ellps='WGS84')

def local(point):
    x, y, z = [a-b for a,b in zip(transform.transform(*point, 0), center)]
    return [-math.sin(lon)*x+math.cos(lon)*y,
            math.sin(lat)*math.cos(lon)*x+math.sin(lat)*math.sin(lon)*y-math.cos(lat)*z]

rows = []
for record in records:
    rings = record['rings']
    outer = next(r['coordinates'] for r in rings if r['role'] == 'outer')
    holes = [r['coordinates'] for r in rings if r['role'] == 'inner']
    polygon = Polygon(list(map(local, outer)), [list(map(local,h)) for h in holes])
    assert polygon.is_valid
    box = list(polygon.minimum_rotated_rectangle.exterior.coords)
    lengths = [math.dist(box[i], box[i+1]) for i in range(4)]
    i = max(range(4), key=lambda i:lengths[i])
    a, b = box[i], box[i+1]
    u = [(b[k]-a[k])/lengths[i] for k in range(2)]
    v = [-u[1], u[0]]
    middle = [(a[k]+b[k])/2 for k in range(2)]
    section = LineString([[middle[k]+v[k]*d for k in range(2)] for d in [-500,500]]).intersection(Polygon(polygon.exterior))
    area = lambda r: abs(geod.polygon_area_perimeter(*zip(*r))[0])
    geodesic_area = area(outer)-sum(map(area,holes))
    outer_geodesic_perimeter = geod.polygon_area_perimeter(*zip(*outer))[1]
    relative_area_error = abs(geodesic_area-polygon.area)/geodesic_area
    relative_perimeter_error = abs(outer_geodesic_perimeter-polygon.exterior.length)/outer_geodesic_perimeter
    assert max(relative_area_error, relative_perimeter_error) < 1e-6, record['spaceId']
    rows.append(dict(spaceId=record['spaceId'], lengthM=round(max(lengths),6), widthSpanM=round(min(lengths),6),
                     centreSectionM=round(section.length,6), areaM2=round(polygon.area,6),
                     geodesicAreaM2=round(geodesic_area,6), outerPerimeterM=round(outer_geodesic_perimeter,6),
                     areaDifferencePpm=round(relative_area_error*1e6,6), perimeterDifferencePpm=round(relative_perimeter_error*1e6,6)))
result = dict(checkedOn='2026-10-11',
              sourceHashEncoding='UTF-8 with LF line endings',
              sources=[dict(path=p.as_posix(),sha256=hashlib.sha256(p.read_bytes().replace(b'\r\n',b'\n')).hexdigest()) for p in paths],
              method='Independent pyproj WGS84 geodesic area/perimeter versus local ECEF projection; Shapely minimum-area rectangles and mid-axis outer cross-sections. Public holes only.',
              limitation='Map-derived dimensions, not a survey or clear walking width. Centre section is perpendicular to the enclosing rectangle axis; width varies along the platform. Displayed figures round to 0.1 m without implying that accuracy.',
              platforms=rows)
target = Path('public/evidence/platform-size-check.json')
target.write_text(json.dumps(result,separators=(',',':'))+'\n')
print(json.dumps(result,indent=2))
