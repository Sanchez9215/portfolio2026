// Runbook templates — hand-authored event sequences per lane. `at` is hours from request
// creation at standard pace (VIP onboarding compresses it). `trigger` names a step in ANOTHER
// lane that causes this one; in-lane order is implicit and needs none.

import type { EventActor, EventSource, EventType, RequestTemplateKey, RunbookDomain } from "./types";

export interface Step {
  key: string;
  title: string;
  source: EventSource;
  at: number;
  actor?: EventActor; // default "system"
  type?: EventType; // default "automation"
  trigger?: string;
}

export interface Fault {
  /** The step this fault replaces/attaches to. */
  atStep: string;
  title: string;
  source: EventSource;
  /** Resolution event (adds a delay to later steps in the lane). */
  resolution?: { title: string; actor: EventActor; type: EventType; delayHours: number };
}

export interface RunbookTemplate {
  runbookName: string;
  domain: RunbookDomain;
  steps: Step[];
  exception: Fault;
  warning: Fault;
}

const st = (
  key: string,
  title: string,
  source: EventSource,
  at: number,
  extra: Partial<Pick<Step, "actor" | "type" | "trigger">> = {},
): Step => ({ key, title, source, at, ...extra });

// ---------------------------------------------------------------------------
// Employee lane (main trunk) — one per request template
// ---------------------------------------------------------------------------

export const ONBOARDING_EMPLOYEE_LANE: Step[] = [
  st("hire", "Hire Confirmed", "hr", 0, { type: "milestone" }),
  st("start-date", "Start Date Set", "hr", 0, { type: "milestone" }),
  st("request", "Request Created", "itsm", 0.25, { type: "milestone", trigger: "hire" }),
  st("manager-approval", "Manager Approval", "itsm", 2, { actor: "manager", type: "approval" }),
  st("identity", "Identity Created", "identity", 6, { trigger: "hire" }),
  st("address", "Shipping Address Confirmed", "itsm", 20, { actor: "employee", type: "human-task" }),
  st("kit", "Kit Selected", "itsm", 22),
  st("screening", "Background Check Cleared", "screening", 40),
  st("received", "Employee Confirmed Receipt", "itsm", 105, { actor: "employee", type: "human-task", trigger: "delivered" }),
  st("enabled", "Account Enabled", "identity", 132),
  st("ready", "Day-One Readiness", "itsm", 140, { type: "milestone" }),
];

export const OFFBOARDING_EMPLOYEE_LANE: Step[] = [
  st("termination", "Termination Recorded", "hr", 0, { type: "milestone" }),
  st("request", "Request Created", "itsm", 0.25, { type: "milestone", trigger: "termination" }),
  st("notified", "Manager Notified", "itsm", 0.5, { type: "notification" }),
  st("retention", "Retention Window Set", "itsm", 2),
  st("ready", "Exit Checklist Complete", "itsm", 170, { type: "milestone" }),
];

// ---------------------------------------------------------------------------
// Onboarding runbooks
// ---------------------------------------------------------------------------

export const DEVICE_DEPLOYMENT: RunbookTemplate = {
  runbookName: "Device Deployment",
  domain: "device",
  steps: [
    st("inventory", "Inventory Available", "procurement", 26, { type: "milestone", trigger: "kit" }),
    st("allocated", "Asset Allocated", "procurement", 30),
    st("preenrolled", "Device Pre-enrolled", "device-management", 36),
    st("dispatch", "Dispatch Initiated", "logistics", 48, { trigger: "address" }),
    st("ack", "Dispatch Acknowledged", "logistics", 50),
    st("tracking", "Tracking Number Issued", "logistics", 54, { type: "notification" }),
    st("carrier", "Package Accepted by Carrier", "logistics", 60),
    st("transit", "Package In Transit", "logistics", 72),
    st("delivered", "Package Delivered", "logistics", 104),
    st("enrolled", "Device Enrolled and Compliant", "device-management", 108, { trigger: "received" }),
    st("complete", "Deployment Complete", "itsm", 110, { type: "milestone" }),
  ],
  exception: {
    atStep: "inventory",
    title: "Inventory Unavailable",
    source: "procurement",
    resolution: { title: "Substitute Approved", actor: "manager", type: "approval", delayHours: 10 },
  },
  warning: { atStep: "transit", title: "Carrier Delay Reported", source: "logistics" },
};

