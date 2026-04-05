export type ListingType = 'room_available' | 'looking_for_roommate'
export type GenderPreference = 'any' | 'male' | 'female'
export type ListingStatus = 'active' | 'closed'

export interface Profile {
  id: string
  name: string
  whatsapp?: string
  has_whatsapp?: boolean
  created_at: string
  last_seen_at?: string
}

export interface Listing {
  id: string
  user_id: string
  type: ListingType
  title: string
  description: string
  city: string
  neighborhood?: string
  price: number
  gender_preference: GenderPreference
  photos: string[]
  status: ListingStatus
  view_count: number
  whatsapp_click_count: number
  created_at: string
  updated_at: string
  // Joined from profiles (used on detail page)
  profiles?: Profile
}

export interface FilterState {
  q: string
  city: string
  type: 'all' | ListingType
  minPrice: number
  maxPrice: number
  genderPreference: 'all' | GenderPreference
}

export const CITIES = [
  'Agadir',
  'Casablanca',
  'Rabat',
  'Fès',
  'Marrakech',
  'Meknès',
  'Tanger',
  'Oujda',
  'Laayoune',
  'Dakhla',
] as const

export type City = (typeof CITIES)[number]
