"use client";

import { useActionState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import {
  sendContactMessage,
  type ContactState,
} from "@/app/actions/contact";
import { cn } from "@/lib/utils";

const initialState: ContactState = { status: "idle" };

type Labels = {
  name: string;
  email: string;
  subject: string;
  message: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  errors: {
    name_too_short: string;
    email_invalid: string;
    message_too_short: string;
  };
};

export function ContactForm({ labels }: { labels: Labels }) {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    initialState,
  );

  const errorFor = (key: keyof Labels["errors"]) => {
    const fieldKey = key.split("_")[0] as "name" | "email" | "message";
    const errCode = state.fieldErrors?.[fieldKey];
    if (!errCode) return null;
    return labels.errors[errCode as keyof Labels["errors"]] ?? errCode;
  };

  const inputClass =
    "block w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-fg-muted"
          >
            {labels.name}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
            aria-invalid={!!state.fieldErrors?.name}
          />
          {errorFor("name_too_short") && (
            <p className="mt-1.5 font-mono text-xs text-red-400">
              {errorFor("name_too_short")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-fg-muted"
          >
            {labels.email}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className={inputClass}
            aria-invalid={!!state.fieldErrors?.email}
          />
          {errorFor("email_invalid") && (
            <p className="mt-1.5 font-mono text-xs text-red-400">
              {errorFor("email_invalid")}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-fg-muted"
        >
          {labels.subject}
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          maxLength={200}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-fg-muted"
        >
          {labels.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={5000}
          className={cn(inputClass, "resize-y")}
          aria-invalid={!!state.fieldErrors?.message}
        />
        {errorFor("message_too_short") && (
          <p className="mt-1.5 font-mono text-xs text-red-400">
            {errorFor("message_too_short")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || state.status === "success"}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-navy-dark transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70",
          )}
        >
          {state.status === "success" ? (
            <>
              <Check size={16} />
              {labels.success}
            </>
          ) : pending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {labels.submitting}
            </>
          ) : (
            <>
              <Send size={14} />
              {labels.submit}
            </>
          )}
        </button>

        {state.status === "error" && !state.fieldErrors && (
          <p className="font-mono text-xs text-red-400">{labels.error}</p>
        )}
      </div>
    </form>
  );
}
