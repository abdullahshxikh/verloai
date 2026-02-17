-- Run this in your Supabase SQL Editor to enable account deletion

-- Create a secure function that allows a user to delete their own account
create or replace function delete_user_account()
returns void
language plpgsql
security definer
as $$
begin
  -- Check if the user is authenticated (redundant but safe)
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete the user from auth.users
  -- This will cascade to public.profiles due to the FK constraint
  delete from auth.users where id = auth.uid();
end;
$$;
