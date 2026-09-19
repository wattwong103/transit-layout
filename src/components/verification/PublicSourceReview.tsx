import review from "../../../public/evidence/public-source-review.json";

const sourceById = new Map(review.sources.map((source) => [source.id, source]));

function Sources({ ids }: { ids: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {ids.map((id) => {
        const source = sourceById.get(id)!;
        return (
          <a key={id} href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
            {source.publisher} · {source.title} ↗
          </a>
        );
      })}
    </div>
  );
}

const groups = [
  ["space", "Platforms, concourses and passages"],
  ["exit", "Exit codes and landing floors"],
  ["connector", "Stairs, escalators and lifts in the model"],
  ["building", "Buildings and destination links"],
  ["facility", "Gates, amenities and works"],
] as const;

export default function PublicSourceReview() {
  const base = process.env.NODE_ENV === "production" ? "/transit-layout" : "";
  return (
    <section id="public-review" aria-labelledby="public-review-title" className="my-12 scroll-mt-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-[#226e65]">Public-source cross-check · 19 September 2026</p>
      <h2 id="public-review-title" className="text-3xl">Source corrections applied.</h2>
      <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
        Every current model feature has a review entry against the sources below.
        Exit landing floors, Hikarie circulation, JR gate levels and Keio’s missing
        levels have been corrected. {review.coverage.individuallyMatchedModelConnectors} source-identified
        lifts and lettered stairs are represented. Their drawn positions remain unmeasured.
      </p>
      <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {groups.map(([kind, title]) => (
          <a key={kind} href={`#review-${kind}`} className="rounded-lg border border-[#dde2d9] p-4">
            <strong className="block text-2xl">{review.features.filter((feature) => feature.kind === kind).length}</strong>
            <span className="mt-1 block text-xs text-slate-600">{title}</span>
          </a>
        ))}
      </div>
      <div className="my-6 rounded-lg border border-[#d8cdb7] bg-[#faf6ec] p-5">
        <h3 className="text-xl">What still needs measured or on-site evidence</h3>
        <p className="mt-3 text-sm font-medium">Photo verification is pending after v1.1.0. The current release preserves the source limits below.</p>
        {review.userInputsNeeded.map(item=><div key={item.id} className="mt-4 text-sm leading-relaxed">
          <p className="font-medium">{item.request}</p><p className="mt-1 text-slate-600">{item.purpose}</p>
        </div>)}
        <details className="mt-4 text-sm"><summary className="cursor-pointer">Remaining coverage gaps</summary>
          <ul className="mt-3 list-disc space-y-2 pl-5">{review.missing.map(item=><li key={item}>{item}</li>)}</ul>
        </details>
      </div>
      <p className="mb-6 text-sm text-slate-600">
        These counts describe review coverage, not verified geometry. The city
        fit remains provisional at 25.7 m RMS, with no independent surveyed
        entrance checks.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {review.findings.map((finding) => (
          <article key={finding.id} className="rounded-lg border border-[#dde2d9] bg-white/40 p-5">
            <p className={`text-xs font-semibold ${finding.status === "Corrected" ? "text-[#226e65]" : "text-[#8a551c]"}`}>{finding.status}</p>
            <h3 className="mt-2 font-medium">{finding.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{finding.detail}</p>
            <Sources ids={finding.sourceIds} />
          </article>
        ))}
      </div>
      <h3 className="mb-4 mt-10 text-xl">Review each model feature</h3>
      <p className="mb-4 text-sm text-slate-600">“Documented relationship” supports only the identity or floor relationship described. “Provisional” means the correspondence is unresolved. Positions, dimensions and elevations remain unverified in every entry.</p>
      {groups.map(([kind, title]) => (
        <details key={kind} id={`review-${kind}`} className="mb-3 scroll-mt-8 rounded-lg border border-[#dde2d9] p-4">
          <summary className="cursor-pointer font-medium">{title} · {review.features.filter((feature) => feature.kind === kind).length}</summary>
          <div className="mt-4 divide-y divide-[#dde2d9]">
            {review.features.filter((feature) => feature.kind === kind).map((feature) => (
              <article key={feature.id} className="py-4">
                <h4 className="text-sm font-medium">{feature.label} <span className="font-normal text-slate-500">{feature.modelLevel ? `· model ${feature.modelLevel}` : ""}</span></h4>
                <p className="mt-1 text-xs font-semibold text-[#8a551c]">{feature.status}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.note}</p>
                <Sources ids={feature.sourceIds} />
              </article>
            ))}
          </div>
        </details>
      ))}
      <details className="mb-3 rounded-lg border border-[#dde2d9] p-4">
        <summary className="cursor-pointer font-medium">Equipment identified in the sources · {review.equipment.length} records</summary>
        <p className="mt-3 text-sm text-slate-600">Source identities are linked to schematic features where established. Survey coordinates remain absent. The 109 lift’s stops remain unresolved, and Keio West has only a works marker. Escalator banks and amenities still need a complete inventory; a range does not imply every intermediate stop.</p>
        <div className="mt-4 divide-y divide-[#dde2d9]">
          {review.equipment.map((item) => (
            <article key={item.id} className="py-4">
              <h4 className="text-sm font-medium">{item.label} <span className="font-normal text-slate-500">{item.sourceLevels.join(" / ")}</span></h4>
              <p className="mt-1 text-xs text-[#8a551c]">{item.status}</p>
              <p className="mt-2 text-sm text-slate-600">{item.note}</p>
              <Sources ids={item.sourceIds} />
            </article>
          ))}
        </div>
      </details>
      <details className="mb-3 rounded-lg border border-[#dde2d9] p-4">
        <summary className="cursor-pointer font-medium">Hours, closures and operating directions</summary>
        {review.restrictions.map((item) => (
          <article key={item.id} className="mt-4 border-t border-[#dde2d9] pt-4">
            <h4 className="text-sm font-medium">{item.label}</h4>
            <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
            <Sources ids={item.sourceIds} />
          </article>
        ))}
      </details>
      <details className="rounded-lg border border-[#dde2d9] p-4">
        <summary className="cursor-pointer font-medium">Source register · {review.sources.length} references and their dates</summary>
        <p className="mt-3 text-sm text-slate-600">This register includes newly inspected sources and earlier evidence retained with explicit limits. Publication dates, source observation dates and future completion dates are different.</p>
        {review.sources.map((source) => (
          <article key={source.id} className="mt-4 border-t border-[#dde2d9] pt-4">
            <a href={source.url} target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4">{source.publisher} · {source.title} ↗</a>
            <p className="mt-1 text-xs text-slate-500">{source.documentDate ?? "Publication date not established"}</p>
            <p className="mt-2 text-sm text-slate-600">{source.scope}</p>
            <p className="mt-2 text-sm text-[#8a551c]">{source.caveat}</p>
          </article>
        ))}
      </details>
      <p className="mt-5 text-sm text-slate-600">The reviewed sources do not establish a complete accessible route or today’s operating status. Detailed source diagrams remain linked; they are not added to the lightweight city download.</p>
      <a href={`${base}/evidence/public-source-review.json`} download className="mt-3 inline-block text-sm underline underline-offset-4">Download the full evidence register</a>
    </section>
  );
}
