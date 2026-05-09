import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { USE_MOCK_DATA } from '../lib/features'
import { useAuth } from '../contexts/AuthContext'
import type { Post, Reply, ReactionType } from '../types'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const emptyReactions = () => ({ heart: 0, clap: 0, idea: 0, fire: 0 })

export const COMMUNITY_CATEGORIES = [
  'Geral', 'Gestão Clínica', 'Clínica Veterinária',
  'Pet Shop', 'Carreira', 'Dúvidas',
]

const MOCK_POSTS: Post[] = [
  {
    id: 'p1', user_id: 'u1', category: 'Carreira',
    content: 'Acabei de abrir minha clínica e faturei R$18k no primeiro mês! Os módulos de gestão financeira do Tiago foram fundamentais. Obrigado a todos que me apoiaram aqui! 🚀',
    likes: 52, replies_count: 14, is_pinned: true,
    reactions: { heart: 31, clap: 18, idea: 4, fire: 22 }, my_reaction: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    user: { name: 'Ana Beatriz Vet' },
  },
  {
    id: 'p2', user_id: 'u2', category: 'Gestão Clínica',
    content: 'Pessoal, alguém usa software de gestão de clínica aqui? Estou entre o PetVet e o VetSmart, qual recomendam? Preciso de algo para controlar prontuários e financeiro.',
    likes: 18, replies_count: 9, is_pinned: false,
    reactions: { heart: 5, clap: 2, idea: 11, fire: 1 }, my_reaction: 'idea',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    user: { name: 'Dr. Carlos Henrique' },
  },
  {
    id: 'p3', user_id: 'u3', category: 'Pet Shop',
    content: 'Dica de ouro: comecei a oferecer planos de saúde para pets no meu pet shop e isso triplicou o ticket médio mensal. O módulo de precificação me deu a base para estruturar isso.',
    likes: 34, replies_count: 7, is_pinned: false,
    reactions: { heart: 12, clap: 9, idea: 16, fire: 7 }, my_reaction: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    user: { name: 'Marcos Pet Shop' },
  },
  {
    id: 'p4', user_id: 'u4', category: 'Dúvidas',
    content: 'Quem puder me ajudar: quanto cobrar por uma consulta de retorno? Estou praticando R$80 mas parece pouco para minha cidade (interior de SP).',
    likes: 11, replies_count: 15, is_pinned: false,
    reactions: { heart: 4, clap: 1, idea: 8, fire: 0 }, my_reaction: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    user: { name: 'Dra. Fernanda Lima' },
  },
  {
    id: 'p5', user_id: 'u5', category: 'Clínica Veterinária',
    content: 'Implementei o protocolo de pós-operatório sugerido no módulo de clínica e tive uma redução de 40% nas complicações em 3 meses. Vale MUITO a pena estudar o material.',
    likes: 45, replies_count: 6, is_pinned: false,
    reactions: { heart: 28, clap: 15, idea: 5, fire: 12 }, my_reaction: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    user: { name: 'Dr. Roberto Santos' },
  },
]

