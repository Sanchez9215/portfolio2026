import Nav from "@/components/Nav";
import Section from "@/components/Section";
import LabelBlock from "@/components/LabelBlock";
import Block from "@/components/Block";
import SectionIntroductionEntry from "@/components/case-studies/data-health-monitor/SectionIntroductionEntry";
import CmdbSystemMap from "@/components/case-studies/data-health-monitor/CmdbSystemMap";
import CmdbSunburst from "@/components/case-studies/data-health-monitor/CmdbSunburst";
import DataCertificationTriggers from "@/components/case-studies/data-health-monitor/DataCertificationTriggers";
import FrameworkShapeSorter from "@/components/case-studies/data-health-monitor/FrameworkShapeSorter";
import styles from "./data-health-monitor.module.css";

export default function DataHealthMonitorPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: "var(--nav-height)" }}>
        <SectionIntroductionEntry />

        <Section className={styles.brief}>
          <div className={styles.briefContent}>
            <LabelBlock
              size="display"
              label="The Brief"
              body={
                <>
                  Autonomous outcomes depend <br />
                  on a single foundation: Reliable data.
                </>
              }
            />
            <Block size="lg" className={styles.detailBlock}>
              Without accurate, complete, and current records, the AI agents
              deployed to automate enterprise workflows operate on a flawed
              foundation.
            </Block>
          </div>
        </Section>

        <Section className={styles.slowerTimeToValue}>
          <LabelBlock
            className={styles.slowerTimeToValueTextBlock}
            size="display"
            label="Slower Time to Value"
            body="XOPS unifies enterprise systems to automate complex IT workflows. However, when onboarding new customers, we frequently inherited stale and fragmented data that introduced operational risk and slowed time to value."
          />
        </Section>

        <Section className={styles.rootCause}>
          <LabelBlock
            className={styles.rootCauseTextBlock}
            size="display"
            label="The Root Cause"
            body="This was an industry-wide issue. XOPS relied on data from Configuration Management Databases (CMDBs), and these systems of record for enterprise assets were often error prone due to manual updates and rare audits. This forced our agents to operate on false premises."
          />
        </Section>

        <Section className={styles.opportunity}>
          <LabelBlock
            className={styles.opportunityTextBlock}
            size="display"
            label="The Opportunity"
            body="XOPS saw a clear market gap. Enterprise customers needed a better answer to CMDB governance."
          />
          <Block size="lg" className={styles.detailBlock}>
            I led the design for the XOPS' Data Health Monitor, a new module
            that transformed reactive data cleanup into a continuous monitoring
            layer.
          </Block>
        </Section>

        <Section className={styles.domainImmersion}>
          <div className={styles.domainImmersionContent}>
            <LabelBlock
              size="display"
              label="Domain & Architecture Immersion"
              body="Coming into this project, I had little knowledge of CMDBs. To ensure productive conversations, I dove deep into mapping its structure, understanding terminology, concepts and pain points."
            />
            <CmdbSystemMap />
          </div>
        </Section>

        <Section className={styles.cmdbFramework}>
          <LabelBlock
            className={styles.cmdbFrameworkTextBlock}
            size="display"
            label="The CMDB Framework"
            body="For most Fortune 500 organizations, the CMDB lives in ServiceNow, the dominant ITSM platform for enterprise IT operations."
          />
          <Block size="lg" className={styles.detailBlock}>
            ServiceNow was the primary integration source for this project.
          </Block>
        </Section>

        <Section className={styles.cmdbSunburst}>
          <div className={styles.cmdbSunburstContent}>
            <CmdbSunburst />
          </div>
        </Section>

        <Section className={styles.dataCertification}>
          <LabelBlock
            className={styles.dataCertificationTextBlock}
            size="display"
            label="Data Certification"
            body="The value of CMDB data depends entirely on its accuracy. Data certification is the process used to validate data hygiene and declare a domain fit for operational use and compliance."
          />
          {/* <Block size="lg" className={styles.detailBlock}>
            At enterprise scale, these processes are manual, infrequent, and
            disconnected from the health data that should be informing them.
          </Block> */}
        </Section>

        <Section className={styles.dataCertificationTriggers}>
          <DataCertificationTriggers />
        </Section>

        <Section className={styles.xopsTransition}>
          <LabelBlock
            className={styles.xopsTransitionTextBlock}
            size="display"
            body="How does this translate into a Data Health Management system in XOPS?"
          />
        </Section>

        <Section className={styles.cmdbToXops}>
          <LabelBlock
            className={styles.cmdbToXopsTextBlock}
            size="display"
            label="Translating the CMDB Framework to XOPS"
            body="To build a data health monitoring system compatible with XOPS, I mapped the CMDB hierarchy to our existing Observability Framework."
          />
          <Block size="lg" className={styles.detailBlock}>
            While the architectures were similar, this wasn't a simple 1:1
            mapping and would require adjustments for it to fit the platform
            logic XOPS was built on.
          </Block>
        </Section>

        <Section className={styles.frameworkShapeSorter}>
          <FrameworkShapeSorter />
        </Section>
      </main>
    </>
  );
}
