import AdminShopTable from '@/components/admin/AdminShopTable';
import { getAllShopProducts } from '@/lib/data/shop-admin';

export default async function AdminShopPage() {
  const products = await getAllShopProducts();

  return (
    <>
      <div className="admin__header">
        <h1>Shop</h1>
        <p className="text-muted">
          Manage Shop Now items — jerseys, shorts, socks, and boots shown on the home page
        </p>
      </div>
      <AdminShopTable products={products} />
    </>
  );
}
