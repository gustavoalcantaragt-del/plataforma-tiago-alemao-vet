// ─────────────────────────────────────────────
// MOCK DATA — Tiago Alemão VET Platform
// ─────────────────────────────────────────────
import type {
  Course, Module, User, Post, StudentMetrics,
  Sale, MonthlyRevenue, DashboardStats, Certificate,
  Product, Payment, LibraryItem, Event,
} from '../types'
import type { Notification } from '../hooks/useNotifications'

// ─── Usuários ─────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: 'u1',
  email: 'dra.patricia@email.com',
  name: 'Dra. Patrícia Souza',
  role: 'student',
  created_at: '2024-01-10T00:00:00Z',
}

export const MOCK_OWNER: User = {
  id: 'o1',
  email: 'tiago@tiagoedu.com.br',
  name: 'Tiago Alemão',
  role: 'owner',
  created_at: '2023-06-01T00:00:00Z',
}

// ─── Cursos ───────────────────────────────────────────────────────────────────

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Diagnóstico Financeiro de Clínicas',
    subtitle: 'Entenda onde o dinheiro está indo',
    description: 'Aprenda a fazer um diagnóstico financeiro completo da sua clínica veterinária, identificar onde o dinheiro está indo e criar um plano de ação para reverter o quadro.',
    category: 'Finanças',
    emoji: '🔍',
    thumbnail_gradient: 'linear-gradient(135deg, #1a0a0a, #3d0000)',
    price: 297,
    price_old: 497,
    modules_count: 6,
    lessons_count: 48,
    hours: 20,
    students_count: 874,
    rating: 4.9,
    is_published: true,
    created_at: '2024-01-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c2',
    title: 'Precificação Estratégica VET',
    subtitle: 'Cobre o que seus serviços realmente valem',
    description: 'Metodologia completa para calcular o custo real de cada serviço veterinário e definir preços com margem de lucro real.',
    category: 'Precificação',
    emoji: '💲',
    thumbnail_gradient: 'linear-gradient(135deg, #0a1a0a, #003d00)',
    price: 197,
    price_old: 347,
    modules_count: 5,
    lessons_count: 40,
    hours: 16,
    students_count: 1231,
    rating: 4.8,
    is_published: true,
    created_at: '2024-02-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c3',
    title: 'Fluxo de Caixa Previsível',
    subtitle: 'Saiba exatamente o que vai entrar e sair',
    description: 'Monte um controle de fluxo de caixa eficiente para sua clínica ou pet shop, com planilhas práticas e metodologia testada.',
    category: 'Controle',
    emoji: '📊',
    thumbnail_gradient: 'linear-gradient(135deg, #0a0a1a, #00003d)',
    price: 247,
    price_old: 397,
    modules_count: 5,
    lessons_count: 38,
    hours: 15,
    students_count: 956,
    rating: 4.7,
    is_published: true,
    created_at: '2024-03-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c4',
    title: 'KPIs para Gestores VET',
    subtitle: 'Meça o que realmente importa',
    description: 'Defina e monitore os indicadores de desempenho certos para tomar decisões baseadas em dados na sua clínica veterinária.',
    category: 'Gestão',
    emoji: '📈',
    thumbnail_gradient: 'linear-gradient(135deg, #1a1a0a, #3d3d00)',
    price: 147,
    price_old: 247,
    modules_count: 4,
    lessons_count: 32,
    hours: 12,
    students_count: 2104,
    rating: 4.9,
    is_published: true,
    created_at: '2024-04-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c5',
    title: 'Controle de Custos e Despesas',
    subtitle: 'Corte o desnecessário sem perder qualidade',
    description: 'Identifique e elimine desperdícios operacionais, negocie melhor com fornecedores e aumente sua margem sem reduzir atendimento.',
    category: 'Custos',
    emoji: '✂️',
    thumbnail_gradient: 'linear-gradient(135deg, #1a0a1a, #3d003d)',
    price: 197,
    price_old: 297,
    modules_count: 5,
    lessons_count: 42,
    hours: 17,
    students_count: 789,
    rating: 4.8,
    is_published: true,
    created_at: '2024-05-01T00:00:00Z',
    owner_id: 'o1',
  },
  {
    id: 'c6',
    title: 'Mentoria: Escala Sustentável VET',
    subtitle: 'Do diagnóstico ao crescimento com lucro',
    description: 'Programa completo com acompanhamento individual para estruturar o financeiro da sua clínica e crescer de forma previsível e lucrativa.',
    category: 'Mentoria',
    emoji: '🏆',
    thumbnail_gradient: 'linear-gradient(135deg, #1a1200, #3d2900)',
    price: 997,
    price_old: 1997,
    modules_count: 12,
    lessons_count: 96,
    hours: 48,
    students_count: 213,
    rating: 5.0,
    is_published: true,
    created_at: '2024-06-01T00:00:00Z',
    owner_id: 'o1',
  },
]

