import Link from "next/link";
import { Package, ClipboardList } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminNav />
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/products">
          <Card className="transition-colors duration-150 hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted">
              Add, edit, and remove menu items
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="transition-colors duration-150 hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted">
              View and update order status
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  );
}
