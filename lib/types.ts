export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  discount_percent: number
  category_id: string | null
  stock: number
  is_active: boolean
  magazine_available: boolean
  images: string[]
  created_at: string
  updated_at: string
  category?: Category
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string | null
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  shipping_address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  created_at: string
  product?: Product
}

export interface ConsultantSettings {
  id: string
  name: string
  bio: string | null
  photo_url: string | null
  phone: string | null
  email: string | null
  instagram: string | null
  whatsapp: string | null
  years_experience: number | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name' | 'newest'
