import { useState } from "react";

interface FreeTextInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
  loading: boolean;
}

export default function FreeTextInput({
  onSubmit,
  disabled,
  loading,
}: FreeTextInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 5) return;
    onSubmit(trimmed);
    setText("");
  }

  return (
    <form
      className="free-text-form"
      onSubmit={handleSubmit}
      data-testid="free-text-form"
    >
      <input
        className="free-text-form__input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What do you do?"
        disabled={disabled || loading}
        data-testid="free-text-input"
        maxLength={200}
        autoComplete="off"
      />
      <button
        className="free-text-form__submit"
        type="submit"
        disabled={disabled || loading || text.trim().length < 5}
        data-testid="free-text-submit"
      >
        {loading ? "Thinking..." : "Go"}
      </button>
    </form>
  );
}
