import type { ExplorerLevelId } from "../types/explorer";

export type HeightMode = "realistic" | "exploded";
/** Explicit layout assumptions, NOT measured heights or a surveyed terrain datum. */
export const stationHeights: Record<ExplorerLevelId, {order:number; meters:number; status:"unverified"}> = {
  "B5":{order:-5,meters:-25,status:"unverified"},
  "B4":{order:-4,meters:-20,status:"unverified"},
  "B3":{order:-3,meters:-15,status:"unverified"},
  "B2":{order:-2,meters:-10,status:"unverified"},
  "B1":{order:-1,meters:-5,status:"unverified"},
  "1F":{order:0,meters:0,status:"unverified"},
  "2F":{order:1,meters:5,status:"unverified"},
  "3F":{order:2,meters:10,status:"unverified"},
  "4F":{order:3,meters:15,status:"unverified"},
};

/** The same assumed floor surface in both frames; exploded spacing never enters realistic mode. */
export function stationLevelHeight(level:string, mode:HeightMode, spacing:number, metersPerUnit=1):number {
  const value=stationHeights[level as ExplorerLevelId];
  if (!value) throw new Error(`Unknown station level ${level}`);
  return mode === "realistic" ? value.meters/metersPerUnit : value.order*spacing;
}
