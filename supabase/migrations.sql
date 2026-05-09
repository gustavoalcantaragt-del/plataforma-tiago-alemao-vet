-- ═══════════════════════════════════════════════════════════════
-- NexusLearn Premium — Schema Supabase
-- Cole este arquivo no SQL Editor do dashboard.supabase.com
-- ═══════════════════════════════════════════════════════════════

-- ─── Extensões ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles (espelho de auth.users) ─────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  avatar_url  text,
  role        text not null default 'student' check (role in ('student', 'owner', 'admin')),
  created_at  timestamptz not null default now()
);

-- Cria perfil automaticamente ao cadastrar no auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Courses ──────────────────────────────────────────────────
create table if not exists public.courses (
  id                  uuid primary key default uuid_generate_v4(),
  owner_id            uuid not null references public.profiles(id),
  title               text not null,
  subtitle            text,
  description         text,
  category            text,
  emoji               text default '📚',
  thumbnail_gradient  text default 'linear-gradient(135deg, #1a1a2e, #16213e)',
  price               numeric(10,2) not null default 0,
  price_old           numeric(10,2),
  modules_count       int not null default 0,
  lessons_count       int not null default 0,
  hours               numeric(5,1) not null default 0,
  students_count      int not null default 0,
  rating              numeric(3,2) not null default 0,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ─── Modules ──────────────────────────────────────────────────
create table if not exists public.modules (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  "order"     int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── Lessons ──────────────────────────────────────────────────
create table if not exists public.lessons (
  id          uuid primary key default uuid_generate_v4(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  title       text not null,
  duration    text,
  video_url   text,
  "order"     int not null default 0,
  is_preview  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── Enrollments ──────────────────────────────────────────────
create table if not exists public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id),
  course_id   uuid not null references public.courses(id),
  progress    int not null default 0,
  status      text not null default 'active' check (status in ('active', 'completed', 'paused')),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- Incrementa contador ao matricular
create or replace function public.handle_enrollment()
returns trigger language plpgsql security definer as $$
begin
  update public.courses set students_count = students_count + 1 where id = new.course_id;
  return new;
end;
$$;

drop trigger if exists on_enrollment_created on public.enrollments;
create trigger on_enrollment_created
  after insert on public.enrollments
  for each row execute procedure public.handle_enrollment();

-- ─── Lesson progress ──────────────────────────────────────────
create table if not exists public.lesson_progress (
  user_id       uuid not null references public.profiles(id),
  lesson_id     uuid not null references public.lessons(id),
  completed     boolean not null default false,
  watch_time    int not null default 0, -- segundos assistidos
  completed_at  timestamptz,
  primary key (user_id, lesson_id)
);

-- ─── Notes ────────────────────────────────────────────────────
create table if not exists public.notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id),
  lesson_id   uuid not null references public.lessons(id),
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ─── Comments (Discussão) ─────────────────────────────────────
create table if not exists public.comments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id),
  lesson_id   uuid not null references public.lessons(id),
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ─── Posts (Comunidade) ───────────────────────────────────────
create table if not exists public.posts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id),
  content       text not null,
  likes         int not null default 0,
  replies_count int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id   uuid not null references public.posts(id) on delete cascade,
  user_id   uuid not null references public.profiles(id),
  primary key (post_id, user_id)
);

-- ─── Certificates ─────────────────────────────────────────────
create table if not exists public.certificates (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id),
  course_id   uuid not null references public.courses(id),
  issued_at   timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ─── Sales ────────────────────────────────────────────────────
create table if not exists public.sales (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id),
  course_id       uuid not null references public.courses(id),
  amount          numeric(10,2) not null,
  stripe_session  text,
  status          text not null default 'pending' check (status in ('pending', 'paid', 'refunded')),
  created_at      timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- RLS — Row Level Security
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.modules         enable row level security;
alter table public.lessons         enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.notes           enable row level security;
alter table public.comments        enable row level security;
alter table public.posts           enable row level security;
alter table public.post_likes      enable row level security;
alter table public.certificates    enable row level security;
alter table public.sales           enable row level security;

-- Profiles: cada usuário vê todos, edita apenas o próprio
create policy "Profiles visíveis para todos" on public.profiles for select using (true);
create policy "Perfil editável pelo dono" on public.profiles for update using (auth.uid() = id);

-- Courses: publicados visíveis para todos; owner gerencia os seus
create policy "Cursos publicados visíveis" on public.courses for select using (is_published = true or owner_id = auth.uid());
create policy "Owner cria cursos" on public.courses for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
);
create policy "Owner edita seus cursos" on public.courses for update using (
  owner_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
);
create policy "Owner deleta seus cursos" on public.courses for delete using (
  owner_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
);

-- Modules & Lessons: visíveis se o curso for publicado ou owner
create policy "Módulos visíveis" on public.modules for select using (
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
      )
  )
);
create policy "Aulas visíveis para alunos com acesso" on public.lessons for select using (
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
      )
  )
);

-- Enrollments: usuário vê e cria as suas
create policy "Ver próprias matrículas" on public.enrollments for select using (auth.uid() = user_id);
create policy "Criar matrícula" on public.enrollments for insert with check (auth.uid() = user_id);

-- Progress: usuário vê e edita o próprio
create policy "Ver progresso próprio" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "Salvar progresso" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "Atualizar progresso" on public.lesson_progress for update using (auth.uid() = user_id);

-- Notes: usuário vê e edita as próprias
create policy "Ver notas próprias" on public.notes for select using (auth.uid() = user_id);
create policy "Criar nota" on public.notes for insert with check (auth.uid() = user_id);
create policy "Editar nota" on public.notes for update using (auth.uid() = user_id);
create policy "Deletar nota" on public.notes for delete using (auth.uid() = user_id);

-- Comments: visíveis para matriculados
create policy "Ver comentários" on public.comments for select using (auth.uid() is not null);
create policy "Criar comentário" on public.comments for insert with check (auth.uid() = user_id);

-- Posts: visíveis para todos autenticados
create policy "Ver posts" on public.posts for select using (auth.uid() is not null);
create policy "Criar post" on public.posts for insert with check (auth.uid() = user_id);

-- Post likes
create policy "Ver likes" on public.post_likes for select using (true);
create policy "Curtir post" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Descurtir post" on public.post_likes for delete using (auth.uid() = user_id);

-- Certificates: usuário vê os seus
create policy "Ver certificados" on public.certificates for select using (auth.uid() = user_id);

-- Sales: usuário vê as suas; owner vê as dos seus cursos
create policy "Ver vendas" on public.sales for select using (
  auth.uid() = user_id or
  exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid())
);
