"use client";
import ConsultancyAdminPage from "../../pages/ConsultancyAdminPage";
import { Suspense } from "react";

export default function ConsultancyAdminRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading admin portal...</div>}>
      <ConsultancyAdminPage />
    </Suspense>
  );
}