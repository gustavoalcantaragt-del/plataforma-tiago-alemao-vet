// ─────────────────────────────────────────────
// CORE TYPES — NexusLearn Premium
// ─────────────────────────────────────────────

export type UserRole = 'student' | 'owner' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: UserRole
  created_at: string
}

export interface Course {
  id: string
  title: string
  subtitle: string
  description: string
  category: string
  emoji: string
  thumbnail_gradient: string
  price: number
  price_old: number
  modules_count: number
  lessons_count: number
  hours: number
  students_count: number
  rating: number
  is_published: boolean
  created_at: string
  owner_id: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  order: number
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  duration: string
  video_url: string
  order: number
  is_preview: boolean
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  progress: number
  status: 'active' | 'completed' | 'paused'
}

export interface LessonProgress {
  user_id: string
  lesson_id: string
  completed: boolean
  watch_time: number
  completed_at?: string
}

export interface Note {
  id: string
  user_id: string
  lesson_id: string
  content: string
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  lesson_id: string
  content: string
  created_at: string
  user?: { name: string; avatar_url?: string }
}

export type ReactionType = 'heart' | 'clap' | 'idea' | 'fire'

export interface PostReactions {
  heart: number
  clap: number
  idea: number
  fire: number
}

export interface Post {
  id: string
  user_id: string
  content: string
  category: string
  is_pinned: boolean
  likes: number
  replies_count: number
  reactions: PostReactions
  my_reaction: ReactionType | null
  created_at: string
  user?: { name: string; avatar_url?: string }
  liked_by_me?: boolean
}

export interface Reply {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user?: { name: string; avatar_url?: string }
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  issued_at: string
  user?: { name: string }
  course?: { title: string }
}

export interface Sale {
  id: string
  user_id: string
  course_id: string
  amount: number
  status: 'paid' | 'refunded' | 'pending'
  created_at: string
  user?: { name: string; email: string }
  course?: { title: string }
}

export interface StudentMetrics {
  user_id: string
  name: string
  email: string
  courses_enrolled: number
  avg_progress: number
  last_access: string
  status: 'active' | 'risk' | 'completed'
}

export interface DashboardStats {
  revenue_total: number
  revenue_monthly: number
  active_students: number
  monthly_sales: number
  completion_rate: number
}

export interface MonthlyRevenue {
  month: string
  value: number
}

// ─── Fase 3 — Conteúdo Expandido ──────────────

export type LibraryItemType = 'ebook' | 'pdf' | 'spreadsheet' | 'link' | 'video'
export type EventType = 'live' | 'mentoria' | 'webinar' | 'qa'

export interface LibraryItem {
  id: string
  title: string
  description: string
  type: LibraryItemType
  file_url: string
  category: string
  access_type: 'free' | 'paid_once' | 'subscription'
  download_count: number
  is_published: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  scheduled_at: string
  duration_min: number
  meet_url?: string
  recording_url?: string
  access_type: 'free' | 'subscription'
  is_published: boolean
  registrations_count?: number
  created_at: string
}

// ─── Fase 2 — Monetização ─────────────────────

export type ProductType = 'course' | 'ebook' | 'subscription' | 'bundle'
export type AccessType = 'free' | 'paid_once' | 'subscription'
export type PaymentMethod = 'pix' | 'credit_card' | 'boleto'
export type PaymentStatus = 'pending' | 'confirmed' | 'overdue' | 'refunded' | 'cancelled'
export type SubscriptionStatus = 'active' | 'cancelled' | 'overdue'

export interface Product {
  id: string
  title: string
  description: string
  type: ProductType
  access_type: AccessType
  price: number
  price_old?: number
  course_id?: string
  is_active: boolean
  created_at: string
}

export interface UserAccess {
  id: string
  user_id: string
  product_type: ProductType
  product_id: string
  granted_at: string
  expires_at?: string
  source: 'payment' | 'admin_grant' | 'free'
}

export interface Payment {
  id: string
  user_id: string
  asa_payment_id?: string
  product_type: string
  product_id: string
  amount: number
  status: PaymentStatus
  payment_method?: PaymentMethod
  paid_at?: string
  created_at: string
  user?: { name: string; email: string }
  product?: { title: string }
}

export interface Subscription {
  id: string
  user_id: string
  asa_subscription_id: string
  plan_id: string
  status: SubscriptionStatus
  next_billing_at?: string
  cancelled_at?: string
  created_at: string
}

// ─── Auth ─────────────────────────────────────
export interface AuthState {
  user: User | null
  loading: boolean
}

// ─── Forms ────────────────────────────────────
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  name: string
  email: string
  password: string
  confirm_password: string
  role: UserRole
}
