import React from "react";
import Link from "next/link";
import Icon from "./Icon";
import styles from "./Sidebar.module.css";

type NavLeafKey =
  | "employees"
  | "problem-mgmt"
  | "worksite"
  | "infrastructure"
  | "requests"
  | "communications"
  | "activity-log"
  | "users";

export type SoftwareSubKey = "overview" | "all-software";
export type ControlCenterSubKey = "insights";

const SOFTWARE_SUB_ROUTES: Record<SoftwareSubKey, string> = {
  overview: "/work/software-observability/xops-overview",
  "all-software": "/work/software-observability/xops-all-software",
};

const SOFTWARE_SUB_ITEMS: { key: SoftwareSubKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "all-software", label: "All Software" },
];

const CONTROL_CENTER_SUB_ROUTES: Record<ControlCenterSubKey, string> = {
  insights: "/work/data-health-monitor/prototype",
};

const CONTROL_CENTER_SUB_ITEMS: { key: ControlCenterSubKey; label: string }[] = [
  { key: "insights", label: "Insights" },
];

type NavItemData = {
  key: NavLeafKey;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItemData[] = [
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
  activeControlCenterItem?: ControlCenterSubKey;
  /** When set, the software sub-links call this instead of routing via next/link —
   *  used to drive an in-place embed's screen state (the live case-study hero flow)
   *  where real routing would navigate the whole portfolio page away. */
  onNavigate?: (screen: SoftwareSubKey) => void;
};

export default function Sidebar({
  activeItem,
  activeSoftwareItem,
  activeControlCenterItem,
  onNavigate,
}: SidebarProps) {
  const softwareExpanded = Boolean(activeSoftwareItem);
  const controlCenterExpanded = Boolean(activeControlCenterItem);

  return (
    <nav className={styles.sidebar} aria-label="Primary">
      <div className={styles.logo}>
        <img src="/xops/svg/XOPSLogo.svg" alt="XOPS" width={81} height={24} />
      </div>
      <ul className={styles.menu}>
        <NavGroup
          icon="speed"
          label="Control Center"
          expanded={controlCenterExpanded}
          items={CONTROL_CENTER_SUB_ITEMS}
          routes={CONTROL_CENTER_SUB_ROUTES}
          activeKey={activeControlCenterItem}
        />

        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <NavButton icon={item.icon} label={item.label} active={activeItem === item.key} />
          </li>
        ))}

        <NavGroup
          icon="code_blocks"
          label="Software"
          expanded={softwareExpanded}
          items={SOFTWARE_SUB_ITEMS}
          routes={SOFTWARE_SUB_ROUTES}
          activeKey={activeSoftwareItem}
          onNavigate={onNavigate}
        />

        {NAV_ITEMS_AFTER_SOFTWARE.map((item) => (
          <li key={item.key}>
            <NavButton icon={item.icon} label={item.label} active={activeItem === item.key} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Shared shape for any top-level item that expands into routed sub-items (currently
// Control Center → Insights, Software → Overview/All Software) — generalized once a
// second item needed the same expand/active/submenu behavior as the first.
function NavGroup<K extends string>({
  icon,
  label,
  expanded,
  items,
  routes,
  activeKey,
  onNavigate,
}: {
  icon: string;
  label: string;
  expanded: boolean;
  items: { key: K; label: string }[];
  routes: Record<K, string>;
  activeKey?: K;
  onNavigate?: (screen: K) => void;
}) {
  return (
    <li>
      <NavButton icon={icon} label={label} expanded={expanded} />
      {expanded && (
        <ul className={styles.submenu}>
          {items.map((item) => (
            <li key={item.key}>
              <SubmenuItem
                screen={item.key}
                label={item.label}
                href={routes[item.key]}
                active={activeKey === item.key}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function SubmenuItem<K extends string>({
  screen,
  label,
  href,
  active,
  onNavigate,
}: {
  screen: K;
  label: string;
  href: string;
  active: boolean;
  onNavigate?: (screen: K) => void;
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
    <Link href={href} className={className}>
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
