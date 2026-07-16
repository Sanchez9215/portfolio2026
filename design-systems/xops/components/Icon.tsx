import React from "react";
import styles from "./Icon.module.css";

export type IconProps = {
  name: string;
  color?: string;
  className?: string;
};

export default function Icon({ name, color, className }: IconProps) {
  return (
    <span
      className={[styles.icon, className].filter(Boolean).join(" ")}
      style={{
        WebkitMaskImage: `url(/xops/icons/${name}.svg)`,
        maskImage: `url(/xops/icons/${name}.svg)`,
        color,
      }}
      aria-hidden="true"
    />
  );
}
