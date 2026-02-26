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
  return (
    <span className={`streaming-text ${className}`} data-testid="streaming-text">
      {text}
      {isStreaming && (
        <span className="streaming-cursor" data-testid="streaming-cursor">
          &#9608;
        </span>
      )}
    </span>
  );
}
