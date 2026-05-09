// ─────────────────────────────────────────────
// MOCK DATA — Substituir por chamadas Supabase
// ─────────────────────────────────────────────
import type {
  Course, Module, User, Post, StudentMetrics,
  Sale, MonthlyRevenue, DashboardStats, Certificate,
} from '../types'

export const MOCK_USER: User = {
  id: 'u1',
  email: 'joao@email.com',
  name: 'João Silva',
  role: 'student',
  created_at: '2024-01-10T00:00:00Z',
}

export const MOCK_OWNER: User = {
  id: 'o1',
  email: 'admin@nexuslearn.com',
  name: 'Ana Costa',
  role: 'owner',
  created_at: '2023-06-01T00:00:00Z',
}

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Tráfego Pago do Zero ao Avançado',
    subtitle: 'Google Ads, Meta Ads e TikTok Ads',
    description: 'Domine as principais plataformas de tráfego pago e escale seus resultados com estratégias comprovadas.',
    category: 'Tráfego',
    emoji: '🎯',
    thumbnail_gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    price: 297,
    price_old: 497,
    modules_count: 8,
    lessons_count: 64,
    hours: 28,
    students_count: 1847,
    rating: 4.9,
    is_published: true,
    created_at: '2024-01-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c2',
    title: 'Marketing de Conteúdo que Converte',
    subtitle: 'Estratégias orgânicas de alto impacto',
    description: 'Aprenda a criar conteúdo que atrai, engaja e converte sua audiência em clientes fiéis.',
    category: 'Marketing',
    emoji: '📱',
    thumbnail_gradient: 'linear-gradient(135deg, #0f0c29, #302b63)',
    price: 197,
    price_old: 347,
    modules_count: 6,
    lessons_count: 48,
    hours: 18,
    students_count: 2341,
    rating: 4.8,
    is_published: true,
    created_at: '2024-02-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c3',
    title: 'Vendas de Alta Performance',
    subtitle: 'Metodologia de fechamento premium',
    description: 'Técnicas avançadas de vendas consultivas para fechar negócios de alto valor com confiança.',
    category: 'Vendas',
    emoji: '💰',
    thumbnail_gradient: 'linear-gradient(135deg, #1a0a00, #3d1f00)',
    price: 397,
    price_old: 697,
    modules_count: 7,
    lessons_count: 56,
    hours: 24,
    students_count: 987,
    rating: 4.9,
    is_published: true,
    created_at: '2024-03-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c4',
    title: 'Mentalidade Milionária',
    subtitle: 'Reprograme sua relação com dinheiro',
    description: 'Quebre crenças limitantes e desenvolva a mentalidade de quem constrói riqueza de forma consistente.',
    category: 'Mentalidade',
    emoji: '🧠',
    thumbnail_gradient: 'linear-gradient(135deg, #0a0a1a, #1a0a2e)',
    price: 147,
    price_old: 247,
    modules_count: 5,
    lessons_count: 40,
    hours: 14,
    students_count: 3102,
    rating: 4.7,
    is_published: true,
    created_at: '2024-04-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c5',
    title: 'Instagram & Reels Pro',
    subtitle: 'Algoritmo, viral e monetização',
    description: 'Estratégias avançadas para crescer no Instagram, dominar o algoritmo e monetizar sua audiência.',
    category: 'Social',
    emoji: '🚀',
    thumbnail_gradient: 'linear-gradient(135deg, #1a0a0a, #2e0a1a)',
    price: 247,
    price_old: 397,
    modules_count: 6,
    lessons_count: 52,
    hours: 20,
    students_count: 4521,
    rating: 4.8,
    is_published: true,
    created_at: '2024-05-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c6',
    title: 'Mentoria Elite: Negócio Digital',
    subtitle: 'Do zero ao primeiro R$10k/mês',
    description: 'Programa completo com acompanhamento para estruturar e escalar seu negócio digital do zero.',
    category: 'Mentoria',
    emoji: '👑',
    thumbnail_gradient: 'linear-gradient(135deg, #1a1200, #2e2000)',
    price: 997,
    price_old: 1997,
    modules_count: 12,
    lessons_count: 96,
    hours: 48,
    students_count: 342,
    rating: 5.0,
    is_published: true,
    created_at: '2024-06-01T00:00:00Z',
    owner_id: 'o1',
  },
]

