import type {
  ExplorerDataset, ExplorerSpace, ExplorerConnector, ExplorerFacility,
  ExplorerLevelId as Level, Point2, FeatureEvidence, FeatureAccess,
} from "../types/explorer";

const evidence = (sourceId: string, locator: string, inferred = false): FeatureEvidence =>
  ({ sourceId, locator, certainty: inferred ? "inferred" : "documented" });
const access = (area: FeatureAccess["area"], note?: string): FeatureAccess =>
  ({ area, status: "shown-in-source", ...(note ? { note } : {}) });
const rect = (x: number, z: number, w: number, d: number): Point2[] =>
  [[x, z], [x + w, z], [x + w, z + d], [x, z + d]];
function corridor(points: Point2[], width: number): Point2[] {
  const side = (sign: number) => points.map(([x, z], i): Point2 => {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
    const dx = b[0] - a[0], dz = b[1] - a[1], length = Math.hypot(dx, dz) || 1;
    return [x - sign * dz / length * width / 2, z + sign * dx / length * width / 2];
  });
  return [...side(1), ...side(-1).reverse()];
}

/**
 * Reconstruct source-supported topology in the existing DRAWING frame.
 * Source identity / floor labels are distinct from unmeasured XY and elevations.
 * The v1 input is cloned; both renderers and registration consume this result.
 */
