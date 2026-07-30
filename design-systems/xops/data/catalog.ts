// Static, factual product catalog — the seed content the generator expands into
// procurement / publisher / identity rows. ~100 managed titles across a Fortune-500-
// shaped portfolio. Logos resolve via PUBLISHER_LOGOS; null → empty-state.
//
// Department ids used in `affinity` MUST match the config taxonomy in generate.ts:
//   eng product design it security data sales marketing cs support
//   finance hr legal ops procurement exec

import type { ProductCatalogEntry } from "./types";

const LOGO_DIR = "/xops/publisher-logos";

// publisher display name → logo file (null = no logo yet, render empty-state).
// The 38 we have, plus the new publishers to source (grouped at the bottom).
export const PUBLISHER_LOGOS: Record<string, string | null> = {
  // --- have logos ---
  Microsoft: `${LOGO_DIR}/microsoft-corporation.jpg`,
  Adobe: `${LOGO_DIR}/adobe-inc.jpg`,
  Salesforce: `${LOGO_DIR}/salesforce-inc.jpg`,
  SAP: `${LOGO_DIR}/sap-ag.jpg`,
  Oracle: `${LOGO_DIR}/oracle-corporation.jpg`,
  ServiceNow: `${LOGO_DIR}/servicenow-inc.jpg`,
  VMware: `${LOGO_DIR}/vmware-inc.jpg`,
  Broadcom: `${LOGO_DIR}/broadcom-corporation.jpg`,
  Workday: `${LOGO_DIR}/workday-inc.jpg`,
  Cisco: `${LOGO_DIR}/cisco-systems-inc.jpg`,
  Atlassian: `${LOGO_DIR}/atlassian-corporation.jpg`,
  Figma: `${LOGO_DIR}/figma.jpg`,
  Okta: `${LOGO_DIR}/okta-inc.jpg`,
  Splunk: `${LOGO_DIR}/splunk-inc.jpg`,
  GitHub: `${LOGO_DIR}/github-inc.jpg`,
  DocuSign: `${LOGO_DIR}/docusign-inc.jpg`,
  Zendesk: `${LOGO_DIR}/zendesk.jpg`,
  HashiCorp: `${LOGO_DIR}/hashicorp.jpg`,
  Slack: `${LOGO_DIR}/slack-technologies.jpg`,
  Tableau: `${LOGO_DIR}/tableau-software.jpg`,
  CrowdStrike: `${LOGO_DIR}/crowdstrike-inc.jpg`,
  Zscaler: `${LOGO_DIR}/zscaler-inc.jpg`,
  Dropbox: `${LOGO_DIR}/dropbox.jpg`,
  Autodesk: `${LOGO_DIR}/autodesk-inc.jpg`,
  Unity: `${LOGO_DIR}/unity-technologies.jpg`,
  Citrix: `${LOGO_DIR}/citrix-systems-inc.jpg`,
  IBM: `${LOGO_DIR}/ibm.jpg`,
  SolarWinds: `${LOGO_DIR}/solarwinds-worldwide-llc.jpg`,
  Tanium: `${LOGO_DIR}/tanium-inc.jpg`,
  McAfee: `${LOGO_DIR}/mcafee-llc.jpg`,
  NortonLifeLock: `${LOGO_DIR}/nortonlifelock.jpg`,
  "Red Hat": `${LOGO_DIR}/red-hat-inc.jpg`,
  Intuit: `${LOGO_DIR}/intuit-inc.jpg`,
  Nuance: `${LOGO_DIR}/nuance-communications-inc.jpg`,
  Google: `${LOGO_DIR}/google-inc.jpg`,
  Shopify: `${LOGO_DIR}/shopify-inc.jpg`,
  Dell: `${LOGO_DIR}/dell-inc.jpg`,
  Zoom: `${LOGO_DIR}/zoom-video-communications-inc.jpg`,

  // --- new publishers to source logos for (empty-state until added) ---
  Snowflake: null,
  Databricks: null,
  Datadog: null,
  MongoDB: null,
  Notion: null,
  Asana: null,
  Box: null,
  Miro: null,
  HubSpot: null,
  "Palo Alto Networks": null,
  Fortinet: null,
  Coupa: null,
  Anaplan: null,
  Smartsheet: null,
  GitLab: null,
  Elastic: null,
};