export const BADGE_ACCESS: RunbookTemplate = {
  runbookName: "Badge Access",
  domain: "badge",
  steps: [
    st("security", "Security Approval", "badge", 8, { actor: "manager", type: "approval" }),
    st("linked", "Profile & Identity Linked", "badge", 10, { trigger: "identity" }),
    st("zones", "Access Zones Assigned", "badge", 44, { trigger: "screening" }),
    st("printed", "Badge Printed", "badge", 80),
    st("provisioned", "Badge Provisioned", "badge", 90),
    st("activated", "Badge Activated", "badge", 134, { trigger: "enabled" }),
    st("tested", "Access Tested", "badge", 136),
    st("complete", "Badge Access Complete", "itsm", 138, { type: "milestone" }),
  ],
  exception: {
    atStep: "printed",
    title: "Photo ID Not Received",
    source: "badge",
    resolution: { title: "Photo ID Received", actor: "employee", type: "human-task", delayHours: 12 },
  },
  warning: { atStep: "security", title: "Approval Pending Beyond Target", source: "badge" },
};

export const SOFTWARE_DEPLOYMENT: RunbookTemplate = {
  runbookName: "Software Deployment",
  domain: "software",
  steps: [
    st("baseline", "Baseline Determined from Role", "itsm", 8),
    st("licenses", "Licenses Assigned", "software-distribution", 12, { trigger: "identity" }),
    st("push", "Software Push Initiated", "software-distribution", 109, { trigger: "enrolled" }),
    st("installed", "Installation Complete", "software-distribution", 118),
    st("activated", "License Activation Complete", "software-distribution", 120),
    st("complete", "Software Deployment Complete", "itsm", 122, { type: "milestone" }),
  ],
  exception: {
    atStep: "licenses",
    title: "License Pool Exhausted",
    source: "software-distribution",
    resolution: { title: "Licenses Purchased", actor: "manager", type: "approval", delayHours: 16 },
  },
  warning: { atStep: "installed", title: "Install Retrying", source: "software-distribution" },
};

export const MOBILE_LINE_ASSIGNMENT: RunbookTemplate = {
  runbookName: "Mobile Line Assignment",
  domain: "mobile",
  steps: [
    st("eligible", "Eligibility Confirmed", "itsm", 4, { trigger: "request" }),
    st("budget", "Communication Budget Approved", "itsm", 12, { actor: "manager", type: "approval" }),
    st("ordered", "Line Ordered", "telecom", 24),
    st("provisioned", "Number Provisioned", "telecom", 48),
    st("assigned", "Number Assigned to Phone System", "telecom", 54),
    st("complete", "Mobile Line Assignment Complete", "itsm", 56, { type: "milestone" }),
  ],
  exception: {
    atStep: "provisioned",
    title: "Carrier Activation Failed",
    source: "telecom",
    resolution: { title: "Activation Retried", actor: "agent", type: "resolution", delayHours: 8 },
  },
  warning: { atStep: "ordered", title: "Number Port Delayed", source: "telecom" },
};

// ---------------------------------------------------------------------------
// Executive onboarding extras — four more lanes so one request carries eight items
// ---------------------------------------------------------------------------

export const EMAIL_PROVISIONING: RunbookTemplate = {
  runbookName: "Email Provisioning",
  domain: "email",
  steps: [
    st("mailbox-created", "Mailbox Created", "identity", 8, { trigger: "identity" }),
    st("lists-joined", "Distribution Lists Joined", "identity", 12),
    st("calendar-set", "Calendar and Delegates Configured", "identity", 16),
    st("email-complete", "Email Provisioning Complete", "itsm", 18, { type: "milestone" }),
  ],
  exception: {
    atStep: "mailbox-created",
    title: "Mailbox Creation Failed",
    source: "identity",
    resolution: { title: "Mailbox Recreated", actor: "agent", type: "resolution", delayHours: 4 },
  },
  warning: { atStep: "lists-joined", title: "Directory Sync Delayed", source: "identity" },
};

