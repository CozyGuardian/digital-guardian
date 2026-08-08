import { useState } from "react";
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

  if (step === 1) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4">
        <h2 className="text-lg font-semibold">Your identity</h2>
        <label className="flex flex-col gap-1 text-sm">
          Full name
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Emails</span>
          {emails.map((row, i) => {
            const trimmed = row.identifier.trim();
            const invalid = trimmed.length > 0 && !isEmailFormatValid(trimmed);
            return (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2"
                    placeholder="you@example.com"
                    value={row.identifier}
                    onChange={(e) => updateEmail(i, e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={() => removeEmail(i)}>
                    Remove
                  </Button>
                </div>
                {invalid && (
                  <span className="text-xs text-red-600">
                    Doesn't look like a valid email.
                  </span>
                )}
              </div>
            );
          })}
          <Button variant="outline" size="sm" onClick={addEmail}>
            Add email
          </Button>
        </div>

        <div className="flex gap-2">
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
    <div className="flex w-full max-w-md flex-col gap-4">
      <h2 className="text-lg font-semibold">Your accounts</h2>
      <div className="flex flex-col gap-2">
        {accounts.map((row, i) => {
          const otherPlatformMissing =
            row.platform === "Other" &&
            row.identifier.trim().length > 0 &&
            row.customPlatform.trim().length === 0;
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex gap-2">
                <select
                  className="rounded-md border border-slate-300 px-2 py-2"
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
                    className="w-28 rounded-md border border-slate-300 px-2 py-2"
                    placeholder="Platform name"
                    value={row.customPlatform}
                    onChange={(e) =>
                      updateAccount(i, { customPlatform: e.target.value })
                    }
                  />
                )}
                <input
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2"
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
                  Remove
                </Button>
              </div>
              {otherPlatformMissing && (
                <span className="text-xs text-red-600">
                  Enter a platform name.
                </span>
              )}
            </div>
          );
        })}
        <Button variant="outline" size="sm" onClick={addAccount}>
          Add account
        </Button>
      </div>

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="flex gap-2">
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
