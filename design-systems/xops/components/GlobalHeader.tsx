import React from "react";
import Icon from "./Icon";
import styles from "./GlobalHeader.module.css";

export type GlobalHeaderProps = {
  userName: string;
  notificationCount?: number;
};

export default function GlobalHeader({ userName, notificationCount }: GlobalHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button type="button" className={styles.iconButton} aria-label="Collapse sidebar">
          <Icon name="left_panel_close" color="var(--xops-text-secondary)" />
        </button>
        <div className={styles.search}>
          <Icon name="search" color="var(--xops-text-disabled)" />
          <span className={styles.searchPlaceholder}>Search</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.notificationWrapper}>
          <button type="button" className={styles.iconButton} aria-label="Notifications">
            <Icon name="notifications" color="var(--xops-text-secondary)" />
          </button>
          {typeof notificationCount === "number" && notificationCount > 0 && (
            <span className={styles.badge}>{notificationCount}</span>
          )}
        </div>

        <div className={styles.profile}>
          <span className={styles.avatar} aria-hidden="true">
            <span className={styles.onlineDot} />
          </span>
          <span className={styles.userName}>{userName}</span>
        </div>
      </div>
    </header>
  );
}
