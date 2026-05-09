-- Security fix for existing Supabase projects.
-- Run after migrations.sql and migrations_v2.sql.

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

drop policy if exists "Módulos visíveis" on public.modules;
drop policy if exists "Módulos visíveis para alunos com acesso" on public.modules;
drop policy if exists "Aulas visíveis" on public.lessons;
drop policy if exists "Aulas visíveis para alunos com acesso" on public.lessons;
drop policy if exists "Owner cria cursos" on public.courses;
drop policy if exists "Owner edita seus cursos" on public.courses;
drop policy if exists "Owner deleta seus cursos" on public.courses;
drop policy if exists "Service role gerencia user_access" on public.user_access;
drop policy if exists "Admin gerencia user_access" on public.user_access;

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

create policy "Admin gerencia user_access"
  on public.user_access for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')));
