import Console from '@/components/Console'
import { loadCatalog } from '@/lib/supabase'

// The catalogue is fetched on the server so the console renders with data on
// first paint. Revalidated hourly — the product range does not move faster.
export const revalidate = 3600

export default async function Page() {
  const { products, source, note } = await loadCatalog()
  return <Console products={products} catalogSource={source} catalogNote={note} />
}
