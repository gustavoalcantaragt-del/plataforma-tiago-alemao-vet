-- ═══════════════════════════════════════════════════════════════════════════
-- Plataforma Tiago Alemão VET — Migrations V2
-- Execute APÓS migrations.sql (schema base)
-- Cole no SQL Editor: supabase.com → projeto → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 2 — Monetização ASA
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.products (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text,
  type         text not null check (type in ('course','ebook','subscription','bundle')),
  access_type  text not null check (access_type in ('free','paid_once','subscription')),
  price        numeric(10,2) not null default 0,
  price_old    numeric(10,2),
  course_id    uuid references public.courses(id) on delete set null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.user_access (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  product_type text not null,
  product_id   uuid not null,
  granted_at   timestamptz not null default now(),
  expires_at   timestamptz,
  source       text not null check (source in ('payment','admin_grant','free')),
  unique (user_id, product_id)
);

create table if not exists public.payments (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id),
  asa_payment_id   text unique,
  product_type     text not null,
  product_id       uuid not null,
  amount           numeric(10,2) not null,
  status           text not null default 'pending'
    check (status in ('pending','confirmed','overdue','refunded','cancelled')),
  payment_method   text check (payment_method in ('pix','credit_card','boleto')),
  paid_at          timestamptz,
  created_at       timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id),
  asa_subscription_id text not null unique,
  plan_id             text not null,
  status              text not null default 'active'
    check (status in ('active','cancelled','overdue','expired')),
  next_billing_at     timestamptz,
  cancelled_at        timestamptz,
  created_at          timestamptz not null default now()
);

-- RLS
alter table public.products      enable row level security;
alter table public.user_access   enable row level security;
alter table public.payments      enable row level security;
alter table public.subscriptions enable row level security;

create policy "Produtos ativos visíveis para todos"
  on public.products for select using (is_active = true);

create policy "Admin gerencia produtos"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')));

create policy "Usuário vê próprio acesso"
  on public.user_access for select using (auth.uid() = user_id);

create policy "Admin gerencia user_access"
  on public.user_access for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')));

create policy "Usuário vê próprios pagamentos"
  on public.payments for select using (auth.uid() = user_id);

create policy "Admin vê todos os pagamentos"
  on public.payments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')));

create policy "Usuário vê próprias assinaturas"
  on public.subscriptions for select using (auth.uid() = user_id);

drop policy if exists "Módulos visíveis" on public.modules;
drop policy if exists "Aulas visíveis" on public.lessons;
drop policy if exists "Aulas visíveis para alunos com acesso" on public.lessons;

create policy "Módulos visíveis para alunos com acesso"
  on public.modules for select using (
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and (
          c.owner_id = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
          or exists (
            select 1 from public.enrollments e
            where e.course_id = c.id and e.user_id = auth.uid() and e.status in ('active','completed')
          )
          or exists (
            select 1 from public.user_access ua
            where ua.user_id = auth.uid()
              and ua.product_id = c.id
              and (ua.expires_at is null or ua.expires_at > now())
          )
        )
    )
  );

create policy "Aulas visíveis para alunos com acesso"
  on public.lessons for select using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id
        and (
          c.owner_id = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
          or exists (
            select 1 from public.enrollments e
            where e.course_id = c.id and e.user_id = auth.uid() and e.status in ('active','completed')
          )
          or exists (
            select 1 from public.user_access ua
            where ua.user_id = auth.uid()
              and ua.product_id = c.id
              and (ua.expires_at is null or ua.expires_at > now())
          )
        )
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 3 — Biblioteca e Eventos
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.library_items (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text,
  type            text not null check (type in ('ebook','pdf','spreadsheet','link','video')),
  file_url        text not null,
  category        text not null default 'Geral',
  access_type     text not null check (access_type in ('free','paid_once','subscription')),
  download_count  int not null default 0,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);

create table if not exists public.events (
  id                   uuid primary key default uuid_generate_v4(),
  title                text not null,
  description          text,
  type                 text not null check (type in ('live','mentoria','webinar','qa')),
  scheduled_at         timestamptz not null,
  duration_min         int not null default 60,
  meet_url             text,
  recording_url        text,
  access_type          text not null check (access_type in ('free','subscription')),
  is_published         boolean not null default false,
  registrations_count  int not null default 0,
  created_at           timestamptz not null default now()
);

