import { FloorId } from "@/types/station";

/** Scale factor applied to floor coordinates before isometric projection */
export const ISO_SCALE = 0.45;

/** Vertical spacing between floors in pixels */
export const FLOOR_SPACING = 100;

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

/**
 * Project a 2D floor coordinate (within 0-1200, 0-600) to isometric 2D screen space.
 * Higher elevation floors appear higher on screen.
 */
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

/**
 * Transform an SVG path string (M/L/Z commands) to isometric coordinates.
 */
export function transformSvgPath(
  svgPath: string,
  elevation: number
): string {
  return svgPath.replace(
    /([ML])\s*([\d.]+)[,\s]+([\d.]+)/gi,
    (_match, cmd, xStr, yStr) => {
      const pt = toIsometric(parseFloat(xStr), parseFloat(yStr), elevation);
      return `${cmd} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
  );
}

/**
 * Get the 4 corners of a floor slab in isometric space.
 * Returns corners in order: top-left, top-right, bottom-right, bottom-left
 */
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

/**
 * Build SVG path for a floor slab outline.
 */
export function getFloorSlabPath(elevation: number): string {
  const corners = getFloorSlabCorners(elevation);
  return (
    `M ${corners[0].x.toFixed(1)} ${corners[0].y.toFixed(1)} ` +
    `L ${corners[1].x.toFixed(1)} ${corners[1].y.toFixed(1)} ` +
    `L ${corners[2].x.toFixed(1)} ${corners[2].y.toFixed(1)} ` +
    `L ${corners[3].x.toFixed(1)} ${corners[3].y.toFixed(1)} Z`
  );
}

/**
 * Compute a viewBox that fits all 8 floors in isometric space with padding.
 */
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

  const padding = 80;
  return `${(minX - padding).toFixed(0)} ${(minY - padding).toFixed(0)} ${(maxX - minX + padding * 2).toFixed(0)} ${(maxY - minY + padding * 2).toFixed(0)}`;
}
