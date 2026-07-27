export function rowToService(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    icon: row.icon,
    bestFor: row.best_for,
    short: row.short_description,
    long: row.long_description,
    highlights:
      typeof row.highlights === "string"
        ? JSON.parse(row.highlights)
        : row.highlights ?? [],
    imageUrl: row.image_url ?? "",
    published: Boolean(row.published),
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function inputToColumns(input) {
  return {
    slug: input.slug,
    title: input.title,
    icon: input.icon ?? "sparkles",
    best_for: input.bestFor,
    short_description: input.shortDescription,
    long_description: input.longDescription,
    highlights: JSON.stringify(input.highlights ?? []),
    image_url: input.imageUrl ?? "",
    published: input.published ? 1 : 0,
    sort_order: input.sortOrder ?? 0,
  };
}
