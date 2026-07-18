import React, { useLayoutEffect, useRef, useState } from "react";
import styles from "./Toggle.module.css";

export type ToggleOption<T extends string = string> = {
  value: T;
  label: string;
};

export type ToggleSize = "small" | "medium" | "large";

export type ToggleProps<T extends string = string> = {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: ToggleSize;
  className?: string;
};

export function Toggle<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "medium",
  className,
}: ToggleProps<T>) {
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumbStyle, setThumbStyle] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const activeButton = optionRefs.current[value];
    if (!activeButton) return;
    setThumbStyle({ left: activeButton.offsetLeft, width: activeButton.offsetWidth });
  }, [value, options]);

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={[styles.track, size !== "medium" ? styles[size] : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {thumbStyle && (
        <span
          aria-hidden="true"
          className={styles.thumb}
          style={{ transform: `translateX(${thumbStyle.left}px)`, width: thumbStyle.width }}
        />
      )}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              optionRefs.current[option.value] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            className={[styles.option, active && styles.optionActive].filter(Boolean).join(" ")}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default Toggle;
