import { Suspense } from "react";
import { FinanzasDashboard } from "@/components/(Kore)/finanzas/FinanzasDashboard";

export const metadata = {
  title: "Finanzas - Kore",
  description: "Módulo de Finanzas y Gastos",
};

export default function FinanzasPage() {
  return (
    <Suspense>
      <FinanzasDashboard />
    </Suspense>
  );
}
