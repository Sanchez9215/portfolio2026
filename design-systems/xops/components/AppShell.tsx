import React from "react";
import Sidebar, { type SidebarProps } from "./Sidebar";
import GlobalHeader from "./GlobalHeader";
import PageHeader from "./PageHeader";
import styles from "./AppShell.module.css";

export type AppShellProps = {
  title?: string;
  metaIcon?: string;
  metaText?: string;
  sidebarProps?: SidebarProps;
  /** Locks the shell to the viewport height so only inner regions scroll, not the page. */
  fillViewport?: boolean;
  children?: React.ReactNode;
};

export default function AppShell({
  title = "Header",
  metaIcon,
  metaText,
  sidebarProps,
  fillViewport = false,
  children,
}: AppShellProps) {
  return (
    <div className={[styles.shell, fillViewport && styles.fillViewport].filter(Boolean).join(" ")}>
      <Sidebar {...sidebarProps} />
      <div className={styles.body}>
        <GlobalHeader userName="John Doe" notificationCount={19} />
        <main className={styles.main}>
          <PageHeader title={title} metaIcon={metaIcon} metaText={metaText} />
          {children}
        </main>
      </div>
    </div>
  );
}
