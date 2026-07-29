import React from "react";
import Link from "next/link";
import Icon from "./Icon";
import styles from "./Sidebar.module.css";

type NavLeafKey =
  | "control-center"
  | "employees"
  | "problem-mgmt"
  | "worksite"
  | "infrastructure"
  | "requests"
  | "communications"
  | "activity-log"
  | "users";

export type SoftwareSubKey = "overview" | "all-software";

const SOFTWARE_SUB_ROUTES: Record<SoftwareSubKey, string> = {
  overview: "/work/software-observability/xops-overview",
  "all-software": "/work/software-observability/xops-all-software",
};

type NavItemData = {
  key: NavLeafKey;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItemData[] = [
  { key: "control-center", label: "Control Center", icon: "speed" },
  { key: "employees", label: "Employees", icon: "group" },
  { key: "problem-mgmt", label: "Problem Mgmt", icon: "e911_emergency" },
  { key: "worksite", label: "Worksite", icon: "domain" },
  { key: "infrastructure", label: "Infrastructure", icon: "storage" },
  { key: "requests", label: "Requests", icon: "acute" },
];

const NAV_ITEMS_AFTER_SOFTWARE: NavItemData[] = [
  { key: "communications", label: "Communications", icon: "lift_to_talk" },
  { key: "activity-log", label: "Activity Log", icon: "assignment" },
  { key: "users", label: "Users", icon: "person" },
];

export type SidebarProps = {
  activeItem?: NavLeafKey;
  activeSoftwareItem?: SoftwareSubKey;
  /** When set, the software sub-links call this instead of routing via next/link —
   *  used to drive an in-place embed's screen state (the live case-study hero flow)
   *  where real routing would navigate the whole portfolio page away. */
  onNavigate?: (screen: SoftwareSubKey) => void;
};

export default function Sidebar({ activeItem, activeSoftwareItem, onNavigate }: SidebarProps) {
  const softwareExpanded = Boolean(activeSoftwareItem);

  return (
    <nav className={styles.sidebar} aria-label="Primary">
      <div className={styles.logo}>
        <img src="/xops/svg/XOPSLogo.svg" alt="XOPS" width={81} height={24} />
      </div>
      <ul className={styles.menu}>
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <NavButton icon={item.icon} label={item.label} active={activeItem === item.key} />
          </li>
        ))}

        <li>
          <NavButton icon="code_blocks" label="Software" expanded={softwareExpanded} />
          {softwareExpanded && (
            <ul className={styles.submenu}>
              <li>
                <SubmenuItem
                  screen="overview"
                  label="Overview"
                  active={activeSoftwareItem === "overview"}
                  onNavigate={onNavigate}
                />
              </li>
              <li>
                <SubmenuItem
                  screen="all-software"
                  label="All Software"
                  active={activeSoftwareItem === "all-software"}
                  onNavigate={onNavigate}
                />
              </li>
            </ul>
          )}
        </li>

        {NAV_ITEMS_AFTER_SOFTWARE.map((item) => (
          <li key={item.key}>
            <NavButton icon={item.icon} label={item.label} active={activeItem === item.key} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SubmenuItem({
  screen,
  label,
  active,
  onNavigate,
}: {
  screen: SoftwareSubKey;
  label: string;
  active: boolean;
  onNavigate?: (screen: SoftwareSubKey) => void;
}) {
  const className = [styles.submenuItem, active ? styles.submenuItemActive : ""]
    .filter(Boolean)
    .join(" ");

  if (onNavigate) {
    return (
      <button
        type="button"
        className={className}
        data-hotspot={`nav-${screen}`}
        onClick={() => onNavigate(screen)}
      >
        {label}
      </button>
    );
  }

  return (
    <Link href={SOFTWARE_SUB_ROUTES[screen]} className={className}>
      {label}
    </Link>
  );
}

function NavButton({
  icon,
  label,
  active,
  expanded,
}: {
  icon: string;
  label: string;
  active?: boolean;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      className={[styles.item, active ? styles.itemActive : ""].filter(Boolean).join(" ")}
      aria-expanded={expanded}
    >
      <span className={styles.itemLeft}>
        <Icon name={icon} color="var(--xops-text-secondary)" className={styles.icon} />
        <span className={styles.label}>{label}</span>
      </span>
      <Icon
        name="keyboard_arrow_down"
        color="var(--xops-text-secondary)"
        className={[styles.chevron, expanded ? styles.chevronOpen : ""].filter(Boolean).join(" ")}
      />
    </button>
  );
}
