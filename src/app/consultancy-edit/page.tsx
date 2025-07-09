"use client";
import ConsultancyEditPage from "../../pages/ConsultancyEditPage";
import { Suspense } from "react";

export default function ConsultancyEditRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading edit form...</div>}>
      <ConsultancyEditPage />
    </Suspense>
  );
}