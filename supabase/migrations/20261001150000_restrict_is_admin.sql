-- is_admin() is security definer, so don't leave it callable by anonymous visitors.
-- Only logged-in users need it (admin.html + the write policies).
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
