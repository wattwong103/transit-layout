import type { ExplorerConnector, FeatureAccess, FeatureEvidence } from "@/types/explorer";
import { connectorLevels } from "@/lib/explorer";

/** Source observations are deliberately separate from present operating status. */
export default function FeatureDetails({ feature }: { feature: {
  evidence?: FeatureEvidence; access?: FeatureAccess; kind?: string;
} }) {
  const { evidence, access } = feature;
  const connector = "from" in feature ? feature as ExplorerConnector : null;
  return <div className="text-xs leading-relaxed">
    {connector && <p>{connector.kind === "lift" ? (connector.stopsComplete ? "Recorded stops" : "Recorded range endpoints") : "Levels"}: {connectorLevels(connector).join(" · ")}.{connector.kind === "lift" && !connector.stopsComplete && " Other stops are not established."}</p>}
    {access && <>
      <p><strong>{({"shown-in-source":"Shown in the source", "closed-in-source":"Closed in the source", planned:"Planned works — opening unconfirmed", unconfirmed:"Source correspondence unconfirmed"})[access.status]}</strong>{access.area !== "unknown" && ` · ${access.area === "mixed" ? "Gate boundary / mixed access" : `${access.area} area`}`}</p>
      {access.hours && <p>Published hours: {access.hours}.</p>}
      {access.direction && <p>Direction in source: {access.direction === "unknown" ? "not established" : access.direction}.</p>}
      {access.note && <p>{access.note}</p>}
    </>}
    {evidence && <p>{evidence.certainty === "inferred" ? "Provisional correspondence" : "Source reference"}: {evidence.locator}.</p>}
    <p>Position and dimensions are schematic. Source records do not establish today’s operating status or a complete accessible route.</p>
  </div>;
}