// ─── Módulos e Aulas ──────────────────────────────────────────────────────────

export const MOCK_MODULES: Module[] = [
  {
    id: 'm1',
    course_id: 'c1',
    title: 'Fundamentos do Diagnóstico Financeiro',
    order: 1,
    lessons: [
      { id: 'l1', module_id: 'm1', title: 'Por que sua clínica pode faturar bem e não lucrar', duration: '14:30', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1, is_preview: true },
      { id: 'l2', module_id: 'm1', title: 'As 5 causas mais comuns de crise financeira em clínicas', duration: '18:45', video_url: '', order: 2, is_preview: false },
      { id: 'l3', module_id: 'm1', title: 'DRE simplificada: entenda suas demonstrações', duration: '22:10', video_url: '', order: 3, is_preview: false },
      { id: 'l4', module_id: 'm1', title: 'Pró-labore vs. lucro: separando sua pessoa jurídica', duration: '15:20', video_url: '', order: 4, is_preview: false },
    ],
  },
  {
    id: 'm2',
    course_id: 'c1',
    title: 'Mapeamento de Custos e Receitas',
    order: 2,
    lessons: [
      { id: 'l5', module_id: 'm2', title: 'Custos fixos vs. variáveis: classificando corretamente', duration: '20:00', video_url: '', order: 1, is_preview: false },
      { id: 'l6', module_id: 'm2', title: 'Custo de insumos e medicamentos: como calcular', duration: '17:15', video_url: '', order: 2, is_preview: false },
      { id: 'l7', module_id: 'm2', title: 'Receita por procedimento: mapeando o que traz dinheiro', duration: '19:40', video_url: '', order: 3, is_preview: false },
      { id: 'l8', module_id: 'm2', title: 'Planilha de mapeamento na prática', duration: '24:50', video_url: '', order: 4, is_preview: false },
    ],
  },
  {
    id: 'm3',
    course_id: 'c1',
    title: 'Plano de Ação Financeiro',
    order: 3,
    lessons: [
      { id: 'l9', module_id: 'm3', title: 'Interpretando seu diagnóstico: o que os números dizem', duration: '16:20', video_url: '', order: 1, is_preview: false },
      { id: 'l10', module_id: 'm3', title: 'Metas financeiras realistas para clínicas veterinárias', duration: '21:30', video_url: '', order: 2, is_preview: false },
      { id: 'l11', module_id: 'm3', title: 'Priorizando ações: impacto vs. esforço', duration: '18:00', video_url: '', order: 3, is_preview: false },
      { id: 'l12', module_id: 'm3', title: 'Revisão mensal: rituais financeiros que funcionam', duration: '13:45', video_url: '', order: 4, is_preview: false },
    ],
  },
]

export const MOCK_LESSON_PROGRESS: Record<string, boolean> = {
  l1: true, l2: true, l3: true, l4: false,
  l5: false, l6: false, l7: false, l8: false,
  l9: false, l10: false, l11: false, l12: false,
}

export const MOCK_ENROLLED_COURSES = ['c1', 'c2', 'c4']
export const MOCK_COMPLETED_COURSES = ['c4']

// ─── Trilha ───────────────────────────────────────────────────────────────────

