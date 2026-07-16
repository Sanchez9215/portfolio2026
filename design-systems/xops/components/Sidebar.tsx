import React from "react";
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

type SoftwareSubKey = "overview" | "all-software";

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
};

export default function Sidebar({ activeItem, activeSoftwareItem }: SidebarProps) {
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
              <li
                className={[
                  styles.submenuItem,
                  activeSoftwareItem === "overview" ? styles.submenuItemActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                Overview
              </li>
              <li
                className={[
                  styles.submenuItem,
                  activeSoftwareItem === "all-software" ? styles.submenuItemActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                All Software
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
