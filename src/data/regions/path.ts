/** Shared world size — all floors use the same XY so the 3D stack matches. */
export const WORLD = { w: 1400, h: 900 };
export const VIEWBOX = `0 0 ${WORLD.w} ${WORLD.h}`;

/** Rounded rectangle. */
export function rr(
  x: number,
  y: number,
  w: number,
  h: number,
  r = 10
): string {
  const x2 = x + w;
  const y2 = y + h;
  const rad = Math.min(r, w / 2, h / 2);
  return (
    `M ${x} ${y + rad}` +
    ` Q ${x} ${y} ${x + rad} ${y}` +
    ` L ${x2 - rad} ${y}` +
    ` Q ${x2} ${y} ${x2} ${y + rad}` +
    ` L ${x2} ${y2 - rad}` +
    ` Q ${x2} ${y2} ${x2 - rad} ${y2}` +
    ` L ${x + rad} ${y2}` +
    ` Q ${x} ${y2} ${x} ${y2 - rad} Z`
  );
}

/** Horizontal capsule (platform). */
export function capsuleH(x: number, y: number, w: number, h: number): string {
  return rr(x, y, w, h, h / 2);
}

/** Vertical capsule (deep platforms). */
export function capsuleV(x: number, y: number, w: number, h: number): string {
  return rr(x, y, w, h, w / 2);
}

/**
 * L-shape used by B2 (and B1 east+west union conceptually):
 * horizontal bar (hx,hy,hw,hh) plus vertical bar (vx,vy,vw,vh).
 * Assumes the bars overlap at the corner.
 */
export function lPath(
  hx: number,
  hy: number,
  hw: number,
  hh: number,
  vx: number,
  vy: number,
  vw: number,
  vh: number,
  r = 12
): string {
  const x1 = hx;
  const y1 = hy;
  const x2 = hx + hw;
  const y2 = hy + hh;
  const vx2 = vx + vw;
  const vy2 = vy + vh;
  const rad = r;
  // Trace outer outline clockwise from top-left of horizontal bar
  return (
    `M ${x1} ${y1 + rad}` +
    ` Q ${x1} ${y1} ${x1 + rad} ${y1}` +
    ` L ${vx} ${y1}` +
    ` L ${vx} ${vy + rad}` +
    ` Q ${vx} ${vy} ${vx + rad} ${vy}` +
    ` L ${vx2 - rad} ${vy}` +
    ` Q ${vx2} ${vy} ${vx2} ${vy + rad}` +
    ` L ${vx2} ${vy2 - rad}` +
    ` Q ${vx2} ${vy2} ${vx2 - rad} ${vy2}` +
    ` L ${vx + rad} ${vy2}` +
    ` Q ${vx} ${vy2} ${vx} ${vy2 - rad}` +
    ` L ${vx} ${y2}` +
    ` L ${x1 + rad} ${y2}` +
    ` Q ${x1} ${y2} ${x1} ${y2 - rad} Z`
  );
}