export const MOCK_MODULES: Module[] = [
  {
    id: 'm1',
    course_id: 'c1',
    title: 'Fundamentos do Tráfego Pago',
    order: 1,
    lessons: [
      { id: 'l1', module_id: 'm1', title: 'O que é tráfego pago e por que usar', duration: '12:30', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1, is_preview: true },
      { id: 'l2', module_id: 'm1', title: 'Pixel e rastreamento de conversões', duration: '18:45', video_url: '', order: 2, is_preview: false },
      { id: 'l3', module_id: 'm1', title: 'Estrutura de campanha ideal', duration: '22:10', video_url: '', order: 3, is_preview: false },
      { id: 'l4', module_id: 'm1', title: 'Métricas que realmente importam', duration: '15:20', video_url: '', order: 4, is_preview: false },
    ],
  },
  {
    id: 'm2',
    course_id: 'c1',
    title: 'Google Ads na Prática',
    order: 2,
    lessons: [
      { id: 'l5', module_id: 'm2', title: 'Criando sua primeira campanha Search', duration: '28:00', video_url: '', order: 1, is_preview: false },
      { id: 'l6', module_id: 'm2', title: 'Palavras-chave: pesquisa e organização', duration: '20:15', video_url: '', order: 2, is_preview: false },
      { id: 'l7', module_id: 'm2', title: 'Anúncios responsivos e Quality Score', duration: '16:40', video_url: '', order: 3, is_preview: false },
      { id: 'l8', module_id: 'm2', title: 'Otimização e redução de CPL', duration: '24:50', video_url: '', order: 4, is_preview: false },
    ],
  },
  {
    id: 'm3',
    course_id: 'c1',
    title: 'Meta Ads: Facebook e Instagram',
    order: 3,
    lessons: [
      { id: 'l9', module_id: 'm3', title: 'Business Manager do zero', duration: '14:20', video_url: '', order: 1, is_preview: false },
      { id: 'l10', module_id: 'm3', title: 'Públicos: frio, morno e quente', duration: '26:30', video_url: '', order: 2, is_preview: false },
      { id: 'l11', module_id: 'm3', title: 'Criativos que convertem em 2024', duration: '31:00', video_url: '', order: 3, is_preview: false },
      { id: 'l12', module_id: 'm3', title: 'Escala horizontal e vertical', duration: '19:45', video_url: '', order: 4, is_preview: false },
    ],
  },
]

export const MOCK_LESSON_PROGRESS: Record<string, boolean> = {
  l1: true, l2: true, l3: false, l4: false,
  l5: false, l6: false, l7: false, l8: false,
  l9: false, l10: false, l11: false, l12: false,
}

export const MOCK_ENROLLED_COURSES = ['c1', 'c2', 'c4']

export const MOCK_COMPLETED_COURSES = ['c4']

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    user_id: 'u2',
    content: 'Pessoal, finalmente consegui meu primeiro cliente usando as técnicas do módulo 3! ROAS de 4.2 na primeira campanha 🚀',
    category: 'Geral',
    is_pinned: false,
    likes: 47,
    replies_count: 12,
    reactions: { heart: 12, clap: 8, idea: 3, fire: 5 },
    my_reaction: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    user: { name: 'Carlos Mendes' },
    liked_by_me: false,
  },
  {
    id: 'p2',
    user_id: 'u3',
    content: 'Dica rápida: sempre testem pelo menos 3 criativos diferentes antes de escalar. Economizei R$800 esse mês com esse hábito simples.',
    category: 'Dicas',
    is_pinned: false,
    likes: 31,
    replies_count: 8,
    reactions: { heart: 7, clap: 15, idea: 6, fire: 3 },
    my_reaction: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    user: { name: 'Fernanda Lima' },
    liked_by_me: true,
  },
  {
    id: 'p3',
    user_id: 'u4',
    content: 'Quem mais está no módulo de Google Ads? Bora criar um grupo de estudos? Responde aqui 👇',
    category: 'Dúvidas',
    is_pinned: false,
    likes: 18,
    replies_count: 23,
    reactions: { heart: 4, clap: 2, idea: 9, fire: 1 },
    my_reaction: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    user: { name: 'Rafael Souza' },
    liked_by_me: false,
  },
]

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'cert1',
    user_id: 'u1',
    course_id: 'c4',
    issued_at: '2024-08-15T00:00:00Z',
    user: { name: 'João Silva' },
    course: { title: 'Mentalidade Milionária' },
  },
]

