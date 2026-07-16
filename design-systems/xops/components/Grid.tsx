import React, { HTMLAttributes, ReactNode } from "react";
import styles from "./Grid.module.css";

type GridGutter = "default" | "tight";

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  gutter?: GridGutter;
  children: ReactNode;
};

export function Grid({ gutter = "default", className, children, ...rest }: GridProps) {
  return (
    <div
      className={[styles.grid, gutter === "tight" && styles.gutterTight, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export type GridItemProps = HTMLAttributes<HTMLDivElement> & {
  colSpan?: number;
  children: ReactNode;
};

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ colSpan = 12, className, style, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={[styles.item, className].filter(Boolean).join(" ")}
        style={{ ...style, ["--xops-grid-item-span" as string]: colSpan }}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
GridItem.displayName = "GridItem";

export default Grid;
