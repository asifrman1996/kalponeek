import type { Metadata } from 'next'
import StatusClient from '../../_components/StatusClient'

export const metadata: Metadata = {
  title: 'Submission Status — Kalponeek',
  description: 'Check the status of your Kalponeek submission using your email and reference number.',
}

export default function StatusPage() {
  return <StatusClient />
}
