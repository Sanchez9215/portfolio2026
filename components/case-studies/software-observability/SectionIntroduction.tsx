import Block from '@/components/Block'
import LabelBlock from '@/components/LabelBlock'
import SoftwareExperienceEmbed from './SoftwareExperienceEmbed'
import styles from './SectionIntroduction.module.css'

export default function SectionIntroduction() {
  return (
    <section className={`cs-grid ${styles.introduction}`}>

      <div className={styles.heroImage}>
        <div className={styles.heroEmbed}>
          <SoftwareExperienceEmbed />
        </div>
      </div>

      <div className={styles.projectOverview}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            Software<br />Observability
          </h1>
          <Block size="lg">
            XOPS&apos; Software Observability module gives enterprises real-time visibility
            into license ownership, spend, and utilization to identify waste and drive
            reclamation and cost optimization.
          </Block>
        </div>
        <div className={styles.projectMeta}>
          <LabelBlock
            size="xs"
            label="Company"
            body="XOPS is an autonomous IT operations platform that streamlines workflows for the Fortune 500."
          />
          <LabelBlock
            size="xs"
            label="Gap"
            body="XOPS unified employee and device data but missed the software dimension."
          />
          <LabelBlock
            size="xs"
            label="Role"
            body="Lead Product Designer"
          />
          <LabelBlock
            size="xs"
            label="Timeline"
            body="Q2 2025"
          />
        </div>
      </div>

      <div className={styles.projectImpact}>
        <LabelBlock
          size="md"
          label="Platform Expansion (0 → 1)"
          body="Designed and launched XOPS's Software Lifecycle management module from scratch, extending the platform's lifecycle coverage from employees and devices into software and license intelligence."
        />
        <LabelBlock
          size="md"
          label="Millions Reclaimed in License Spend"
          body="Established the foundation for advanced software optimization. The XOPS software intelligence layer directly enabled enterprise customers like Broadcom to surface and recover unused software costs at scale."
        />
        <LabelBlock
          size="md"
          label="Revenue & Sales Enablement"
          body="Software portfolio and profile views became a consistent presence in enterprise sales demos, revealing the depth of XOPS's data model and system of intelligence."
        />
      </div>

    </section>
  )
}
