import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { savePersonalSpec } from "@/lib/api";
import type { PersonalSpec, PersonalSpecAccountInput } from "@/lib/api";
import {
  canFinish,
  canProceedStep1,
  isEmailFormatValid,
} from "@/lib/personalSpecValidation";

const PLATFORM_OPTIONS = [
  "Twitter/X",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "Reddit",
  "GitHub",
  "YouTube",
  "Twitch",
  "Discord",
  "Other",
] as const;

interface EmailRow {
  identifier: string;
}

interface AccountRow {
  platform: string;
  customPlatform: string;
  identifier: string;
}

interface PersonalSpecWizardProps {
  initialData?: PersonalSpec | null;
  onSaved: (spec: PersonalSpec) => void;
  onCancel?: () => void;
}

function emailRowsFrom(spec?: PersonalSpec | null): EmailRow[] {
  if (!spec) return [{ identifier: "" }];
  const emails = spec.accounts
    .filter((a) => a.kind === "email")
    .map((a) => ({ identifier: a.identifier }));
  return emails.length > 0 ? emails : [{ identifier: "" }];
}

function accountRowsFrom(spec?: PersonalSpec | null): AccountRow[] {
  if (!spec) {
    return [{ platform: "Twitter/X", customPlatform: "", identifier: "" }];
  }
  const known: readonly string[] = PLATFORM_OPTIONS;
  const rows = spec.accounts
    .filter((a) => a.kind === "username")
    .map((a) => ({
      platform: known.includes(a.platform) ? a.platform : "Other",
      customPlatform: known.includes(a.platform) ? "" : a.platform,
      identifier: a.identifier,
    }));
  return rows.length > 0
    ? rows
    : [{ platform: "Twitter/X", customPlatform: "", identifier: "" }];
}

