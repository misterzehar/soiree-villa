export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

/**
 * Génère un slug unique en suffixant -2, -3, etc. en cas de collision.
 * @param name        Nom source
 * @param checkExists Fonction qui retourne true si le slug est déjà pris
 */
export async function generateUniqueSlug(
  name: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(name)
  let slug = base
  let attempt = 2

  while (await checkExists(slug)) {
    slug = `${base}-${attempt}`
    attempt++
    if (attempt > 100) throw new Error(`Impossible de générer un slug unique pour "${name}"`)
  }

  return slug
}
