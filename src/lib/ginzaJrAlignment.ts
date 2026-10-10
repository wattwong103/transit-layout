import source from "../../public/evidence/ginza-jr-alignment.json";
import type { ExplorerDataset, Point2 } from "../types/explorer";

/** Local plan corrections. Operator floor identities and the global fit stay unchanged. */
export function alignGinzaJr(
  original: ExplorerDataset,
  project: (longitude:number, latitude:number)=>readonly [number,number,number],
  toDiagram: (point:Point2)=>Point2,
): ExplorerDataset {
  const records=source.platforms.map(record=>({...record, rings:record.rings.map(ring=>({
    ...ring, points:ring.coordinates.map(([lon,lat]):Point2=>{const p=project(lon,lat);return [p[0],p[2]];}),
  }))}));
  const [ginza,west,east]=records.map(r=>r.rings.find(r=>r.role==="outer")!.points);
  const middle=(a:Point2,b:Point2):Point2=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  function frame(start:Point2,end:Point2,eastAcross=false) {
    const length=Math.hypot(end[0]-start[0],end[1]-start[1]);
    const u:Point2=[(end[0]-start[0])/length,(end[1]-start[1])/length];
    const v:Point2=eastAcross ? [u[1],-u[0]] : [-u[1],u[0]];
    const along=(p:Point2)=>(p[0]-start[0])*u[0]+(p[1]-start[1])*u[1];
    const across=(p:Point2)=>(p[0]-start[0])*v[0]+(p[1]-start[1])*v[1];
    const section=(ring:Point2[],distance:number):[number,number]=>{
      const values=ring.map(along);
      const d=Math.max(Math.min(...values)+.05,Math.min(Math.max(...values)-.05,distance));
      const hits:number[]=[];
      ring.forEach((p,i)=>{
        const j=(i+1)%ring.length,a=values[i],b=values[j];
        if((a<=d&&b>d)||(b<=d&&a>d)) hits.push(across(p)+(across(ring[j])-across(p))*(d-a)/(b-a));
      });
      if(hits.length<2) throw new Error("Invalid platform cross-section");
      return [Math.min(...hits),Math.max(...hits)];
    };
    return {length,v,section,point:(d:number,w:number):Point2=>[start[0]+d*u[0]+w*v[0],start[1]+d*u[1]+w*v[1]]};
  }
  // Reviewed end midpoints in the preserved source rings; directions west→east / north→south.
  const g=frame(middle(ginza[0],ginza[16]),middle(ginza[9],ginza[10]));
  const j=frame(middle(west[9],west[13]),middle(west[0],west[22]),true);
  const ginzaPoint=([x,z]:Point2):Point2=>{
    const d=(x+31)/166*g.length,[a,b]=g.section(ginza,d);
    return toDiagram(g.point(d,a+(z+43)/19*(b-a)));
  };
  const jrPoint=([x,z]:Point2):Point2=>{
    // A common longitudinal frame keeps cross-platform gate banks abreast.
    // Saikyo's exact outline retains its longer southern extension.
    const d=(z+94)/172*j.length,[a,b]=j.section(west,d),[c,e]=j.section(east,d);
    const w=x<=-12 ? a+(x+31)/19*(b-a) : x<2 ? b+(x+12)/14*(c-b) : c+(x-2)/20*(e-c);
    return toDiagram(j.point(d,w));
  };
  const boundary=(ring:Point2[],point:(p:Point2)=>Point2)=>ring.flatMap((p,i)=>{
    const q=ring[(i+1)%ring.length],count=Math.max(1,Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/3));
    return Array.from({length:count},(_,n)=>point([p[0]+(q[0]-p[0])*n/count,p[1]+(q[1]-p[1])*n/count]));
  });
  const group=(id:string)=>id.startsWith("ginza-") ? "ginza" : id.startsWith("jr-")||id==="ground-jr" ? "jr" : null;
  const note=(name:string)=>`${name} floor confirmed by the operator. Position inferred relative to public-map platforms; gate, stair and lift locations and elevations still need verification.`;
  const data=structuredClone(original);
  for(const space of data.spaces) {
    const kind=group(space.id);
    if(!kind||space.id==="ginza-jr-bridge") continue;
    const point=kind==="ginza"?ginzaPoint:jrPoint;
    space.polygon=boundary(space.polygon,point);
    space.labelPosition=point(space.labelPosition);
    space.openings=undefined;
    space.positionNote=note(kind==="ginza"?"Ginza":"JR");
    const record=records.find(r=>r.spaceId===space.id);
    if(record) {
      space.polygon=record.rings.find(r=>r.role==="outer")!.points.map(p=>toDiagram(p));
      space.openings=record.rings.filter(r=>r.role==="inner").map(r=>r.points.map(p=>toDiagram(p)));
      space.evidence={sourceId:kind==="ginza"?"metro-map":"jr-map",locator:`${record.floor} platform identity and floor; OSM ${record.kind} ${record.id}`,certainty:"documented"};
      space.access={area:"paid",status:"shown-in-source",note:"Platform shown in the operator plan; detailed paid-area edges and current access are not surveyed."};
      space.positionNote="Public-map platform outline and mapped openings; floor confirmed by the operator. Track centres, equipment positions and metre elevations remain unverified. PLATEAU predates recent JR reconstruction.";
      const paths=kind==="ginza" ? [ginza.slice(0,8),ginza.slice(10,17).reverse()]
        : space.id==="jr-west-platform" ? [west.slice(0,10),west.slice(13).reverse()]
        : [east.slice(0,8),east.slice(8,21).reverse()];
      const across=kind==="ginza"?g.v:j.v;
      const signs=kind==="ginza"?[1,-1]:space.id==="jr-west-platform"?[1,-1]:[-1,1];
      space.tracks=paths.map((path,i)=>({color:space.tracks?.[i]?.color??space.color,
        points:path.map(p=>toDiagram([p[0]+across[0]*signs[i]*1.7,p[1]+across[1]*signs[i]*1.7]))}));
    }
  }
  for(const connector of data.connectors) {
    const isGinza=connector.id.startsWith("g-")||connector.id.startsWith("metro-ginza-");
    const isJr=connector.id.startsWith("jr-")||connector.id==="keio-jr-central-stairs";
    if(!isGinza&&!isJr) continue;
    const point=isGinza?ginzaPoint:jrPoint;
    connector.from.position=point(connector.from.position);
    connector.to.position=point(connector.to.position);
    connector.stops=connector.stops?.map(stop=>({...stop,position:point(stop.position)}));
    connector.width*=isGinza?.38:.5;
    connector.positionNote=note(isGinza?"Ginza":"JR");
  }
  for(const facility of data.facilities??[]) {
    const kind=group(facility.spaceId);
    if(!kind) continue;
    facility.position=(kind==="ginza"?ginzaPoint:jrPoint)(facility.position);
    facility.positionNote=note(kind==="ginza"?"Ginza":"JR");
  }
  // These straight public approaches express adjacency only, not measured walking routes.
  function approach(id:string,a:Point2,b:Point2) {
    const space=data.spaces.find(s=>s.id===id)!;
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length,half=1.5;
    space.polygon=[[a[0]-dx*half-dz*half,a[1]-dz*half+dx*half],[b[0]+dx*half-dz*half,b[1]+dz*half+dx*half],
      [b[0]+dx*half+dz*half,b[1]+dz*half-dx*half],[a[0]-dx*half+dz*half,a[1]-dz*half-dx*half]];
    space.labelPosition=middle(a,b);
    space.positionNote="Inferred public approach joining the corrected station areas. Actual path, widths, intermediate levels and vertical transition still need verification.";
    space.evidence={...space.evidence!,certainty:"inferred"};
  }
  approach("ginza-jr-bridge",ginzaPoint([-42,-30]),jrPoint([40,-18]));
  // Preserve the already-corrected Keio concourse and move only the JR approach endpoint.
  approach("keio-transfer",data.spaces.find(s=>s.id==="keio-central-gate")!.labelPosition,jrPoint([-47,-15]));
  return data;
}
