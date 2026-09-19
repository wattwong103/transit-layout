import { cp, mkdir, readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = resolve(root, "node_modules/cesium/Build/Cesium");
const destination = resolve(root, "public/cesium");
const pkg = JSON.parse(
  await readFile(resolve(root, "node_modules/cesium/package.json"), "utf8"),
);
const previous = await readFile(resolve(destination, ".version"), "utf8").catch(
  () => "",
);
const exists = await access(resolve(destination, "Cesium.js")).then(
  () => true,
  () => false,
);
if (previous !== pkg.version || !exists) {
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true });
  await writeFile(resolve(destination, ".version"), pkg.version);
}
