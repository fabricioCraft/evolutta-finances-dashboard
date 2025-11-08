-- Supabase: Sincronização de novos usuários
-- Cria função e trigger para inserir registros na tabela public."User"

-- Função chamada pelo gatilho ao criar usuários em auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insere o usuário na tabela de perfis com o mesmo id e email
  insert into public."User" (id, email, "updatedAt")
  values (new.id, new.email, now());
  return new;
end;
$$;

-- Trigger que dispara após inserção em auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();