import type * as Cesium from "cesium";

/** Place the decoded east/up/south GLB without a fitted translation or scale. */
export function passagePlacement(C: typeof Cesium, origin: readonly number[]) {
  if (origin.length !== 3 || !origin.every(Number.isFinite)) {
    throw new Error(
      "A longitude, latitude and ellipsoidal height are required",
    );
  }
  return {
    modelMatrix: C.Transforms.eastNorthUpToFixedFrame(
      C.Cartesian3.fromDegrees(origin[0], origin[1], origin[2]),
    ),
    // Y->Z turns east/up/south into east/north/up. Forward X prevents
    // Cesium's extra Z-forward conversion from rotating geographic geometry.
    upAxis: C.Axis.Y,
    forwardAxis: C.Axis.X,
    scale: 1,
  };
}
