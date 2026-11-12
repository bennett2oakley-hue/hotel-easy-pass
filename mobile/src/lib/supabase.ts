import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// This is the public publishable key for the dedicated Hotel Easy Pass project.
// It is safe to include in a client app; never put a service-role or secret key here.
// Local .env values override these defaults.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://edwnfpxprznbdjvneiaq.supabase.co";
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_riqHPEaaWsQQUyvhBXnfng_pxwNrShl";

export const supabase = createClient(url, publishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
