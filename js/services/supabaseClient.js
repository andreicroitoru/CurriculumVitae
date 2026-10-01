import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm";
import { supabaseConfig } from "../config.js";

// One shared client for the whole site (public page + admin)
export const supabaseClient = createClient(supabaseConfig.projectUrl, supabaseConfig.publishableKey);
