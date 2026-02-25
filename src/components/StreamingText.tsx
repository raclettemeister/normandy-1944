import { useState, useEffect, useRef } from "react";

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

export default function StreamingText({
  text,
  isStreaming,
  className = "",
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      indexRef.current = 0;
      return;
    }

    if (isStreaming) {
      setDisplayedText(text);
      indexRef.current = text.length;
      return;
    }

    if (indexRef.current >= text.length) {
      setDisplayedText(text);
      return;
    }

    const interval = setInterval(() => {
      indexRef.current = Math.min(indexRef.current + 2, text.length);
      setDisplayedText(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [text, isStreaming]);

  return (
    <span className={`streaming-text ${className}`} data-testid="streaming-text">
      {displayedText}
      {(isStreaming || indexRef.current < text.length) && (
        <span className="streaming-cursor" data-testid="streaming-cursor">
          &#9608;
        </span>
      )}
    </span>
  );
}
