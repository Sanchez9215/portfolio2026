import ImgCard from '@/components/ImgCard'
import TextBlock from '@/components/TextBlock'
import styles from './SectionIntroduction.module.css'

export default function SectionIntroduction() {
  return (
    <section className={`cs-grid ${styles.introduction}`}>

      <div className={styles.heroImage}>
        <ImgCard aspectRatio="16/9">
          <div className={styles.imagePlaceholder} />
        </ImgCard>
      </div>

      <div className={styles.projectOverview}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            Software<br />Observability
          </h1>
          <p className={styles.subtitle}>
            XOPS&apos; Software Observability module gives enterprises real-time visibility
            into license ownership, spend, and utilization to identify waste and drive
            reclamation and cost optimization.
          </p>
        </div>
        <div className={styles.projectMeta}>
          <TextBlock
            size="xs"
            label="Company"
            body="XOPS is an autonomous IT operations platform that streamlines workflows for the Fortune 500."
          />
          <TextBlock
            size="xs"
            label="Gap"
            body="XOPS unified employee and device data but missed the software dimension."
          />
          <TextBlock
            size="xs"
            label="Role"
            body="Lead Product Designer"
          />
        </div>
      </div>

      <div className={styles.projectImpact}>
        <TextBlock
          size="md"
          label="Platform Expansion (0 → 1)"
          body="Designed and launched XOPS's Software Lifecycle management module from scratch, extending the platform's lifecycle coverage from employees and devices into software and license intelligence."
        />
        <TextBlock
          size="md"
          label="Millions Reclaimed in License Spend"
          body="Established the foundation for advanced software optimization. The XOPS software intelligence layer directly enabled enterprise customers like Broadcom to surface and recover unused software costs at scale."
        />
        <TextBlock
          size="md"
          label="Revenue & Sales Enablement"
          body="Software portfolio and profile views became a consistent presence in enterprise sales demos, revealing the depth of XOPS's data model and system of intelligence."
        />
      </div>

    </section>
  )
}
