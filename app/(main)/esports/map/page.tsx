import type { Metadata } from "next";
import MapTool from "@/components/esports/MapTool";

export const metadata: Metadata = { title: "Simulador de Mapa — HOK Builds" };

export default function MapPage() {
  return <MapTool />;
}
