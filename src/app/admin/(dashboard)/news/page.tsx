import AdminNewsList from '@/components/admin/AdminNewsList';
import { getAllNewsArticles } from '@/lib/data/news-admin';

export default async function AdminNewsPage() {
  const articles = await getAllNewsArticles();

  return (
    <>
      <div className="admin__header">
        <h1>News Management</h1>
        <p className="text-muted">Create, publish, and manage CBFC news articles</p>
      </div>

      <AdminNewsList articles={articles} />
    </>
  );
}
