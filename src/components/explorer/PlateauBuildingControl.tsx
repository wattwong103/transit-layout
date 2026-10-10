import summary from "@/data/plateau-buildings-summary.json";

export default function PlateauBuildingControl({enabled,onChange,status,onRetry}: {
  enabled:boolean;onChange:(value:boolean)=>void;status:string;onRetry:()=>void;
}) {
  return <div className="my-3 rounded border border-[#cedcd4] bg-[#f3f7f3] p-3 text-xs leading-relaxed">
    <label className="flex items-center gap-2 font-medium">
      <input type="checkbox" checked={enabled} onChange={event=>onChange(event.target.checked)}/>
      PLATEAU 3D buildings
    </label>
    <p className="mt-1">Eight source meshes with roof shapes and setbacks. Optional {Math.round(summary.bytes/1000)} KB download; no textures.</p>
    {enabled && <p className="mt-1">Source heights and positions; station floors remain illustrative. 2025 release, surveys mostly 2021.</p>}
    <p role="status" className="mt-1">
      {status === "loading" ? "Loading building shapes…" : status === "ready" ? "Eight PLATEAU buildings loaded." : status === "error" ? <>Building shapes could not load. Simple outlines remain available. <button className="underline" onClick={onRetry}>Retry building download</button></> : null}
    </p>
  </div>;
}
