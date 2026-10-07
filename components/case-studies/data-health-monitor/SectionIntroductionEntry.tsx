"use client";

// Thin client boundary: page.tsx is a Server Component and can't pass a
// function prop (the `visual` render prop) across the RSC boundary — this
// composes SectionIntroduction + its visual entirely on the client side so
// no function ever crosses from server to client.
import SectionIntroduction from "@/components/case-studies/SectionIntroduction";
import DataHealthEmbed from "./DataHealthEmbed";
import { dataHealthMonitorIntro } from "./introContent";

export default function SectionIntroductionEntry() {
  return (
    <SectionIntroduction
      intro={dataHealthMonitorIntro}
      visual={() => <DataHealthEmbed />}
    />
  );
}
