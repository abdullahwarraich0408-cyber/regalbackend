export function rowToBooking(row) {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    status: row.status,
    eventType: row.event_type,
    preferredDate: row.preferred_date,
    alternativeDate: row.alternative_date ?? "",
    eventLocation: row.event_location,
    area: row.area ?? "",
    guestCount: row.guest_count ?? "",
    venueType: row.venue_type ?? undefined,
    setupTime: row.setup_time ?? "",
    theme: row.theme ?? "",
    servicesNeeded:
      typeof row.services_needed === "string"
        ? JSON.parse(row.services_needed)
        : row.services_needed ?? [],
    budgetRange: row.budget_range ?? undefined,
    inspirationNotes: row.inspiration_notes ?? "",
    fullName: row.full_name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    preferredContactMethod: row.preferred_contact_method,
    message: row.message ?? "",
    consent: Boolean(row.consent),
  };
}

export function inputToColumns(input) {
  return {
    event_type: input.eventType,
    preferred_date: input.preferredDate,
    alternative_date: input.alternativeDate ?? "",
    event_location: input.eventLocation,
    area: input.area ?? "",
    guest_count: input.guestCount ?? "",
    venue_type: input.venueType ?? null,
    setup_time: input.setupTime ?? "",
    theme: input.theme ?? "",
    services_needed: JSON.stringify(input.servicesNeeded ?? []),
    budget_range: input.budgetRange ?? null,
    inspiration_notes: input.inspirationNotes ?? "",
    full_name: input.fullName,
    email: input.email ?? "",
    phone: input.phone ?? "",
    preferred_contact_method: input.preferredContactMethod,
    message: input.message ?? "",
    consent: input.consent ? 1 : 0,
  };
}
