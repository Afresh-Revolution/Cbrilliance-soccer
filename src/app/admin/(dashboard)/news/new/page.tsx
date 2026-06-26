import NewsArticleForm from '@/components/admin/NewsArticleForm';

export default function AdminNewArticlePage() {
  return (
    <>
      <div className="admin__header">
        <h1>New Article</h1>
        <p className="text-muted">Write and publish a news story for the CBFC site</p>
      </div>
      <NewsArticleForm mode="create" />
    </>
  );
}
