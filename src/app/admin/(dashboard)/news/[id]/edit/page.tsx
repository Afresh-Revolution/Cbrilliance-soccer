import { notFound } from 'next/navigation';
import NewsArticleForm from '@/components/admin/NewsArticleForm';
import { requireAdminUuid } from '@/lib/admin/params';
import { articleToFormValues, getNewsArticleById } from '@/lib/data/news-admin';

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditNewsPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = requireAdminUuid(rawId);
  const article = await getNewsArticleById(id);
  if (!article) notFound();

  return (
    <>
      <div className="admin__header">
        <h1>Edit Article</h1>
        <p className="text-muted">{article.title}</p>
      </div>
      <NewsArticleForm mode="edit" initial={articleToFormValues(article)} articleId={article.id} />
    </>
  );
}
