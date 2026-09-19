import Link from "next/link";
import PlateauViewer from "@/components/verification/PlateauViewer";
import PublicSourceReview from "@/components/verification/PublicSourceReview";
import reference from "../../../public/plateau/reference.json";

export const metadata = {
  title: "Shibuya — Sources & real-world reference",
  description:
    "Review the v1.1 schematic against operator diagrams and decoded PLATEAU geometry.",
};

export default function VerificationPage() {
  const base = process.env.NODE_ENV === "production" ? "/transit-layout" : "";
  const [east, height, north] = reference.extentMeters;
  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <nav className="mb-12 flex flex-wrap justify-between gap-3 text-sm">
        <Link href="/" className="underline underline-offset-4">
          ← Back to station explorer
        </Link>
        <span className="text-slate-500">v1.1.0 review · 19 September 2026</span>
      </nav>
      <Link
        href="/area"
        prefetch={false}
        className="mb-8 block rounded-lg border border-[#c9ddd4] bg-[#e8f0eb] p-5 text-sm"
      >
        <strong>Compare the station and city together →</strong>
        <span className="mt-1 block text-slate-600">
          Lightweight PLATEAU buildings and the station drawing in one
          geographic frame.
        </span>
      </Link>
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#226e65]">
        From diagram to place
      </p>
      <h1 className="max-w-3xl text-4xl font-medium leading-tight sm:text-5xl">
        A good schematic.
        <br />A real-world model in progress.
      </h1>
      <p className="mb-8 mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
        Tokyu, Metro, JR, Keio and city sources now have a feature-by-feature
        review. The evidenced floor and gate corrections are now shared by the
        diagram and city views, with explicit lift stops and published closures.
        Accurate dimensions, entrance positions and floor elevations still need measured evidence.
      </p>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Operator diagrams", "Levels & destinations"],
          ["PLATEAU geometry", "Passage + city context"],
          ["Model alignment", "Provisional · 25.7 m mismatch"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#dde2d9] p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className="mt-2 font-medium">{value}</p>
          </div>
        ))}
      </div>
      <PublicSourceReview />
      <section
        aria-labelledby="reference-title"
        className="overflow-hidden rounded-xl border border-[#dce0d8]"
      >
        <div className="bg-white/50 p-5 sm:p-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#226e65]">
            PLATEAU reference · December 2024 source
          </p>
          <h2 id="reference-title" className="text-2xl">
            Shibuya west-exit underground passage
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            This is the decoded source geometry at its original scale. It covers
            about {east.toFixed(1)} m east–west × {north.toFixed(1)} m
            north–south, with {height.toFixed(1)} m of vertical extent. It is a
            limited passage dataset, not the whole station.
          </p>
        </div>
        <PlateauViewer />
        <div className="border-t border-[#dce0d8] bg-white/50 p-5 text-sm leading-relaxed">
          <p>
            <strong>Survey verification pending.</strong> The combined city view
            now includes a draft horizontal fit of the station drawing. This
            standalone passage view preserves its source geometry; source floor
            names and station routes have not been inferred.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {reference.attribution} Geometry decoded and recolored; original
            feature IDs preserved. Heights use the WGS84 ellipsoid, not sea
            level. The source does not establish today’s access conditions.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs underline underline-offset-4">
            <a href={reference.catalogUrl} target="_blank" rel="noreferrer">
              Source catalog ↗
            </a>
            <a href={reference.licenseUrl} target="_blank" rel="noreferrer">
              Attribution & terms ↗
            </a>
            <a href={`${base}/plateau/reference.json`}>
              Coordinate check report
            </a>
            <a href={`${base}/plateau/shibuya-west-passage.glb`} download>
              Download derived 3D model
            </a>
          </div>
        </div>
      </section>
      <section className="my-12 max-w-3xl">
        <h2 className="text-2xl">Next: refine the draft alignment</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          Replace the approximate building-centre controls with shared entrances
          and corners, record their source coordinates, then check points not
          used in the fit. The combined city and station view supplies the
          common frame. Source-supported floor corrections are applied;
          measured shapes, full equipment coverage and current operations
          still need evidence.
        </p>
      </section>
    </main>
  );
}
