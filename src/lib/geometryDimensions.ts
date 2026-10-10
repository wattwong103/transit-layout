import type { ExplorerDataset, Point2 } from "../types/explorer";

const cross=(o:Point2,a:Point2,b:Point2)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
export const ringArea=(ring:readonly Point2[])=>Math.abs(ring.reduce((sum,p,i)=>{
  const q=ring[(i+1)%ring.length];return sum+p[0]*q[1]-q[0]*p[1];
},0))/2;

/** Minimum enclosing rectangle, not a constant platform width or usable length. */
export function measureFootprint(outer:readonly Point2[],holes:readonly (readonly Point2[])[] = []) {
  if(outer.length<3||outer.some(p=>p.some(v=>!Number.isFinite(v)))) throw new Error("Invalid footprint");
  const sorted=[...outer].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const half=(points:Point2[])=>{
    const result:Point2[]=[];
    for(const p of points) {while(result.length>=2&&cross(result[result.length-2],result[result.length-1],p)<=0) result.pop();result.push(p);}
    return result.slice(0,-1);
  };
  const hull=[...half(sorted),...half([...sorted].reverse())];
  const bounds=(u:Point2,v:Point2)=>{
    const xs=hull.map(p=>p[0]*u[0]+p[1]*u[1]),ys=hull.map(p=>p[0]*v[0]+p[1]*v[1]);
    return {minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};
  };
  let best:{u:Point2;v:Point2;area:number}|undefined;
  hull.forEach((p,i)=>{
    const q=hull[(i+1)%hull.length],d=Math.hypot(q[0]-p[0],q[1]-p[1]);
    if(!d) return;
    const u:Point2=[(q[0]-p[0])/d,(q[1]-p[1])/d],v:Point2=[-u[1],u[0]],b=bounds(u,v);
    const area=(b.maxX-b.minX)*(b.maxY-b.minY);
    if(!best||area<best.area) best={u,v,area};
  });
  if(!best||best.area<1e-8) throw new Error("Degenerate footprint");
  let {u,v}=best;
  let b=bounds(u,v);
  if(b.maxY-b.minY>b.maxX-b.minX) {u=v;v=[-u[1],u[0]];}
  // Give the inspection frame a stable eastward/southward reading direction.
  if((Math.abs(u[0])>=Math.abs(u[1])?u[0]:u[1])<0) {u=[-u[0],-u[1]];v=[-v[0],-v[1]];}
  b=bounds(u,v);
  const length=b.maxX-b.minX,width=b.maxY-b.minY;
  const project=(p:Point2):Point2=>[p[0]*u[0]+p[1]*u[1]-b.minX,p[0]*v[0]+p[1]*v[1]-b.minY];
  const restore=([x,y]:Point2):Point2=>[u[0]*(x+b.minX)+v[0]*(y+b.minY),u[1]*(x+b.minX)+v[1]*(y+b.minY)];
  const ring=outer.map(project),hits:number[]=[];
  ring.forEach((p,i)=>{
    const q=ring[(i+1)%ring.length],x=length/2;
    if((p[0]<=x&&q[0]>x)||(q[0]<=x&&p[0]>x)) hits.push(p[1]+(q[1]-p[1])*(x-p[0])/(q[0]-p[0]));
  });
  const centreSection:Point2[] = hits.length>=2?[[length/2,Math.min(...hits)],[length/2,Math.max(...hits)]]:[];
  return {length,width,u,v,project,restore,centreSection,
    centreWidth:centreSection.length?centreSection[1][1]-centreSection[0][1]:0,
    area:ringArea(outer)-holes.reduce((sum,hole)=>sum+ringArea(hole),0),
    rectangle:([[0,0],[length,0],[length,width],[0,width]] as Point2[]).map(restore)};
}

export const detailPlatforms = [
  {id:"ginza-platform",name:"Ginza",floor:"3F",source:"https://www.openstreetmap.org/way/759134298"},
  {id:"jr-west-platform",name:"JR Yamanote · 1–2",floor:"2F",source:"https://www.openstreetmap.org/relation/18546084"},
  {id:"jr-east-platform",name:"JR Saikyo · 3–4",floor:"2F",source:"https://www.openstreetmap.org/relation/18546085"},
  {id:"keio-platform",name:"Keio · main",floor:"2F",source:"https://www.openstreetmap.org/way/1349961222"},
  {id:"keio-arrival-platform",name:"Keio · arrival",floor:"2F",source:"https://www.openstreetmap.org/way/1349961223"},
] as const;

/** A view-only subset. Never translates, enlarges or rewrites the shared model. */
export function platformDetail(data:ExplorerDataset,id:string,includeAccess:boolean):ExplorerDataset {
  if(!detailPlatforms.some(p=>p.id===id)) throw new Error("Unknown public platform");
  const same=(key:string)=>id.startsWith("jr-") ? key.startsWith("jr-")||key==="ground-jr"
    :id.startsWith("keio-") ? (key.startsWith("keio-")&&key!=="keio-transfer"&&key!=="keio-jr-central-stairs")||key==="markcity-avenue"
    :key.startsWith("ginza-")&&key!=="ginza-jr-bridge";
  const spaces=data.spaces.filter(s=>s.id===id||(includeAccess&&same(s.id)));
  const ids=new Set(spaces.map(s=>s.id));
  return {...data,spaces,buildings:[],exits:[],entranceReferences:[],
    facilities:includeAccess?data.facilities?.filter(f=>ids.has(f.spaceId)):[],
    connectors:includeAccess?data.connectors.filter(c=>same(c.id)||(id.startsWith("ginza-")&&(c.id.startsWith("g-")||c.id.startsWith("metro-ginza-")))):[]};
}
