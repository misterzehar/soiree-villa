import { type MetadataRoute } from 'next'
import { createServerSupabase } from '@/lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://soireevilla.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabase()

  const [
    { data: experiences },
    { data: lieux },
    { data: fournisseurs },
  ] = await Promise.all([
    supabase.from('experiences').select('id, updated_at').eq('status', 'published'),
    supabase.from('lieux').select('slug').eq('is_approved', true),
    supabase.from('fournisseurs').select('slug').eq('is_approved', true),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/onboarding`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/experiences`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/lieux`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/fournisseurs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/tier-list`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/marketplace`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/connexion`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/charte-participant`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/charte-organisateur`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/charte-fournisseur`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  const expRoutes: MetadataRoute.Sitemap = (experiences ?? []).map(exp => ({
    url: `${SITE_URL}/experiences/${exp.id}`,
    lastModified: exp.updated_at ? new Date(exp.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const lieuRoutes: MetadataRoute.Sitemap = (lieux ?? []).map(l => ({
    url: `${SITE_URL}/lieux/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const fournisseurRoutes: MetadataRoute.Sitemap = (fournisseurs ?? []).map(f => ({
    url: `${SITE_URL}/fournisseurs/${f.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...expRoutes, ...lieuRoutes, ...fournisseurRoutes]
}
