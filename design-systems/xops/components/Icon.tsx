import React from "react";
import styles from "./Icon.module.css";

export type IconProps = {
  name: string;
  color?: string;
  size?: "16" | "18" | "20";
  className?: string;
};

export default function Icon({ name, color, size = "20", className }: IconProps) {
  return (
    <span
      className={[styles.icon, styles[`size${size}`], className].filter(Boolean).join(" ")}
      style={{
        WebkitMaskImage: `url(/xops/icons/${name}.svg)`,
        maskImage: `url(/xops/icons/${name}.svg)`,
        color,
      }}
      aria-hidden="true"
    />
  );
}