export const MOCK_TRAIL_STAGES = [
  { id: 'c4', title: 'KPIs para Gestores VET', status: 'done' as const, emoji: '📈' },
  { id: 'c2', title: 'Precificação Estratégica VET', status: 'done' as const, emoji: '💲' },
  { id: 'c1', title: 'Diagnóstico Financeiro de Clínicas', status: 'current' as const, emoji: '🔍' },
  { id: 'c3', title: 'Fluxo de Caixa Previsível', status: 'locked' as const, emoji: '📊' },
  { id: 'c5', title: 'Controle de Custos e Despesas', status: 'locked' as const, emoji: '✂️' },
  { id: 'c6', title: 'Mentoria: Escala Sustentável VET', status: 'locked' as const, emoji: '🏆' },
]

// ─── Comunidade ───────────────────────────────────────────────────────────────

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    user_id: 'u2',
    content: 'Pessoal, apliquei o método do Tiago de precificação na minha clínica e aumentei minha margem em 38% sem perder clientes. Vale muito cada centavo do investimento! 🚀',
    category: 'Resultados',
    is_pinned: true,
    likes: 89,
    replies_count: 21,
    reactions: { heart: 32, clap: 28, idea: 14, fire: 15 },
    my_reaction: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    user: { name: 'Dr. Carlos Ferreira' },
    liked_by_me: false,
  },
  {
    id: 'p2',
    user_id: 'u3',
    content: 'Dica: antes de renegociar com fornecedores, mapeie 100% dos seus custos de insumos. Consegui 22% de desconto só com essa base de dados. A aula 6 do módulo 2 ensina exatamente isso.',
    category: 'Dicas',
    is_pinned: false,
    likes: 54,
    replies_count: 11,
    reactions: { heart: 12, clap: 25, idea: 14, fire: 3 },
    my_reaction: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    user: { name: 'Dra. Renata Oliveira' },
    liked_by_me: true,
  },
  {
    id: 'p3',
    user_id: 'u4',
    content: 'Quem está fazendo o módulo de KPIs? Tenho dúvida sobre como calcular o ticket médio por espécie. Alguém pode ajudar? 🐾',
    category: 'Dúvidas',
    is_pinned: false,
    likes: 22,
    replies_count: 18,
    reactions: { heart: 5, clap: 3, idea: 12, fire: 2 },
    my_reaction: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    user: { name: 'Dr. Rodrigo Lima' },
    liked_by_me: false,
  },
  {
    id: 'p4',
    user_id: 'u5',
    content: 'Meu pet shop estava no vermelho há 8 meses. Depois de 6 semanas aplicando o diagnóstico financeiro, já fechei o mês no azul pela primeira vez. Obrigada Tiago! 💚',
    category: 'Resultados',
    is_pinned: false,
    likes: 134,
    replies_count: 35,
    reactions: { heart: 67, clap: 42, idea: 8, fire: 17 },
    my_reaction: null,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    user: { name: 'Mariana Teixeira' },
    liked_by_me: false,
  },
  {
    id: 'p5',
    user_id: 'u6',
    content: 'Alguém usa algum sistema de gestão integrado ao que aprendemos aqui? Estou avaliando VetSoft e iClinic, gostaria de opiniões de quem já usou.',
    category: 'Ferramentas',
    is_pinned: false,
    likes: 19,
    replies_count: 14,
    reactions: { heart: 3, clap: 2, idea: 11, fire: 3 },
    my_reaction: null,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    user: { name: 'Dr. Felipe Nascimento' },
    liked_by_me: false,
  },
]

// ─── Certificados ─────────────────────────────────────────────────────────────

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'cert1',
    user_id: 'u1',
    course_id: 'c4',
    issued_at: '2024-08-15T00:00:00Z',
    user: { name: 'Dra. Patrícia Souza' },
    course: { title: 'KPIs para Gestores VET' },
  },
  {
    id: 'cert2',
    user_id: 'u1',
    course_id: 'c2',
    issued_at: '2024-10-02T00:00:00Z',
    user: { name: 'Dra. Patrícia Souza' },
    course: { title: 'Precificação Estratégica VET' },
  },
]

// ─── Métricas de Alunos ───────────────────────────────────────────────────────

