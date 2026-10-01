// Thin wrapper over Supabase Auth, so the rest of the admin code
// doesn't need to know about the supabase-js API.
export class AuthService {
  constructor(supabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async getCurrentUser() {
    const { data } = await this.supabaseClient.auth.getSession();
    return data.session?.user ?? null;
  }

  async signIn(email, password) {
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }

  async signOut() {
    await this.supabaseClient.auth.signOut();
  }

  // Being logged in isn't enough - the user also has to be in admin_users.
  // RLS only lets a user see their own row there, so "row exists" = "is admin".
  async isCurrentUserAdmin(user) {
    const { data, error } = await this.supabaseClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  }
}
