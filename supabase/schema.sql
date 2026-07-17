-- Base de datos para confirmaciones de asistencia (RSVP).
-- Pega este archivo completo en el SQL Editor de Supabase y ejecútalo una sola vez.

create extension if not exists pgcrypto;

create table if not exists public.invitation_groups (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  access_code text not null unique check (access_code = upper(access_code) and char_length(access_code) >= 8),
  max_guests integer not null check (max_guests > 0),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.invitation_guests (
  id uuid primary key default gen_random_uuid(),
  invitation_group_id uuid not null references public.invitation_groups(id) on delete cascade,
  full_name text not null,
  display_order integer not null default 0,
  is_attending boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists invitation_guests_group_idx
  on public.invitation_guests (invitation_group_id, display_order);

alter table public.invitation_groups enable row level security;
alter table public.invitation_guests enable row level security;

-- Las tablas no se exponen directamente al navegador. Solo las funciones de abajo
-- reciben el código de invitación y devuelven/actualizan la familia correspondiente.
create or replace function public.rsvp_get_invitation(p_access_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  group_record public.invitation_groups%rowtype;
begin
  select * into group_record
  from public.invitation_groups
  where access_code = upper(trim(p_access_code));

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'family_name', group_record.family_name,
    'max_guests', group_record.max_guests,
    'confirmed_at', group_record.confirmed_at,
    'guests', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', guest.id,
          'full_name', guest.full_name,
          'is_attending', guest.is_attending
        ) order by guest.display_order, guest.full_name
      )
      from public.invitation_guests guest
      where guest.invitation_group_id = group_record.id
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.rsvp_confirm_attendance(
  p_access_code text,
  p_selected_guest_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  group_record public.invitation_groups%rowtype;
  selected_count integer;
  valid_count integer;
begin
  select * into group_record
  from public.invitation_groups
  where access_code = upper(trim(p_access_code));

  if not found then
    raise exception 'Código de invitación no válido.';
  end if;

  select count(distinct selected_id) into selected_count
  from unnest(coalesce(p_selected_guest_ids, '{}'::uuid[])) as selected_id;

  select count(*) into valid_count
  from public.invitation_guests
  where invitation_group_id = group_record.id
    and id = any(coalesce(p_selected_guest_ids, '{}'::uuid[]));

  if selected_count <> valid_count then
    raise exception 'La selección incluye invitados no válidos.';
  end if;

  if selected_count > group_record.max_guests then
    raise exception 'Esta invitación permite confirmar hasta % personas.', group_record.max_guests;
  end if;

  update public.invitation_guests
  set is_attending = id = any(coalesce(p_selected_guest_ids, '{}'::uuid[])),
      updated_at = now()
  where invitation_group_id = group_record.id;

  update public.invitation_groups
  set confirmed_at = now()
  where id = group_record.id;

  return public.rsvp_get_invitation(p_access_code);
end;
$$;

revoke all on function public.rsvp_get_invitation(text) from public;
revoke all on function public.rsvp_confirm_attendance(text, uuid[]) from public;
grant execute on function public.rsvp_get_invitation(text) to anon;
grant execute on function public.rsvp_confirm_attendance(text, uuid[]) to anon;

-- Ejemplo para dar de alta una familia. Cambia nombres, código y cupo.
-- Usa códigos de 8 caracteres o más, difíciles de adivinar.
--
-- with new_group as (
--   insert into public.invitation_groups (family_name, access_code, max_guests)
--   values ('Familia García', 'GARCIA26X', 4)
--   returning id
-- )
-- insert into public.invitation_guests (invitation_group_id, full_name, display_order)
-- select id, guest_name, guest_order
-- from new_group,
--   (values
--     ('Ana García', 1),
--     ('Luis García', 2),
--     ('Sofía García', 3),
--     ('Mateo García', 4)
--   ) as guests(guest_name, guest_order);