export default function PersonalSpecWizard({
  initialData,
  onSaved,
  onCancel,
}: PersonalSpecWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState(initialData?.full_name ?? "");
  const [emails, setEmails] = useState<EmailRow[]>(() =>
    emailRowsFrom(initialData),
  );
  const [accounts, setAccounts] = useState<AccountRow[]>(() =>
    accountRowsFrom(initialData),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEditing = Boolean(initialData);
  const filledEmailCount = emails.filter(
    (e) => e.identifier.trim().length > 0,
  ).length;
  const filledAccountCount = accounts.filter(
    (a) => a.identifier.trim().length > 0,
  ).length;
  const hasIncompleteOtherPlatform = accounts.some(
    (a) =>
      a.platform === "Other" &&
      a.identifier.trim().length > 0 &&
      a.customPlatform.trim().length === 0,
  );
  const hasInvalidEmail = emails.some((e) => {
    const t = e.identifier.trim();
    return t.length > 0 && !isEmailFormatValid(t);
  });

  function updateEmail(index: number, identifier: string) {
    setEmails((rows) => rows.map((r, i) => (i === index ? { identifier } : r)));
  }
  function addEmail() {
    setEmails((rows) => [...rows, { identifier: "" }]);
  }
  function removeEmail(index: number) {
    setEmails((rows) => rows.filter((_, i) => i !== index));
  }

  function updateAccount(index: number, patch: Partial<AccountRow>) {
    setAccounts((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }
  function addAccount() {
    setAccounts((rows) => [
      ...rows,
      { platform: "Twitter/X", customPlatform: "", identifier: "" },
    ]);
  }
  function removeAccount(index: number) {
    setAccounts((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleFinish() {
    setSaving(true);
    setSaveError(null);

    const emailInputs: PersonalSpecAccountInput[] = emails
      .filter((e) => e.identifier.trim().length > 0)
      .map((e) => ({
        platform: "email",
        identifier: e.identifier.trim(),
        kind: "email",
      }));

    const accountInputs: PersonalSpecAccountInput[] = accounts
      .filter((a) => a.identifier.trim().length > 0)
      .map((a) => ({
        platform: a.platform === "Other" ? a.customPlatform.trim() : a.platform,
        identifier: a.identifier.trim(),
        kind: "username",
      }));

    try {
      const saved = await savePersonalSpec({
        full_name: fullName.trim(),
        accounts: [...emailInputs, ...accountInputs],
      });
      onSaved(saved);
    } catch {
      setSaveError("Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-200/50 dark:border-white/10 bg-cozy-bg-light dark:bg-cozy-bg-dark px-4 py-3 text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cozy-sage-light dark:focus:ring-cozy-sage-dark transition-all duration-150";
  const errorTextClass =
    "text-sm font-medium text-cozy-status-risk dark:text-cozy-status-risk-dark";

  const stepDots = (
    <div className="flex items-center gap-2" aria-hidden>
      {[1, 2].map((s) => (
        <span
          key={s}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            s === step
              ? "w-6 bg-cozy-sage-light dark:bg-cozy-sage-dark"
              : "w-1.5 bg-stone-200/50 dark:bg-white/10"
          }`}
        />
      ))}
    </div>
  );

  if (step === 1) {
    return (
      <div className="flex w-full max-w-md flex-col gap-6 bg-cozy-card-light dark:bg-cozy-card-dark rounded-cozy p-6 sm:p-8 border border-stone-200/50 dark:border-white/5 shadow-sm motion-safe:animate-cozy-stagger-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 font-display">
            Your identity
          </h2>
          {stepDots}
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Full name
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Emails
          </span>
          {emails.map((row, i) => {
            const trimmed = row.identifier.trim();
            const invalid = trimmed.length > 0 && !isEmailFormatValid(trimmed);
            return (
              <div
                key={i}
                className="flex flex-col gap-1.5 motion-safe:animate-cozy-stagger-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex gap-2">
                  <input
                    className={`flex-1 ${inputClass}`}
                    placeholder="you@example.com"
                    value={row.identifier}
                    onChange={(e) => updateEmail(i, e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={() => removeEmail(i)}>
                    <X className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </div>
                {invalid && (
                  <span className={errorTextClass}>
                    Doesn't look like a valid email.
                  </span>
                )}
              </div>
            );
          })}
          <Button variant="outline" size="sm" onClick={addEmail}>
            <Plus className="w-4 h-4" strokeWidth={2} /> Add email
          </Button>
        </div>

        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            disabled={!canProceedStep1(fullName) || hasInvalidEmail}
            onClick={() => setStep(2)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6 bg-cozy-card-light dark:bg-cozy-card-dark rounded-cozy p-6 sm:p-8 border border-stone-200/50 dark:border-white/5 shadow-sm motion-safe:animate-cozy-stagger-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 font-display">
          Your accounts
        </h2>
        {stepDots}
      </div>

      <div className="flex flex-col gap-3">
        {accounts.map((row, i) => {
          const otherPlatformMissing =
            row.platform === "Other" &&
            row.identifier.trim().length > 0 &&
            row.customPlatform.trim().length === 0;
          return (
            <div
              key={i}
              className="flex flex-col gap-1.5 motion-safe:animate-cozy-stagger-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex gap-2">
                <select
                  className={inputClass}
                  value={row.platform}
                  onChange={(e) =>
                    updateAccount(i, { platform: e.target.value })
                  }
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {row.platform === "Other" && (
                  <input
                    className={`w-28 ${inputClass}`}
                    placeholder="Platform name"
                    value={row.customPlatform}
                    onChange={(e) =>
                      updateAccount(i, { customPlatform: e.target.value })
                    }
                  />
                )}
                <input
                  className={`flex-1 ${inputClass}`}
                  placeholder="username"
                  value={row.identifier}
                  onChange={(e) =>
                    updateAccount(i, { identifier: e.target.value })
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAccount(i)}
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </Button>
              </div>
              {otherPlatformMissing && (
                <span className={errorTextClass}>Enter a platform name.</span>
              )}
            </div>
          );
        })}
        <Button variant="outline" size="sm" onClick={addAccount}>
          <Plus className="w-4 h-4" strokeWidth={2} /> Add account
        </Button>
      </div>

      {saveError && <p className={errorTextClass}>{saveError}</p>}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          disabled={
            !canFinish(filledEmailCount, filledAccountCount) ||
            hasIncompleteOtherPlatform ||
            hasInvalidEmail ||
            saving
          }
          onClick={handleFinish}
        >
          {saving ? "Saving…" : isEditing ? "Save" : "Finish"}
        </Button>
      </div>
    </div>
  );
}
