import Nav from "@/components/Nav";
import Section from "@/components/Section";
import LabelBlock from "@/components/LabelBlock";
import Block from "@/components/Block";
import Card from "@/components/Card";
import SectionIntroduction from "@/components/case-studies/software-observability/SectionIntroduction";
import ContextBlock from "@/components/ContextBlock";
import TheProblemPinnedScene from "@/components/case-studies/software-observability/TheProblemPinnedScene";
import QuoteBlock from "@/components/QuoteBlock";
import ContentHub from "@/components/ContentHub";
import ImgCard from "@/components/ImgCard";
import OverviewPrototypeHotspots from "@/components/case-studies/software-observability/OverviewPrototypeHotspots";
import OverviewPrototype2Hotspots from "@/components/case-studies/software-observability/OverviewPrototype2Hotspots";
import GapsIdentifiedHexScene from "@/components/case-studies/software-observability/GapsIdentifiedHexScene";
import AllSoftwareLegacyHotspots from "@/components/case-studies/software-observability/AllSoftwareLegacyHotspots";
import AllSoftwareDirectionIssuesHotspots from "@/components/case-studies/software-observability/AllSoftwareDirectionIssuesHotspots";
import AllSoftwareExperienceIssuesHotspots from "@/components/case-studies/software-observability/AllSoftwareExperienceIssuesHotspots";
import SoftwareProfileLegacyHotspots from "@/components/case-studies/software-observability/SoftwareProfileLegacyHotspots";
import SoftwareProfileIssuesHotspots from "@/components/case-studies/software-observability/SoftwareProfileIssuesHotspots";
import SoftwareProfileFinalHotspots from "@/components/case-studies/software-observability/SoftwareProfileFinalHotspots";
import InactiveLicenseDistributionHotspots from "@/components/case-studies/software-observability/InactiveLicenseDistributionHotspots";
import LifecycleTimelineHotspots from "@/components/case-studies/software-observability/LifecycleTimelineHotspots";
import InsightsGoalsContent from "@/components/case-studies/software-observability/InsightsGoalsContent";
import CardRow from "@/components/CardRow";
import CardColumn from "@/components/CardColumn";
import SectionImg from "@/components/SectionImg";
// import DataGlossaryTable from "@/components/case-studies/software-observability/DataGlossaryTable"; — hidden, see section.data-dictionary
import DataDictionaryScene from "@/components/case-studies/software-observability/DataDictionaryScene";
import ObservabilityEyes from "@/components/case-studies/software-observability/ObservabilityEyes";
import FrameworkFunnelSpine from "@/components/case-studies/software-observability/FrameworkFunnelSpine";
import FrameworkScene from "@/components/case-studies/software-observability/FrameworkScene";
import DataScrollController from "@/components/case-studies/software-observability/DataScrollController";
import DataIntroText from "@/components/case-studies/software-observability/DataIntroText";
import LifecycleTimelineScene from "@/components/case-studies/software-observability/LifecycleTimelineScene";
import LegacyExperienceEmbed from "@/components/case-studies/software-observability/LegacyExperienceEmbed";
import FinalAllSoftwareEmbed from "@/components/case-studies/software-observability/FinalAllSoftwareEmbed";
import OverviewSpendLifecycleEmbed from "@/components/case-studies/software-observability/OverviewSpendLifecycleEmbed";
import RowAnatomyHotspots from "@/components/case-studies/software-observability/RowAnatomyHotspots";
import GeneratingEventsContent from "@/components/case-studies/software-observability/GeneratingEventsContent";
import ToolTipsImages from "@/components/case-studies/software-observability/ToolTipsImages";
import styles from "./software-observability.module.css";

