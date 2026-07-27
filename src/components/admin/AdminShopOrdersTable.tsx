'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShopOrder, ShopOrderStatus } from '@/types';
import { fetchCsrfToken, patchWithCsrf } from '@/lib/auth/csrf-client';

const STATUS_OPTIONS: ShopOrderStatus[] = ['new', 'contacted', 'completed', 'cancelled'];

export default function AdminShopOrdersTable({ orders: initialOrders }: { orders: ShopOrder[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(id: string, status: ShopOrderStatus) {
    setBusyId(id);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await patchWithCsrf<{ order?: ShopOrder; error?: string }>(
        `/api/admin/shop-orders/${id}`,
        { status },
        csrf,
      );
      if (!ok || !data.order) return;
      setOrders((prev) => prev.map((order) => (order.id === id ? data.order! : order)));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin__table-wrap">
      <table className="admin__table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Items</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={4} className="admin__table-empty">No shop orders yet.</td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.fullName}</strong>
                  <br />
                  <span className="text-muted">{order.email}</span>
                  <br />
                  <span className="text-muted">{order.phone}</span>
                  {order.notes ? <p className="text-muted">{order.notes}</p> : null}
                </td>
                <td>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        {item.quantity}x {item.productName} — {item.color}, {item.size}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <select
                    className="form__input"
                    value={order.status}
                    disabled={busyId === order.id}
                    onChange={(e) => updateStatus(order.id, e.target.value as ShopOrderStatus)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
