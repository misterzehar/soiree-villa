"use client";

import { useRef, useState } from "react";
import { joinWaitlist } from "@/app/actions";

export function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    const result = await joinWaitlist(formData);

    if (result.success) {
      setStatus("success");
      setMessage("C'est noté ! On te contacte dès qu'une soirée est prête.");
      formRef.current?.reset();
    } else {
      setStatus("error");
      setMessage(result.error ?? "Une erreur s'est produite.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 text-success font-medium py-3">
        <span aria-hidden className="text-lg">✓</span>
        <span>{message}</span>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
    >
      <input
        type="email"
        name="email"
        placeholder="ton@email.fr"
        required
        disabled={status === "loading"}
        className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 transition-all"
        aria-label="Ton adresse email"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-text text-surface font-semibold text-sm px-6 py-3 rounded-full hover:opacity-80 disabled:opacity-50 transition-all whitespace-nowrap"
      >
        {status === "loading" ? "..." : "M'avertir"}
      </button>

      {status === "error" && (
        <p className="w-full text-center text-sm text-error mt-1" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
