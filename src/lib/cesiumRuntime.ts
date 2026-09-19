import type * as Cesium from "cesium";

type CesiumWindow = Window & {
  Cesium?: typeof Cesium;
  CESIUM_BASE_URL?: string;
};
let pending: Promise<typeof Cesium> | undefined;

/** Load the locally packaged runtime; no ion token or third-party script request. */
export function loadCesium(): Promise<typeof Cesium> {
  const host = window as CesiumWindow;
  if (host.Cesium) return Promise.resolve(host.Cesium);
  if (pending) return pending;
  const base = process.env.NODE_ENV === "production" ? "/transit-layout" : "";
  host.CESIUM_BASE_URL = `${base}/cesium/`;
  pending = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${base}/cesium/Cesium.js`;
    script.async = true;
    script.onload = () =>
      host.Cesium
        ? resolve(host.Cesium)
        : reject(new Error("Map runtime did not initialize"));
    script.onerror = () => {
      pending = undefined;
      script.remove();
      reject(new Error("Map runtime could not load"));
    };
    document.head.appendChild(script);
  });
  return pending;
}
