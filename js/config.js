// Supabase project settings (Dashboard -> Project Settings -> API).
//
// The publishable (anon) key is meant to be public - it ships to every browser
// that opens the site. What protects the data are the RLS policies in
// supabase/migrations: anyone can read, only admins can write.
// Never put the service_role / secret key here.

export const supabaseConfig = {
  projectUrl: "https://byvlkmutxfqhrsizjsiz.supabase.co",
  publishableKey: "sb_publishable_1fYO3CmFp7kZYijOKdLDSw_4Tl3MPDI",
};

export const isSupabaseConfigured =
  !supabaseConfig.projectUrl.includes("YOUR-PROJECT-REF") && !supabaseConfig.publishableKey.startsWith("YOUR-");
