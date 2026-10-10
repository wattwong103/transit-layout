import type { ExplorerDataset } from "@/types/explorer";
import { getSelection } from "@/lib/explorer";

export default function EntranceDetails({data, targetId, unitsToMeters = 1}: {data:ExplorerDataset;targetId:string|null;unitsToMeters?:number}) {
  const records = data.entranceReferences?.filter(r=>r.targetId===targetId) ?? [];
  const selection = getSelection(data,targetId);
  const target = selection.exit?.position ?? selection.connector?.stops?.find(s=>s.levelId==="1F")?.position;
  if (!records.length) return selection.exit ? <p className="my-3 text-xs leading-relaxed">No accepted current-code public map reference is available for this exit in the reviewed snapshot. Its landing remains schematic; an entrance sign and wider street-context photo would help establish its identity.</p> : null;
  return <section aria-label="Public entrance references" className="my-3 rounded border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed">
    <strong>Mapped entrance references</strong>
    <p>Blue circles use OpenStreetMap coordinates on the comparison plane. Yellow exits remain schematic landings. Map positions are not surveyed checkpoints.</p>
    {records.map(r=><p key={r.id} className="mt-2">
      <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="underline">{r.ref} · source map ↗</a>
      {target && <> · {(Math.hypot(r.position[0]-target[0],r.position[1]-target[1])*unitsToMeters).toFixed(1)} m horizontal separation from the schematic {selection.exit ? "landing" : "surface stop"}</>}
      <br/>Map record updated {r.sourceUpdatedAt.slice(0,10)}. {r.sourceLevel ? `Source level: ${r.sourceLevel}; no measured elevation.` : "Source level not recorded."}
      {r.match === "exit-group" && " Branch suffix is grouped under the diagram’s main exit code; individual branch connections remain unverified."}
    </p>)}
    <p className="mt-2">Separation includes any approach between the entrance and landing; it is not a measured alignment error or a walking route. Checked 10 October 2026. <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · ODbL</a>.</p>
  </section>;
}
