import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleClient from '../../_components/ArticleClient'
import { createServerClient } from '../../_lib/supabase-server'
import type { Article, Comment } from '../../_lib/database.types'

const DEMO_SLUGS = [
  'the-cartographers-of-sleep',
  'notes-on-a-city-that-forgets',
  'saltwater-liturgy',
  'the-last-translator',
  'what-the-river-kept',
  'an-interview-with-the-dark',
  'cassette-futures',
]

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('articles')
      .select('title, subtitle')
      .eq('slug', slug)
      .single()
    if (data) {
      const row = data as { title: string; subtitle: string }
      return { title: row.title, description: row.subtitle }
    }
  } catch {}
  return {}
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let article: Article | null = null
  let comments: Comment[] | null = null

  try {
    const supabase = createServerClient()
    const [articleRes, commentsRes] = await Promise.all([
      supabase.from('articles').select('*').eq('slug', slug).single(),
      supabase.from('comments').select('*').eq('article_id', slug).order('created_at', { ascending: false }),
    ])
    article = articleRes.data as Article | null
    comments = commentsRes.data as Comment[] | null
  } catch {
    // Supabase not configured — ArticleClient falls back to mock data
  }

  if (!article && !DEMO_SLUGS.includes(slug)) {
    notFound()
  }

  return <ArticleClient article={article} comments={comments ?? undefined} />
}