const MOCK_REPLIES: Record<string, Reply[]> = {
  p1: [
    { id: 'r1', post_id: 'p1', user_id: 'u10', content: 'Parabéns! Que resultado incrível! Quanto tempo levou para abrir a clínica após o curso?', created_at: new Date(Date.now() - 3600000).toISOString(), user: { name: 'Júlia Vet' } },
    { id: 'r2', post_id: 'p1', user_id: 'u11', content: 'Incrível! Você pode compartilhar mais sobre como estruturou o modelo financeiro?', created_at: new Date(Date.now() - 1800000).toISOString(), user: { name: 'Pedro Gestor' } },
  ],
  p2: [
    { id: 'r3', post_id: 'p2', user_id: 'u12', content: 'Uso o PetVet há 2 anos e recomendo muito! O suporte é rápido.', created_at: new Date(Date.now() - 4 * 3600000).toISOString(), user: { name: 'Dra. Camila' } },
    { id: 'r4', post_id: 'p2', user_id: 'u13', content: 'VetSmart tem mais recursos mas o preço é mais alto. Depende do tamanho da sua clínica.', created_at: new Date(Date.now() - 3 * 3600000).toISOString(), user: { name: 'Dr. Carlos Henrique' } },
  ],
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCommunity(categoryFilter: string = 'Todos', search: string = '') {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [repliesByPost, setRepliesByPost] = useState<Record<string, Reply[]>>(USE_MOCK_DATA ? MOCK_REPLIES : {})

  const load = useCallback(async () => {
    setLoading(true)
    if (supabase) {
      let q = supabase.from('posts').select('*, user:profiles(name, avatar_url)').order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
      if (categoryFilter !== 'Todos') q = q.eq('category', categoryFilter)
      if (search) q = q.ilike('content', `%${search}%`)
      const { data } = await q.limit(30)
      if (data && data.length > 0) { setPosts(data as Post[]); setLoading(false); return }
    }
    let result = USE_MOCK_DATA ? MOCK_POSTS : []
    if (categoryFilter !== 'Todos') result = result.filter(p => p.category === categoryFilter)
    if (search) result = result.filter(p => p.content.toLowerCase().includes(search.toLowerCase()))
    setPosts(result)
    setLoading(false)
  }, [categoryFilter, search])

  useEffect(() => { load() }, [load])

  const loadReplies = useCallback(async (postId: string) => {
    if (repliesByPost[postId]) return // already loaded
    if (supabase) {
      const { data } = await supabase
        .from('replies')
        .select('*, user:profiles(name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      setRepliesByPost(prev => ({ ...prev, [postId]: (data as Reply[]) ?? [] }))
    } else {
      setRepliesByPost(prev => ({ ...prev, [postId]: [] }))
    }
  }, [repliesByPost])

  const publishPost = useCallback(async (content: string, category: string) => {
    if (!user || !content.trim()) return
    const newPost: Post = {
      id: Math.random().toString(36).slice(2),
      user_id: user.id,
      content: content.trim(),
      category,
      is_pinned: false,
      likes: 0, replies_count: 0,
      reactions: emptyReactions(), my_reaction: null,
      created_at: new Date().toISOString(),
      user: { name: user.name },
    }
    setPosts(prev => [newPost, ...prev])
    if (supabase) await supabase.from('posts').insert({ ...newPost, user: undefined })
    return newPost
  }, [user])

  const react = useCallback(async (postId: string, reaction: ReactionType) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const wasReacted = p.my_reaction === reaction
      const newReactions = { ...p.reactions }
      if (wasReacted) {
        newReactions[reaction] = Math.max(0, newReactions[reaction] - 1)
      } else {
        if (p.my_reaction) newReactions[p.my_reaction] = Math.max(0, newReactions[p.my_reaction] - 1)
        newReactions[reaction] = newReactions[reaction] + 1
      }
      return { ...p, reactions: newReactions, my_reaction: wasReacted ? null : reaction }
    }))
    if (supabase && user) {
      const post = posts.find(p => p.id === postId)
      const wasReacted = post?.my_reaction === reaction
      if (wasReacted) {
        await supabase.from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        await supabase.from('post_reactions')
          .upsert({ post_id: postId, user_id: user.id, reaction }, { onConflict: 'post_id,user_id' })
      }
    }
  }, [posts, user])

  const addReply = useCallback(async (postId: string, content: string) => {
    if (!user || !content.trim()) return
    const reply: Reply = {
      id: Math.random().toString(36).slice(2),
      post_id: postId, user_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      user: { name: user.name },
    }
    setRepliesByPost(prev => ({ ...prev, [postId]: [...(prev[postId] ?? []), reply] }))
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies_count: p.replies_count + 1 } : p))
    if (supabase) await supabase.from('replies').insert({ ...reply, user: undefined })
  }, [user])

  return { posts, setPosts, loading, repliesByPost, loadReplies, publishPost, react, addReply }
}

// ─── Admin hook ────────────────────────────────────────────────────────────────
export function useCommunityAdmin() {
  const [posts, setPosts] = useState<Post[]>(USE_MOCK_DATA ? MOCK_POSTS : [])
  const [loading] = useState(false)

  const pinPost = useCallback(async (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, is_pinned: !p.is_pinned } : p))
    if (supabase) {
      const post = posts.find(p => p.id === id)
      await supabase.from('posts').update({ is_pinned: !post?.is_pinned }).eq('id', id)
    }
  }, [posts])

  const deletePost = useCallback(async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
    if (supabase) await supabase.from('posts').delete().eq('id', id)
  }, [])

  const assignCategory = useCallback(async (id: string, category: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, category } : p))
    if (supabase) await supabase.from('posts').update({ category }).eq('id', id)
  }, [])

  return { posts, loading, pinPost, deletePost, assignCategory }
}
