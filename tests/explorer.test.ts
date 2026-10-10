import test from "node:test";
import assert from "node:assert/strict";
import { explorerData as data } from "../src/data/explorer";
import {
  getSelection,
  getVisibleFeatures,
  getSpaceOpenings,
  placeBuildingLabels,
  connectorLevels,
} from "../src/lib/explorer";
import type { ExplorerDataset, ExplorerSpace } from "../src/types/explorer";
import { buildingAssociationAnchor, associationVisible, placeDiagramLabel, type LabelBox } from "../src/lib/diagramPresentation";

test("destination association anchors use outer building boundaries without moving the source", () => {
  const building = {...data.buildings[0], polygon:[[0,0],[10,0],[10,10],[0,10]] as const,
    parts: [ [[[0,0],[10,0],[10,10],[0,10]], [[3,3],[7,3],[7,7],[3,7]]], [[[20,0],[24,0],[24,4],[20,4]]] ]} as unknown as typeof data.buildings[number];
  const before = JSON.stringify(building);
  assert.deepEqual(buildingAssociationAnchor(building,[-5,4]),[0,4]);
  assert.deepEqual(buildingAssociationAnchor(building,[5,5]),[5,0],"A courtyard hole is not a destination boundary");
  assert.deepEqual(buildingAssociationAnchor(building,[25,3]),[24,3],"Multipart outlines use the nearest part");
  assert.equal(JSON.stringify(building),before);
});

test("overview connections respect floor, selection and direct versus toward evidence", () => {
  const links = data.exits.flatMap(e=>e.destinations.map(d=>({...d,exitId:e.id,levels:[e.levelId]})));
  const visible = (level: "all" | "B1" | "B2" | "B3", selected: string | null, showAll=true) => links.filter(l=>associationVisible(l,"both",level,selected,showAll));
  assert.equal(visible("all",null).length,8);
  assert.equal(visible("all",null,false).length,0);
  assert.deepEqual(visible("all","mark-city").map(l=>[l.exitId,l.relationship]),[["exit-a5","toward"]]);
  assert.equal(visible("all","exit-a5").length,2);
  assert.equal(visible("B2","exit-a5").length,0);
  assert.equal(visible("all","exit-a0").length,0,"An unmapped exit gains no invented connection");
  assert.equal(visible("B1",null).length,4);
  assert.equal(visible("B2",null).length,3);
  assert.deepEqual(visible("B3",null).map(l=>l.exitId),["exit-b5"],"B5 is an exit code on B3");
  assert.equal(associationVisible(links[0],"station","all",null,true),false);
});

test("floor callouts remain inside the viewport and clear adjacent labels", () => {
  for (const width of [320,900]) {
    const occupied: LabelBox[] = [];
    for(let i=0;i<9;i++) {
      const placement = placeDiagramLabel([6,35+i*38],34,26,[width,420],occupied,"floor");
      assert.ok(placement);
      const b=placement.bounds;
      assert.ok(b.left>=0&&b.right<=width&&b.top>=0&&b.bottom<=420);
      assert.ok(occupied.every(a=>b.right<=a.left||b.left>=a.right||b.bottom<=a.top||b.top>=a.bottom));
      occupied.push(b);
    }
    const selected = placeDiagramLabel([width-2,418],150,24,[width,420],occupied,"platform",true)!;
    assert.ok(selected.bounds.right<=width&&selected.bounds.bottom<=420,"Selected callouts may not be clipped");
  }
});

test("Hikarie and Scramble Square labels clear their exit badges at desktop and mobile scales", () => {
  const before = JSON.stringify(data);
  for (const code of ["B5", "B6"]) {
    const exit = data.exits.find(item => item.code === code)!;
    const visible = getVisibleFeatures(data, "both", exit.levelId);
    for (const scale of [0.75, 1.6, 3]) {
      const positions = placeBuildingLabels(visible.buildings, visible.exits, scale);
      const label = positions.get(exit.destinations[0].buildingId)!;
      assert.ok(Math.abs(label[1] - exit.position[1]) * scale >= 20,
        `${code} badge must not cover its destination name at scale ${scale}`);
    }
  }
  assert.equal(
    JSON.stringify(data),
    before,
    "Label placement must not edit canonical geometry",
  );
});

