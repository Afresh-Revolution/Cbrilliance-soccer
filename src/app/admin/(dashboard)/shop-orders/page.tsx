import AdminShopOrdersTable from '@/components/admin/AdminShopOrdersTable';
import { getAllShopOrders } from '@/lib/data/shop-orders-admin';

export default async function AdminShopOrdersPage() {
  const orders = await getAllShopOrders();

  return (
    <>
      <div className="admin__header">
        <h1>Shop Orders</h1>
        <p className="text-muted">Customer orders placed from the Shop Now cart</p>
      </div>
      <AdminShopOrdersTable orders={orders} />
    </>
  );
}