export default function SoftwareObservabilityPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: "var(--nav-height)" }}>
        <SectionIntroduction />

        <Section>
          <LabelBlock
            className={styles.briefTextBlock}
            size="display"
            label="Brief"
            body="When a startup is at full velocity, high-priority initiatives don't always begin with a formal spec."
            support="They come from white-boarding sessions, hallway conversations, an after-hours slack ping."
          />
        </Section>

        <Section className={styles.theProblem}>
          <TheProblemPinnedScene className={styles.theProblemPinnedScene} />
        </Section>

        <Section className={styles.research}>
          <ContextBlock side="left" className={styles.researchContextBlock}>
            <Block size="lg">
              What did I know about software asset management?
            </Block>
            <p className={styles.researchContextStat}>0%</p>
          </ContextBlock>
          <div className={styles.researchContent}>
            <LabelBlock
              size="display"
              label="Research"
              body="Before setting time with experts who had dealt with these pain points firsthand,"
              support="I used Claude and ChatGPT to ramp up on the problem space."
            />
          </div>
        </Section>

        <Section className={styles.insightsGoals}>
          <InsightsGoalsContent />
        </Section>

        <div className={styles.frameworkObservabilityWrap}>
          <FrameworkFunnelSpine />
          <Section className={styles.frameworkAdaptation}>
            <LabelBlock
              className={styles.frameworkAdaptationTextBlock}
              size="display"
              label="Framework Adaptation & Data Requirements"
              body="The experience needed to integrate seamlessly into the platform. I applied our product strategy when integrating a new domain lifecycle."
              support=""
            />
          </Section>

          <Section className={styles.observabilityEyes}>
            <ObservabilityEyes />
          </Section>
        </div>

        <Section className={styles.framework}>
          <FrameworkScene className={styles.frameworkScene} />
        </Section>

        <DataScrollController fadeIn centerFade>
          <Section className={styles.data}>
            <ContextBlock side="none" className={styles.dataContext}>
              <DataIntroText />
            </ContextBlock>
            <div className={styles.dataContainer} data-scroll-body>
              <div className={styles.dataType}>
                <ContentHub
                  title="Software Identification"
                  nodes={[
                    { name: "Title" },
                    { name: "Vendor" },
                    { name: "Publisher" },
                    { name: "Version" },
                    { name: "Licensing Model" },
                    { name: "Lifecycle State" },
                  ]}
                />
              </div>
              <div className={styles.dataType}>
                <ContentHub
                  title="Utilization"
                  nodes={[
                    {
                      name: "Total Purchased",
                      children: [
                        {
                          name: "Assigned",
                          children: [{ name: "Active" }, { name: "Inactive" }],
                        },
                      ],
                    },
                    { name: "Assigned to Offboarded Employee" },
                    { name: "Unassigned" },
                    { name: "Over-Assigned" },
                  ]}
                />
              </div>
              <div className={styles.dataType}>
                <ContentHub
                  title="Compliance"
                  nodes={[
                    { name: "Titles with Over-Assigned Licenses" },
                    { name: "Unauthorized Installations" },
                    { name: "Duplicate Assignments" },
                    { name: "Expired Licenses" },
                    { name: "At Risk / Unverified Titles" },
                  ]}
                />
              </div>
              <div className={styles.dataType}>
                <ContentHub
                  title="Financial"
                  nodes={[
                    { name: "Contract Value" },
                    { name: "Cost per License" },
                    { name: "Purchase Date" },
                    { name: "Total Annual Spend" },
                    { name: "Spend by Department" },
                    { name: "Inactive License Dollar Value" },
                    { name: "Unused License Dollar Value" },
                    { name: "Renewal Date" },
                    { name: "Auto-Renew Status" },
                  ]}
                />
              </div>
              <div className={styles.dataType}>
                <ContentHub
                  title="Record Integrity"
                  nodes={[
                    { name: "Internal Record of Assigned Licenses" },
                    { name: "Internal Record of Total Owned Licenses" },
                    { name: "Vendor Record of Total Purchased Licenses" },
                    {
                      name: "Publisher Records",
                      children: [
                        { name: "Total Owned Licenses" },
                        { name: "Total Assigned Licenses" },
                      ],
                    },
                  ]}
                />
              </div>
            </div>
          </Section>
        </DataScrollController>

        {/* <Section>
          <LabelBlock
            className={styles.modularDesignApproach}
            size="display"
            label="Designing for Data Uncertainty"
            body="Data Ops had higher priorities before software data integrations, and I didn't know which sources would survive."
            support="I took a modular design approach that would adapt regardless of any missing source."
          />
        </Section> */}

        <DataScrollController fadeIn>
          <Section className={styles.parallelPrototyping}>
            <div className={styles.parallelPrototypingLeft}>
              <LabelBlock
                size="display"
                label="Parallel Prototyping"
                body="I kicked off design with the Overview page. The module's entry point."
                support="This would establish core metrics, visual language, and data groupings that everything else would inherit."
              />
              <Block
                size="lg"
                className={styles.parallelPrototypingDetailBlock}
              >
                I generated a set of parallel prototypes in both Claude and
                Figma Make to identify where outputs converged, validate logical
                data groupings, and pressure-test the information architecture
                before committing to a direction.
              </Block>
            </div>
            <div className={styles.parallelPrototypingScroll} data-scroll-body>
              <div className={styles.parallelPrototypingCard}>
                <p className={styles.parallelPrototypingCardLabel}>
                  Claude Prototype
                </p>
                <img
                  className={styles.parallelPrototypingCardImg}
                  src="/images/software-observability/claude-overview.jpg"
                  alt="Claude AI prototype of the Overview page"
                />
              </div>
              <div className={styles.parallelPrototypingCard}>
                <p className={styles.parallelPrototypingCardLabel}>
                  Figma Prototype 01
                </p>
                <img
                  className={styles.parallelPrototypingCardImg}
                  src="/images/software-observability/figma-overview-01.jpg"
                  alt="Figma Prototype 01"
                />
              </div>
              <div className={styles.parallelPrototypingCard}>
                <p className={styles.parallelPrototypingCardLabel}>
                  Figma Prototype 02
                </p>
                <img
                  className={styles.parallelPrototypingCardImg}
                  src="/images/software-observability/figma-overview-02.jpg"
                  alt="Figma Prototype 02"
                />
              </div>
            </div>
          </Section>
        </DataScrollController>

        <Section className={styles.dataDictionary}>
          <DataDictionaryScene className={styles.dataDictionaryScene} />
          {/* <DataGlossaryTable /> — hidden while the pinned scene above
              (scaffold build → real data-dictionary table) is being built;
              see PLAN.md beat 12 / progress.md. */}
        </Section>

        <Section className={styles.prototypeValidation}>
          <LabelBlock
            className={styles.prototypeValidationTextBlock}
            size="display"
            label="Prototype Validation"
            body="Using the outputs as strategic context, I created a prototype to focus the direction through sessions with leadership and subject matter experts."
          />
        </Section>

        {/* ── section.overview-prototype-1 ── */}
        {/* Static assumption/finding cards hidden while the hotspot annotation
            system (PLAN.md "Hotspot Annotation System") is being validated —
            see OverviewPrototypeHotspots.tsx for the POC (3 of 8 hotspots). */}
        <Section className={styles.overviewPrototype1}>
          <div className={styles.overviewPrototype1Embed}>
            <OverviewPrototypeHotspots />
          </div>
        </Section>

        {/* ── section.overview-prototype-2 ── */}
        {/* Static Decision cards + image hidden while the hotspot annotation
            system is being validated — see OverviewPrototype2Hotspots.tsx;
            progress.md / PLAN.md beat 14. */}
        <Section className={styles.overviewPrototype2}>
          <div className={styles.overviewPrototype2Embed}>
            <OverviewPrototype2Hotspots />
          </div>
        </Section>

        <Section className={styles.gapsIdentified}>
          <GapsIdentifiedHexScene className={styles.gapsIdentifiedScene} />
        </Section>

        <Section className={styles.allSoftwareView}>
          <LabelBlock
            className={styles.allSoftwareViewTextBlock}
            size="display"
            label="All Software View"
            body="The design would be consistent with the structure established across all asset views, a complete, filterable catalog. The challenge was defining the right row-level attributes so teams could find what they needed fast."
          />
          <Block size="lg" className={styles.allSoftwareViewDetailBlock}>
            This would enable teams to isolate exactly the subset of titles they
            need to act on.
          </Block>
        </Section>

        {/* <Section className={styles.coreAttributeIntent}>
          <LabelBlock
            className={styles.coreAttributeIntentTextBlock}
            size="display"
            label="Core Attribute Intent"
            body="The challenge was defining the right row-level attributes and data points,"
            support="so teams could find what they needed fast without friction."
          />
        </Section> */}

        {/* ── section.all-software-prototype-1 ── */}
        {/* Static Assumption cards + image hidden while the hotspot annotation
            system is applied here — see AllSoftwareLegacyHotspots.tsx. */}
        <Section className={styles.overviewPrototype1}>
          <div className={styles.overviewPrototype1Embed}>
            <AllSoftwareLegacyHotspots />
          </div>
        </Section>

        <Section className={styles.softwareProfile}>
          <LabelBlock
            className={styles.softwareProfileTextBlock}
            size="display"
            label="Software Profile"
            body="Profiles serve as the single source of truth for every title,combining identity data, organizational context, and a complete operational history."
          />
          <Block size="lg" className={styles.softwareProfileDetailBlock}>
            The intent was to make this record the definitive place to assess
            licensing, utilization health, spend, compliance, and lifecycle
            events so teams had the evidence they needed to justify a
            reclamation, challenge a renewal, or escalate a waste conversation
            without leaving the platform.
          </Block>
        </Section>

        {/* <Section className={styles.utilizationAndCost}>
          <LabelBlock
            className={styles.utilizationAndCostTextBlock}
            size="display"
            label="Utilization and Cost Summary"
            body="I established the financial baseline upfront by surfacing the scale of licenses owned attached to spend,"
            support="followed by a utilization breakdown that translated unused license metrics into a dollar figure."
          />
          <Block size="md" className={styles.utilizationAndCostDetailBlock}>
            The business intent was clear, give stakeholders the evidence they
            needed to justify a reclamation, challenge a renewal, or escalate a
            waste conversation without ever leaving the platform.
          </Block>
        </Section> */}

        {/* ── section.profile-prototype-1 ── */}
        {/* Absorbed section.software-profile-quote (quote now left column here).
            Static Assumption/Finding cards + image replaced by the live hotspot
            experience — see SoftwareProfileLegacyHotspots.tsx. */}
        <Section className={styles.profilePrototype1}>
          <div className={styles.profilePrototype1Quote}>
            <Block size="lg" className={styles.softwareProfileQuoteDetailBlock}>
              I designed the landing view to immediately answer the two most
              critical questions:
            </Block>
            <QuoteBlock quote="What is this software costing us? Is it actually being used?" />
          </div>
          <div className={styles.profilePrototype1Embed}>
            <SoftwareProfileLegacyHotspots />
          </div>
        </Section>

        <Section className={styles.lifecycleTimeline}>
          <LifecycleTimelineScene className={styles.lifecycleTimelineScene} />
        </Section>

        <Section className={styles.generatingEvents}>
          <GeneratingEventsContent />
        </Section>

        {/* ── section.final-lifecycle-timeline ── */}
        {/* Static before/after CardColumns + image replaced by the live hotspot
            experience — see LifecycleTimelineHotspots.tsx. */}
        <Section className={styles.finalLifecycleTimeline}>
          <div className={styles.finalLifecycleTimelineEmbed}>
            <LifecycleTimelineHotspots />
          </div>
        </Section>

        <DataScrollController fadeIn>
          <Section className={styles.unifyingSystems}>
            <div className={styles.unifyingSystemsLeft}>
              <LabelBlock
                size="display"
                label="Unifying Systems"
                body="Connecting software data to employee, device, and financial records was central to delivering on XOPS' core promise."
              />
              <Block size="lg" className={styles.unifyingSystemsDetailBlock}>
                Using the same parallel prototyping approach as the Overview, I
                generated directional variations.
              </Block>
            </div>
            <div className={styles.unifyingSystemsScroll} data-scroll-body>
              <div className={styles.unifyingSystemsCard}>
                <p className={styles.unifyingSystemsCardLabel}>
                  Claude Profile Prototype
                </p>
                <img
                  className={styles.unifyingSystemsCardImg}
                  src="/images/software-observability/img.claude-profile.jpg"
                  alt="Claude Profile Prototype"
                />
              </div>
              <div className={styles.unifyingSystemsCard}>
                <p className={styles.unifyingSystemsCardLabel}>
                  Figma Employee Tab Prototype
                </p>
                <img
                  className={styles.unifyingSystemsCardImg}
                  src="/images/software-observability/figma-profile-01.jpg"
                  alt="Figma Employee Tab Prototype"
                />
              </div>
              <div className={styles.unifyingSystemsCard}>
                <p className={styles.unifyingSystemsCardLabel}>
                  Figma Financial Tab Prototype
                </p>
                <img
                  className={styles.unifyingSystemsCardImg}
                  src="/images/software-observability/figma-profile-02.jpg"
                  alt="Figma Financial Tab Prototype"
                />
              </div>
              <div className={styles.unifyingSystemsCard}>
                <p className={styles.unifyingSystemsCardLabel}>
                  Figma Devices Tab Prototype
                </p>
                <img
                  className={styles.unifyingSystemsCardImg}
                  src="/images/software-observability/figma-profile-03.jpg"
                  alt="Figma Devices Tab Prototype"
                />
              </div>
            </div>
          </Section>
        </DataScrollController>

        <Section className={styles.unifyingSystemsPrototype}>
          <div className={styles.unifyingSystemsPrototypeHeader}>
            <LabelBlock
              size="display"
              className={styles.unifyingSystemsPrototypeLabel}
              label="Setting a Blueprint"
              body="I synthesized my findings into a prototype that covered the data relationships. "
            />
            <Block
              size="lg"
              className={styles.unifyingSystemsPrototypeDetailBlock}
            >
              The intent wasn&apos;t to present a solution, but to walk into
              stakeholder and leadership chats with a starting point to align on
              what mattered, challenge what didn&apos;t, and define direction
              collectively.
            </Block>
          </div>
          <ImgCard
            className={styles.unifyingSystemsPrototypeImgCard}
            images={[
              {
                src: "/images/software-observability/employee-tab.jpg",
                caption: "Employee Tab Prototype",
              },
              {
                src: "/images/software-observability/financial-tab.jpg",
                caption: "Financial Tab Prototype",
              },
              {
                src: "/images/software-observability/img.device-tab.jpg",
                caption: "Figma Devices Tab Prototype",
              },
            ]}
          />
        </Section>

        <Section className={styles.testingTheExperience}>
          <div className={styles.testingTheExperienceWrapper}>
            <LabelBlock
              size="display"
              label="Testing The Experience"
              body="With the Overview finalized, I connected the All Software and Profile views into a single navigable prototype to test them as one experience."
            />
            <Block size="lg" className={styles.testingTheExperienceDetailBlock}>
              Rather than validating each view in isolation, I wanted feedback
              to reflect how teams would actually move through the system, from
              portfolio to catalog to individual record, so that gaps in
              continuity, logic, and data consistency would surface naturally.
            </Block>
          </div>
          <ImgCard
            variant="card"
            className={styles.testingTheExperienceImgCard}
            caption="Full Prototype"
            aspectRatio="16/9"
          >
            <LegacyExperienceEmbed />
          </ImgCard>
        </Section>

        <Section className={styles.twoTrackValidation}>
          <LabelBlock
            size="display"
            label="Two Track Validation"
            body="Ongoing working sessions with our Director of Product kept design decisions aligned with our business strategy and buyer expectations. "
            className={styles.twoTrackValidationLabelBlock}
          />
          <Block size="lg" className={styles.twoTrackValidationDetailBlock}>
            Deeply involved in sales while leading engineering and integration
            efforts, they had a precise understanding of what enterprise teams
            needed and the technical depth to understand how to get there.
          </Block>
        </Section>

        <Section>
          <div className={styles.crossFunctionalSessionsWrapper}>
            <LabelBlock
              size="display"
              body="In parallel, I facilitated cross-functional sessions with customer success, PMs, engineers, and strategic advisors. "
            />
            <Block
              size="lg"
              className={styles.crossFunctionalSessionsDetailBlock}
            >
              Each function experiences design through a different mental model,
              surfacing issues that are easy to miss the longer one stares at
              the same problem.
            </Block>
          </div>
        </Section>
        {/* 
        <Section>
          <LabelBlock
            className={styles.phaseOneClarityTextBlock}
            size="display"
            body="Together these sessions gave me clarity"
            support="to finalize designs for Phase 1 Software Observability."
          />
        </Section> */}

        <Section className={styles.allSoftwareDirectionIssues}>
          <LabelBlock
            size="display"
            label="All Software: Issues Identified"
            body="Early designs surfaced the right data
            but failed to make it actionable at a glance."
          />
        </Section>

        {/* ── section.direction-issue-annotations ── */}
        {/* Static Assumption cards + image hidden while the hotspot annotation
            system is applied here — see AllSoftwareDirectionIssuesHotspots.tsx. */}
        <Section className={styles.directionIssueAnnotations}>
          <div className={styles.directionIssueAnnotationsEmbed}>
            <AllSoftwareDirectionIssuesHotspots />
          </div>
        </Section>

        <Section className={styles.allSoftwareExperienceIssues}>
          <LabelBlock
            size="display"
            label="Not Ready for Scale"
            body="While solving for All Software, I captured issues with our current table experience that would compound as we introduced more lifecycle data to the platform."
          />
        </Section>

        {/* ── section.experience-issue-annotations ── */}
        {/* Static Assumption cards + image hidden while the hotspot annotation
            system is applied here — see AllSoftwareExperienceIssuesHotspots.tsx. */}
        <Section className={styles.experienceIssueAnnotations}>
          <div className={styles.experienceIssueAnnotationsEmbed}>
            <AllSoftwareExperienceIssuesHotspots />
          </div>
        </Section>

        {/* ── section.all-software-final ── */}
        <Section className={styles.allSoftwareFinal}>
          <LabelBlock
            size="display"
            label="All Software: Final Design"
            body="The final design shifted the table from being a data display to a decision making surface."
          />
        </Section>

        {/* ── section.all-software-final-design ── */}
        <Section className={styles.allSoftwareFinalDesign}>
          <ImgCard
            variant="card"
            caption="Final All Software View"
            height="100vh"
          >
            <FinalAllSoftwareEmbed />
          </ImgCard>
        </Section>

        {/* ── section.table-anatomy ── (absorbed section.row-anatomy — embed sits
            128px below the label, in the same height-hugging section) */}
        <Section className={styles.tableAnatomy}>
          <LabelBlock
            className={styles.tableAnatomyLabel}
            size="display"
            label="Table Anatomy"
            body="All elements were redesigned to communicate status and urgency at a glance."
          />
          <div className={styles.tableAnatomyEmbed}>
            <RowAnatomyHotspots />
          </div>
        </Section>

        {/* ── section.tool-tips ── */}
        <Section className={styles.toolTips}>
          <LabelBlock
            size="display"
            label="Tooltips"
            body="Tooltips appear when hovering over information icons, providing metric definitions and calculation transparency, so users can interpret data with confidence."
            support=""
          />
        </Section>

        {/* ── section.tool-tips-final-design ── */}
        <Section className={styles.toolTipsFinalDesign}>
          <ToolTipsImages />
        </Section>

        {/* ── section.design-system-refinements ── */}
        {/* <Section className={styles.designSystemRefinements}>
          <LabelBlock
            className={styles.designSystemRefinementsTextBlock}
            size="display"
            label="Design System Refinements"
            body="More data meant increasingly cluttered views. This led me to propose system-wide refinements that kept views clear, modern, and easy to navigate."
            support=""
          />
          <Block
            className={styles.designSystemRefinementsDetailBlock}
            size="lg"
          >
            These updates reduced visual weight, improved scannability, and
            ensured users could quickly focus on what mattered.
          </Block>
        </Section> */}

        {/* ── section.refinement-annotations ── */}

        {/* ── section.custimizable-columns ── */}
        <Section className={styles.custimizableColumns}>
          <LabelBlock
            size="display"
            label="Customizable Columns"
            body="Column controls let users tailor their view so they only see the information that matters to them."
          />
        </Section>

        {/* ── section.custimizable-columns-final ── */}
        <Section className={styles.custimizableColumnsFinal}>
          <ImgCard variant="card" caption="Custom Columns">
            <img
              src="/images/software-observability/custom-columns-final.jpg"
              alt="Customizable Columns Final Design"
            />
          </ImgCard>
        </Section>

        {/* ── section.Drag-and-Drop-Reordering ── */}
        <Section className={styles.dragAndDropReordering}>
          <LabelBlock
            size="display"
            label="Drag-and-Drop Reordering"
            body="Users can arrange information in the order that best fits their workflow,"
            support="giving them faster access to the attributes they rely on most."
          />
        </Section>

        {/* ── section.Drag-and-Drop-final ── */}
        <Section className={styles.dragAndDropFinal}>
          <ImgCard
            variant="card"
            layout="column"
            images={[
              {
                src: "/images/software-observability/grab-column.jpg",
                caption: "Grab Column",
              },
              {
                src: "/images/software-observability/drop-column.jpg",
                caption: "Drop Column",
              },
            ]}
          />
        </Section>

        {/* ── section.software-profile-issues ── */}
        <Section className={styles.softwareProfileIssues}>
          <LabelBlock
            size="display"
            label="Software Profiles: Issues Identified"
            body="Profile designs suffered from similar patterns, key data presented in a way that was difficult to act on. Utilization, spend, and waste data felt scattered, forcing users to piece together insights that should have been immediate."
          />
        </Section>

        {/* ── section.profile-issue-annotations ── */}
        {/* Static Assumption/Finding cards + image hidden while the hotspot annotation
            system is applied here — see SoftwareProfileIssuesHotspots.tsx. */}
        <Section className={styles.profileIssueAnnotations}>
          <div className={styles.profileIssueAnnotationsEmbed}>
            <SoftwareProfileIssuesHotspots />
          </div>
        </Section>

        {/* ── section.software-profile-final ── */}
        <Section className={styles.softwareProfileFinal}>
          <LabelBlock
            size="display"
            label="Software Profiles: Final Design"
            body="The final design led with financial opportunity, guiding users through license ownership and utilization. Clear hierarchy and data grouping reduced cognitive load, for faster, more confident decision-making."
          />
        </Section>

        {/* ── section.profile-final-design ── */}
        {/* Static before/after CardColumns + image replaced by the live hotspot
            experience — see SoftwareProfileFinalHotspots.tsx. */}
        <Section className={styles.profileFinalDesign}>
          <div className={styles.profileFinalDesignEmbed}>
            <SoftwareProfileFinalHotspots />
          </div>
        </Section>

        {/* ── section.scope-tradeoffs ── */}
        <Section>
          <LabelBlock
            className={styles.scopeTradeoffsTextBlock}
            size="display"
            label="Scope and Trade-Offs"
            body="Three features descoped from Phase 1 to keep the experience"
            support="focused on delivering immediate and trustworthy value."
          />
        </Section>

        {/* ── section.descoped-views ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
              <Card variant="filled" size="sm" label="Lifecycle Timeline">
                <Block size="sm" color="tertiary">
                  Delivering it accurately required a data collection strategy
                  and event definitions that depended on integration output that
                  wasn&apos;t ready at this phase.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Device Tab">
                <Block size="sm" color="tertiary">
                  Deprioritized in favor of keeping Phase 1 focused on the
                  highest impact reclamation signals. Device-level data would
                  add depth in a future phase but wasn&apos;t necessary to
                  deliver on the core promise.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Financial Tab">
                <Block size="sm" color="tertiary">
                  Contract terms, support costs, and historic spend are often
                  scattered across emails, invoices, spreadsheets, and legal
                  documents with no reliable integration path. Shipping with
                  incomplete records would have cost XOPS customer trust during
                  a critical evaluation period. Phase 2 required a data
                  collection strategy before the tab could deliver on its
                  promise.
                </Block>
              </Card>
            </CardColumn>
          }
          image={
            <ImgCard
              variant="card"
              images={[
                {
                  src: "/images/software-observability/timeline-prototype-2.jpg",
                  alt: "Lifecycle Timeline — descoped view",
                  caption: "Timeline",
                },
                {
                  src: "/images/software-observability/img.device-tab.jpg",
                  alt: "Devices Tab — descoped view",
                  caption: "Devices Tab",
                },
                {
                  src: "/images/software-observability/financial-tab.jpg",
                  alt: "Financial Tab — descoped view",
                  caption: "Financial Tab",
                },
              ]}
            />
          }
        />

        {/* ── section.inactive-license-distribution ── */}
        <Section className={styles.inactiveLicenseDistribution}>
          <LabelBlock
            size="display"
            label="Inactive License Distribution"
            body="Phase 1's focus was lowering spend through confident license reclamation. To achieve this,"
            support="the employee tab evolved into an organizational breakdown of inactivity, showing where waste was concentrated and who to target first."
          />
        </Section>

        {/* ── section.distribution-overview ── */}
        {/* Static Assumption/Finding cards + images across all 3 static sections
            (section.distribution-overview / .inactive-by-departments /
            .inactive-by-costCenter) replaced by the live hotspot experience —
            see InactiveLicenseDistributionHotspots.tsx. */}
        <Section className={styles.inactiveLicenseDistributionEmbed}>
          <div className={styles.inactiveLicenseDistributionEmbedInner}>
            <InactiveLicenseDistributionHotspots />
          </div>
        </Section>

        {/* ── section.overview-revisit ── */}
        <Section className={styles.overviewRevisit}>
          <LabelBlock
            className={styles.overviewRevisitTextBlock}
            size="display"
            label="Software Overview Revisit"
            body="Early Software Insights discussions revealed utilization and compliance would have dedicated dashboards, making them redundant in the Overview page."
          />
          <Block size="lg" className={styles.overviewRevisitDetailBlock}>
            I removed them, refocusing the page on annual spend, licensing
            models, and lifecycle stage distribution.
          </Block>
        </Section>

        {/* ── section.overview-final ── */}
        <Section className={styles.overviewFinal}>
          <ImgCard variant="card" caption="Final Overview Page" height="100vh">
            <OverviewSpendLifecycleEmbed />
          </ImgCard>
        </Section>

        {/* ── section.completion ── */}
        <Section className={styles.completion}>
          <QuoteBlock quote="With the overview refined, the software observability foundation for Phase 1 was complete." />
        </Section>

        {/* ── section.final-design ── */}
        <Section className={styles.finalAllSoftwareDesign}>
          <ImgCard
            variant="card"
            caption="Final All Software View"
            height="100vh"
          >
            <FinalAllSoftwareEmbed />
          </ImgCard>
        </Section>

        {/* ── section.impact ── */}
        <Section className={styles.impact}>
          <LabelBlock
            className={styles.impactTextBlock}
            size="display"
            label="Product & Business Impact"
            body="By successfully integrating software data, XOPS evolved its system of intelligence beyond device and employee lifecycle management,"
            support="unlocking a new revenue stream and a new dimension of value for our customers."
          />
          <Block size="lg" className={styles.impactDetailBlock}>
            Enterprise customers received their first actionable view of
            software waste, laying the foundation for autonomous license
            optimization.
          </Block>
        </Section>

        {/* ── section.goal-connections ── */}
        <Section className={styles.goalConnections}>
          <CardRow>
            <Card
              variant="filled"
              separator
              labelSize="xs"
              label="Platform Expansion"
              title="Established Software Observability (0 → 1)"
            >
              <Block size="md" color="tertiary">
                Established XOPS&apos;s first end-to-end software experience,
                evolving the platform beyond device and employee lifecycles into
                software observability and license intelligence.
              </Block>
            </Card>
            <Card
              variant="filled"
              separator
              labelSize="xs"
              label="Revenue & Sales Enablement"
              title="Unlocked a Sales-Critical Capability"
            >
              <Block size="md" color="tertiary">
                In production, the software overview, portfolio, and profile
                views became core artifacts in enterprise sales conversations,
                giving sales teams a live demonstration of the exact
                capabilities Fortune 500 prospects said they were missing and
                positioning XOPS as a differentiated enterprise solution.
              </Block>
            </Card>
            <Card
              variant="filled"
              separator
              labelSize="xs"
              label="Customer Financial Impact"
              title="Foundation for Large-Scale License Optimization"
            >
              <Block size="md" color="tertiary">
                This foundational work later powered advanced software
                optimization capabilities, contributing to millions in unused
                license savings for enterprise customers like{" "}
                <a
                  href="https://www.xops.io/case-study/broadcom"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Broadcom.
                </a>
              </Block>
            </Card>
          </CardRow>
          <div className={styles.goalConnectionsConnectorRow}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.goalConnectionsConnector} />
            ))}
          </div>
          <CardRow>
            <Card variant="outline" labelSize="xs" label="Goal 1">
              <Block size="md" color="tertiary">
                Delivered. A single source of truth for software ownership,
                spend, and health gave finance and IT a unified view for the
                first time, eliminating the data fragmentation that made
                confident decisions impossible.
              </Block>
            </Card>
            <Card variant="outline" labelSize="xs" label="Goal 2">
              <Block size="md" color="tertiary">
                Directional. The financial context and spend visibility
                delivered in Phase 1 established the data foundation. Deeper
                reconciliation against publisher and vendor records and
                spend-to-utilization connections at the department level are the
                natural next step for Phase 2.
              </Block>
            </Card>
            <Card variant="outline" labelSize="xs" label="Goal 3">
              <Block size="md" color="tertiary">
                Delivered. Inactive license distribution and reclamation
                workflows translated utilization data into dollar-denominated
                opportunities, giving enterprise customers like Broadcom the
                intelligence to act on unused licenses at scale.
              </Block>
            </Card>
          </CardRow>
        </Section>

        {/* ── section.reflection ── */}
        <Section className={styles.reflection}>
          <LabelBlock size="display" label="Reflection" />
          <CardRow>
            <Card variant="filled" title="End-to-End Accountability">
              <Block size="md" color="tertiary">
                Working closely with our Director of Product reinforced a rigor
                I applied to every decision: every data point had to earn its
                place, pressure-tested against its source, dependencies, and how
                a Fortune 500 team would actually act on it. That discipline
                sharpened engineering conversations and ensured every metric
                held up the moment a customer tried to use it.
              </Block>
            </Card>
            <Card
              variant="filled"
              title="Tangible Artifacts Move Teams Faster Than Discussion"
            >
              <Block size="md" color="tertiary">
                In a fast-moving startup, a real prototype surfaces gaps,
                opposing ideas, and priorities faster than any sketch or
                abstract debate. The goal isn&apos;t to be right, it&apos;s to
                put something concrete in front of cross-functional partners
                whose different mental models will pressure-test and strengthen
                the direction.
              </Block>
            </Card>
            <Card
              variant="filled"
              title="Parallel Prototyping as a Velocity Tool"
            >
              <Block size="md" color="tertiary">
                AI compressed the path from ambiguity to direction. Work that
                once took rounds of research synthesis, stakeholder meetings,
                and competitor hunting could be explored and validated in a
                fraction of the time.
              </Block>
            </Card>
            <Card variant="filled" title="Transparency as a Trust Foundation">
              <Block size="md" color="tertiary">
                Unifying data across systems creates a black-box risk, so I
                treated transparency as a design requirement. I surfaced metric
                definitions and calculations consistently across every view to
                reduce ambiguity.
              </Block>
            </Card>
          </CardRow>
        </Section>

        {/* ── section.next-steps ── */}
        <Section className={styles.nextSteps}>
          <LabelBlock
            className={styles.nextStepsTextBlock}
            size="display"
            label="Next Steps"
            body="Phase 1 made reclamation actionable at the software title level. Phase 2 expanded that intelligence to the portfolio, enabling vendor level comparisons across operational, compliance, and financial dashboards."
          />
        </Section>
      </main>
    </>
  );
}
