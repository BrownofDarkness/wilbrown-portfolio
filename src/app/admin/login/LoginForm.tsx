"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-elevated text-accent">
          <Lock size={16} />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            Admin
          </p>
          <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-fg">
            Connexion
          </h1>
        </div>
      </div>

      <label
        htmlFor="password"
        className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-fg-muted"
      >
        Mot de passe
      </label>

      <div className="relative">
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          autoFocus
          className="block w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 pr-12 text-base text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={
            showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-accent"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {state.error && (
        <p className="mt-3 font-mono text-xs text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-navy-dark transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Vérification…
          </>
        ) : (
          "Se connecter"
        )}
      </button>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
        Accès réservé · Wilfried Brown
      </p>
    </form>
  );
}
