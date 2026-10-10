"use client";

import {useMemo,useState} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {geographicExplorer,schematicExplorer} from "@/lib/stationRegistration";
import {detailPlatforms,measureFootprint,platformDetail} from "@/lib/geometryDimensions";
import {getSelection} from "@/lib/explorer";
import FeatureDetails from "../explorer/FeatureDetails";
import type {Point2} from "@/types/explorer";
import styles from "./detail.module.css";

const Explorer3D=dynamic(()=>import("../explorer/Explorer3D"),{ssr:false,loading:()=> <p className={styles.loading}>Preparing the close-up…</p>});
const number=(n:number)=>n.toLocaleString("en-US",{maximumFractionDigits:1,minimumFractionDigits:1});

export default function GeometryDetail() {
  const [platformId,setPlatformId]=useState<string>("ginza-platform");
  const [view,setView]=useState<"3d"|"plan">("3d");
  const [access,setAccess]=useState(false);
  const [exploded,setExploded]=useState(false);
  const [labels,setLabels]=useState(true);
  const [selected,setSelected]=useState<string|null>(platformId);
  const [reset,setReset]=useState(0),[zoomStep,setZoomStep]=useState(0);
  const [planZoom,setPlanZoom]=useState(1),[along,setAlong]=useState(50);
  const record=detailPlatforms.find(p=>p.id===platformId)!;
  const platform=geographicExplorer.spaces.find(p=>p.id===platformId)!;
  // Keio's rendered equipment cutouts are inferred, not holes in its public outline.
  const holes=useMemo(()=>platformId.startsWith("jr-")?platform.openings??[]:[],[platformId,platform]);
  const measure=useMemo(()=>measureFootprint(platform.polygon,holes),[platform,holes]); // Metric frame, never drawing units.
  const data=useMemo(()=>platformDetail(schematicExplorer,platformId,access),[platformId,access]);
  const selection=getSelection(data,selected);
  const feature=selection.space??selection.connector??selection.facility;
  function choose(id:string) {setPlatformId(id);setSelected(id);setReset(v=>v+1);setPlanZoom(1);setAlong(50);}
  function fit() {setReset(v=>v+1);setPlanZoom(1);setAlong(50);}
  function zoom(delta:number) {if(view==="3d") setZoomStep(v=>v+delta);else setPlanZoom(v=>Math.max(1,Math.min(6,v*Math.pow(1.4,delta))));}
  const path=(ring:readonly Point2[])=>ring.map((p,i)=>`${i?"L":"M"}${measure.project(p).join(",")}`).join(" ")+" Z";
  const padding=measure.length*.10,baseWidth=measure.length+2*padding;
  const baseHeight=Math.max(measure.width+padding*3,baseWidth*.5),width=baseWidth/planZoom,height=baseHeight/planZoom;
  const centerX=measure.length/2+(along/100-.5)*(baseWidth-width);
  const left=centerX-width/2,top=measure.width/2-height/2;
  const font=baseWidth/65/planZoom,unit=measure.length>180?20:10;
  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>SHIBUYA / GEOMETRY DETAIL</span><h1>Station geometry, up close.</h1></div>
      <nav><Link href="/" prefetch={false}>Station diagram</Link><Link href="/area" prefetch={false}>Unified map</Link></nav>
    </header>
    <div className={styles.workspace}>
      <aside className={styles.sidebar} aria-label="Geometry inspection controls">
        <p className={styles.intro}>Inspect one platform at a time. Zooming changes the camera, not the platform’s dimensions.</p>
        <label className={styles.field}>Platform<select aria-label="Inspect platform" value={platformId} onChange={e=>choose(e.target.value)}>
          {detailPlatforms.map(p=><option key={p.id} value={p.id}>{p.name} · {p.floor}</option>)}
        </select></label>
        <div className={styles.switch} role="group" aria-label="Detail view">
          <button aria-pressed={view==="3d"} onClick={()=>setView("3d")}>Enlarged 3D</button>
          <button aria-pressed={view==="plan"} onClick={()=>setView("plan")}>Measured plan</button>
        </div>
        <section className={styles.measurements} aria-label="Source footprint dimensions">
          <span className={styles.eyebrow}>PUBLIC MAP DIMENSIONS · APPROXIMATE</span>
          <dl><div><dt>Overall length span</dt><dd data-testid="platform-length">{number(measure.length)} <small>m</small></dd></div>
            <div><dt>Overall width span</dt><dd>{number(measure.width)} <small>m</small></dd></div>
            <div><dt>Centre cross-section</dt><dd data-testid="platform-section">{number(measure.centreWidth)} <small>m</small></dd></div>
            <div><dt>Mapped surface area</dt><dd>{Math.round(measure.area).toLocaleString("en-US")} <small>m²</small></dd></div></dl>
          <p>The spans enclose the whole curved outline. They are not a constant platform width or a usable boarding length. The centre section is marked on the plan. Area excludes mapped openings.</p>
        </section>
        {view==="3d"?<>
          <label className={styles.check}><input type="checkbox" checked={access} onChange={e=>{setAccess(e.target.checked);setSelected(platformId);setReset(v=>v+1);}}/>Include gates & connections</label>
          <label className={styles.check}><input type="checkbox" checked={labels} onChange={e=>setLabels(e.target.checked)}/>Show labels</label>
          <div className={styles.switch} role="group" aria-label="Detail floor spacing">
            <button aria-pressed={!exploded} onClick={()=>setExploded(false)}>Estimated heights</button>
            <button aria-pressed={exploded} onClick={()=>setExploded(true)}>Exploded</button>
          </div>
          <p className={styles.note}>{exploded?"Floors are separated for reading; vertical distances are exaggerated.":"Floor elevations use the provisional 5 m interval. Heights, slab thickness and equipment dimensions are not measured."}</p>
        </>:<>
          <label className={styles.field}>Along platform<input aria-label="Along platform" type="range" min="0" max="100" value={along} disabled={planZoom===1} onChange={e=>setAlong(Number(e.target.value))}/></label>
          <p className={styles.note}>Zoom in, then slide along the platform to inspect either end. The plan is rotated to fit the screen; both axes use the same metre scale.</p>
        </>}
        <details className={styles.evidence}><summary>Size check & remaining uncertainty</summary>
          <p>Rechecked 11 October 2026. Geographic dimensions agree with an independent WGS84 geodesic calculation; the diagram’s drawing units are converted once.</p>
          <p>Tokyo Metro describes the current Ginza platform as approximately 12 m wide. The mapped centre section is 12.5 m; the 12.7 m enclosing span includes its shape and bends.</p>
          <p>JR’s 19.2 m and 21.6 m enclosing spans include platform curvature. Their mapped centre sections are about 12.6 m and 11.0 m. These are map-derived measurements, not a platform survey.</p>
          <p>PLATEAU roofs do not establish interior dimensions. Exact gate, lift, stair and track positions, usable widths and elevations still need photos or measurements. Keio’s 3D equipment cutouts are illustrative and are excluded from the measured plan.</p>
          <p><a href={record.source} target="_blank" rel="noreferrer">Selected public outline ↗</a> · <a href="https://www.tokyometro.jp/news/2019/203391.html" target="_blank" rel="noreferrer">Metro width reference ↗</a></p>
        </details>
        {feature&&view==="3d"&&<details className={styles.evidence}><summary>Selected feature: {"name" in feature?feature.name:"Station geometry"}</summary><FeatureDetails feature={feature}/></details>}
      </aside>
      <section className={styles.scene} aria-label="Enlarged station geometry">
        <div className={styles.sceneTitle}><span className={styles.eyebrow}>{view==="plan"?"METRE PLAN · ROTATED FOR CLARITY":exploded?"CLOSE-UP · EXPLODED FLOORS":"CLOSE-UP · HEIGHTS UNVERIFIED"}</span>
          <h2>{record.name} <span> / {record.floor}</span></h2><p>{view==="plan"?"Exact source outline · mapped openings preserved":access?"Shared station geometry · access positions inferred":"Public platform outline · illustrative rail strokes"}</p></div>
        {view==="3d"?<Explorer3D data={data} contextMode="station" activeLevel="all" selectedId={selected} onSelect={setSelected}
          separation={18} heightMode={exploded?"exploded":"realistic"} showLabels={labels} resetKey={reset} zoomStep={zoomStep} inspection/>
          :<svg className={styles.plan} viewBox={`${left} ${top} ${width} ${height}`} role="img" aria-label={`${record.name} dimensioned platform plan`}
            data-testid="dimension-plan" data-length-m={measure.length} data-width-m={measure.width} data-section-m={measure.centreWidth} data-zoom={planZoom}>
            <defs><pattern id="metre-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#d8e2dd" strokeWidth=".12"/></pattern></defs>
            <rect x={left} y={top} width={width} height={height} fill="url(#metre-grid)"/>
            <rect x="0" y="0" width={measure.length} height={measure.width} fill="none" stroke="#899a96" strokeDasharray="1 1" strokeWidth=".18"/>
            <path d={[platform.polygon,...holes].map(path).join(" ")} fill={platform.color} stroke="#356b61" strokeWidth=".25" fillRule="evenodd"/>
            {platform.polygon.map((p,i)=>{const [x,y]=measure.project(p);return <circle key={i} cx={x} cy={y} r={.25} fill="#356b61"/>;})}
            {measure.centreSection.length===2&&<g stroke="#087f91" strokeWidth=".28" strokeDasharray="1 .5"><line x1={measure.centreSection[0][0]} y1={measure.centreSection[0][1]} x2={measure.centreSection[1][0]} y2={measure.centreSection[1][1]}/></g>}
            <g fill="#355952" fontSize={font} textAnchor="middle" stroke="#355952" strokeWidth=".18">
              <path d={`M0 ${-padding*.5} H${measure.length} M0 ${-padding*.7} V0 M${measure.length} ${-padding*.7} V0`} fill="none"/>
              <text x={measure.length/2} y={-padding*.65} stroke="none">{number(measure.length)} m overall span</text>
              <path d={`M${measure.length+padding*.4} 0 V${measure.width} M${measure.length} 0 H${measure.length+padding*.6} M${measure.length} ${measure.width} H${measure.length+padding*.6}`} fill="none"/>
              <text x={measure.length+padding*.65} y={measure.width/2} stroke="none" transform={`rotate(90 ${measure.length+padding*.65} ${measure.width/2})`}>{number(measure.width)} m span</text>
              <text x={measure.length/2} y={measure.width+padding*.4} stroke="none" fill="#087f91">Centre section {number(measure.centreWidth)} m</text>
            </g>
            <g transform={`translate(${left+width*.06},${top+height*.87})`} fontSize={font} fill="#355952"><path d={`M0 -1V0H${unit}V-1`} fill="none" stroke="#355952" strokeWidth=".3"/><text x={unit/2} y={font*1.5} textAnchor="middle">{unit} m</text></g>
          </svg>}
        <div className={styles.zoom} role="group" aria-label="Detail zoom"><button onClick={()=>zoom(-1)} aria-label="Zoom out detail">−</button><button onClick={fit}>Fit geometry</button><button onClick={()=>zoom(1)} aria-label="Zoom in detail">+</button></div>
        <div className={styles.footer}><span>{view==="3d"?"Drag to orbit · right-drag to pan · scroll to zoom":"10 m grid · equal scale on both axes"}</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · ODbL</a></div>
      </section>
    </div>
  </main>;
}
