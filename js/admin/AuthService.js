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

  // Being logged in isn't enough - the user also has to be in admin_users,
  // otherwise RLS will reject every write anyway
  async isCurrentUserAdmin() {
    const { data, error } = await this.supabaseClient.rpc("is_admin");
    if (error) throw error;
    return data === true;
  }
}