export function logoFor(publisher: string): string | null {
  return PUBLISHER_LOGOS[publisher] ?? null;
}

export const PRODUCT_CATALOG: ProductCatalogEntry[] = [
  // ---- Microsoft ----
  { sku: "MSFT-M365-E3", name: "Microsoft 365 E3", publisher: "Microsoft", category: "Collaboration Suite", licenseModel: "enterprise", adoption: "universal", edition: "E3", priceMin: 360, priceMax: 432, description: "Enterprise productivity suite featuring core Office apps, cloud storage, security, and compliance tools." },
  { sku: "MSFT-M365-E5", name: "Microsoft 365 E5", publisher: "Microsoft", category: "Collaboration Suite", licenseModel: "enterprise", adoption: "broad", edition: "E5", priceMin: 540, priceMax: 660, description: "Enterprise productivity suite with advanced security, compliance, voice, and analytical capabilities." },
  { sku: "MSFT-TEAMS-PHONE", name: "Teams Phone", publisher: "Microsoft", category: "Communication", licenseModel: "enterprise", adoption: "broad", edition: "Standard", priceMin: 72, priceMax: 96 },
  { sku: "MSFT-VISIO-P2", name: "Visio Plan 2", publisher: "Microsoft", category: "Productivity", licenseModel: "enterprise", adoption: "departmental", edition: "Plan 2", priceMin: 180, priceMax: 180, affinity: ["it", "ops", "eng"] },
  { sku: "MSFT-POWERBI-PRO", name: "Power BI Pro", publisher: "Microsoft", category: "BI & Analytics", licenseModel: "enterprise", adoption: "broad", edition: "Pro", priceMin: 120, priceMax: 120, affinity: ["data", "finance", "ops"] },
  { sku: "MSFT-D365-SALES", name: "Dynamics 365 Sales", publisher: "Microsoft", category: "CRM", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 780, priceMax: 1140, affinity: ["sales"] },
  { sku: "MSFT-AZDEVOPS", name: "Azure DevOps", publisher: "Microsoft", category: "DevOps", licenseModel: "enterprise", adoption: "departmental", edition: "Basic + Test", priceMin: 72, priceMax: 624, affinity: ["eng", "product"], description: "Developer suite providing CI/CD pipelines, Git code repositories, Agile project planning, and testing tools." },

  // ---- Adobe ----
  { sku: "ADBE-CC-ALL", name: "Adobe Creative Cloud", publisher: "Adobe", category: "Design", licenseModel: "enterprise", adoption: "departmental", edition: "All Apps", priceMin: 600, priceMax: 840, affinity: ["design", "marketing"] },
  { sku: "ADBE-ACROBAT-PRO", name: "Adobe Acrobat Pro", publisher: "Adobe", category: "Productivity", licenseModel: "enterprise", adoption: "broad", edition: "Pro", priceMin: 180, priceMax: 240, description: "Comprehensive PDF editor for creating, modifying, signing, converting, and securing digital documents." },
  { sku: "ADBE-AEM", name: "Adobe Experience Manager", publisher: "Adobe", category: "Marketing", licenseModel: "enterprise", adoption: "niche", edition: "Sites", priceMin: 1200, priceMax: 2400, affinity: ["marketing"] },

  // ---- Salesforce ----
  { sku: "CRM-SALES-CLOUD", name: "Salesforce Sales Cloud", publisher: "Salesforce", category: "CRM", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 1500, priceMax: 2160, affinity: ["sales"] },
  { sku: "CRM-SERVICE-CLOUD", name: "Salesforce Service Cloud", publisher: "Salesforce", category: "Customer Service", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 1500, priceMax: 2160, affinity: ["support", "cs"], description: "Customer service CRM platform for managing support tickets, customer cases, and service operations." },
  { sku: "CRM-MKTG-CLOUD", name: "Salesforce Marketing Cloud", publisher: "Salesforce", category: "Marketing", licenseModel: "enterprise", adoption: "niche", edition: "Pro", priceMin: 1200, priceMax: 3600, affinity: ["marketing"] },

  // ---- SAP ----
  { sku: "SAP-S4HANA", name: "SAP S/4HANA Cloud", publisher: "SAP", category: "ERP", licenseModel: "enterprise", adoption: "departmental", edition: "Private", priceMin: 1080, priceMax: 1800, affinity: ["finance", "ops", "procurement"] },
  { sku: "SAP-SUCCESSFACTORS", name: "SAP SuccessFactors", publisher: "SAP", category: "HRIS", licenseModel: "enterprise", adoption: "broad", edition: "HXM Core", priceMin: 84, priceMax: 108, affinity: ["hr"] },
  { sku: "SAP-CONCUR", name: "SAP Concur", publisher: "SAP", category: "Expense Management", licenseModel: "enterprise", adoption: "broad", edition: "Professional", priceMin: 96, priceMax: 156 },

  // ---- Oracle ----
  { sku: "ORCL-DB-ULA", name: "Oracle Database ULA", publisher: "Oracle", category: "Database", licenseModel: "enterprise", adoption: "niche", edition: "Enterprise", priceMin: 2400, priceMax: 6000, affinity: ["eng", "data", "it"], description: "Unlimited deployment license for high-performance enterprise relational database infrastructure." },
  { sku: "ORCL-FUSION-ERP", name: "Oracle Fusion ERP", publisher: "Oracle", category: "ERP", licenseModel: "enterprise", adoption: "departmental", edition: "Cloud", priceMin: 1800, priceMax: 3000, affinity: ["finance", "ops"] },
  { sku: "ORCL-NETSUITE", name: "Oracle NetSuite", publisher: "Oracle", category: "ERP", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 1200, priceMax: 1800, affinity: ["finance"] },

  // ---- ServiceNow ----
  { sku: "NOW-ITSM", name: "ServiceNow ITSM", publisher: "ServiceNow", category: "ITSM", licenseModel: "enterprise", adoption: "broad", edition: "Professional", priceMin: 1200, priceMax: 1800, affinity: ["it", "eng", "ops"], description: "IT service management platform for automating IT workflows, incident management, and service requests." },
  { sku: "NOW-HRSD", name: "ServiceNow HR Service Delivery", publisher: "ServiceNow", category: "HRIS", licenseModel: "enterprise", adoption: "departmental", edition: "Standard", priceMin: 900, priceMax: 1200, affinity: ["hr"] },
  { sku: "NOW-SECOPS", name: "ServiceNow Security Operations", publisher: "ServiceNow", category: "Security & Compliance", licenseModel: "enterprise", adoption: "niche", edition: "Standard", priceMin: 1500, priceMax: 2400, affinity: ["security"] },

  // ---- VMware / Broadcom ----
  { sku: "VMW-VSPHERE", name: "VMware vSphere", publisher: "VMware", category: "Virtualization", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise Plus", priceMin: 300, priceMax: 600, affinity: ["it", "eng"] },
  { sku: "BCM-VCF", name: "Broadcom VMware Cloud Foundation", publisher: "Broadcom", category: "Virtualization", licenseModel: "enterprise", adoption: "niche", edition: "9.0", priceMin: 600, priceMax: 900, affinity: ["it"] },
  { sku: "BCM-SYMC-ENDPOINT", name: "Symantec Endpoint Security", publisher: "Broadcom", category: "Endpoint Security", licenseModel: "enterprise", adoption: "broad", edition: "Complete", priceMin: 48, priceMax: 84 },

  // ---- Workday ----
  { sku: "WDAY-HCM", name: "Workday HCM", publisher: "Workday", category: "HRIS", licenseModel: "enterprise", adoption: "universal", edition: "Core HCM", priceMin: 96, priceMax: 144, affinity: ["hr"] },
  { sku: "WDAY-FINS", name: "Workday Financial Management", publisher: "Workday", category: "Finance & Accounting", licenseModel: "enterprise", adoption: "departmental", edition: "Core", priceMin: 240, priceMax: 420, affinity: ["finance"] },
  { sku: "WDAY-ADAPTIVE", name: "Workday Adaptive Planning", publisher: "Workday", category: "Finance & Accounting", licenseModel: "enterprise", adoption: "niche", edition: "Enterprise", priceMin: 600, priceMax: 900, affinity: ["finance"] },

  // ---- Cisco ----
  { sku: "CSCO-WEBEX", name: "Cisco Webex", publisher: "Cisco", category: "Communication", licenseModel: "enterprise", adoption: "broad", edition: "Enterprise", priceMin: 120, priceMax: 180, description: "Enterprise video conferencing, cloud calling, team messaging, and virtual event hosting software." },
  { sku: "CSCO-FIREWALL", name: "Cisco Secure Firewall", publisher: "Cisco", category: "Network Security", licenseModel: "enterprise", adoption: "niche", edition: "Threat Defense", priceMin: 480, priceMax: 960, affinity: ["security", "it"] },
  { sku: "CSCO-UMBRELLA", name: "Cisco Umbrella", publisher: "Cisco", category: "Network Security", licenseModel: "enterprise", adoption: "broad", edition: "SIG Essentials", priceMin: 36, priceMax: 72, affinity: ["security"] },
  { sku: "CSCO-MERAKI", name: "Cisco Meraki", publisher: "Cisco", category: "Network Management", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 150, priceMax: 300, affinity: ["it"] },

  // ---- Atlassian ----
  { sku: "TEAM-JIRA", name: "Jira Software", publisher: "Atlassian", category: "DevOps", licenseModel: "enterprise", adoption: "broad", edition: "Premium", priceMin: 90, priceMax: 168, affinity: ["eng", "product", "it"] },
  { sku: "TEAM-CONFLUENCE", name: "Confluence", publisher: "Atlassian", category: "Collaboration", licenseModel: "enterprise", adoption: "broad", edition: "Premium", priceMin: 66, priceMax: 132 },
  { sku: "TEAM-BITBUCKET", name: "Bitbucket", publisher: "Atlassian", category: "DevOps", licenseModel: "enterprise", adoption: "departmental", edition: "Premium", priceMin: 72, priceMax: 108, affinity: ["eng"] },
  { sku: "TEAM-JSM", name: "Jira Service Management", publisher: "Atlassian", category: "ITSM", licenseModel: "enterprise", adoption: "departmental", edition: "Premium", priceMin: 528, priceMax: 636, affinity: ["it", "support"] },

  // ---- Figma ----
  { sku: "FIG-ORG", name: "Figma Organization", publisher: "Figma", category: "Design", licenseModel: "enterprise", adoption: "departmental", edition: "Organization", priceMin: 540, priceMax: 720, affinity: ["design", "product", "eng"] },
  { sku: "FIG-FIGJAM", name: "FigJam", publisher: "Figma", category: "Collaboration", licenseModel: "enterprise", adoption: "broad", edition: "Organization", priceMin: 60, priceMax: 120, affinity: ["design", "product"] },

  // ---- Okta ----
  { sku: "OKTA-WIC", name: "Okta Workforce Identity", publisher: "Okta", category: "Identity & Access", licenseModel: "enterprise", adoption: "universal", edition: "SSO + MFA", priceMin: 48, priceMax: 96 },
  { sku: "OKTA-ASA", name: "Okta Advanced Server Access", publisher: "Okta", category: "Identity & Access", licenseModel: "enterprise", adoption: "niche", edition: "Standard", priceMin: 180, priceMax: 300, affinity: ["eng", "it"] },

  // ---- Splunk ----
  { sku: "SPLK-ES", name: "Splunk Enterprise Security", publisher: "Splunk", category: "Security & Compliance", licenseModel: "enterprise", adoption: "niche", edition: "Cloud", priceMin: 1800, priceMax: 3600, affinity: ["security"] },
  { sku: "SPLK-OBS", name: "Splunk Observability Cloud", publisher: "Splunk", category: "Observability", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 900, priceMax: 1500, affinity: ["eng", "it"], description: "Full-stack cloud monitoring platform for real-time application performance, metrics, and log analysis." },

  // ---- GitHub ----
  { sku: "GH-ENT", name: "GitHub Enterprise Cloud", publisher: "GitHub", category: "DevOps", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 231, priceMax: 231, affinity: ["eng", "product"] },
  { sku: "GH-ADV-SEC", name: "GitHub Advanced Security", publisher: "GitHub", category: "Security & Compliance", licenseModel: "enterprise", adoption: "niche", edition: "GHAS", priceMin: 399, priceMax: 588, affinity: ["eng", "security"] },
  { sku: "GH-COPILOT", name: "GitHub Copilot", publisher: "GitHub", category: "DevOps", licenseModel: "enterprise", adoption: "departmental", edition: "Business", priceMin: 228, priceMax: 468, affinity: ["eng"] },

  // ---- DocuSign ----
  { sku: "DOCU-ESIGN", name: "Docusign eSignature", publisher: "DocuSign", category: "Contract Management", licenseModel: "enterprise", adoption: "broad", edition: "Business Pro", priceMin: 108, priceMax: 180, description: "Cloud platform for securely sending, signing, routing, and managing electronic signatures and agreements." },
  { sku: "DOCU-CLM", name: "Docusign CLM", publisher: "DocuSign", category: "Contract Management", licenseModel: "enterprise", adoption: "niche", edition: "CLM", priceMin: 600, priceMax: 960, affinity: ["legal", "procurement"] },

  // ---- Zendesk ----
  { sku: "ZEN-SUITE", name: "Zendesk Suite", publisher: "Zendesk", category: "Customer Service", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 1188, priceMax: 1668, affinity: ["support", "cs"] },
  { sku: "ZEN-SELL", name: "Zendesk Sell", publisher: "Zendesk", category: "CRM", licenseModel: "enterprise", adoption: "niche", edition: "Growth", priceMin: 588, priceMax: 1140, affinity: ["sales"] },

  // ---- HashiCorp ----
  { sku: "HASHI-VAULT", name: "HashiCorp Vault", publisher: "HashiCorp", category: "Security & Compliance", licenseModel: "enterprise", adoption: "niche", edition: "Enterprise", priceMin: 1200, priceMax: 2400, affinity: ["eng", "security", "it"], description: "Secrets management and data protection tool for securing API keys, passwords, and encryption keys." },
  { sku: "HASHI-TF", name: "HashiCorp Terraform", publisher: "HashiCorp", category: "DevOps", licenseModel: "enterprise", adoption: "departmental", edition: "Plus", priceMin: 240, priceMax: 720, affinity: ["eng", "it"], description: "Infrastructure-as-code tool for automating multi-cloud resource provisioning and management." },
  { sku: "HASHI-CONSUL", name: "HashiCorp Consul", publisher: "HashiCorp", category: "Networking", licenseModel: "open-source", adoption: "niche", edition: "Enterprise", priceMin: 0, priceMax: 600, affinity: ["eng"] },

  // ---- Slack / Tableau / Zoom (independent brands) ----
  { sku: "SLACK-EG", name: "Slack Enterprise Grid", publisher: "Slack", category: "Collaboration", licenseModel: "enterprise", adoption: "universal", edition: "Enterprise Grid", priceMin: 150, priceMax: 225 },
  { sku: "TBL-CREATOR", name: "Tableau Creator", publisher: "Tableau", category: "BI & Analytics", licenseModel: "enterprise", adoption: "departmental", edition: "Creator", priceMin: 840, priceMax: 900, affinity: ["data", "finance"] },
  { sku: "TBL-EXPLORER", name: "Tableau Explorer", publisher: "Tableau", category: "BI & Analytics", licenseModel: "enterprise", adoption: "broad", edition: "Explorer", priceMin: 420, priceMax: 504, affinity: ["data", "ops", "finance"] },
  { sku: "ZOOM-ONE", name: "Zoom One Enterprise", publisher: "Zoom", category: "Communication", licenseModel: "enterprise", adoption: "universal", edition: "Enterprise", priceMin: 180, priceMax: 264, description: "Unified communications platform featuring video conferencing, cloud phone system, chat, and whiteboards." },
  { sku: "ZOOM-PHONE", name: "Zoom Phone", publisher: "Zoom", category: "Communication", licenseModel: "enterprise", adoption: "broad", edition: "Pro", priceMin: 120, priceMax: 180 },
  { sku: "ZOOM-CC", name: "Zoom Contact Center", publisher: "Zoom", category: "Customer Service", licenseModel: "enterprise", adoption: "niche", edition: "Elite", priceMin: 780, priceMax: 1320, affinity: ["support"] },

  // ---- CrowdStrike / Zscaler / security ----
  { sku: "CRWD-FALCON", name: "CrowdStrike Falcon Complete", publisher: "CrowdStrike", category: "Endpoint Security", licenseModel: "enterprise", adoption: "universal", edition: "Complete", priceMin: 60, priceMax: 108 },
  { sku: "CRWD-IDENTITY", name: "CrowdStrike Falcon Identity", publisher: "CrowdStrike", category: "Identity & Access", licenseModel: "enterprise", adoption: "broad", edition: "Identity Protection", priceMin: 36, priceMax: 72, affinity: ["security"] },
  { sku: "ZS-ZIA", name: "Zscaler Internet Access", publisher: "Zscaler", category: "Network Security", licenseModel: "enterprise", adoption: "broad", edition: "Business", priceMin: 60, priceMax: 108, affinity: ["security", "it"] },
  { sku: "ZS-ZPA", name: "Zscaler Private Access", publisher: "Zscaler", category: "Network Security", licenseModel: "enterprise", adoption: "departmental", edition: "Standard", priceMin: 48, priceMax: 96, affinity: ["security", "it", "eng"] },

  // ---- Storage / collab ----
  { sku: "DBX-BIZ", name: "Dropbox Business", publisher: "Dropbox", category: "Cloud Storage", licenseModel: "enterprise", adoption: "departmental", edition: "Advanced", priceMin: 180, priceMax: 300 },

  // ---- Autodesk (perpetual + subscription) ----
  { sku: "ADSK-AEC", name: "Autodesk AEC Collection", publisher: "Autodesk", category: "CAD & Design", licenseModel: "enterprise", adoption: "niche", edition: "Collection", priceMin: 2800, priceMax: 3600, affinity: ["eng", "design"], description: "Integrated BIM and CAD software set for building design, civil infrastructure, and construction engineering." },
  { sku: "ADSK-AUTOCAD", name: "Autodesk AutoCAD", publisher: "Autodesk", category: "CAD & Design", licenseModel: "perpetual", adoption: "niche", edition: "2025", priceMin: 1900, priceMax: 2400, affinity: ["eng", "design"], description: "Computer-aided design (CAD) software for precision 2D drafting, 3D modeling, and architectural drawing." },
  { sku: "ADSK-FUSION", name: "Autodesk Fusion 360", publisher: "Autodesk", category: "CAD & Design", licenseModel: "enterprise", adoption: "niche", edition: "Team", priceMin: 680, priceMax: 820, affinity: ["eng"] },

  // ---- Unity / Citrix ----
  { sku: "UNITY-PRO", name: "Unity Pro", publisher: "Unity", category: "Development", licenseModel: "enterprise", adoption: "niche", edition: "Pro", priceMin: 2040, priceMax: 2040, affinity: ["eng", "product"], description: "Professional real-time 2D and 3D engine for game development, interactive visual simulation, and design." },
  { sku: "UNITY-IND", name: "Unity Industry", publisher: "Unity", category: "Development", licenseModel: "enterprise", adoption: "niche", edition: "Industry", priceMin: 4500, priceMax: 4500, affinity: ["eng"], description: "Real-time 3D creation platform tailored for enterprise industrial applications, digital twins, and AR/VR." },
  { sku: "CTX-VAD", name: "Citrix Virtual Apps", publisher: "Citrix", category: "Virtualization", licenseModel: "enterprise", adoption: "departmental", edition: "Premium", priceMin: 300, priceMax: 420, affinity: ["it"] },
  { sku: "CTX-DAAS", name: "Citrix DaaS", publisher: "Citrix", category: "Virtualization", licenseModel: "enterprise", adoption: "departmental", edition: "Advanced Plus", priceMin: 240, priceMax: 360, affinity: ["it"] },

  // ---- IBM ----
  { sku: "IBM-MAXIMO", name: "IBM Maximo", publisher: "IBM", category: "Asset Management", licenseModel: "enterprise", adoption: "niche", edition: "Application Suite", priceMin: 1200, priceMax: 2400, affinity: ["ops", "it"] },
  { sku: "IBM-COGNOS", name: "IBM Cognos Analytics", publisher: "IBM", category: "BI & Analytics", licenseModel: "enterprise", adoption: "niche", edition: "Enterprise", priceMin: 600, priceMax: 1200, affinity: ["data", "finance"] },
  { sku: "IBM-WATSONX", name: "IBM watsonx", publisher: "IBM", category: "AI & ML", licenseModel: "consumption", adoption: "niche", edition: "Platform", priceMin: 900, priceMax: 3000, affinity: ["data", "eng"] },

  // ---- SolarWinds / Tanium / observability ----
  { sku: "SW-OBS", name: "SolarWinds Observability", publisher: "SolarWinds", category: "Observability", licenseModel: "enterprise", adoption: "departmental", edition: "SaaS", priceMin: 300, priceMax: 600, affinity: ["it", "eng"] },
  { sku: "SW-SD", name: "SolarWinds Service Desk", publisher: "SolarWinds", category: "ITSM", licenseModel: "enterprise", adoption: "departmental", edition: "Business", priceMin: 468, priceMax: 900, affinity: ["it"] },
  { sku: "TAN-CORE", name: "Tanium Core Platform", publisher: "Tanium", category: "Endpoint Management", licenseModel: "enterprise", adoption: "broad", edition: "Core", priceMin: 36, priceMax: 84, affinity: ["it", "security"] },

  // ---- McAfee / Norton (endpoint) ----
  { sku: "MCAF-TOTAL", name: "McAfee Total Protection", publisher: "McAfee", category: "Endpoint Security", licenseModel: "enterprise", adoption: "broad", edition: "Business", priceMin: 42, priceMax: 78 },
  { sku: "NLOK-360", name: "NortonLifeLock 360 Business", publisher: "NortonLifeLock", category: "Endpoint Security", licenseModel: "enterprise", adoption: "departmental", edition: "Business", priceMin: 48, priceMax: 90 },

  // ---- Red Hat ----
  { sku: "RH-OPENSHIFT", name: "Red Hat OpenShift", publisher: "Red Hat", category: "DevOps", licenseModel: "enterprise", adoption: "niche", edition: "Platform Plus", priceMin: 1200, priceMax: 2400, affinity: ["eng", "it"], description: "Enterprise Kubernetes application platform for building, deploying, and scaling containerized workloads." },
  { sku: "RH-RHEL", name: "Red Hat Enterprise Linux", publisher: "Red Hat", category: "Operating Systems", licenseModel: "enterprise", adoption: "departmental", edition: "Server", priceMin: 349, priceMax: 799, affinity: ["eng", "it"] },
  { sku: "RH-ANSIBLE", name: "Red Hat Ansible Automation", publisher: "Red Hat", category: "DevOps", licenseModel: "enterprise", adoption: "niche", edition: "Platform", priceMin: 600, priceMax: 1400, affinity: ["it", "eng"] },

  // ---- Intuit / Nuance / Shopify / Dell ----
  { sku: "INTU-QBE", name: "Intuit QuickBooks Enterprise", publisher: "Intuit", category: "Finance & Accounting", licenseModel: "enterprise", adoption: "niche", edition: "Diamond", priceMin: 1800, priceMax: 3600, affinity: ["finance"] },
  { sku: "NUAN-DRAGON", name: "Nuance Dragon Professional", publisher: "Nuance", category: "Productivity", licenseModel: "perpetual", adoption: "niche", edition: "v16", priceMin: 500, priceMax: 700, affinity: ["legal", "ops"] },
  { sku: "SHOP-PLUS", name: "Shopify Plus", publisher: "Shopify", category: "E-Commerce", licenseModel: "consumption", adoption: "niche", edition: "Plus", priceMin: 1200, priceMax: 3000, affinity: ["marketing", "sales"] },
  { sku: "DELL-APEX", name: "Dell APEX", publisher: "Dell", category: "IT Asset Management", licenseModel: "enterprise", adoption: "niche", edition: "Console", priceMin: 300, priceMax: 720, affinity: ["it"] },
  { sku: "DELL-BOOMI", name: "Dell Boomi", publisher: "Dell", category: "Integration", licenseModel: "enterprise", adoption: "niche", edition: "Enterprise", priceMin: 600, priceMax: 1200, affinity: ["it", "eng"] },

  // ---- Google ----
  { sku: "GOOG-WORKSPACE", name: "Google Workspace Enterprise", publisher: "Google", category: "Collaboration Suite", licenseModel: "enterprise", adoption: "broad", edition: "Enterprise Plus", priceMin: 276, priceMax: 360, description: "Cloud collaboration suite providing Gmail, Drive, Docs, Meet, and enterprise security controls." },
  { sku: "GOOG-CLOUD", name: "Google Cloud Platform", publisher: "Google", category: "Cloud Infrastructure", licenseModel: "consumption", adoption: "departmental", edition: "Enterprise", priceMin: 600, priceMax: 3600, affinity: ["eng", "data", "it"] },
  { sku: "GOOG-CHROME-ENT", name: "Chrome Enterprise", publisher: "Google", category: "Endpoint Management", licenseModel: "enterprise", adoption: "broad", edition: "Upgrade", priceMin: 48, priceMax: 72, affinity: ["it"] },

  // ---- New publishers (empty-state logos until sourced) ----
  { sku: "SNOW-DW", name: "Snowflake Data Cloud", publisher: "Snowflake", category: "Data Platform", licenseModel: "consumption", adoption: "departmental", edition: "Enterprise", priceMin: 600, priceMax: 4800, affinity: ["data", "eng"] },
  { sku: "DBX-LAKEHOUSE", name: "Databricks Lakehouse", publisher: "Databricks", category: "Data Platform", licenseModel: "consumption", adoption: "niche", edition: "Enterprise", priceMin: 900, priceMax: 4200, affinity: ["data", "eng"] },
  { sku: "DDOG-APM", name: "Datadog Observability", publisher: "Datadog", category: "Observability", licenseModel: "consumption", adoption: "departmental", edition: "Enterprise", priceMin: 360, priceMax: 1200, affinity: ["eng", "it"] },
  { sku: "MONGO-ATLAS", name: "MongoDB Atlas", publisher: "MongoDB", category: "Database", licenseModel: "consumption", adoption: "niche", edition: "Dedicated", priceMin: 600, priceMax: 3000, affinity: ["eng"] },
  { sku: "NOTION-ENT", name: "Notion Enterprise", publisher: "Notion", category: "Collaboration", licenseModel: "enterprise", adoption: "broad", edition: "Enterprise", priceMin: 180, priceMax: 240, affinity: ["product", "design", "marketing"] },
  { sku: "ASANA-ENT", name: "Asana Enterprise", publisher: "Asana", category: "Work Management", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 300, priceMax: 480, affinity: ["marketing", "ops", "product"] },
  { sku: "BOX-ENT", name: "Box Enterprise", publisher: "Box", category: "Cloud Storage", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise Plus", priceMin: 240, priceMax: 420, description: "Secure cloud content management platform for enterprise file sharing, collaboration, and governance." },
  { sku: "MIRO-ENT", name: "Miro Enterprise", publisher: "Miro", category: "Collaboration", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 96, priceMax: 192, affinity: ["product", "design", "eng"] },
  { sku: "HUB-MKTG", name: "HubSpot Marketing Hub", publisher: "HubSpot", category: "Marketing", licenseModel: "enterprise", adoption: "niche", edition: "Enterprise", priceMin: 600, priceMax: 1800, affinity: ["marketing"] },
  { sku: "PANW-PRISMA", name: "Palo Alto Prisma Access", publisher: "Palo Alto Networks", category: "Network Security", licenseModel: "enterprise", adoption: "broad", edition: "Enterprise", priceMin: 72, priceMax: 144, affinity: ["security", "it"] },
  { sku: "FTNT-FORTIGATE", name: "Fortinet FortiGate", publisher: "Fortinet", category: "Network Security", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 60, priceMax: 120, affinity: ["security", "it"] },
  { sku: "COUPA-SPEND", name: "Coupa Spend Management", publisher: "Coupa", category: "Procurement", licenseModel: "enterprise", adoption: "niche", edition: "Enterprise", priceMin: 600, priceMax: 1200, affinity: ["procurement", "finance"] },
  { sku: "ANAP-PLAN", name: "Anaplan Planning", publisher: "Anaplan", category: "Finance & Accounting", licenseModel: "enterprise", adoption: "niche", edition: "Enterprise", priceMin: 900, priceMax: 1800, affinity: ["finance", "ops"] },
  { sku: "SMART-ENT", name: "Smartsheet Enterprise", publisher: "Smartsheet", category: "Work Management", licenseModel: "enterprise", adoption: "departmental", edition: "Enterprise", priceMin: 300, priceMax: 480, affinity: ["ops", "marketing"] },
  { sku: "GLAB-ULTIMATE", name: "GitLab Ultimate", publisher: "GitLab", category: "DevOps", licenseModel: "enterprise", adoption: "departmental", edition: "Ultimate", priceMin: 1188, priceMax: 1428, affinity: ["eng"] },
  { sku: "ELASTIC-ENT", name: "Elastic Enterprise Search", publisher: "Elastic", category: "Data Platform", licenseModel: "open-source", adoption: "niche", edition: "Platinum", priceMin: 0, priceMax: 1200, affinity: ["eng", "data"] },
];
