import { RailwayLineInfo } from "@/types/station";

export const railwayLines: RailwayLineInfo[] = [
  {
    id: "jr_yamanote",
    name: "JR Yamanote Line",
    color: "#9acd32",
    operator: "JR East",
  },
  {
    id: "jr_saikyo",
    name: "JR Saikyo Line",
    color: "#00ac9a",
    operator: "JR East",
  },
  {
    id: "jr_shonan_shinjuku",
    name: "JR Shonan-Shinjuku Line",
    color: "#e75b12",
    operator: "JR East",
  },
  {
    id: "metro_ginza",
    name: "Tokyo Metro Ginza Line",
    color: "#f39700",
    operator: "Tokyo Metro",
  },
  {
    id: "metro_hanzomon",
    name: "Tokyo Metro Hanzomon Line",
    color: "#8b76d0",
    operator: "Tokyo Metro",
  },
  {
    id: "metro_fukutoshin",
    name: "Tokyo Metro Fukutoshin Line",
    color: "#bb641d",
    operator: "Tokyo Metro",
  },
  {
    id: "tokyu_toyoko",
    name: "Tokyu Toyoko Line",
    color: "#da0442",
    operator: "Tokyu",
  },
  {
    id: "tokyu_den_en_toshi",
    name: "Tokyu Den-en-toshi Line",
    color: "#da0442",
    operator: "Tokyu",
  },
  {
    id: "keio_inokashira",
    name: "Keio Inokashira Line",
    color: "#b8417a",
    operator: "Keio",
  },
];

export function getLineColor(lineId: string): string {
  return railwayLines.find((l) => l.id === lineId)?.color ?? "#888";
}

export function getLineName(lineId: string): string {
  return railwayLines.find((l) => l.id === lineId)?.name ?? lineId;
}