export const MOCK_STUDENT_METRICS: StudentMetrics[] = [
  { user_id: 'u1', name: 'Dra. Patrícia Souza', email: 'dra.patricia@email.com', courses_enrolled: 3, avg_progress: 72, last_access: '2025-05-09', status: 'active' },
  { user_id: 'u2', name: 'Dr. Carlos Ferreira', email: 'carlos.vet@email.com', courses_enrolled: 5, avg_progress: 94, last_access: '2025-05-09', status: 'completed' },
  { user_id: 'u3', name: 'Dra. Renata Oliveira', email: 'renata.vet@email.com', courses_enrolled: 4, avg_progress: 61, last_access: '2025-05-08', status: 'active' },
  { user_id: 'u4', name: 'Dr. Rodrigo Lima', email: 'rodrigo@clinicavet.com', courses_enrolled: 2, avg_progress: 18, last_access: '2025-04-20', status: 'risk' },
  { user_id: 'u5', name: 'Mariana Teixeira', email: 'mariana@petshop.com', courses_enrolled: 6, avg_progress: 88, last_access: '2025-05-07', status: 'active' },
  { user_id: 'u6', name: 'Dr. Felipe Nascimento', email: 'felipe@hospitalvet.com', courses_enrolled: 3, avg_progress: 45, last_access: '2025-05-06', status: 'active' },
  { user_id: 'u7', name: 'Dra. Amanda Castro', email: 'amanda@email.com', courses_enrolled: 1, avg_progress: 6, last_access: '2025-04-10', status: 'risk' },
  { user_id: 'u8', name: 'Bruno Carvalho', email: 'bruno@petshopcanino.com', courses_enrolled: 4, avg_progress: 79, last_access: '2025-05-08', status: 'active' },
  { user_id: 'u9', name: 'Dra. Larissa Mendes', email: 'larissa.vet@gmail.com', courses_enrolled: 5, avg_progress: 97, last_access: '2025-05-09', status: 'completed' },
  { user_id: 'u10', name: 'Dr. Paulo Henrique', email: 'paulo@clinicaph.com', courses_enrolled: 2, avg_progress: 33, last_access: '2025-05-04', status: 'active' },
]

// ─── Vendas Recentes ──────────────────────────────────────────────────────────

export const MOCK_RECENT_SALES: Sale[] = [
  { id: 's1', user_id: 'u11', course_id: 'c6', amount: 997, status: 'paid', created_at: new Date(Date.now() - 1 * 3600000).toISOString(), user: { name: 'Dra. Juliana Ramos', email: 'juliana@email.com' }, course: { title: 'Mentoria: Escala Sustentável VET' } },
  { id: 's2', user_id: 'u12', course_id: 'c1', amount: 297, status: 'paid', created_at: new Date(Date.now() - 3 * 3600000).toISOString(), user: { name: 'Dr. Marcos Vinicius', email: 'marcos@email.com' }, course: { title: 'Diagnóstico Financeiro de Clínicas' } },
  { id: 's3', user_id: 'u13', course_id: 'c2', amount: 197, status: 'paid', created_at: new Date(Date.now() - 7 * 3600000).toISOString(), user: { name: 'Andrea Pinto', email: 'andrea@petshop.com' }, course: { title: 'Precificação Estratégica VET' } },
  { id: 's4', user_id: 'u14', course_id: 'c3', amount: 247, status: 'paid', created_at: new Date(Date.now() - 14 * 3600000).toISOString(), user: { name: 'Dr. Fábio Corrêa', email: 'fabio@email.com' }, course: { title: 'Fluxo de Caixa Previsível' } },
]

// ─── Receita Mensal ───────────────────────────────────────────────────────────

export const MOCK_MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'Mai/24', value: 14200 },
  { month: 'Jun/24', value: 18700 },
  { month: 'Jul/24', value: 16900 },
  { month: 'Ago/24', value: 22400 },
  { month: 'Set/24', value: 27100 },
  { month: 'Out/24', value: 31600 },
  { month: 'Nov/24', value: 29800 },
  { month: 'Dez/24', value: 38400 },
  { month: 'Jan/25', value: 43200 },
  { month: 'Fev/25', value: 39700 },
  { month: 'Mar/25', value: 47900 },
  { month: 'Abr/25', value: 54300 },
]