test("all selectable features resolve and all exit destinations and floor references exist", () => {
  const features = [
    ...data.spaces,
    ...data.connectors,
    ...data.buildings,
    ...data.exits,
    ...(data.facilities ?? []),
  ];
  assert.equal(
    new Set(features.map((item) => item.id)).size,
    features.length,
    "IDs must be globally unique for shared selection",
  );
  const levels = new Set(data.levels.map((item) => item.id));
  for (const feature of features) {
    const selection = getSelection(data, feature.id);
    assert.ok(
      selection.exit ||
        selection.space ||
        selection.building ||
        selection.connector || selection.facility,
      `Unresolved pick: ${feature.id}`,
    );
  }
  for (const exit of data.exits) {
    assert.ok(levels.has(exit.levelId));
    assert.equal(
      data.spaces.find((space) => space.id === exit.spaceId)?.levelId,
      exit.levelId,
    );
    assert.equal(new URL(exit.sourceUrl).protocol, "https:");
    assert.ok(exit.sourceDate);
    for (const destination of exit.destinations)
      assert.ok(
        data.buildings.some(
          (building) => building.id === destination.buildingId,
        ),
      );
  }
  for (const space of data.spaces) {
    assert.ok(levels.has(space.levelId));
    assert.ok(space.polygon.length >= 3);
    assert.ok(space.polygon.every((point) => point.every(Number.isFinite)));
    const area = space.polygon.reduce((sum, [x, y], i, points) => {
      const next = points[(i + 1) % points.length];
      return sum + x * next[1] - next[0] * y;
    }, 0);
    assert.ok(Math.abs(area) > 1, `Degenerate space ${space.id}`);
  }
  for (const connector of data.connectors) {
    assert.ok(
      levels.has(connector.from.levelId) && levels.has(connector.to.levelId),
    );
    assert.notEqual(connector.from.levelId, connector.to.levelId);
    assert.ok(connector.width > 0);
  }
});

test("building selection reveals only its own association when an exit serves multiple destinations", () => {
  const markCity = getSelection(data, "mark-city");
  assert.deepEqual(
    markCity.connections.map((link) => [
      link.exit.code,
      link.buildingId,
      link.relationship,
    ]),
    [["A5", "mark-city", "toward"]],
  );
  assert.equal(markCity.highlightedIds.has("fukuras"), false);
  const a5 = getSelection(data, "exit-a5");
  assert.equal(a5.connections.length, 2);
  assert.ok(a5.connections.every((link) => link.relationship === "toward"));
  assert.equal(
    getSelection(data, "exit-b5").connections[0].relationship,
    "direct",
  );
  assert.equal(
    getSelection(data, "exit-b5").connections[0].buildingId,
    "hikarie",
  );
  assert.equal(
    getSelection(data, "exit-a0").connections.length,
    0,
    "Unmapped exit must not invent a destination",
  );
});

test("context toggles retain canonical coordinates and selected floor exits", () => {
  const original = JSON.stringify(data);
  for (const mode of ["station", "buildings", "both"] as const) {
    for (const level of data.levels) {
      const visible = getVisibleFeatures(data, mode, level.id);
      assert.ok(visible.spaces.every((space) => space.levelId === level.id));
      assert.ok(visible.exits.every((exit) => exit.levelId === level.id));
      assert.ok(
        visible.connectors.every(
          (connector) =>
            connectorLevels(connector).includes(level.id),
        ),
      );
      assert.equal(
        visible.buildings.length,
        mode === "station" ? 0 : data.buildings.length,
      );
      if (mode === "buildings")
        assert.equal(visible.spaces.length + visible.connectors.length, 0);
      for (const space of visible.spaces)
        assert.equal(
          space,
          data.spaces.find((item) => item.id === space.id),
        );
    }
  }
  assert.equal(
    JSON.stringify(data),
    original,
    "Display filtering must never rewrite source coordinates",
  );
  assert.equal(
    getVisibleFeatures(data, "both", "all").spaces.length,
    data.spaces.length,
  );
});

test("stair voids cut the upper floor and lift voids pass through intermediate floors", () => {
  const base: ExplorerSpace = {
    id: "room",
    name: "Room",
    levelId: "B1",
    kind: "concourse",
    color: "#fff",
    labelPosition: [0, 0],
    polygon: [
      [-20, -20],
      [20, -20],
      [20, 20],
      [-20, 20],
    ],
  };
  const fixture: ExplorerDataset = {
    levels: data.levels,
    spaces: [base],
    buildings: [],
    exits: [],
    connectors: [
      {
        id: "stairs",
        kind: "stairs",
        from: { levelId: "B1", position: [0, 0] },
        to: { levelId: "B2", position: [0, 10] },
        width: 4,
      },
    ],
  };
  assert.equal(
    getSpaceOpenings(fixture, base).length,
    1,
    "Stairs may be stored top-to-bottom",
  );
  assert.equal(
    getSpaceOpenings(fixture, { ...base, levelId: "B2" }).length,
    0,
    "Stair landing must not puncture its bottom floor",
  );
  fixture.connectors[0] = {
    id: "lift",
    kind: "lift",
    from: { levelId: "B3", position: [0, 0] },
    to: { levelId: "B1", position: [0, 0] },
    width: 4,
  };
  assert.equal(getSpaceOpenings(fixture, { ...base, levelId: "B2" }).length, 1);
  assert.equal(getSpaceOpenings(fixture, { ...base, levelId: "B3" }).length, 0);
  assert.equal(
    getSpaceOpenings(fixture, {
      ...base,
      polygon: [
        [1, 1],
        [8, 1],
        [8, 8],
        [1, 8],
      ],
    }).length,
    0,
    "Shaft outside a room must not create a corrupt hole",
  );
});
