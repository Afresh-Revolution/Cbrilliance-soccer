import Link from 'next/link';
import Image from 'next/image';
import { getNewsArticles } from '@/lib/data/queries';
import { NEWS_CATEGORY_LABELS } from '@/lib/constants/navigation';
import { formatDate } from '@/lib/utils/format';
import FadeIn from '@/components/common/FadeIn';
import NewsFilters from '@/components/news/NewsFilters';

export const metadata = {
  title: 'News & Media',
  description: 'Latest news from CBFC Academy, Agency, and Professional Club.',
};

export default async function NewsPage() {
  const articles = await getNewsArticles();
  const featured = articles.find((a) => a.featured) || articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">News & Media</p>
          <h1>CBFC <span className="text-gold">News</span></h1>
          <p>Stay updated with the latest from our Academy, Agency, and Professional Club.</p>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          {featured && (
            <Link href={`/news/${featured.slug}`} className="news-featured">
              <div className="news-featured__main">
                <Image src={featured.coverImage} alt={featured.title} fill sizes="(max-width: 1024px) 100vw, 60vw" />
                <div className="news-featured__main__overlay">
                  <span className="label">{NEWS_CATEGORY_LABELS[featured.category]}</span>
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                </div>
              </div>
            </Link>
          )}

          <NewsFilters />

          <div className="grid grid--3">
            {rest.map((article, i) => (
              <FadeIn key={article.id} index={i}>
                <Link href={`/news/${article.slug}`} className="article-card">
                  <div className="article-card__image">
                    <Image src={article.coverImage} alt={article.title} width={400} height={225} />
                  </div>
                  <div className="article-card__body">
                    <p className="article-card__category">{NEWS_CATEGORY_LABELS[article.category]}</p>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <p className="article-card__date">
                      {article.publishedAt && formatDate(article.publishedAt)}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