// ─── Stats do Dashboard ───────────────────────────────────────────────────────

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  revenue_total: 384200,
  revenue_monthly: 54300,
  active_students: 8741,
  monthly_sales: 213,
  completion_rate: 71,
}

// ─── Produtos ─────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    title: 'Diagnóstico Financeiro de Clínicas',
    description: 'Curso completo para entender onde o dinheiro está indo e criar plano de ação financeiro.',
    type: 'course',
    access_type: 'paid_once',
    price: 297,
    price_old: 497,
    course_id: 'c1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prod2',
    title: 'Precificação Estratégica VET',
    description: 'Metodologia para calcular custos e definir preços com margem de lucro real.',
    type: 'course',
    access_type: 'paid_once',
    price: 197,
    price_old: 347,
    course_id: 'c2',
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'prod3',
    title: 'Planilha Mestra: Gestão Financeira VET',
    description: 'Planilha completa com DRE, fluxo de caixa, KPIs e precificação em um só arquivo.',
    type: 'ebook',
    access_type: 'paid_once',
    price: 97,
    price_old: 197,
    is_active: true,
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'prod4',
    title: 'Assinatura Mensal — Acesso Completo',
    description: 'Acesso a todos os cursos, planilhas, mentorias em grupo e comunidade por 1 mês.',
    type: 'subscription',
    access_type: 'subscription',
    price: 97,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prod5',
    title: 'Assinatura Anual — Melhor Custo-Benefício',
    description: 'Acesso completo por 12 meses com bônus exclusivos e mentorias individuais.',
    type: 'subscription',
    access_type: 'subscription',
    price: 797,
    price_old: 1164,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prod6',
    title: 'Bundle: Gestão Financeira Completa',
    description: 'Pacote com os 5 cursos de gestão financeira + planilha mestra com 35% de desconto.',
    type: 'bundle',
    access_type: 'paid_once',
    price: 697,
    price_old: 1085,
    is_active: true,
    created_at: '2024-04-01T00:00:00Z',
  },
]

// ─── Pagamentos ───────────────────────────────────────────────────────────────

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay1', user_id: 'u1', product_type: 'course', product_id: 'prod1', amount: 297, status: 'confirmed', payment_method: 'pix', paid_at: new Date(Date.now() - 5 * 86400000).toISOString(), created_at: new Date(Date.now() - 5 * 86400000).toISOString(), user: { name: 'Dra. Patrícia Souza', email: 'dra.patricia@email.com' }, product: { title: 'Diagnóstico Financeiro de Clínicas' } },
  { id: 'pay2', user_id: 'u2', product_type: 'subscription', product_id: 'prod4', amount: 97, status: 'confirmed', payment_method: 'credit_card', paid_at: new Date(Date.now() - 2 * 86400000).toISOString(), created_at: new Date(Date.now() - 2 * 86400000).toISOString(), user: { name: 'Dr. Carlos Ferreira', email: 'carlos.vet@email.com' }, product: { title: 'Assinatura Mensal' } },
  { id: 'pay3', user_id: 'u3', product_type: 'course', product_id: 'prod2', amount: 197, status: 'confirmed', payment_method: 'boleto', paid_at: new Date(Date.now() - 3 * 86400000).toISOString(), created_at: new Date(Date.now() - 3 * 86400000).toISOString(), user: { name: 'Dra. Renata Oliveira', email: 'renata.vet@email.com' }, product: { title: 'Precificação Estratégica VET' } },
  { id: 'pay4', user_id: 'u4', product_type: 'course', product_id: 'prod1', amount: 297, status: 'pending', payment_method: 'boleto', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), user: { name: 'Dr. Rodrigo Lima', email: 'rodrigo@clinicavet.com' }, product: { title: 'Diagnóstico Financeiro de Clínicas' } },
  { id: 'pay5', user_id: 'u5', product_type: 'subscription', product_id: 'prod5', amount: 797, status: 'confirmed', payment_method: 'pix', paid_at: new Date(Date.now() - 10 * 86400000).toISOString(), created_at: new Date(Date.now() - 10 * 86400000).toISOString(), user: { name: 'Mariana Teixeira', email: 'mariana@petshop.com' }, product: { title: 'Assinatura Anual' } },
  { id: 'pay6', user_id: 'u6', product_type: 'bundle', product_id: 'prod6', amount: 697, status: 'confirmed', payment_method: 'credit_card', paid_at: new Date(Date.now() - 7 * 86400000).toISOString(), created_at: new Date(Date.now() - 7 * 86400000).toISOString(), user: { name: 'Dr. Felipe Nascimento', email: 'felipe@hospitalvet.com' }, product: { title: 'Bundle: Gestão Financeira Completa' } },
  { id: 'pay7', user_id: 'u7', product_type: 'course', product_id: 'prod3', amount: 97, status: 'overdue', payment_method: 'boleto', created_at: new Date(Date.now() - 15 * 86400000).toISOString(), user: { name: 'Dra. Amanda Castro', email: 'amanda@email.com' }, product: { title: 'Planilha Mestra: Gestão Financeira VET' } },
  { id: 'pay8', user_id: 'u8', product_type: 'course', product_id: 'prod2', amount: 197, status: 'refunded', payment_method: 'pix', created_at: new Date(Date.now() - 20 * 86400000).toISOString(), user: { name: 'Bruno Carvalho', email: 'bruno@petshopcanino.com' }, product: { title: 'Precificação Estratégica VET' } },
]

