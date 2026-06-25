import { getNewsArticles } from '@/lib/data/queries';
import { NEWS_CATEGORY_LABELS } from '@/lib/constants/navigation';
import Link from 'next/link';

export default async function AdminNewsPage() {
  const articles = await getNewsArticles();

  return (
    <>
      <div className="admin__header">
        <h1>News Management</h1>
        <Link href="/admin/news/new" className="btn btn--primary btn--sm">New Article</Link>
      </div>

      <div className="admin__table-wrap">
      <table className="admin__table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{NEWS_CATEGORY_LABELS[a.category]}</td>
              <td>{a.published ? 'Published' : 'Draft'}</td>
              <td>
                <Link href={`/admin/news/${a.id}`} className="btn btn--outline btn--sm">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