export const VPN_ACCESS: RunbookTemplate = {
  runbookName: "VPN Access",
  domain: "remote-access",
  steps: [
    st("vpn-approved", "Remote Access Approved", "itsm", 10, { actor: "manager", type: "approval", trigger: "manager-approval" }),
    st("vpn-profile", "VPN Profile Created", "identity", 14),
    st("vpn-mfa", "MFA Enrolled", "identity", 136, { actor: "employee", type: "human-task", trigger: "enabled" }),
    st("vpn-tested", "VPN Connectivity Tested", "identity", 138),
    st("vpn-complete", "VPN Access Complete", "itsm", 140, { type: "milestone" }),
  ],
  exception: {
    atStep: "vpn-profile",
    title: "VPN Profile Rejected",
    source: "identity",
    resolution: { title: "Profile Reissued", actor: "agent", type: "resolution", delayHours: 6 },
  },
  warning: { atStep: "vpn-mfa", title: "MFA Enrollment Pending", source: "identity" },
};

export const PAYROLL_SETUP: RunbookTemplate = {
  runbookName: "Payroll Setup",
  domain: "payroll",
  steps: [
    st("pay-record", "Payroll Record Created", "hr", 6, { trigger: "hire" }),
    st("pay-tax", "Tax Forms Collected", "hr", 30, { actor: "employee", type: "human-task" }),
    st("pay-deposit", "Direct Deposit Confirmed", "hr", 60, { actor: "employee", type: "human-task" }),
    st("pay-benefits-open", "Benefits Window Opened", "hr", 64),
    st("pay-benefits", "Benefits Elected", "hr", 100, { actor: "employee", type: "human-task" }),
    st("pay-complete", "Payroll Setup Complete", "itsm", 110, { type: "milestone" }),
  ],
  exception: {
    atStep: "pay-tax",
    title: "Tax Forms Missing",
    source: "hr",
    resolution: { title: "Tax Forms Received", actor: "employee", type: "human-task", delayHours: 24 },
  },
  warning: { atStep: "pay-benefits", title: "Enrollment Window Closing", source: "hr" },
};

export const TRAINING_ASSIGNMENT: RunbookTemplate = {
  runbookName: "Training Assignment",
  domain: "training",
  steps: [
    st("train-plan", "Training Plan Assigned", "itsm", 12, { trigger: "identity" }),
    st("train-security", "Security Awareness Assigned", "identity", 14),
    st("train-compliance", "Compliance Course Assigned", "hr", 16),
    st("train-day-one", "Day-One Training Scheduled", "hr", 134, { trigger: "enabled" }),
    st("train-complete", "Training Assignment Complete", "itsm", 138, { type: "milestone" }),
  ],
  exception: {
    atStep: "train-day-one",
    title: "Trainer Unavailable",
    source: "hr",
    resolution: { title: "Alternate Trainer Assigned", actor: "manager", type: "approval", delayHours: 8 },
  },
  warning: { atStep: "train-compliance", title: "Course Seats Limited", source: "hr" },
};

// ---------------------------------------------------------------------------
// Offboarding runbooks — ordered by risk: access first, hardware last
// ---------------------------------------------------------------------------

export const BADGE_ACCESS_DEACTIVATION: RunbookTemplate = {
  runbookName: "Badge Access Deactivation",
  domain: "badge",
  steps: [
    st("sessions", "Sessions Revoked", "identity", 0.5, { trigger: "termination" }),
    st("disabled", "Account Disabled", "identity", 0.75),
    st("badge", "Badge Deactivated", "badge", 1),
    st("mailbox", "Mailbox Converted to Shared", "identity", 4),
    st("review", "Access Review Complete", "identity", 6),
    st("deleted", "Identity Deleted", "identity", 168, { trigger: "retention" }),
  ],
  exception: {
    atStep: "badge",
    title: "Badge Deactivation Failed",
    source: "badge",
    resolution: { title: "Deactivated Manually", actor: "manager", type: "human-task", delayHours: 2 },
  },
  warning: { atStep: "mailbox", title: "Mailbox Conversion Delayed", source: "identity" },
};

export const SOFTWARE_LICENSE_RECLAIM: RunbookTemplate = {
  runbookName: "Software License Reclaim",
  domain: "software",
  steps: [
    st("flagged", "Licenses Flagged for Reclaim", "software-distribution", 2, { trigger: "disabled" }),
    st("grace", "Data Transfer Grace Period Started", "software-distribution", 3),
    st("revoked", "Licenses Revoked", "software-distribution", 72),
    st("returned", "Licenses Returned to Pool", "software-distribution", 74),
    st("reported", "Reclaim Reported to Asset Management", "itsm", 76, { type: "milestone" }),
  ],
  exception: {
    atStep: "revoked",
    title: "License Revocation Failed",
    source: "software-distribution",
    resolution: { title: "Revoked Manually", actor: "manager", type: "human-task", delayHours: 6 },
  },
  warning: { atStep: "grace", title: "Data Transfer Incomplete", source: "software-distribution" },
};