export const MOCK_STUDENT_METRICS: StudentMetrics[] = [
  { user_id: 'u1', name: 'João Silva', email: 'joao@email.com', courses_enrolled: 3, avg_progress: 72, last_access: '2024-11-20', status: 'active' },
  { user_id: 'u2', name: 'Carlos Mendes', email: 'carlos@email.com', courses_enrolled: 5, avg_progress: 94, last_access: '2024-11-20', status: 'completed' },
  { user_id: 'u3', name: 'Fernanda Lima', email: 'fernanda@email.com', courses_enrolled: 2, avg_progress: 15, last_access: '2024-10-28', status: 'risk' },
  { user_id: 'u4', name: 'Rafael Souza', email: 'rafael@email.com', courses_enrolled: 4, avg_progress: 61, last_access: '2024-11-18', status: 'active' },
  { user_id: 'u5', name: 'Mariana Costa', email: 'mariana@email.com', courses_enrolled: 6, avg_progress: 88, last_access: '2024-11-19', status: 'active' },
  { user_id: 'u6', name: 'Pedro Alves', email: 'pedro@email.com', courses_enrolled: 1, avg_progress: 8, last_access: '2024-10-15', status: 'risk' },
]

export const MOCK_RECENT_SALES: Sale[] = [
  { id: 's1', user_id: 'u7', course_id: 'c6', amount: 997, status: 'paid', created_at: new Date(Date.now() - 1 * 3600000).toISOString(), user: { name: 'Amanda Rocha', email: 'amanda@email.com' }, course: { title: 'Mentoria Elite' } },
  { id: 's2', user_id: 'u8', course_id: 'c1', amount: 297, status: 'paid', created_at: new Date(Date.now() - 3 * 3600000).toISOString(), user: { name: 'Bruno Santos', email: 'bruno@email.com' }, course: { title: 'Tráfego Pago' } },
  { id: 's3', user_id: 'u9', course_id: 'c3', amount: 397, status: 'paid', created_at: new Date(Date.now() - 8 * 3600000).toISOString(), user: { name: 'Camila Ferreira', email: 'camila@email.com' }, course: { title: 'Vendas de Alta Performance' } },
  { id: 's4', user_id: 'u10', course_id: 'c2', amount: 197, status: 'paid', created_at: new Date(Date.now() - 15 * 3600000).toISOString(), user: { name: 'Diego Martins', email: 'diego@email.com' }, course: { title: 'Marketing de Conteúdo' } },
]

export const MOCK_MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'Fev', value: 18400 },
  { month: 'Mar', value: 22100 },
  { month: 'Abr', value: 19800 },
  { month: 'Mai', value: 28700 },
  { month: 'Jun', value: 31200 },
  { month: 'Jul', value: 26900 },
  { month: 'Ago', value: 34500 },
  { month: 'Set', value: 38200 },
  { month: 'Out', value: 41700 },
  { month: 'Nov', value: 39100 },
  { month: 'Dez', value: 47300 },
  { month: 'Jan', value: 52800 },
]

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  revenue_total: 421000,
  revenue_monthly: 52800,
  active_students: 13482,
  monthly_sales: 184,
  completion_rate: 67,
}

export const MOCK_TRAIL_STAGES = [
  { id: 'c4', title: 'Mentalidade Milionária', status: 'done' as const, emoji: '🧠' },
  { id: 'c2', title: 'Marketing de Conteúdo', status: 'done' as const, emoji: '📱' },
  { id: 'c1', title: 'Tráfego Pago do Zero ao Avançado', status: 'current' as const, emoji: '🎯' },
  { id: 'c3', title: 'Vendas de Alta Performance', status: 'locked' as const, emoji: '💰' },
  { id: 'c5', title: 'Instagram & Reels Pro', status: 'locked' as const, emoji: '🚀' },
  { id: 'c6', title: 'Mentoria Elite: Negócio Digital', status: 'locked' as const, emoji: '👑' },
]
