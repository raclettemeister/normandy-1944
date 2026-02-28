import { useState } from "react";

interface FreeTextInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
  loading: boolean;
  placeholder?: string;
  maxLength?: number;
  initialText?: string;
}

export default function FreeTextInput({
  onSubmit,
  disabled,
  loading,
  placeholder = "Mon capitaine, quels sont vos ordres ?",
  maxLength = 500,
  initialText = "",
}: FreeTextInputProps) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 5) {
      setError("Repetez, mon capitaine ?");
      return;
    }
    setError(null);
    onSubmit(trimmed);
  }

  return (
    <form
      className="free-text-form"
      onSubmit={handleSubmit}
      data-testid="free-text-form"
    >
      <textarea
        className="free-text-form__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || loading}
        data-testid="free-text-input"
        maxLength={maxLength}
        autoComplete="off"
        rows={3}
      />
      {error && <div className="free-text-form__error" data-testid="input-error">{error}</div>}
      <div className="free-text-form__footer">
        <span className="free-text-form__count">
          {text.length}/{maxLength}
        </span>
        <button
          className="btn btn--primary free-text-form__submit"
          type="submit"
          disabled={disabled || loading || text.trim().length < 5}
          data-testid="free-text-submit"
        >
          {loading ? "Evaluation..." : "Donner les ordres"}
        </button>
      </div>
    </form>
  );
}
