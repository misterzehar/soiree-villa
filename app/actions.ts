"use server";

import { createServerSupabase } from "@/lib/supabase";

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Adresse email invalide." };
  }

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("waitlist")
    .insert({ email })
    .single();

  if (error) {
    // Code 23505 = violation de contrainte unique (email déjà inscrit)
    if (error.code === "23505") {
      return { error: "Cet email est déjà sur la liste. À bientôt !" };
    }
    return { error: "Une erreur s'est produite. Réessaie." };
  }

  return { success: true };
}
