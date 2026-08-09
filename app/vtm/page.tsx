import type { Metadata } from 'next'
import VtmTool from '@/components/VtmTool'
import { listFrames } from '@/lib/vtm/engine.server'

export const metadata: Metadata = {
  title: 'VTM//TOWER — Tower Mill Power Model',
  description:
    'CMD tower mill power model: predicted shaft power for VTM and JETM vertical stirred mills from mill geometry and screw speed, calibrated against an 82-installation benchmark database.',
  robots: { index: true, follow: true },
}

// Only the public frame catalogue (geometry + motor sizes) crosses to the
// client. Model coefficients and the installation database stay server-side —
// results come back through /api/vtm.
export default function Page() {
  return <VtmTool frames={listFrames()} />
}