alter table public.library_items enable row level security;
alter table public.events        enable row level security;

create policy "Itens publicados visíveis"
  on public.library_items for select using (is_published = true);

create policy "Admin gerencia biblioteca"
  on public.library_items for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')));

create policy "Eventos publicados visíveis"
  on public.events for select using (is_published = true);

create policy "Admin gerencia eventos"
  on public.events for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')));

-- RPC: incrementa contador de downloads
create or replace function public.increment_download_count(item_id uuid)
returns void language sql security definer as $$
  update public.library_items set download_count = download_count + 1 where id = item_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 4 — Gamificação e Notificações
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.user_xp (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  total_xp     int not null default 0,
  level        int not null default 1,
  streak_days  int not null default 0,
  last_login   date,
  updated_at   timestamptz not null default now()
);

create table if not exists public.notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null,
  title        text not null,
  body         text not null,
  action_url   text,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.user_xp       enable row level security;
alter table public.notifications  enable row level security;

create policy "Usuário vê próprio XP"
  on public.user_xp for select using (auth.uid() = user_id);

create policy "Usuário atualiza próprio XP"
  on public.user_xp for update using (auth.uid() = user_id);

create policy "Usuário insere próprio XP"
  on public.user_xp for insert with check (auth.uid() = user_id);

create policy "Usuário vê próprias notificações"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Usuário marca lida"
  on public.notifications for update using (auth.uid() = user_id);

create policy "Sistema insere notificações"
  on public.notifications for insert with check (true); -- Edge Functions usam service_role

-- RPC: incrementa XP (upsert seguro)
create or replace function public.increment_user_xp(p_user_id uuid, p_xp int)
returns void language plpgsql security definer as $$
begin
  insert into public.user_xp (user_id, total_xp, updated_at)
  values (p_user_id, p_xp, now())
  on conflict (user_id) do update
    set total_xp   = user_xp.total_xp + excluded.total_xp,
        updated_at = now();
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 5 — Comunidade Premium
-- ─────────────────────────────────────────────────────────────────────────────

-- Adiciona colunas novas na tabela posts (criada no migrations.sql)
alter table public.posts
  add column if not exists category  text not null default 'Geral',
  add column if not exists is_pinned boolean not null default false,
  add column if not exists reactions jsonb not null
    default '{"heart":0,"clap":0,"idea":0,"fire":0}';

create table if not exists public.replies (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.post_reactions (
  post_id      uuid not null references public.posts(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  reaction     text not null check (reaction in ('heart','clap','idea','fire')),
  created_at   timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.replies        enable row level security;
alter table public.post_reactions enable row level security;

create policy "Ver replies" on public.replies
  for select using (auth.uid() is not null);

create policy "Criar reply" on public.replies
  for insert with check (auth.uid() = user_id);

create policy "Deletar próprio reply" on public.replies
  for delete using (auth.uid() = user_id);

create policy "Ver reações" on public.post_reactions
  for select using (true);

create policy "Reagir a post" on public.post_reactions
  for insert with check (auth.uid() = user_id);

create policy "Remover própria reação" on public.post_reactions
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 6 — Reengajamento (colunas no profiles)
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists last_active_at            timestamptz default now(),
  add column if not exists last_reengagement_sent_at timestamptz,
  add column if not exists email_reengagement        boolean not null default true;

-- Atualiza last_active_at automaticamente a cada login
create or replace function public.handle_user_login()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles
  set last_active_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_user_login on auth.users;
create trigger on_user_login
  after update of last_sign_in_at on auth.users
  for each row execute procedure public.handle_user_login();

-- ─────────────────────────────────────────────────────────────────────────────
-- ÍNDICES — para performance em queries comuns
-- ─────────────────────────────────────────────────────────────────────────────

create index if not exists idx_payments_user_id   on public.payments(user_id);
create index if not exists idx_payments_status    on public.payments(status);
create index if not exists idx_user_access_user   on public.user_access(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id, read);
create index if not exists idx_posts_category     on public.posts(category);
create index if not exists idx_posts_pinned       on public.posts(is_pinned) where is_pinned = true;
create index if not exists idx_replies_post       on public.replies(post_id);
create index if not exists idx_events_scheduled   on public.events(scheduled_at);
create index if not exists idx_library_published  on public.library_items(is_published, type);
create index if not exists idx_profiles_active    on public.profiles(last_active_at);
