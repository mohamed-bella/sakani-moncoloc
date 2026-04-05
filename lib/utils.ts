import { ListingType, GenderPreference } from '@/types'

/**
 * Normalize a Moroccan WhatsApp number to international format (212XXXXXXXXX)
 * Handles: 0661234567 → 212661234567
 *          +212661234567 → 212661234567
 *          212661234567 → 212661234567
 */
export function normalizeWhatsApp(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('212')) return digits
  if (digits.startsWith('0')) return '212' + digits.slice(1)
  return '212' + digits
}

/**
 * Build a fake email from WhatsApp number for Supabase auth
 */
export function whatsappToEmail(whatsapp: string): string {
  return `${normalizeWhatsApp(whatsapp)}@moncoloc.ma`
}

/**
 * Build the wa.me URL with a pre-filled message
 */
export function buildWhatsAppUrl(whatsapp: string, listingTitle: string): string {
  const normalized = normalizeWhatsApp(whatsapp)
  const message = encodeURIComponent(`مرحبا، أنا مهتم بإعلانك على moncoloc.ma بخصوص: ${listingTitle}`)
  return `https://wa.me/${normalized}?text=${message}`
}

/**
 * Format price as Arabic string: 1500 → "1٬500 درهم/شهر"
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ar-MA')} درهم/شهر`
}

/**
 * Display label for listing type
 */
export function listingTypeLabel(type: ListingType): string {
  return type === 'room_available' ? 'لدي غرفة للإيجار' : 'أبحث عن غرفة / شريك'
}

/**
 * Display label for gender preference
 */
export function genderPreferenceLabel(pref: GenderPreference): string {
  switch (pref) {
    case 'any':
      return 'الجميع'
    case 'male':
      return 'ذكور فقط'
    case 'female':
      return 'إناث فقط'
  }
}

/**
 * Format a date in Arabic
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get the placeholder image URL when no photos
 */
export function getPlaceholderImage(): string {
  return '/placeholder.svg'
}
