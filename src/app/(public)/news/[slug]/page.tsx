import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getNewsBySlug } from '@/lib/data/queries';
import { NEWS_CATEGORY_LABELS } from '@/lib/constants/navigation';
import { formatDate } from '@/lib/utils/format';
import { sanitizeRichHtml } from '@/lib/security/sanitize-html';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: 'Article Not Found' };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { images: [article.coverImage] },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const safeContent = sanitizeRichHtml(article.content);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">{NEWS_CATEGORY_LABELS[article.category]}</p>
          <h1>{article.title}</h1>
          <p className="text-muted">
            {article.author} • {article.publishedAt && formatDate(article.publishedAt)}
          </p>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: '2rem' }}>
              <Image src={article.coverImage} alt={article.title} fill sizes="900px" />
            </div>
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