export const DEVICE_RECOVERY: RunbookTemplate = {
  runbookName: "Device Recovery",
  domain: "device",
  steps: [
    st("label", "Return Label Issued", "logistics", 4, { trigger: "termination" }),
    st("shipped", "Return Kit Shipped", "logistics", 8),
    st("transit", "Package In Transit", "logistics", 48),
    st("received", "Device Received", "logistics", 96),
    st("checked", "Condition Check Complete", "procurement", 100),
    st("wiped", "Data Wiped", "device-management", 104),
    st("stock", "Asset Returned to Stock", "procurement", 108, { type: "milestone" }),
  ],
  exception: {
    atStep: "received",
    title: "Device Not Returned",
    source: "logistics",
    resolution: { title: "Return Confirmed", actor: "employee", type: "human-task", delayHours: 48 },
  },
  warning: { atStep: "transit", title: "Return Overdue", source: "logistics" },
};

export const MOBILE_LINE_DEACTIVATION: RunbookTemplate = {
  runbookName: "Mobile Line Deactivation",
  domain: "mobile",
  steps: [
    st("suspended", "Line Suspended", "telecom", 2, { trigger: "termination" }),
    st("disposition", "Number Disposition Selected", "itsm", 10, { actor: "manager", type: "approval" }),
    st("cancelled", "Line Cancelled", "telecom", 30),
    st("recovered", "Phone Recovered", "logistics", 90),
    st("complete", "Mobile Line Deactivation Complete", "itsm", 92, { type: "milestone" }),
  ],
  exception: {
    atStep: "cancelled",
    title: "Carrier Cancellation Failed",
    source: "telecom",
    resolution: { title: "Cancellation Retried", actor: "agent", type: "resolution", delayHours: 8 },
  },
  warning: { atStep: "recovered", title: "Phone Not Yet Returned", source: "logistics" },
};

// ---------------------------------------------------------------------------
// Request templates
// ---------------------------------------------------------------------------

export interface RequestTemplate {
  key: RequestTemplateKey;
  name: string;
  employeeLane: Step[];
  runbooks: RunbookTemplate[];
  /** Multiplies every step's `at` — VIP compresses a ~6 day flow to ~2 days. */
  pace: number;
  /** SLA target to complete, in hours from creation. */
  slaTargetHours: number;
}

export const REQUEST_TEMPLATES: Record<RequestTemplateKey, RequestTemplate> = {
  "vip-onboarding": {
    key: "vip-onboarding",
    name: "US VIP Onboarding",
    employeeLane: ONBOARDING_EMPLOYEE_LANE,
    runbooks: [DEVICE_DEPLOYMENT, BADGE_ACCESS, SOFTWARE_DEPLOYMENT, MOBILE_LINE_ASSIGNMENT],
    pace: 0.3,
    slaTargetHours: 48,
  },
  "remote-onboarding": {
    key: "remote-onboarding",
    name: "Remote Knowledge Worker Onboarding",
    employeeLane: ONBOARDING_EMPLOYEE_LANE,
    runbooks: [DEVICE_DEPLOYMENT, SOFTWARE_DEPLOYMENT, MOBILE_LINE_ASSIGNMENT],
    pace: 1,
    slaTargetHours: 168,
  },
  "executive-onboarding": {
    key: "executive-onboarding",
    name: "Executive Onboarding",
    employeeLane: ONBOARDING_EMPLOYEE_LANE,
    runbooks: [DEVICE_DEPLOYMENT, BADGE_ACCESS, SOFTWARE_DEPLOYMENT, MOBILE_LINE_ASSIGNMENT, EMAIL_PROVISIONING, VPN_ACCESS, PAYROLL_SETUP, TRAINING_ASSIGNMENT],
    pace: 0.5,
    slaTargetHours: 96,
  },
  offboarding: {
    key: "offboarding",
    name: "US Employee Offboarding",
    employeeLane: OFFBOARDING_EMPLOYEE_LANE,
    runbooks: [BADGE_ACCESS_DEACTIVATION, SOFTWARE_LICENSE_RECLAIM, DEVICE_RECOVERY, MOBILE_LINE_DEACTIVATION],
    pace: 1,
    slaTargetHours: 168,
  },
};
