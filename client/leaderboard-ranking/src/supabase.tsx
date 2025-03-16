import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rrzipakdeywmmcmykjcc.supabase.co";
const SUPABASE_ANON_KEY = "your-aneyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyemlwYWtkZXl3bW1jbXlramNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzI0MTEsImV4cCI6MjA1NzcwODQxMX0.PX13Nyd1ga4MKfLDgOxy3lglOm2lyEau-JEO9hgpAkwon-key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
