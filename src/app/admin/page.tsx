import { redirect } from "next/navigation";

/**
 * /admin → chuyển hướng sang /admin/dashboard.
 */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}