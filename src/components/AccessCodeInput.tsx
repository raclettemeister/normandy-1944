import { useState } from "react";

interface AccessCodeInputProps {
  onValidated: (code: string) => void;
  apiUrl: string;
}

export default function AccessCodeInput({
  onValidated,
  apiUrl,
}: AccessCodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/api/validate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      const result = (await response.json()) as { valid: boolean };
      if (result.valid) {
        onValidated(trimmed);
      } else {
        setError("Invalid access code.");
      }
    } catch {
      setError("Could not reach server. Playing in offline mode.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="access-code-form" onSubmit={handleSubmit} data-testid="access-code-form">
      <label className="access-code-form__label" htmlFor="access-code">
        Access Code <span className="access-code-form__optional">(optional — enables AI narration)</span>
      </label>
      <div className="access-code-form__row">
        <input
          id="access-code"
          className="access-code-form__input"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter access code"
          disabled={loading}
          data-testid="access-code-input"
          autoComplete="off"
        />
        <button
          className="access-code-form__submit"
          type="submit"
          disabled={loading || !code.trim()}
          data-testid="access-code-submit"
        >
          {loading ? "Validating..." : "Activate"}
        </button>
      </div>
      {error && (
        <div className="access-code-form__error" data-testid="access-code-error">
          {error}
        </div>
      )}
    </form>
  );
}
