export const PROPERTY_TYPES = [
  'Home / Residential',
  'Retail / Commercial',
  'Warehouse / Industrial',
  'Construction site',
  'Multi-site portfolio',
]

// Shared by the lead form and the assistant's follow-up flow. Not wired to a
// backend yet: send `lead` to your CRM or form endpoint here and throw on failure.
// Only send what the visitor consented to: { name, email, phone?, property, source }.
export async function submitLead(lead) {
  return lead
}
