import { Suspense } from "react";
import { QRProyectoView } from "@/components/(Kore)/proyectos/QRProyecto/QRProyectoView";

export default function ProyectoQRPage() {
  return (
    <Suspense>
      <QRProyectoView />
    </Suspense>
  );
}
