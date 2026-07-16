import React, { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "text";
type ButtonSize = "small" | "medium" | "large";

type ButtonBaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

type ButtonWithLabelProps = ButtonBaseProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: false;
  icon?: ReactNode;
  children: ReactNode;
};

type ButtonIconOnlyProps = ButtonBaseProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly: true;
  icon: ReactNode;
  ariaLabel: string;
  children?: never;
};

export type ButtonProps = ButtonWithLabelProps | ButtonIconOnlyProps;

export default function Button(props: ButtonProps) {
  const { variant = "secondary", size = "medium", icon, className, ...rest } = props;
  const sizeClass = size !== "medium" ? styles[size] : undefined;

  if (props.iconOnly) {
    const { ariaLabel, ...buttonRest } = rest as Omit<
      ButtonIconOnlyProps,
      "variant" | "size" | "icon" | "className"
    >;
    return (
      <button
        type="button"
        className={[styles.button, styles.secondary, styles.iconOnly, sizeClass, className]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
        {...buttonRest}
      >
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      </button>
    );
  }

  const { children, ...buttonRest } = rest as Omit<
    ButtonWithLabelProps,
    "variant" | "size" | "icon" | "className"
  >;
  return (
    <button
      type="button"
      className={[styles.button, styles[variant], sizeClass, className]
        .filter(Boolean)
        .join(" ")}
      {...buttonRest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
