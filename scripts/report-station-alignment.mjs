import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
// npm test compiles the same registration module used by both live views.
const {
  stationAlignment,
  alignmentControls,
  fitSimilarity,
  transformPoint,
} = require("../.test-dist/src/lib/stationRegistration.js");
const landmarks = JSON.parse(
  await readFile(
    new URL("../src/data/plateau-landmarks.json", import.meta.url),
    "utf8",
  ),
);
const heldOut = alignmentControls.map((control) => {
  const fit = fitSimilarity(
    alignmentControls.filter((c) => c.id !== control.id),
  );
  const p = transformPoint(control.diagram, fit);
  return {
    id: control.id,
    distanceM: Math.hypot(p[0] - control.target[0], p[1] - control.target[1]),
  };
});
const report = {
  status:
    "provisional building-centre registration; not surveyed entrance alignment",
  coordinateFrame:
    "WGS84-derived local east/up/south metres, shared with the PLATEAU passage",
  transform: stationAlignment,
  controls: alignmentControls.map((c) => ({
    ...c,
    source: landmarks.find((m) => m.explorerId === c.id),
  })),
  leaveOneOut: heldOut,
  independentSurveyedCheckpoints: 0,
  stationVerticalRegistration: "Unknown; floor separation remains illustrative",
  limitations:
    "Envelope centres are approximate correspondences. Leave-one-out checks reuse the same three building identities and are not independent survey validation. No shear or local warping is applied. Source-supported floor/topology corrections are included; measured station geometry and elevations remain unresolved.",
};
const output = new URL(
  "../docs/spatial-recovery/station-registration.json",
  import.meta.url,
);
await writeFile(output, JSON.stringify(report, null, 2) + "\n");
process.stdout.write(
  `${fileURLToPath(output)}\nRMS building-centre mismatch: ${stationAlignment.rmse.toFixed(2)} m\n`,
);
