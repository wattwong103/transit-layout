import type { HeightMode } from "@/lib/stationHeights";

export default function HeightModeControl({mode,onChange,onFocus}: {
  mode:HeightMode; onChange:(value:HeightMode)=>void; onFocus:(station:"keio"|"ginza"|"jr")=>void;
}) {
  return <section className="my-3 rounded border border-[#cedcd4] bg-[#f3f7f3] p-3 text-xs leading-relaxed" aria-label="Station height view">
    <div className="flex gap-2" role="group" aria-label="Vertical view">
      {(["realistic","exploded"] as HeightMode[]).map(value=><button key={value} aria-pressed={mode===value}
        className={`rounded border px-3 py-2 ${mode===value ? "bg-[#32665a] text-white" : "bg-white"}`}
        onClick={()=>onChange(value)}>{value === "realistic" ? "Realistic" : "Exploded"}</button>)}
    </div>
    <p className="mt-2"><strong>{mode === "realistic" ? "Estimated heights · verification needed" : "Floors separated for clarity"}</strong></p>
    <p>{mode === "realistic" ? "Floor heights and the ground reference are estimates, not measurements." : "Vertical spacing is exaggerated; horizontal geometry stays aligned. Choose a floor to see its layout."}</p>
    <details className="mt-2">
      <summary className="cursor-pointer">Alignment & heights to verify</summary>
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2" role="group" aria-label="Compare station platforms">
      <button className="underline underline-offset-4" onClick={()=>onFocus("keio")}>Keio inside Mark City · 2F</button>
      <button className="underline underline-offset-4" onClick={()=>onFocus("ginza")}>Ginza platforms · 3F</button>
      <button className="underline underline-offset-4" onClick={()=>onFocus("jr")}>JR platforms · 2F</button>
    </div>
    <p className="mt-2">Keio, Ginza and JR platform outlines follow public map coordinates. Gate and equipment locations are inferred. PLATEAU surveys mostly date to 2021, before JR’s 2023 platform and 2024 New South gate changes.</p>
      <table className="my-2 w-full text-left"><thead><tr><th>Confirmed floor</th><th>Assumed height*</th></tr></thead><tbody>
        <tr><td>Keio West gate · 1F</td><td>0 m · unverified datum</td></tr>
        <tr><td>Keio platforms / Central · 2F</td><td>+5 m · unverified</td></tr>
        <tr><td>Keio Avenue gate · 4F</td><td>+15 m · unverified</td></tr>
        <tr><td>Ginza platforms / Scramble Square gate · 3F</td><td>+10 m · unverified</td></tr>
        <tr><td>Ginza Meiji-dori gate · 2F</td><td>+5 m · unverified</td></tr>
        <tr><td>JR platforms 1–4 · 2F</td><td>+5 m · unverified</td></tr>
        <tr><td>JR Central / New South gates · 3F</td><td>+10 m · unverified</td></tr>
        <tr><td>JR South / Hachiko gates · 1F</td><td>0 m · unverified datum</td></tr>
      </tbody></table>
      <p>*Above assumed 1F. All station levels currently use a 5 m floor interval. This is a display estimate, including the connection to PLATEAU heights. The same floor name at different operators does not establish the same elevation. Sloping streets and building-specific floor elevations still need measurements.</p>
      <p className="mt-1">Floors: <a className="underline" href="https://www.keio.co.jp/train/station/station_map/pdf/in01_shibuya_floor_map.pdf" target="_blank" rel="noreferrer">Keio</a> · <a className="underline" href="https://www.s-markcity.co.jp/office/pdf/office.pdf?up=20240311" target="_blank" rel="noreferrer">Mark City</a> · <a className="underline" href="https://www.tokyometro.jp/station/shibuya/index.html" target="_blank" rel="noreferrer">Tokyo Metro</a> · <a className="underline" href="https://www.jreast.co.jp/estation/stations/808.html" target="_blank" rel="noreferrer">JR East</a>.</p>
      <p className="mt-1">Public outlines: <a className="underline" href="https://www.openstreetmap.org/way/759134298" target="_blank" rel="noreferrer">Ginza</a> · <a className="underline" href="https://www.openstreetmap.org/relation/18546084" target="_blank" rel="noreferrer">JR 1–2</a> · <a className="underline" href="https://www.openstreetmap.org/relation/18546085" target="_blank" rel="noreferrer">JR 3–4</a> · © OpenStreetMap contributors.</p>
    </details>
  </section>;
}
