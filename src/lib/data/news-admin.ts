import type { NewsArticle } from '@/types';
import { slugify } from '@/lib/utils/format';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import { sanitizeRichHtml } from '@/lib/security/sanitize-html';
import { sanitizeText } from '@/lib/security/sanitize';
import type { z } from 'zod';
import type { adminNewsArticleSchema } from '@/lib/validators/schemas';
import { seedNews } from './seed';

export type AdminNewsInput = z.infer<typeof adminNewsArticleSchema>;

function mapDbArticle(row: Record<string, unknown>): NewsArticle {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: (row.excerpt as string) || '',
    content: (row.content as string) || '',
    category: row.category as NewsArticle['category'],
    coverImage: (row.cover_image as string) || '',
    author: (row.author as string) || 'CBFC Media',
    published: row.published as boolean,
    featured: row.featured as boolean,
    publishedAt: row.published_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toDbRow(input: AdminNewsInput, slug: string) {
  const published = input.published ?? false;
  return {
    title: input.title.trim(),
    slug,
    excerpt: input.excerpt ? sanitizeText(input.excerpt, 500) : null,
    content: input.content ? sanitizeRichHtml(input.content) : null,
    category: input.category,
    cover_image: input.coverImage?.trim() || null,
    author: input.author?.trim() || 'CBFC Media',
    published,
    featured: input.featured ?? false,
    published_at: published ? new Date().toISOString() : null,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  if (!isSupabaseApiConfigured()) {
    return [...seedNews].sort(
      (a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime(),
    );
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error || !data) return seedNews;
  return data.map(mapDbArticle);
}

export async function getNewsArticleById(id: string): Promise<NewsArticle | null> {
  if (!isSupabaseApiConfigured()) {
    return seedNews.find((a) => a.id === id) ?? null;
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('news_articles').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapDbArticle(data);
}

export async function createNewsArticle(input: AdminNewsInput): Promise<NewsArticle> {
  const slug = input.slug?.trim() || slugify(input.title);
  const row = toDbRow(input, slug);

  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('news_articles').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbArticle(data);
}

export async function updateNewsArticle(id: string, input: Partial<AdminNewsInput>): Promise<NewsArticle> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.slug !== undefined) patch.slug = input.slug.trim();
  if (input.excerpt !== undefined) patch.excerpt = input.excerpt ? sanitizeText(input.excerpt, 500) : null;
  if (input.content !== undefined) patch.content = input.content ? sanitizeRichHtml(input.content) : null;
  if (input.category !== undefined) patch.category = input.category;
  if (input.coverImage !== undefined) patch.cover_image = input.coverImage.trim() || null;
  if (input.author !== undefined) patch.author = input.author.trim() || 'CBFC Media';
  if (input.featured !== undefined) patch.featured = input.featured;

  if (input.published !== undefined) {
    patch.published = input.published;
    if (input.published) {
      patch.published_at = new Date().toISOString();
    }
  }

  if (input.title && input.slug === undefined) {
    patch.slug = slugify(input.title);
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('news_articles').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbArticle(data);
}

export async function deleteNewsArticle(id: string): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { error } = await supabase.from('news_articles').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function articleToFormValues(article: NewsArticle): AdminNewsInput {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    category: article.category,
    coverImage: article.coverImage,
    author: article.author,
    published: article.published,
    featured: article.featured ?? false,
  };
}
