import { AllSoftwareScreen } from "./AllSoftwareScreen";

// Thin route wrapper — the screen itself lives in AllSoftwareScreen.tsx so it can
// also be rendered (with onNavigate) inside the case-study hero embed. On its
// own route it renders with no onNavigate, so the Sidebar uses real routing.
export default function XopsAllSoftwarePage() {
  return <AllSoftwareScreen />;
}
