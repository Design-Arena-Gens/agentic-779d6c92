"use client";

import { useCallback, useRef } from "react";

interface ChatComposerProps {
  value: string;
  disabled: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const ChatComposer = ({
  value,
  disabled,
  placeholder,
  onChange,
  onSubmit
}: ChatComposerProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        if (!disabled) {
          onSubmit();
        }
      }
    },
    [disabled, onSubmit]
  );

  return (
    <div className="composer">
      <textarea
        ref={textareaRef}
        value={value}
        placeholder={placeholder ?? "Describe your task or question..."}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <div className="composer-footer">
        <span className="chip">
          <strong>Tip</strong> Press ⌘⏎ or Ctrl⏎ to deploy the assistant.
        </span>
        <button onClick={onSubmit} disabled={!value.trim() || disabled}>
          Launch
        </button>
      </div>
    </div>
  );
};
