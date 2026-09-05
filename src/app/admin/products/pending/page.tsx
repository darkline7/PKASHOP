import { redirect } from "next/navigation";

export default function AdminPendingProductsRedirect() {
  redirect("/admin/products");
}
