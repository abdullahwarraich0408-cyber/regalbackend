export function rowToTestimonial(row) {
  return {
    id: row.id,
    quote: row.quote,
    name: row.name,
    event: row.event,
    rating: row.rating,
    source: row.source ?? "client",
    published: Boolean(row.published),
    sortOrder: row.sort_order,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}

export function inputToColumns(input) {
  return {
    quote: input.quote,
    name: input.name,
    event: input.event,
    rating: input.rating ?? 5,
    source: input.source ?? "client",
    published: input.published ? 1 : 0,
    sort_order: input.sortOrder ?? 0,
  };
}
