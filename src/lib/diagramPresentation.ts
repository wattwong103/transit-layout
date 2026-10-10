import type { ExplorerBuilding, ExplorerLevelId, Point2 } from "../types/explorer";
import { buildingParts } from "./explorer";

/** Visual association endpoint on the nearest outer envelope, never a surveyed door. */
export function buildingAssociationAnchor(building: ExplorerBuilding, from: Point2): Point2 {
  let best: Point2 = building.labelPosition;
  let distance = Infinity;
  for (const [outer] of buildingParts(building)) {
    outer.forEach((a, i) => {
      const b = outer[(i + 1) % outer.length];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const length2 = dx * dx + dz * dz;
      const t = length2 ? Math.max(0, Math.min(1, ((from[0] - a[0]) * dx + (from[1] - a[1]) * dz) / length2)) : 0;
      const candidate: Point2 = [a[0] + t * dx, a[1] + t * dz];
      const d = Math.hypot(candidate[0] - from[0], candidate[1] - from[1]);
      if (d < distance) { distance = d; best = candidate; }
    });
  }
  return best;
}

export function associationVisible(link: {exitId: string; buildingId: string; levels: string[]},
  context: string, level: ExplorerLevelId | "all", selectedId: string | null, showAll: boolean) {
  if (context === "station" || (level !== "all" && !link.levels.includes(level))) return false;
  return selectedId ? selectedId === link.exitId || selectedId === link.buildingId : showAll;
}

export type LabelBox = {left: number; right: number; top: number; bottom: number};
/** Screen-space only: keep labels readable without moving any source geometry. */
export function placeDiagramLabel(anchor: Point2, width: number, height: number,
  viewport: Point2, occupied: LabelBox[], kind: string, force = false) {
  const margin = 4;
  const box = (x: number, y: number): LabelBox => ({left:x-width/2-margin,right:x+width/2+margin,top:y-height/2-margin,bottom:y+height/2+margin});
  const overlaps = (a: LabelBox) => occupied.some(b => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
  const clamp = (x: number, y: number): Point2 => [
    Math.max(width/2+margin, Math.min(viewport[0]-width/2-margin,x)),
    Math.max(height/2+margin, Math.min(viewport[1]-height/2-margin,y)),
  ];
  const start: Point2 = kind === "floor" ? [-width/2-20,0] : [0,-height/2-5];
  const offsets: Point2[] = [start,[0,0],[0,-28],[0,28],[-width/2-18,0],[width/2+18,0]];
  const limit = kind === "exit" || kind === "reference" ? 48 : 144;
  for (let d=48; d<=limit; d+=24) offsets.push([0,-d],[0,d],[-width/2-18,-d],[width/2+18,d]);
  if (kind === "platform" || kind === "building")
    for (const dx of [-width-36,width+36,-width*1.5-36,width*1.5+36])
      for (const dy of [0,-32,32,-64,64]) offsets.push([dx,dy]);
  for (const [dx,dy] of offsets) {
    const [x,y] = clamp(anchor[0]+dx,anchor[1]+dy);
    const bounds = box(x,y);
    if (!overlaps(bounds)) return {x,y,bounds};
  }
  if (!force) return null;
  const [x,y] = clamp(anchor[0]+start[0],anchor[1]+start[1]);
  return {x,y,bounds:box(x,y)};
}
