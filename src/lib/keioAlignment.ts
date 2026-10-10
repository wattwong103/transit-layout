import source from "../../public/evidence/keio-alignment.json";
import type { ExplorerDataset, Point2 } from "../types/explorer";

/** Local correction only. The three original global fit controls stay frozen. */
export function alignKeio(
  original: ExplorerDataset,
  project: (longitude: number, latitude: number) => readonly [number, number, number],
  toDiagram: (point: Point2) => Point2,
): ExplorerDataset {
  const rings = source.platforms.map(p => p.coordinates.map(([lon, lat]): Point2 => {
    const local = project(lon, lat);
    return [local[0], local[2]];
  }));
  const [main, arrival] = rings;
  // Eastward station axis from the reviewed platform's west/east end midpoints.
  const start: Point2 = [(main[0][0]+main[14][0])/2, (main[0][1]+main[14][1])/2];
  const end: Point2 = [(main[6][0]+main[9][0])/2, (main[6][1]+main[9][1])/2];
  const length = Math.hypot(end[0]-start[0], end[1]-start[1]);
  const u: Point2 = [(end[0]-start[0])/length, (end[1]-start[1])/length];
  const v: Point2 = [-u[1], u[0]];
  const along = (p: Point2) => (p[0]-start[0])*u[0]+(p[1]-start[1])*u[1];
  const across = (p: Point2) => (p[0]-start[0])*v[0]+(p[1]-start[1])*v[1];
  // Cross-sections follow the tapered, curved platform instead of scaling it to a rectangle.
  function section(ring: Point2[], distance: number): [number, number] {
    const values = ring.map(along);
    const d = Math.max(Math.min(...values)+.01, Math.min(Math.max(...values)-.01, distance));
    const intersections: number[] = [];
    ring.forEach((p, i) => {
      const q=ring[(i+1)%ring.length], a=values[i], b=values[(i+1)%ring.length];
      if ((a<=d && b>d) || (b<=d && a>d)) intersections.push(across(p)+(across(q)-across(p))*(d-a)/(b-a));
    });
    if (intersections.length<2) throw new Error("Invalid Keio reference cross-section");
    return [Math.min(...intersections), Math.max(...intersections)];
  }
  const local = ([x,z]: Point2): Point2 => {
    const d=(x+156)/101*length;
    const [north,south]=section(main,d), [arrivalNorth,arrivalSouth]=section(arrival,d);
    const offset = z<=48 ? north+(z-29)/19*(south-north)
      : z<55 ? south+(z-48)/7*(arrivalNorth-south)
      : arrivalNorth+(z-55)/9*(arrivalSouth-arrivalNorth);
    return [start[0]+u[0]*d+v[0]*offset,start[1]+u[1]*d+v[1]*offset];
  };
  const point = (p: Point2) => toDiagram(local(p));
  const boundary = (ring: Point2[]) => ring.flatMap((p,i) => {
    const q=ring[(i+1)%ring.length],count=Math.max(1,Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/3));
    return Array.from({length:count},(_,j)=>point([p[0]+(q[0]-p[0])*j/count,p[1]+(q[1]-p[1])*j/count]));
  });
  const data = structuredClone(original);
  const note = "Position inferred within Mark City from public-map platforms and Keio's floor plan. Gate, stair and lift coordinates still need verification.";
  for (const space of data.spaces) {
    if (!(space.id.startsWith("keio-") || space.id === "markcity-avenue") || space.id === "keio-transfer") continue;
    space.polygon=boundary(space.id === "keio-west-gate"
      ? [[-155,20],[-142,20],[-125,24],[-105,24],[-105,70],[-155,70]] : space.polygon);
    space.labelPosition=point(space.labelPosition);
    space.openings=undefined;
    space.positionNote=note;
    const index=source.platforms.findIndex(p=>p.spaceId===space.id);
    if (index>=0) {
      space.polygon=rings[index].map(p=>toDiagram(p));
      space.positionNote="Outline follows the public map; floor confirmed by Keio. Platform elevation and track centres remain unverified.";
    }
    if (space.id === "keio-platform") {
      // Illustrative rail strokes follow the actual platform edges; no track survey is implied.
      space.tracks=[main.slice(0,7).map(p=>[p[0]-v[0],p[1]-v[1]] as Point2),
        main.slice(9,15).reverse().map(p=>[p[0]+v[0]*.8,p[1]+v[1]*.8] as Point2)]
        .map(points=>({points:points.map(p=>toDiagram(p)),color:"#8e7aad"}));
    }
  }
  for (const connector of data.connectors) {
    if (!connector.id.startsWith("keio-") || connector.id === "keio-jr-central-stairs") continue;
    connector.from.position=point(connector.from.position);
    connector.to.position=point(connector.to.position);
    connector.stops=connector.stops?.map(stop=>({...stop,position:point(stop.position)}));
    connector.positionNote=note;
    // Existing drawing widths must shrink with this local correction too.
    connector.width*=.6;
  }
  for (const facility of data.facilities ?? []) {
    if (!facility.spaceId.startsWith("keio-")) continue;
    facility.position=point(facility.position);
    facility.positionNote=note;
  }
  // Only the Keio end moves. Preserve the JR endpoint and disclose the inferred approach.
  const transfer=data.spaces.find(s=>s.id==="keio-transfer")!;
  const a=point([-42,45]), b: Point2=[-47,-15], c: Point2=[-32,-15];
  const path=[a,[b[0],a[1]] as Point2,b,c], half=2.5;
  const side=(sign:number)=>path.map(([x,z],i):Point2=>{
    const p=path[Math.max(0,i-1)],q=path[Math.min(path.length-1,i+1)];
    const dx=q[0]-p[0],dz=q[1]-p[1],d=Math.hypot(dx,dz)||1;
    return [x-sign*dz/d*half,z+sign*dx/d*half];
  });
  transfer.polygon=[...side(1),...side(-1).reverse()];
  transfer.labelPosition=path[1];
  transfer.positionNote="Approximate public approach between the relocated Keio concourse and unchanged JR landing; path shape and height transition need verification.";
  transfer.evidence={sourceId:"keio-floor",locator:"Central gate approach toward JR",certainty:"inferred"};
  return data;
}
