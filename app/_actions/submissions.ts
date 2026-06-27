'use server'

import { createServerClient } from '../_lib/supabase-server'

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRef(): string {
  let ref = 'KLP-'
  for (let i = 0; i < 6; i++) ref += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]
  return ref
}

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export type SubmitInput = {
  fullName: string
  email: string
  bio: string
  storyTitle: string
  genre: string
  contentRating: string
  coverLetter: string
  piece: string
  prevPublished: boolean
}

export async function submitPiece(input: SubmitInput): Promise<string> {
  if (!input.fullName.trim()) throw new Error('Full name is required.')
  if (!input.email.includes('@')) throw new Error('A valid email address is required.')
  if (!input.bio.trim()) throw new Error('Bio is required.')
  if (wordCount(input.bio) > 100) throw new Error('Bio must be 100 words or fewer.')
  if (!input.storyTitle.trim()) throw new Error('Story title is required.')
  if (!input.piece.trim()) throw new Error('The piece cannot be empty.')
  if (wordCount(input.coverLetter) > 300) throw new Error('Cover letter must be 300 words or fewer.')

  const supabase = createServerClient()

  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = generateRef()
    const { error } = await supabase.from('submissions').insert({
      reference_number: ref,
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      bio: input.bio.trim(),
      story_title: input.storyTitle.trim(),
      genre: input.genre,
      content_rating: input.contentRating,
      cover_letter: input.coverLetter.trim() || null,
      piece: input.piece.trim(),
      previously_published: input.prevPublished,
      status: 'pending',
    })
    if (!error) return ref
    if (error.code !== '23505') break // not a duplicate key — bail
  }

  throw new Error('Could not save your submission. Please try again.')
}

export type StatusResult = {
  storyTitle: string
  genre: string
  submittedAt: string
  status: string
}

export async function checkSubmissionStatus(
  email: string,
  refNumber: string,
): Promise<StatusResult | null> {
  if (!email.trim() || !refNumber.trim()) return null
  const supabase = createServerClient()
  const { data } = await supabase
    .from('submissions')
    .select('story_title, genre, created_at, status')
    .eq('email', email.trim().toLowerCase())
    .eq('reference_number', refNumber.trim().toUpperCase())
    .single()
  if (!data) return null
  const row = data as { story_title: string; genre: string; created_at: string; status: string }
  return {
    storyTitle: row.story_title,
    genre: row.genre,
    submittedAt: row.created_at,
    status: row.status,
  }
}
