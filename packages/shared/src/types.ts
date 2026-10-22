import type { OrderStatus } from './order-status'

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
  status: OrderStatus
  total: number
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  shipping_address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  status_history?: OrderStatusHistory[]
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  note: string | null
  created_at: string
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

export interface CheckoutItemInput {
  productId: string
  quantity: number
}

export interface CheckoutInput {
  items: CheckoutItemInput[]
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  notes?: string
}

export interface UpdateOrderStatusInput {
  status: OrderStatus
  note?: string
}

export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>

export type ConsultantSettingsInput = Omit<ConsultantSettings, 'id' | 'created_at' | 'updated_at'>

export type PublicConsultantSettings = Pick<
  ConsultantSettings,
  'name' | 'email' | 'phone' | 'instagram' | 'whatsapp'
>

export interface DashboardStats {
  productsCount: number
  activeProductsCount: number
  lowStockProducts: Product[]
  ordersCount: number
  pendingOrders: number
  totalRevenue: number
  recentOrders: Order[]
}