// ─── Biblioteca ───────────────────────────────────────────────────────────────

export const MOCK_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'lib1',
    title: 'Planilha: DRE Simplificada para Clínicas VET',
    description: 'Demonstração de resultados do exercício adaptada para a realidade das clínicas veterinárias. Preencha e visualize seu lucro real.',
    type: 'spreadsheet',
    file_url: '#',
    category: 'Finanças',
    access_type: 'free',
    download_count: 2847,
    is_published: true,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'lib2',
    title: 'E-book: Guia de Precificação para Veterinários',
    description: 'Guia completo com metodologia passo a passo para calcular o preço correto de cada serviço veterinário, do banho à cirurgia.',
    type: 'ebook',
    file_url: '#',
    category: 'Precificação',
    access_type: 'free',
    download_count: 1934,
    is_published: true,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'lib3',
    title: 'Planilha: Controle de Fluxo de Caixa Semanal',
    description: 'Controle suas entradas e saídas semana a semana. Inclui gráfico de projeção de caixa para os próximos 3 meses.',
    type: 'spreadsheet',
    file_url: '#',
    category: 'Controle',
    access_type: 'subscription',
    download_count: 1102,
    is_published: true,
    created_at: '2024-03-10T00:00:00Z',
  },
  {
    id: 'lib4',
    title: 'PDF: Os 10 KPIs Essenciais para Clínicas VET',
    description: 'Lista comentada dos 10 indicadores de desempenho que todo gestor de clínica veterinária precisa monitorar mensalmente.',
    type: 'pdf',
    file_url: '#',
    category: 'Gestão',
    access_type: 'free',
    download_count: 3241,
    is_published: true,
    created_at: '2024-03-20T00:00:00Z',
  },
  {
    id: 'lib5',
    title: 'Planilha: Controle de Custos de Insumos e Medicamentos',
    description: 'Planilha para mapear e controlar todos os custos de insumos, medicamentos e materiais cirúrgicos da sua clínica.',
    type: 'spreadsheet',
    file_url: '#',
    category: 'Custos',
    access_type: 'subscription',
    download_count: 876,
    is_published: true,
    created_at: '2024-04-05T00:00:00Z',
  },
  {
    id: 'lib6',
    title: 'PDF: Checklist de Diagnóstico Financeiro',
    description: 'Checklist com 47 perguntas para diagnosticar a saúde financeira da sua clínica ou pet shop em menos de 1 hora.',
    type: 'pdf',
    file_url: '#',
    category: 'Diagnóstico',
    access_type: 'subscription',
    download_count: 1567,
    is_published: true,
    created_at: '2024-04-20T00:00:00Z',
  },
]

