import type { Metadata } from 'next'
import SubmitClient from '../_components/SubmitClient'

export const metadata: Metadata = {
  title: 'Submit a Piece — Kalponeek',
  description:
    'Submit your fiction, poetry, essays, and translations to Kalponeek. Open submissions for Issue 02.',
}

export default function SubmitPage() {
  return <SubmitClient />
}
