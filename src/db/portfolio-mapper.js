export function rowToPortfolio(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    imageUrl: row.cover_image_url ?? "",
    gallery: parseJsonArray(row.gallery),
    videos: parseJsonArray(row.videos),
    clientName: row.client_name ?? "",
    description: row.description ?? "",
    highlights: parseJsonArray(row.highlights),
    instagramUrl: row.instagram_url ?? "",
    palette: parsePalette(row.palette),
    published: Boolean(row.published),
    sortOrder: row.sort_order,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string" && value) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parsePalette(value) {
  const fallback = ["oklch(0.95 0.03 85)", "oklch(0.82 0.08 70)"];
  const arr = parseJsonArray(value);
  if (arr.length >= 2) {
    return [arr[0], arr[1]];
  }
  return fallback;
}

export function inputToColumns(input) {
  return {
    slug: input.slug,
    title: input.title,
    category: input.category,
    cover_image_url: input.imageUrl ?? "",
    gallery: JSON.stringify((input.gallery ?? []).slice(0, 5)),
    videos: JSON.stringify((input.videos ?? []).slice(0, 2)),
    client_name: input.clientName ?? "",
    description: input.description ?? "",
    highlights: JSON.stringify(input.highlights ?? []),
    instagram_url: input.instagramUrl ?? "",
    palette: JSON.stringify(input.palette ?? ["oklch(0.95 0.03 85)", "oklch(0.82 0.08 70)"]),
    published: input.published ? 1 : 0,
    sort_order: input.sortOrder ?? 0,
  };
}
