import slugify from 'slugify';

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export async function generateUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = generateSlug(base);
  let counter = 1;

  while (await exists(slug)) {
    slug = `${generateSlug(base)}-${counter++}`;
  }

  return slug;
}