// ─── Eventos e Mentorias ──────────────────────────────────────────────────────

export const MOCK_EVENTS: Event[] = [
  {
    id: 'ev1',
    title: 'Live: Como sair do vermelho em 90 dias',
    description: 'Tiago vai mostrar ao vivo o caso real de uma clínica que reverteu o prejuízo em menos de 3 meses. Perguntas abertas no final.',
    type: 'live',
    scheduled_at: new Date(Date.now() + 2 * 86400000).toISOString(),
    duration_min: 90,
    meet_url: '#',
    access_type: 'free',
    is_published: true,
    registrations_count: 412,
    created_at: '2025-05-01T00:00:00Z',
  },
  {
    id: 'ev2',
    title: 'Mentoria em Grupo: Precificação na Prática',
    description: 'Sessão em grupo para revisar a precificação dos seus serviços com feedbacks em tempo real do Tiago Alemão.',
    type: 'mentoria',
    scheduled_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    duration_min: 120,
    meet_url: '#',
    access_type: 'subscription',
    is_published: true,
    registrations_count: 87,
    created_at: '2025-05-01T00:00:00Z',
  },
  {
    id: 'ev3',
    title: 'Webinar: Indicadores Financeiros para Pet Shops',
    description: 'Quais KPIs um pet shop precisa acompanhar para crescer com saúde financeira? Tiago responde com exemplos reais.',
    type: 'webinar',
    scheduled_at: new Date(Date.now() + 9 * 86400000).toISOString(),
    duration_min: 60,
    meet_url: '#',
    access_type: 'free',
    is_published: true,
    registrations_count: 234,
    created_at: '2025-05-02T00:00:00Z',
  },
  {
    id: 'ev4',
    title: 'Q&A: Tire todas as suas dúvidas financeiras',
    description: 'Sessão aberta de perguntas e respostas. Envie suas dúvidas antecipadamente no formulário e Tiago responde ao vivo.',
    type: 'qa',
    scheduled_at: new Date(Date.now() + 12 * 86400000).toISOString(),
    duration_min: 60,
    meet_url: '#',
    access_type: 'subscription',
    is_published: true,
    registrations_count: 156,
    created_at: '2025-05-03T00:00:00Z',
  },
  {
    id: 'ev5',
    title: 'Live Gravada: Fluxo de Caixa do Zero — Maio/25',
    description: 'Gravação da live de maio sobre como montar um controle de fluxo de caixa do zero, mesmo sem conhecimento financeiro prévio.',
    type: 'live',
    scheduled_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    duration_min: 75,
    recording_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    access_type: 'subscription',
    is_published: true,
    registrations_count: 389,
    created_at: '2025-04-28T00:00:00Z',
  },
]

// ─── Notificações ─────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    user_id: 'u1',
    type: 'achievement',
    title: 'Conquista desbloqueada! 🏆',
    body: 'Você concluiu 3 aulas seguidas. Continue assim!',
    is_read: false,
    action_url: '/conquistas',
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'n2',
    user_id: 'u1',
    type: 'event',
    title: 'Live amanhã às 20h',
    body: 'Não esqueça: "Como sair do vermelho em 90 dias" começa amanhã.',
    is_read: false,
    action_url: '/mentorias',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'n3',
    user_id: 'u1',
    type: 'course',
    title: 'Novo material disponível',
    body: 'A Planilha Mestra de Gestão Financeira VET foi atualizada com novas funcionalidades.',
    is_read: false,
    action_url: '/biblioteca',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'n4',
    user_id: 'u1',
    type: 'system',
    title: 'Bem-vindo à plataforma! 👋',
    body: 'Sua conta foi criada com sucesso. Comece pela trilha de aprendizado.',
    is_read: true,
    action_url: '/trilha',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'n5',
    user_id: 'u1',
    type: 'payment',
    title: 'Pagamento confirmado',
    body: 'Seu acesso ao curso "Diagnóstico Financeiro de Clínicas" foi liberado.',
    is_read: true,
    action_url: '/meus-cursos',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
]
