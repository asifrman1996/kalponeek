import type { Metadata } from 'next'
import ComingSoon from '../_components/ComingSoon'

export const metadata: Metadata = {
  title: 'Genres',
}

export default function GenresPage() {
  return (
    <ComingSoon
      title="Genres"
      bengali="ধারা"
      eyebrow="Coming soon"
      tagline="Browse by form — fiction, poetry, essays, translation, interviews, and culture writing."
    />
  )
}