export function applySourceCorrections(original: ExplorerDataset): ExplorerDataset {
  const data = structuredClone(original);
  data.facilities = [];
  data.levels.unshift({ id: "4F", order: 3, label: "4F", description: "Keio Avenue · building lift landings" });
  data.levels.find(l => l.id === "3F")!.description = "Ginza · JR Central & New South";
  data.levels.find(l => l.id === "B3")!.description = "Hanzomon · Hikarie gates · B1 approach";
  const getSpace = (id: string) => data.spaces.find(s => s.id === id)!;
  const getConnector = (id: string) => data.connectors.find(c => c.id === id)!;
  function addSpace(id: string, name: string, levelId: Level, polygon: Point2[], labelPosition: Point2,
    sourceId: string, locator: string, area: FeatureAccess["area"] = "unpaid", kind: ExplorerSpace["kind"] = "concourse") {
    const s: ExplorerSpace = { id, name, levelId, polygon, labelPosition, kind,
      color: area === "paid" ? "#f1e8bf" : "#edeae3", evidence: evidence(sourceId, locator), access: access(area) };
    data.spaces.push(s); return s;
  }
  function reviseSpace(id: string, changes: Partial<ExplorerSpace>, sourceId: string, locator: string, area: FeatureAccess["area"]) {
    Object.assign(getSpace(id), changes, { evidence: evidence(sourceId, locator), access: access(area) });
  }
  function connect(id: string, name: string, kind: ExplorerConnector["kind"], from: Level, a: Point2,
    to: Level, b: Point2, sourceId: string, locator: string, area: FeatureAccess["area"] = "paid", width = 3.5) {
    const c: ExplorerConnector = { id, name, kind, from: { levelId: from, position: a }, to: { levelId: to, position: b }, width,
      evidence: evidence(sourceId, locator), access: access(area) };
    if (kind === "escalator") c.access!.direction = "unknown";
    data.connectors.push(c); return c;
  }
  function lift(id: string, equipmentId: string, name: string, levels: Level[], position: Point2,
    sourceId: string, locator: string, area: FeatureAccess["area"] = "paid", complete = true) {
    const c = connect(id, name, "lift", levels[0], position, levels[levels.length - 1], position, sourceId, locator, area, 3);
    c.equipmentId = equipmentId;
    c.stops = levels.map(levelId => ({ levelId, position }));
    c.stopsComplete = complete;
    if (!complete) c.access!.note = "Only documented landings shown; intermediate stops are not inferred.";
    return c;
  }
  function facility(id: string, name: string, kind: ExplorerFacility["kind"], spaceId: string, position: Point2,
    sourceId: string, locator: string, area: FeatureAccess["area"] = "unpaid", hours?: string) {
    const f: ExplorerFacility = { id, name, kind, spaceId, position, levelId: getSpace(spaceId).levelId,
      evidence: evidence(sourceId, locator), access: { ...access(area), ...(hours ? { hours } : {}) } };
    data.facilities!.push(f); return f;
  }
  function exit(code: string, levelId: Level, spaceId: string, position: Point2, note: string) {
    const e = data.exits.find(e => e.code === code)!;
    Object.assign(e, { levelId, spaceId, position, evidence: evidence("tokyu-plan", note), access: access("unpaid") });
  }

  // Underground: distinguish the B2 Miyamasuzaka level from the B3 Hikarie gates.
  reviseSpace("b2-hikarie-concourse", { id: "hikarie-gates-b3", levelId: "B3", name: "Hikarie 1 & 2 gate concourse",
    polygon: rect(54, 28, 45, 44), labelPosition: [76, 47] }, "tokyu-plan", "B2/B3 plan: Hikarie 1 and 2", "paid");
  addSpace("miyamasuzaka-b2", "Miyamasuzaka gates", "B2", rect(54, -39, 46, 51), [78, -21], "tokyu-plan", "B2 Miyamasuzaka Central/East; simplified extent includes both sides of the gates", "mixed");
  reviseSpace("b3-transfer", { id: "hikarie-public-b3", name: "Hikarie outside-gate passage",
    polygon: [[42,25],[54,25],[54,72],[99,72],[99,28],[110,28],[110,44],[127,44],[134,52],[126,60],[110,60],[110,83],[42,83]],
    labelPosition: [47,54], kind: "passage" }, "tokyu-plan", "Unpaid circulation around Hikarie gates", "unpaid");
  reviseSpace("b2-hikarie-link", { id: "hikarie-link-b3", levelId: "B3", polygon: corridor([[104,52],[128,52]],8), labelPosition: [119,52] }, "tokyu-plan", "B5/Hikarie B3 interface", "unpaid");
  exit("B5", "B3", "hikarie-link-b3", [128,52], "B5 label beside Hikarie B3");
  connect("miyamasuzaka-hikarie-slope", "B2–B3 concourse slope", "slope", "B3", [76,30], "B2", [76,8], "tokyu-plan", "Slope between Miyamasuzaka and Hikarie", "paid", 8);
  Object.assign(getConnector("b2-b3-east"), {name:"Hanzomon / Miyamasuzaka stair bank", evidence:evidence("tokyu-plan","B3 Hanzomon to B2 Miyamasuzaka relationship; individual stair bank not matched",true),access:{...access("paid"),status:"unconfirmed"}});
  getConnector("b2-b4-escalator").id = "hikarie1-b4-escalator";
  Object.assign(getConnector("hikarie1-b4-escalator"), {
    name: "Hikarie 1 escalator bank", from: { levelId: "B4", position: [82,55] }, to: { levelId: "B3", position: [82,32] },
    evidence: evidence("tokyu-plan", "Hikarie 1 / B4 escalator bank"), access: { ...access("paid"), direction: "both", note: "Weekdays from first train to about 10:00, both indicated units run upward. Bank geometry is schematic." },
  });
  Object.assign(getConnector("b3-b4-transfer"), { id: "hikarie2-b4-escalator", name: "Hikarie 2 escalator bank", kind: "escalator",
    from: { levelId: "B4", position: [68,78] }, to: { levelId: "B3", position: [68,62] },
    evidence: evidence("tokyu-plan", "Hikarie 2 / B4 bank"), access: { ...access("paid"), direction: "both" } });
  connect("miyamasuzaka-b4-bank", "Miyamasuzaka / B4 escalator bank", "escalator", "B4", [70,-52], "B2", [70,-30], "tokyu-plan", "Northern B4 escalators toward Miyamasuzaka");
  // Replace anonymous shafts with source-identified equipment and recorded stops.
  data.connectors = data.connectors.filter(c => !["toyoko-lift-west","toyoko-lift-east","hanzomon-lift","west-ground-lift"].includes(c.id));
  lift("tokyu-lift-A", "A", "Tokyu lift A", ["B3","B2"], [-65,4], "tokyu-plan", "A / Den-en-toshi B3–B2");
  addSpace("hanzomon-b4-transfer", "Hanzomon transfer branch", "B4", corridor([[18,5],[57,5]],10), [32,5], "tokyu-plan", "B4 west branch to Den-en-toshi platform", "paid", "passage");
  lift("tokyu-lift-B", "B", "Tokyu lift B", ["B4","B3"], [18,5], "tokyu-plan", "B / B3 platform–B4 branch");
  lift("tokyu-lift-C", "C", "Tokyu lift C · platforms 3–4", ["B5","B4","B2"], [88,7], "tokyu-plan", "C on B2, B4 and B5 panels");
  lift("tokyu-lift-D", "D", "Tokyu lift D · platforms 5–6", ["B5","B4","B2"], [58,7], "tokyu-plan", "D on B2, B4 and B5 panels");
  lift("tokyu-lift-E", "E", "Tokyu lift E · Hikarie", ["B5","B4","B3"], [88,60], "tokyu-plan", "E on B3–B5 panels");
  lift("tokyu-lift-F", "F", "Tokyu lift F · Hikarie", ["B5","B4","B3"], [58,60], "tokyu-plan", "F on B3–B5 panels");
  lift("tokyu-lift-1", "1", "Lift 1 · A6 / Dogenzaka", ["B2","1F"], [-62,-18], "tokyu-plan", "Lift 1 range 1F–B2", "unpaid", false);
  addSpace("a6-surface-landing", "A6-side lift landing", "1F", rect(-70,-25,16,16), [-62,-17], "tokyu-plan", "Surface landing of lift 1");
  lift("tokyu-lift-21", "21", "Lift 21 · surface / B2", ["B2","1F"], [35,5], "tokyu-plan", "21 explicitly does not stop at B1", "unpaid");
  getConnector("tokyu-lift-21").access!.note = "Does not stop at B1. Source identifies the 1F and B2 landings.";

  // Exit approaches are separate features, never decoded from the exit code.
  addSpace("magnet-link-b2", "A12 · MAGNET approach", "B2", corridor([[-24,-16],[-24,-42]],9), [-24,-31], "tokyu-plan", "A12 on B2", "unpaid", "passage");
  exit("A12", "B2", "magnet-link-b2", [-24,-42], "MAGNET / A12 in B2 panel");
  reviseSpace("b1-east-north", { id: "b1-exit-approach-b3", levelId: "B3", name: "Exit B1 · lower approach", polygon: corridor([[90,-48],[90,-65],[104,-80]],12), labelPosition: [94,-65] }, "tokyu-plan", "Exit B1 corridor labelled B3", "unpaid");
  addSpace("b1-exit-landing-b2", "Exit B1 · B2 lift landing", "B2", rect(82,-54,18,22), [89,-42], "tokyu-plan", "20b / B2 landing");
  addSpace("b1-exit-surface", "Exit B1 · surface landing", "1F", rect(93,-80,20,18), [103,-72], "tokyu-plan", "B1 surface / 20a");
  exit("B1", "B3", "b1-exit-approach-b3", [104,-80], "B1 is an exit code; its corridor is B3");
  lift("tokyu-lift-20a", "20a", "Lift 20a · B1 exit / surface", ["B3","1F"], [101,-74], "tokyu-plan", "20a / 1F–B3 range", "unpaid", false);
  lift("tokyu-lift-20b", "20b", "Lift 20b · B1 approach", ["B3","B2"], [90,-51], "tokyu-plan", "20b / B2–B3", "unpaid");
  addSpace("b7-landing-b1", "B7 · east plaza landing", "B1", rect(40,15,25,24), [52,24], "tokyu-plan", "B7 on B1 landing");
  exit("B7", "B1", "b7-landing-b1", [45,25], "B7 landing beside B1 label");
  connect("b7-b2-bank", "B7 landing escalator bank", "escalator", "B2", [45,12], "B1", [50,25], "tokyu-plan", "B7 approach from B2", "unpaid");
  connect("b7-surface-stairs", "B7 surface stairs", "stairs", "B1", [58,28], "1F", [68,14], "tokyu-plan", "B7 / surface approach", "unpaid");
  reviseSpace("b2-stream-link", { polygon: corridor([[55,43],[45,60],[45,82],[106,97],[106,112]],11), labelPosition: [79,91] }, "tokyu-plan", "South public corridor to C1/C2/C3", "unpaid");
  addSpace("c1-branch-b2", "C1 · south-east branch", "B2", corridor([[80,90],[123,90],[130,101]],9), [120,92], "tokyu-plan", "Distinct C1 branch", "unpaid", "passage");
  addSpace("c3-branch-b2", "C3 · stair approach", "B2", corridor([[45,65],[33,65]],8), [38,65], "tokyu-plan", "C3 west-facing stair branch", "unpaid", "passage");
  exit("C1", "B2", "c1-branch-b2", [130,101], "C1 southern junction");
  exit("C2", "B2", "b2-stream-link", [106,112], "C2 / Stream branch");
  exit("C3", "B2", "c3-branch-b2", [33,65], "C3 outside-gate passage; absolute elevation unverified");
  data.exits.find(e => e.code === "C3")!.evidence!.certainty = "inferred";
  connect("b6-hikarie-public-stairs", "B6 / Hikarie public transition", "stairs", "B3", [47,40], "B2", [48,35], "tokyu-plan", "Steps west of Hikarie gate toward B6", "unpaid");
  connect("hikarie-south-public-stairs", "Hikarie / south public passage", "stairs", "B3", [47,76], "B2", [48,81], "tokyu-plan", "Steps from Hikarie 2 area to south corridor", "unpaid");
  addSpace("c1-upper-landing", "C1-side upper lift landing", "2F", rect(116,84,18,20), [125,98], "tokyu-plan", "Lift 31 upper range endpoint");
  addSpace("c2-upper-landing", "C2-side upper lift landing", "2F", rect(98,98,18,19), [107,111], "tokyu-plan", "Lift 32 upper range endpoint");
  lift("tokyu-lift-31", "31", "Lift 31 · south junction", ["B2","2F"], [122,91], "tokyu-plan", "31 / 2F–B2 range", "unpaid", false);
  lift("tokyu-lift-32", "32", "Lift 32 · Stream side", ["B2","2F"], [106,104], "tokyu-plan", "32 / 2F–B2 range", "unpaid", false);
  addSpace("hikarie-upper-landing", "Hikarie upper lift landing", "4F", rect(113,42,28,22), [130,59], "tokyu-plan", "22 / 4F range endpoint; facility floor naming");
  addSpace("hikarie-surface-landing", "Hikarie surface lift landing", "1F", rect(113,42,28,22), [130,59], "tokyu-plan", "Hikarie-side 1F landing");
  lift("tokyu-lift-22-upper", "22 (4F range)", "Hikarie lift · B3–4F", ["B3","4F"], [119,50], "tokyu-plan", "22 left symbol, 4F–B3 range", "unpaid", false);
  lift("tokyu-lift-22-surface", "22 adjacent (1F range)", "Hikarie lift · B3–1F", ["B3","1F"], [129,53], "tokyu-plan", "Separate adjacent symbol, 1F–B3 range", "unpaid", false);
  addSpace("b6-upper-landing", "B6 upper lift landing", "3F", rect(46,35,23,18), [59,47], "tokyu-plan", "Lift 23 / 3F endpoint");
  addSpace("b6-surface-landing", "B6 surface lift landing", "1F", rect(40,24,22,20), [53,39], "tokyu-plan", "B6 / ground lift endpoint");
  lift("tokyu-lift-23-upper", "23 (3F range)", "B6 lift · B2–3F", ["B2","3F"], [54,42], "tokyu-plan", "23 / 3F–B2 range", "unpaid", false);
  lift("tokyu-lift-23-surface", "23 adjacent (1F range)", "B6 lift · B2–1F", ["B2","1F"], [44,30], "tokyu-plan", "Separate ground-route lift symbol", "unpaid", false);

  // JR: source letter IDs, four distinct gate areas, platforms stay on 2F.
  reviseSpace("jr-central-concourse", { levelId: "3F", name: "JR Central gate concourse", polygon: rect(-35,-9,70,25), labelPosition: [0,5], kind: "concourse" }, "jr-map", "June 2026 / 3F Central Gate", "paid");
  addSpace("jr-central-public", "JR Central outside-gate passage", "3F", [[-54,-23],[50,-23],[50,18],[35,18],[35,-9],[-35,-9],[-35,18],[-54,18]], [-44,-14], "jr-map", "3F Central public approach");
  reviseSpace("ground-jr", { name: "JR South gate concourse", polygon: rect(-35,-23,73,74), labelPosition: [-1,27] }, "jr-map", "1F South Gate / lifts A,F", "paid");
  addSpace("jr-hachiko-concourse", "JR Hachiko gate concourse", "1F", rect(-35,-71,64,44), [0,-44], "jr-map", "1F Hachiko Gate / lifts B,C", "paid");
  addSpace("jr-new-south", "JR New South gate concourse", "3F", rect(-35,46,70,28), [0,68], "jr-map", "3F New South Gate / lifts D,E", "paid");
  addSpace("jr-new-south-public", "New South free passage", "3F", corridor([[-53,78],[42,78],[58,86]],12), [20,79], "jr-map", "3F public passage beside New South gate", "unpaid", "passage");
  reviseSpace("ginza-jr-bridge", { levelId: "3F", name: "JR Central elevated approach", polygon: corridor([[121,-17],[50,-17],[40,-16]],8), labelPosition: [75,-17] }, "jr-map", "Central Gate 3F; exact external alignment illustrative", "unpaid");
  for (const [letter, x, z, floors] of [
    ["A",8,-15,["1F","2F","3F"]],["B",-25,-55,["1F","2F"]],["C",8,-55,["1F","2F"]],
    ["D",8,57,["2F","3F"]],["E",-25,57,["2F","3F"]],["F",-25,-15,["1F","2F","3F"]],
  ] as [string,number,number,Level[]][]) {
    // Central lift shafts meet a short 3F north extension of the paid concourse.
    if (letter === "A" || letter === "F") addSpace(`jr-${letter}-landing-3f`, `JR lift ${letter} landing`, "3F", rect(x-4,-20,8,14), [x,-12], "jr-map", `3F lift ${letter} landing`, "paid");
    lift(`jr-lift-${letter}`, letter, `JR lift ${letter}`, floors, [x,z], "jr-map", `Lift ${letter} matched across June 2026 panels`);
  }
  for (const [suffix,x] of [["yamanote",-16],["saikyo",18]] as [string,number][]) {
    connect(`jr-central-${suffix}-stairs`, `JR Central / ${suffix} stairs`, "stairs", "2F", [x,20], "3F", [x,2], "jr-map", "3F Central / 2F platform stair bank");
    connect(`jr-new-south-${suffix}-stairs`, `New South / ${suffix} stairs`, "stairs", "2F", [x,36], "3F", [x,64], "jr-map", "New South stair bank");
    connect(`jr-central-${suffix}-escalator`, `JR Central / ${suffix} escalator`, "escalator", "2F", [x,-5], "3F", [x,10], "jr-map", "Central escalator symbol; direction not inferred", "paid", 2.5);
    connect(`jr-new-south-${suffix}-escalator`, `New South / ${suffix} escalator`, "escalator", "2F", [x,73], "3F", [x,51], "jr-map", "New South escalator symbol; direction not inferred", "paid", 2.5);
  }
  connect("keio-jr-central-stairs", "Keio approach / JR Central level", "stairs", "2F", [-47,-15], "3F", [-47,2], "jr-map", "Central public approach toward Keio; exact bank unresolved", "unpaid").evidence!.certainty = "inferred";

  getConnector("keio-jr-central-stairs").access!.status="unconfirmed";

  // Keio's 4F Avenue, 1F West and arrival-only platform.
  addSpace("keio-central-gate", "Keio Central gate area", "2F", rect(-64,26,24,43), [-50,55], "keio-floor", "2F Central gate", "mixed");
  addSpace("keio-arrival-platform", "Keio arrival-only platform", "2F", rect(-156,55,93,9), [-112,60], "keio-floor", "Separate arrival-only platform", "paid", "platform").color = "#e3d4ef";
  addSpace("keio-west-gate", "Keio West gate area", "1F", rect(-160,20,55,50), [-133,45], "keio-floor", "1F West gate", "mixed");
  addSpace("keio-avenue-gate", "Keio Avenue gate area", "4F", rect(-153,25,25,44), [-141,45], "keio-floor", "4F Avenue gate", "mixed");
  addSpace("markcity-avenue", "Mark City Avenue", "4F", corridor([[-140,64],[-45,64]],10), [-92,64], "markcity-access", "Restaurants Avenue 4F connection", "unpaid", "passage");
  addSpace("keio-central-surface", "Mark City surface lift landing", "1F", rect(-60,51,21,21), [-50,62], "keio-floor", "Ground endpoint of external Central lift");
  lift("keio-central-lift", "Central outside-gate lift", "Keio Central / Mark City lift", ["1F","2F","4F"], [-50,62], "keio-floor", "Outside Central gate: ground and Avenue destinations", "unpaid");
  for (const [letter,from,a,to,b] of [
    ["A","2F",[-142,37],"4F",[-140,28]], ["B","2F",[-142,59],"4F",[-140,60]],
    ["C","1F",[-150,22],"2F",[-150,34]], ["D","1F",[-150,68],"2F",[-150,60]],
    ["E","1F",[-111,33],"2F",[-126,36]], ["F","1F",[-111,60],"2F",[-126,60]],
  ] as [string,Level,Point2,Level,Point2][]) {
    const c=connect(`keio-stair-${letter}`, `Keio stairs ${letter}`, "stairs", from,a,to,b,"keio-floor",`Lettered stair ${letter}`,"paid",3);
    c.equipmentId=letter;
    if (letter === "C" || letter === "D") { c.access!.status="closed-in-source"; c.access!.note="West-end stair replacement for lift works; planned through end-September 2026. Opening not confirmed."; c.evidence=evidence("keio-map",`West-end ${letter} closure overlay`); }
  }
  const works=facility("keio-west-works","Keio West lift works","works","keio-west-gate",[-150,45],"keio-works","2025-08-25 to end-September 2026, planned","mixed");
  works.access.status="planned"; works.access.note="New lift is not presented as open. Confirmation of completion is still required.";

  // Ginza's paid Meiji-dori lift and outside-gate ground lift are separate assets.
  reviseSpace("ginza-gates", { name:"Ginza Scramble Square gate area", polygon:rect(-55,-50,25,27), labelPosition:[-43,-40] }, "metro-map", "3F Scramble Square gate beside JR approach", "mixed");
  reviseSpace("ginza-east-landing", {name:"Ginza Meiji-dori gate area"}, "metro-map", "2F Meiji-dori gate and paid lift", "mixed");
  reviseSpace("ginza-jr-bridge", {polygon:corridor([[-42,-30],[-42,-18],[40,-18]],8), labelPosition:[0,-18]}, "jr-map", "3F Central public approach; external geometry schematic", "unpaid");
  getSpace("ginza-jr-bridge").evidence!.certainty="inferred";
  addSpace("ginza-scramble-surface", "Ginza ground lift landing", "1F", rect(-50,-43,15,16), [-42,-35], "metro-access", "Scramble Square gate–ground lift");
  data.connectors=data.connectors.filter(c=>c.id!=="g-lift");
  lift("metro-ginza-paid-lift", "Meiji-dori paid lift", "Ginza Meiji-dori lift", ["2F","3F"], [125,-36], "metro-access", "Meiji-dori gate–platform", "paid");
  lift("metro-ginza-unpaid-lift", "Scramble Square outside-gate lift", "Ginza Scramble Square / ground lift", ["1F","3F"], [-42,-35], "metro-access", "Scramble Square gate–ground; intermediate stops not specified", "unpaid", false);
  Object.assign(getConnector("g-east-stairs"), {name:"Ginza Meiji-dori stairs", to:{levelId:"3F",position:[125,-30]}, evidence:evidence("metro-map","2F Meiji-dori area–3F platform stair bank"), access:access("paid")});
  Object.assign(getConnector("g-west-stairs"), {name:"Ginza west outside-gate stairs", from:{levelId:"2F",position:[-36,-35]}, to:{levelId:"3F",position:[-42,-32]}, evidence:evidence("metro-map","Scramble Square side outside-gate stairs"), access:access("unpaid")});

  // Named gates are discrete boundaries, rather than decorative ticket bars on every slab.
  for (const [id,name,spaceId,point,src,hrs] of [
    ["jr-central","JR Central gate","jr-central-concourse",[34,4],"jr-map",null],
    ["jr-new-south","JR New South gate","jr-new-south",[0,73],"jr-map",null],
    ["jr-south","JR South gate","ground-jr",[34,25],"jr-map",null],
    ["jr-hachiko","JR Hachiko gate","jr-hachiko-concourse",[-34,-46],"jr-map",null],
    ["keio-central","Keio Central gate","keio-central-gate",[-60,45],"keio-floor",null],
    ["keio-west","Keio West gate","keio-west-gate",[-108,46],"keio-floor",null],
    ["keio-avenue","Keio Avenue gate","keio-avenue-gate",[-130,60],"keio-floor","07:30–22:00"],
    ["tokyu-dogenzaka","Dogenzaka gate","b2-west-concourse",[-89,4],"tokyu-plan",null],
    ["tokyu-hachiko","Hachiko gate · Tokyu","b2-west-concourse",[-18,7],"tokyu-plan",null],
    ["tokyu-miyamasuzaka-central","Miyamasuzaka Central gate","miyamasuzaka-b2",[65,-10],"tokyu-plan",null],
    ["tokyu-miyamasuzaka-east","Miyamasuzaka East gate","miyamasuzaka-b2",[99,-21],"tokyu-plan",null],
    ["tokyu-hikarie1","Hikarie 1 gate","hikarie-gates-b3",[54,35],"tokyu-plan",null],
    ["tokyu-hikarie2","Hikarie 2 gate","hikarie-gates-b3",[76,72],"tokyu-plan",null],
    ["ginza-meiji","Ginza Meiji-dori gate","ginza-east-landing",[120,-23],"metro-map",null],
    ["ginza-scramble","Ginza Scramble Square gate","ginza-gates",[-31,-34],"metro-map",null],
  ] as [string,string,string,Point2,string,string|null][]) facility(`gate-${id}`,name,"gate",spaceId,point,src,name,"mixed",hrs??undefined);
  // Identifiable amenities; icon placement is schematic, not a surveyed doorway.
  for (const [id,name,kind,spaceId,point,src,area] of [
    ["jr-south-wc","JR South accessible toilet","toilet","ground-jr",[-30,44],"jr-map","paid"],
    ["jr-hachiko-wc","JR Hachiko accessible toilet","toilet","jr-hachiko-concourse",[24,-31],"jr-map","paid"],
    ["jr-new-south-wc","JR New South accessible toilet","toilet","jr-new-south",[28,69],"jr-map","paid"],
    ["keio-central-wc","Keio accessible toilet","toilet","keio-central-gate",[-59,31],"keio-floor","paid"],
    ["keio-baby-care","Keio baby-care facilities","baby-care","keio-central-gate",[-45,31],"keio-floor","unpaid"],
    ["keio-aed","Keio AED","aed","keio-central-gate",[-45,44],"keio-floor","unknown"],
    ["keio-tickets","Keio tickets","tickets","keio-central-gate",[-43,57],"keio-floor","unpaid"],
    ["tokyu-b2-wc","Dogenzaka accessible toilet","toilet","b2-west-concourse",[-53,10],"tokyu-plan","unpaid"],
    ["tokyu-east-wc","Miyamasuzaka accessible toilet","toilet","miyamasuzaka-b2",[96,-33],"tokyu-plan","unpaid"],
    ["tokyu-b4-wc","B4 accessible toilet","toilet","b4-concourse",[85,32],"tokyu-plan","paid"],
    ["tokyu-lounge-wc","Chikamichi Lounge adjoining toilet","toilet","b1-west-spine",[-83,-32],"tokyu-plan","unpaid"],
    ["tokyu-aed-west","Dogenzaka AED","aed","b2-west-concourse",[-90,-13],"tokyu-plan","unpaid"],
    ["tokyu-aed-east","Miyamasuzaka AED","aed","miyamasuzaka-b2",[62,-32],"tokyu-plan","unpaid"],
    ["tokyu-hikarie-aed","Hikarie AED","aed","hikarie-public-b3",[105,38],"tokyu-plan","unpaid"],
    ["tokyu-west-lockers","West concourse lockers","lockers","b2-west-concourse",[-108,-8],"tokyu-plan","unpaid"],
    ["tokyu-hikarie-lockers","Hikarie lockers","lockers","hikarie-public-b3",[106,65],"tokyu-plan","unpaid"],
    ["tokyu-information","Wander Compass information","information","b1-west-spine",[-94,-31],"tokyu-plan","unpaid"],
    ["tokyu-hikarie-tickets","Hikarie ticket facilities","tickets","hikarie-public-b3",[104,31],"tokyu-plan","unpaid"],
    ["ginza-wc","Ginza accessible toilet","toilet","ginza-east-landing",[131,-40],"metro-access","paid"],
  ] as [string,string,ExplorerFacility["kind"],string,Point2,string,FeatureAccess["area"]][]) facility(id,name,kind,spaceId,point,src,name,area);
  data.facilities.find(f=>f.id==="tokyu-lounge-wc")!.access.note="Adjoining lounge is closed in the source; toilet available first to last train.";
  data.exits.find(e=>e.code==="A0")!.access={...access("unpaid"),hours:"Weekdays 04:35–00:45 next day; weekends/holidays 04:35–00:35 next day"};
  data.exits.find(e=>e.code==="C2")!.access={...access("unpaid"),hours:"First to last train (source plan)"};
  for (const e of data.exits) e.sourceDate="Plan dated 21 August 2026; exit-direction inset 30 August 2024; reviewed 19 September 2026";

  // Remaining v1 banks are explicitly generic, never falsely assigned an asset ID.
  for (const c of data.connectors) if (!c.evidence) {
    const sourceId=c.id.startsWith("jr-")?"jr-map":c.id.startsWith("g-")?"metro-map":"tokyu-plan";
    c.evidence=evidence(sourceId,"General floor relationship; individual bank correspondence unresolved",true);
    c.access={...access("unknown"),status:"unconfirmed",...(c.kind==="escalator"?{direction:"unknown" as const}:{}),note:"Illustrative bank; source equipment identity and exact location remain unverified."};
  }
  // Retained v1 features remain explicitly unmeasured and do not acquire implied paid boundaries.
  for (const s of data.spaces) if (!s.access) s.access={area:"unknown",status:"unconfirmed",note:"Schematic extent; paid-area boundary is not established for this shape."};
  return data;
}
