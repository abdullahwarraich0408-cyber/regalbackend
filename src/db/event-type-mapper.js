export function rowToEventType(row) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    published: Boolean(row.published),
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function inputToColumns(input) {
  return {
    name: input.name,
    icon: input.icon ?? "sparkles",
    published: input.published ? 1 : 0,
    sort_order: input.sortOrder ?? 0,
  };
}
