import { FloorId } from "@/types/station";

/** Scale factor applied to floor coordinates before isometric projection */
export const ISO_SCALE = 0.45;

/** Vertical spacing between floors in pixels */
export const FLOOR_SPACING = 100;

/** Slab thickness as fraction of FLOOR_SPACING */
export const SLAB_THICKNESS = 0.18;

/** Isometric angles */
const COS_30 = Math.cos(Math.PI / 6); // 0.866
const SIN_30 = Math.sin(Math.PI / 6); // 0.5

/** Floor elevation values */
const ELEVATION: Record<FloorId, number> = {
  "3F": 3,
  "2F": 2,
  "1F": 1,
  B1: -1,
  B2: -2,
  B3: -3,
  B4: -4,
  B5: -5,
};

export function getElevation(floor: FloorId): number {
  return ELEVATION[floor];
}

export function toIsometric(
  x: number,
  y: number,
  elevation: number
): { x: number; y: number } {
  const sx = x * ISO_SCALE;
  const sy = y * ISO_SCALE;
  return {
    x: (sx - sy) * COS_30,
    y: (sx + sy) * SIN_30 - elevation * FLOOR_SPACING,
  };
}

export function transformSvgPath(
  svgPath: string,
  elevation: number
): string {
  let result = svgPath.replace(
    /([ML])\s*([\d.]+)[,\s]+([\d.]+)/gi,
    (_match, cmd, xStr, yStr) => {
      const pt = toIsometric(parseFloat(xStr), parseFloat(yStr), elevation);
      return `${cmd} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
  );
  result = result.replace(
    /Q\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/gi,
    (_match, cx, cy, ex, ey) => {
      const cp = toIsometric(parseFloat(cx), parseFloat(cy), elevation);
      const ep = toIsometric(parseFloat(ex), parseFloat(ey), elevation);
      return `Q ${cp.x.toFixed(1)} ${cp.y.toFixed(1)} ${ep.x.toFixed(1)} ${ep.y.toFixed(1)}`;
    }
  );
  return result;
}

export function getFloorSlabCorners(
  elevation: number,
  width: number = 1200,
  height: number = 600
): { x: number; y: number }[] {
  return [
    toIsometric(0, 0, elevation),
    toIsometric(width, 0, elevation),
    toIsometric(width, height, elevation),
    toIsometric(0, height, elevation),
  ];
}

export function getFloorSlabPath(elevation: number): string {
  const corners = getFloorSlabCorners(elevation);
  return (
    `M ${corners[0].x.toFixed(1)} ${corners[0].y.toFixed(1)} ` +
    `L ${corners[1].x.toFixed(1)} ${corners[1].y.toFixed(1)} ` +
    `L ${corners[2].x.toFixed(1)} ${corners[2].y.toFixed(1)} ` +
    `L ${corners[3].x.toFixed(1)} ${corners[3].y.toFixed(1)} Z`
  );
}

interface SlabBox {
  topPath: string;
  frontPath: string;
  rightPath: string;
}

export function getSlabBox(
  elevation: number,
  thickness: number = SLAB_THICKNESS
): SlabBox {
  const top = getFloorSlabCorners(elevation);
  const drop = thickness * FLOOR_SPACING;
  const bot = top.map((c) => ({ x: c.x, y: c.y + drop }));

  const fmt = (p: { x: number; y: number }) =>
    `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;

  return {
    topPath:
      `M ${fmt(top[0])} L ${fmt(top[1])} L ${fmt(top[2])} L ${fmt(top[3])} Z`,
    frontPath:
      `M ${fmt(top[3])} L ${fmt(top[2])} L ${fmt(bot[2])} L ${fmt(bot[3])} Z`,
    rightPath:
      `M ${fmt(top[2])} L ${fmt(top[1])} L ${fmt(bot[1])} L ${fmt(bot[2])} Z`,
  };
}

export function getRampQuad(
  p1: { x: number; y: number; elev: number },
  p2: { x: number; y: number; elev: number },
  halfWidth: number = 6
): { path: string; steps: number; midAngle: number } {
  const a = toIsometric(p1.x, p1.y, p1.elev);
  const b = toIsometric(p2.x, p2.y, p2.elev);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { path: "", steps: 0, midAngle: 0 };

  const nx = (-dy / len) * halfWidth;
  const ny = (dx / len) * halfWidth;

  const fmt = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const path =
    `M ${fmt(a.x + nx, a.y + ny)} ` +
    `L ${fmt(b.x + nx, b.y + ny)} ` +
    `L ${fmt(b.x - nx, b.y - ny)} ` +
    `L ${fmt(a.x - nx, a.y - ny)} Z`;

  return {
    path,
    steps: Math.max(2, Math.floor(len / 9)),
    midAngle: Math.atan2(dy, dx) * (180 / Math.PI),
  };
}

export function getColumnBox(
  x: number,
  y: number,
  elevTop: number,
  elevBot: number,
  halfWidth: number = 8
): { frontPath: string; sidePath: string } {
  const top = toIsometric(x, y, elevTop);
  const bot = toIsometric(x, y, elevBot);

  const isoDepthX = COS_30 * halfWidth * ISO_SCALE * 0.5;
  const isoDepthY = SIN_30 * halfWidth * ISO_SCALE * 0.5;

  const fmt = (px: number, py: number) => `${px.toFixed(1)} ${py.toFixed(1)}`;

  const frontPath =
    `M ${fmt(top.x - halfWidth, top.y)} ` +
    `L ${fmt(top.x + halfWidth, top.y)} ` +
    `L ${fmt(bot.x + halfWidth, bot.y)} ` +
    `L ${fmt(bot.x - halfWidth, bot.y)} Z`;

  const sidePath =
    `M ${fmt(top.x + halfWidth, top.y)} ` +
    `L ${fmt(top.x + halfWidth + isoDepthX, top.y - isoDepthY)} ` +
    `L ${fmt(bot.x + halfWidth + isoDepthX, bot.y - isoDepthY)} ` +
    `L ${fmt(bot.x + halfWidth, bot.y)} Z`;

  return { frontPath, sidePath };
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) {
    const v = Math.round(l * 255);
    return `#${v.toString(16).padStart(2, "0").repeat(3)}`;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return (
    "#" +
    [r, g, b].map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join("")
  );
}

export function shadeFace(
  baseHex: string,
  face: "top" | "front" | "side"
): string {
  const [h, s, l] = hexToHsl(baseHex);
  switch (face) {
    case "top":
      return hslToHex(h, s, Math.min(1, l * 1.1));
    case "front":
      return hslToHex(h, s, l * 0.72);
    case "side":
      return hslToHex(h, s, l * 0.52);
  }
}

export function getPathBounds(svgPath: string): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  cx: number;
  cy: number;
} {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const mlRegex = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/gi;
  let match;
  while ((match = mlRegex.exec(svgPath)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const qRegex = /Q\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/gi;
  while ((match = qRegex.exec(svgPath)) !== null) {
    for (let i = 1; i <= 3; i += 2) {
      const x = parseFloat(match[i]);
      const y = parseFloat(match[i + 1]);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

export function computeIsometricViewBox(): string {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const floor of Object.keys(ELEVATION) as FloorId[]) {
    const elev = ELEVATION[floor];
    const corners = getFloorSlabCorners(elev);
    for (const c of corners) {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x);
      maxY = Math.max(maxY, c.y);
    }
  }

  const drop = SLAB_THICKNESS * FLOOR_SPACING;
  maxY += drop;

  const padding = 100;
  return `${(minX - padding).toFixed(0)} ${(minY - padding).toFixed(0)} ${(maxX - minX + padding * 2).toFixed(0)} ${(maxY - minY + padding * 2).toFixed(0)}`;
}
