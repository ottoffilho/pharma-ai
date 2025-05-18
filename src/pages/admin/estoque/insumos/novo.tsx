
import React from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import InsumoForm from "@/components/estoque/InsumoForm";

export default function NovoInsumoPage() {
  return (
    <AdminLayout>
      <div className="container py-6">
        <InsumoForm />
      </div>
    </AdminLayout>
  );
}
