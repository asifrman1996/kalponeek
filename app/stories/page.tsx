import type { Metadata } from 'next'
import ComingSoon from '../_components/ComingSoon'

export const metadata: Metadata = {
  title: 'Stories',
}

export default function StoriesPage() {
  return (
    <ComingSoon
      title="Stories"
      bengali="গল্প"
      eyebrow="Coming soon"
      tagline="Fiction, essays, poetry, and translation — every piece we've published, all in one place."
    />
  )
}
