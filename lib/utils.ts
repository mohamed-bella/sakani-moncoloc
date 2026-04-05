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
 * Get relative time in Arabic (e.g., "منذ ساعة", "منذ يومين")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "الآن"
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) return "منذ دقيقة"
    if (diffInMinutes === 2) return "منذ دقيقتين"
    if (diffInMinutes <= 10) return `منذ ${diffInMinutes} دقائق`
    return `منذ ${diffInMinutes} دقيقة`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    if (diffInHours === 1) return "منذ ساعة"
    if (diffInHours === 2) return "منذ ساعتين"
    if (diffInHours <= 10) return `منذ ${diffInHours} ساعات`
    return `منذ ${diffInHours} ساعة`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    if (diffInDays === 1) return "منذ يوم"
    if (diffInDays === 2) return "منذ يومين"
    return `منذ ${diffInDays} أيام`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    if (diffInWeeks === 1) return "منذ أسبوع"
    if (diffInWeeks === 2) return "منذ أسبوعين"
    return `منذ ${diffInWeeks} أسابيع`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    if (diffInMonths === 1) return "منذ شهر"
    if (diffInMonths === 2) return "منذ شهرين"
    return `منذ ${diffInMonths} أشهر`
  }

  return formatDate(dateString)
}

/**
 * Get the placeholder image URL when no photos
 */
export function getPlaceholderImage(): string {
  return '/placeholder.svg'
}


