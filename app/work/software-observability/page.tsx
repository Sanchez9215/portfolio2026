import dynamic from "next/dynamic";
import LazyMount from "@/components/LazyMount";
import BridgeOpener from "@/components/case-studies/software-observability/BridgeOpener";
import BridgeCards from "@/components/case-studies/software-observability/BridgeCards";
import SquareGrid from "@/components/case-studies/software-observability/SquareGrid";
import UsageBeamReveal from "@/components/case-studies/software-observability/UsageBeamReveal";
import BridgeLens from "@/components/case-studies/software-observability/BridgeLens";
import BridgeSpine from "@/components/case-studies/software-observability/BridgeSpine";
import Section from "@/components/Section";
import PriorityMountain from "@/components/case-studies/software-observability/PriorityMountain";
import PriorityRings from "@/components/case-studies/software-observability/PriorityRings";
import PageCenterLine from "@/components/case-studies/software-observability/PageCenterLine";
import ThresholdDropLine from "@/components/case-studies/software-observability/ThresholdDropLine";
import SapAribaLogo from "@/components/case-studies/software-observability/SapAribaLogo";
import FlexeraLogo from "@/components/case-studies/software-observability/FlexeraLogo";
import MicrosoftLogo from "@/components/case-studies/software-observability/MicrosoftLogo";
import OktaLogo from "@/components/case-studies/software-observability/OktaLogo";
import LabelBlock from "@/components/LabelBlock";
import Tooltip from "@/components/Tooltip";
import Block from "@/components/Block";
import Card from "@/components/Card";
import SectionIntroductionEntry from "@/components/case-studies/software-observability/SectionIntroductionEntry";
// import ContextBlock from "@/components/ContextBlock"; — unused while section.research / stakeholders are hidden
// import TheProblemPinnedScene from "@/components/case-studies/software-observability/TheProblemPinnedScene"; — section.the-problem removed
import QuoteBlock from "@/components/QuoteBlock";
import MetricCard from "@/components/MetricCard";
import Label from "@/components/Label";
import Title from "@/components/Title";
import SystemMapQuestionRow from "@/components/case-studies/software-observability/SystemMapQuestionRow";
// import ContentHub from "@/components/ContentHub"; — hidden, see section.data
import ImgCard from "@/components/ImgCard";
// import GapsIdentifiedHexScene from "@/components/case-studies/software-observability/GapsIdentifiedHexScene"; — hidden, see section.gaps-identified (reverted to original LabelBlock version)
// import SoftwareProfileIssuesHotspots from "@/components/case-studies/software-observability/SoftwareProfileIssuesHotspots"; — replaced by SoftwareProfileIssuesMap in section.profile-issue-annotations
import InsightsGoalsContent from "@/components/case-studies/software-observability/InsightsGoalsContent";
// import StakeholdersIntro from "@/components/case-studies/software-observability/StakeholdersIntro"; — unused while section.research / stakeholders are hidden
// import StakeholdersCards from "@/components/case-studies/software-observability/StakeholdersCards"; — unused while section.research / stakeholders are hidden
// import BuildingBlocksIntro from "@/components/case-studies/software-observability/BuildingBlocksIntro"; — unused while section.building-blocks-intro is hidden
// import BuildingBlocksMap from "@/components/case-studies/software-observability/BuildingBlocksMap"; — unused while section.building-blocks-map is hidden
import CardRow from "@/components/CardRow";
import CardColumn from "@/components/CardColumn";
import SectionImg from "@/components/SectionImg";
// import DataGlossaryTable from "@/components/case-studies/software-observability/DataGlossaryTable"; — hidden, see section.data-dictionary
import DataDictionaryScene from "@/components/case-studies/software-observability/DataDictionaryScene";
import FrameworkAdaptationEyes from "@/components/case-studies/software-observability/FrameworkAdaptationEyes";
// import ObservabilityEyes from "@/components/case-studies/software-observability/ObservabilityEyes"; — hidden, see section.observability-eyes below
// import FrameworkScene from "@/components/case-studies/software-observability/FrameworkScene"; — hidden, replaced by CubeLattice in section.framework
import CubeLattice from "@/components/case-studies/software-observability/CubeLattice";
import DataScrollController from "@/components/case-studies/software-observability/DataScrollController";
// import DataIntroText from "@/components/case-studies/software-observability/DataIntroText"; — hidden, see section.data
// import InactiveLicenseDistributionHotspots from "@/components/case-studies/software-observability/InactiveLicenseDistributionHotspots"; — replaced by InactiveLicenseDistributionMap in section.distribution-overview
import InactiveLicenseDistributionMap from "@/components/case-studies/software-observability/InactiveLicenseDistributionMap";
import GeneratingEventsContent from "@/components/case-studies/software-observability/GeneratingEventsContent";
import ToolTipsImages from "@/components/case-studies/software-observability/ToolTipsImages";
import styles from "./software-observability.module.css";

// Dynamically imported: these pull in the full XOPS design system + generated
// dataset (design-systems/xops/**). Splitting them into their own chunks keeps
// that weight out of the initial bundle the hero embed (SectionIntroduction)
// has to load behind. SSR stays on (default) so case-study content still
// renders in the initial HTML.
// OverviewPrototypeHotspots now walks Intent → Insights → (embed swaps to
// Prototype 02) → Decisions in one continuous sequence, with a Timeline
// sidebar tracking the phase — see OverviewPrototypeSection, which wraps both
// together (page.tsx itself is a server component and can't hold the shared
// milestone state). OverviewPrototype2Hotspots.tsx is left unreferenced/kept
// for reference — its own "Decision" hotspot data was migrated into
// OverviewPrototypeHotspots.tsx's DECISION_ANNOTATION_HOTSPOTS instead.
// TEMP: hidden — restore with the section.prototype-validation block below.
// const OverviewPrototypeSection = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/OverviewPrototypeSection"),
// );
const OverviewPrototype1QuestionsMap = dynamic(
  () =>
    import("@/components/case-studies/software-observability/OverviewPrototype1QuestionsMap"),
);
const OverviewPrototype1LearningsMap = dynamic(
  () =>
    import("@/components/case-studies/software-observability/OverviewPrototype1LearningsMap"),
);
const OverviewPrototype2DecisionsMap = dynamic(
  () =>
    import("@/components/case-studies/software-observability/OverviewPrototype2DecisionsMap"),
);
// const AllSoftwarePrototype1Map = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/AllSoftwarePrototype1Map"),
// ); — unused while section.all-software-prototype-1 is hidden
const AllSoftwareViewTabs = dynamic(
  () =>
    import("@/components/case-studies/software-observability/AllSoftwareViewTabs"),
);
// const SoftwareProfileIssuesMap = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/SoftwareProfileIssuesMap"),
// ); — unused while its section is hidden
// const AllSoftwareIssuesMap = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/AllSoftwareIssuesMap"),
// ); — unused while section.all-software-issues-embed is hidden
const AllSoftwareExperienceIssuesHotspots = dynamic(
  () =>
    import("@/components/case-studies/software-observability/AllSoftwareExperienceIssuesHotspots"),
);
// const SoftwareProfileLegacyHotspots = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/SoftwareProfileLegacyHotspots"),
// ); — replaced by SoftwareProfilePrototype1Map in section.profile-prototype-1
const SoftwareProfilePrototype1Map = dynamic(
  () =>
    import("@/components/case-studies/software-observability/SoftwareProfilePrototype1Map"),
);
// const SoftwareProfileFinalHotspots = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/SoftwareProfileFinalHotspots"),
// ); — replaced by SoftwareProfileFinalMap in section.profile-final-design
// const SoftwareProfileFinalMap = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/SoftwareProfileFinalMap"),
// ); — unused while its section is hidden
// const LifecycleTimelineHotspots = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/LifecycleTimelineHotspots"),
// ); — replaced by LifecycleTimelinePrototypeMap in section.final-lifecycle-timeline
const LifecycleTimelinePrototypeMap = dynamic(
  () =>
    import("@/components/case-studies/software-observability/LifecycleTimelinePrototypeMap"),
);
const LegacyExperienceEmbed = dynamic(
  () =>
    import("@/components/case-studies/software-observability/LegacyExperienceEmbed"),
);
const FinalExperienceEmbed = dynamic(
  () =>
    import("@/components/case-studies/software-observability/FinalExperienceEmbed"),
);
const FinalAllSoftwareEmbed = dynamic(
  () =>
    import("@/components/case-studies/software-observability/FinalAllSoftwareEmbed"),
);
// const OverviewSpendLifecycleEmbed = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/OverviewSpendLifecycleEmbed"),
// ); — unused while section.overview-final is hidden
// const RowAnatomyHotspots = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/RowAnatomyHotspots"),
// ); — replaced by RowAnatomyMap in section.table-anatomy
const RowAnatomyMap = dynamic(
  () =>
    import("@/components/case-studies/software-observability/RowAnatomyMap"),
);
// const QuestionsRolesPrism = dynamic(
//   () =>
//     import("@/components/case-studies/software-observability/QuestionsRolesPrism"),
// ); — hidden, prism approach replaced (section.bridge)

// Trimmed to intro + prototype/findings/final embeds. Flip to true to bring the
// cut sections back (context, research, framework, text-only labels, impact, reflection, archived).
const SHOW_CUT_SECTIONS = false;
// The contour-ring version (PriorityRings) of the mountain — tried and dropped.
const SHOW_PRIORITY_RINGS = false;

export default function SoftwareObservabilityPage() {
  return (
    <>
      {/* <Nav /> — hidden for now, not deleted */}
      <main style={{ paddingTop: "var(--nav-height)" }}>
        <SectionIntroductionEntry />

        {/* ── section.bridge ── */}
        {/* Connects the intro to Overview Prototype 1. Middle child is an empty
            slot (3rd child) for the questions × roles interaction (replaces lens research.png). */}
        <Section className={styles.bridge}>
          <BridgeOpener />
          <BridgeLens />
          {/* <LazyMount>
            <QuestionsRolesPrism />
          </LazyMount> — hidden, prism approach replaced */}
          <BridgeCards />
          {/* Integration-work detail block — hidden for now; that story moves to
              Data Limitations later:
          <Block size="2xl" reveal>
            Integration work for software hadn&apos;t started, so I didn&apos;t
            know what data we could count on. I built a first concept to find
            out what a dashboard could actually answer.
          </Block>
          */}
          <BridgeSpine />
        </Section>

        {/* ── section.insights-goals ── the bridge's line (BridgeCards' exit line)
            runs into this section's own spine, which draws on scroll. */}
        <Section className={styles.insightsGoals}>
          <InsightsGoalsContent />
        </Section>

        {SHOW_CUT_SECTIONS && (
          <>
            <Section className={styles.brief}>
              <LabelBlock
                size="display"
                label="Context"
                body={
                  <>
                    When a startup is at full velocity,
                    <br />
                    everything is urgent.
                  </>
                }
              />
              <Block size="2xl" reveal>
                High-priority initiatives fall through the cracks.
              </Block>
            </Section>

            {/* ── section.execution-risk ── */}
            <Section className={styles.executionRisk}>
              <LabelBlock
                size="display"
                label="An Execution Risk"
                body="Software Observability lived through word-of-mouth, with no roadmap placement and zero momentum."
              />
              <Block size="2xl" reveal>
                I took the initiative to drive it forward between projects.
              </Block>
            </Section>

            {/* ── section.business-opportunity ── */}
            <Section className={styles.businessOpportunity}>
              <LabelBlock
                size="display"
                label="The Business Opportunity"
                body="Software telemetry would unlock a new revenue line in Software Spend Governance and Optimization."
              />
              <Block size="2xl" reveal>
                While scaling XOPS’ provisioning beyond device hardware to
                complete the employee stack.
              </Block>
            </Section>

            {/* ── section.the-opportunity ── */}
            <Section className={styles.theOpportunity}>
              <div className={styles.theOpportunityLeft}>
                <div className={styles.theOpportunityText}>
                  <LabelBlock
                    size="display"
                    label="The Opportunity"
                    animate={false}
                    body="Enterprise software data is spread across disconnected systems."
                  />
                  <Block size="2xl" reveal>
                    Lack of a shared view leads IT &amp; Finance teams to waste
                    millions on unused licenses and compliance fines.
                  </Block>
                </div>
                <QuoteBlock
                  quote="Making aligned, confident decisions on spend, compliance and allocation..."
                  emphasis="nearly impossible."
                  variant="compact"
                />
              </div>
              <div className={styles.theOpportunityMetrics}>
                <MetricCard
                  className={styles.theOpportunityMetric}
                  value="50%"
                  label="Of all software licenses go unused or underutilized."
                />
                <MetricCard
                  className={styles.theOpportunityMetric}
                  value="$45M"
                  label="Average company cost in wasted spend."
                />
                <MetricCard
                  className={styles.theOpportunityMetric}
                  value="#"
                  label="Non Compliance Metric"
                />
              </div>
            </Section>

            {/* ── section.birds-eye-goal ── */}
            <Section className={styles.birdsEyeGoal}>
              <LabelBlock
                size="display"
                label="Birds Eye Goal"
                body="At a high level, the objective was clear."
              />
              <Block size="2xl" reveal>
                Identify unused licenses. Reclaim them for employees who will
                actually use them. Understand how many are needed in time to
                negotiate contracts or avoid penalties.
              </Block>
            </Section>

            {/* ── section.working-backwards ── */}
            <Section className={styles.workingBackwards}>
              <LabelBlock size="display" label="Working Backwards" />
              <Block size="2xl" reveal>
                What must we know to guarantee
                <br />
                zero waste, total compliance, and
                <br />
                optimized spend?
              </Block>
              <Label size="xl">The Fundamental questions</Label>
              <div>
                <Label size="xl" color="secondary">
                  What do we own?
                </Label>
                <Label size="xl" color="secondary">
                  What does it cost?
                </Label>
                <Label size="xl" color="secondary">
                  How is it used?
                </Label>
                <Label size="xl" color="secondary">
                  Are we compliant?
                </Label>
              </div>
            </Section>

            {/* ── section.navigating-ambiguity ── */}
            <Section className={styles.navigatingAmbiguity}>
              <Block size="2xl" reveal>
                What did I know about
                <br />
                software asset management?
              </Block>
              <p>0%</p>
              <LabelBlock
                size="display"
                label="Navigating Ambiguity"
                body="Using the questions as guidelines, I used Claude and Chat GPT to ramp up on the problem space."
              />
            </Section>

            {/* ── section.system-map ── */}
            <Section className={styles.systemMap}>
              <LabelBlock
                size="display"
                label="Building A Mental Map"
                body="I approached the problem by getting familiar with concepts and terminology."
              />
              <Block size="2xl" reveal>
                What do I need to understand to answer these questions?
              </Block>
              <SystemMapQuestionRow />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/software-observability/system-map.png"
                alt="System map: the concepts and terminology behind the four fundamental questions"
              />
            </Section>

            {/* ── section.our-target ── */}
            <Section className={styles.ourTarget}>
              <LabelBlock
                size="display"
                label="Our Target"
                body="Whose struggles to answer these questions on the daily?"
              />
              <Block size="2xl" reveal>
                3 roles at the core of the software
                <br />
                asset management ecosystem.
              </Block>
              <div>
                <div>
                  <Title size="lg">Software Asset Manager (SAM)</Title>
                  <Block size="xl">
                    Responsible for inventory, vendor compliance, and license
                    optimization, and defending the organization during vendor
                    audits.
                  </Block>
                </div>
                <div>
                  <Title size="lg">Financial Specialist</Title>
                  <Block size="xl">
                    Controls spend and budgets across departments and cost
                    centers, pushes to ensure max return on investments.
                  </Block>
                </div>
                <div>
                  <Title size="lg">IT Operations Manager</Title>
                  <Block size="xl">
                    Deploys, maintains, and retires software, while providing
                    the data SAM and Finance depend on.
                  </Block>
                </div>
              </div>
            </Section>

            {/* ── section.role-lens ── */}
            {/* Figma node 1:150. The label ("{Title}" in Figma) is still a
            placeholder there — omitted until a title is supplied. */}
            <Section className={styles.roleLens}>
              <LabelBlock
                size="display"
                body="Building a unified and actionable solution meant understanding the core questions through each role's distinct lens."
              />
              <Block size="2xl" reveal>
                I collected questions for each role across the 4 categories and
                set up a kick off call. The goal was to work closely with
                experts and filter out the critical ones that would define our
                MVP.
              </Block>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/software-observability/lens%20research.png"
                alt="Questions collected for each role across the four categories: what do we own, how is it used, what does it cost, are we compliant"
              />
            </Section>
          </>
        )}

        {/* data-framework-observability-wrap marks this wrap for
            FrameworkAdaptationEyes' light-beam layer, which is portaled here
            (not rendered inside its own local .wrap) so it can paint across
            both rows — a div's background/clip-path can't extend beyond its
            own box the way an <svg overflow="visible"> could, so the beam's
            paint surface has to actually be sized to the full wrap. */}
        <div
          className={styles.frameworkObservabilityWrap}
          data-framework-observability-wrap="true"
        >
          {/* ── section.success ── */}
          <Section className={styles.success}>
            <LabelBlock
              size="display"
              label="Defining Success"
              body="Stakeholders can identify unused software, what it’s costing them and where inactive licenses are concentrated to prioritize reclamation."
            />
            <SquareGrid className={styles.successSquares} />
            <UsageBeamReveal />
          </Section>

          {/* Framework Adaptation + Observability are two independent
              Sections again (un-merged) — the merge existed only for the
              now-abandoned FrameworkFunnelSpine mechanism. The beam/mask
              system doesn't need a shared stacking context, only this
              wrap's own position:relative to portal/measure against. */}
          {/* data-eyes-row marks this Section for FrameworkAdaptationEyes'
              own hub-y pin ("flush with this section's bottom"). */}
          <Section
            className={styles.frameworkAdaptationSection}
            data-eyes-row="true"
          >
            {/* data-framework-adaptation-text-block marks this block's
                real bottom edge — FrameworkAdaptationEyes' beam only
                starts tracking the mouse once the cursor passes below it.
                display:contents so the marker div has no box of its own. */}
            <div
              data-framework-adaptation-text-block="true"
              style={{ display: "contents" }}
            >
              <LabelBlock
                className={styles.frameworkAdaptationTextBlock}
                size="display"
                label="Framework Adaptation"
                body="To incorporate software into the platform I mapped it to XOPS’ observability framework."
              />
            </div>
            <FrameworkAdaptationEyes
              className={styles.frameworkAdaptationEyes}
              beamTextOverlayLabel="Observability"
              beamTextOverlayBody="Full visibility into enterprise assets, asset relationships, and end-to-end operations by unifying data across HR, IT, financial, and third-party systems."
            />
          </Section>

          <Section
            className={styles.observabilitySection}
            data-observability-row="true"
          >
            {/* data-observability-text-block marks the real text box for
                FrameworkAdaptationEyes' black-text mask overlay — it
                measures this box's real position/size to lay its cloned
                (solid black, clip-path-revealed) copy exactly on top.
                display:contents so the marker div itself has no box of
                its own and doesn't affect the grid layout. */}
            <div
              data-observability-text-block="true"
              style={{ display: "contents" }}
            >
              <LabelBlock
                className={styles.stakeholderIntroTextBlock}
                size="display"
                label="Observability"
                body="Full visibility into enterprise assets, asset relationships, and end-to-end operations by unifying data across HR, IT, financial, and third-party systems."
              />
            </div>
          </Section>

          {/* <Section className={styles.observabilityEyes}>
            <ObservabilityEyes />
          </Section> — hidden while Framework Adaptation's own eyes collage
          is being reworked, see progress.md */}
        </div>

        <Section className={styles.framework}>
          {/* <FrameworkScene className={styles.frameworkScene} /> — hidden,
              not deleted; replaced by the floating cube lattice. */}
          <LabelBlock size="display" body="The Framework." />
          <CubeLattice className={styles.frameworkLattice} />
        </Section>

        {/* ── section.data-limitations ── */}
        <Section className={styles.dataLimitations}>
          <LabelBlock
            size="display"
            label="Data Limitations"
            body={
              <>
                Due to higher priorities,
                <br />
                Data Ops had not started integration work.
              </>
            }
          />
          <Block size="2xl" reveal>
            I was in the dark in terms of the data we could count on. I reached
            out to our director of engineering for insight on what integrations
            would power this solution.
          </Block>
          <div className={styles.dataLimitationsIntegrations}>
            <SapAribaLogo
              className={`${styles.dataLimitationsLogo} ${styles.dataLimitationsLogoAriba}`}
            />
            <FlexeraLogo
              className={`${styles.dataLimitationsLogo} ${styles.dataLimitationsLogoFlexera}`}
            />
            <OktaLogo
              className={`${styles.dataLimitationsLogo} ${styles.dataLimitationsLogoOkta}`}
            />
            <MicrosoftLogo
              className={`${styles.dataLimitationsLogo} ${styles.dataLimitationsLogoMicrosoft}`}
            />
          </div>
          <ThresholdDropLine />
        </Section>

        {/* ── section.data-dictionary ── */}
        <Section className={styles.dataDictionary}>
          <DataDictionaryScene className={styles.dataDictionaryScene} />
          <PageCenterLine startBelow='[role="table"]' />
          {/* <DataGlossaryTable /> — hidden while the pinned scene above
              (scaffold build → real data-dictionary table) is being built;
              see PLAN.md beat 12 / progress.md. */}
        </Section>

        {/* ── section.starting-design ── */}
        <Section className={styles.startingDesign}>
          <LabelBlock
            size="display"
            label="Starting Design"
            body={
              <>
                I kicked off design with the modules entry point, the Software
                Overview.
              </>
            }
          />
          <PageCenterLine />
        </Section>

        {/* ── section.the-problem ── removed (animated pinned scene)
        <Section className={styles.theProblem}>
          <TheProblemPinnedScene className={styles.theProblemPinnedScene} />
        </Section>
        */}

        {/* ── section.research / section.stakeholders-intro / section.stakeholders-cards ── hidden
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
              body="Before setting time with experts who had dealt with these pain points, I used Claude and ChatGPT to ramp up on the problem space."
            />
          </div>
        </Section>

        <Section className={styles.stakeholdersIntro}>
          <StakeholdersIntro />
        </Section>

        <Section className={styles.stakeholdersCards}>
          <StakeholdersCards />
        </Section>
        */}

        {/* ── section.building-blocks-intro ── hidden
        <Section className={styles.buildingBlocksIntro}>
          <BuildingBlocksIntro />
        </Section>
        */}

        {/* ── section.building-blocks-map ── hidden
        <Section className={styles.buildingBlocksMap}>
          <BuildingBlocksMap />
        </Section>
        */}

        {/* section.data (old ContentHub-based hub-and-spoke version) hidden
            — superseded by section.building-blocks-map's SoftwareSystemMap
            (BuildingBlocksIntro + BuildingBlocksMap), see progress.md.
            Component + data untouched, not rendered. */}
        {/* <DataScrollController fadeIn centerFade>
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
        </DataScrollController> */}

        {/* <Section>
          <LabelBlock
            className={styles.modularDesignApproach}
            size="display"
            label="Designing for Data Uncertainty"
            body="Data Ops had higher priorities before software data integrations, and I didn't know which sources would survive."
            support="I took a modular design approach that would adapt regardless of any missing source."
          />
        </Section> */}

        {/* ── section.parallel-prototyping ── */}
        {/* <DataScrollController fadeIn>
          <Section className={styles.parallelPrototyping}>
            <div className={styles.parallelPrototypingLeft}>
              <LabelBlock
                size="display"
                label="Parallel Prototyping"
                body="I kicked off with the module's entry point, the Overview page, to establish the core metrics and visual language downstream layers would inherit."
              />
              <Block
                size="lg"
                className={styles.parallelPrototypingDetailBlock}
              >
                Using Claude and Figma Make, I generated prototypes to evaluate
                output convergence, logical data groupings, and IA patterns
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
        </DataScrollController> */}

        {/* ── section.overview-prototype-1 ── */}
        <Section className={styles.overviewPrototype1}>
          <LabelBlock
            className={styles.overviewPrototype1TextBlock}
            size="display"
            label="Overview Prototype 1"
            body="Intent: provide stakeholders with high-level portfolio health check that answered their most critical questions."
          />
          <Block
            size="2xl"
            reveal
            className={styles.overviewPrototype1DetailBlock}
          >
            I built this first concept to test my assumptions, answer open
            questions,
            <br />
            and share something tangible to align on.
          </Block>
          <PageCenterLine />
        </Section>

        {/* ── section.overview-prototype-1-questions ── */}
        <Section className={styles.overviewPrototype1Questions}>
          <LazyMount>
            <OverviewPrototype1QuestionsMap />
          </LazyMount>
          <PageCenterLine endAbove="[data-question-row]" />
          <PageCenterLine startBelow="[data-prototype-embed]" />
        </Section>

        {/* ── section.overview-prototype-1-limitations ── */}
        <Section className={styles.overviewPrototype1Limitations}>
          <LabelBlock
            className={styles.overviewPrototype1LimitationsTextBlock}
            size="display"
            label="Learnings"
            body="Through Prototype 01 I was able to identify gaps in my thinking about the problem space."
          />
          <PageCenterLine />
        </Section>

        {/* ── section.overview-prototype-1-learnings ── */}
        <Section className={styles.overviewPrototype1Learnings}>
          <LazyMount>
            <OverviewPrototype1LearningsMap />
          </LazyMount>
          <PageCenterLine />
        </Section>

        {/* ── section.overview-prototype-1-scope ── */}
        <Section className={styles.overviewPrototype1Scope}>
          <LabelBlock
            className={styles.overviewPrototype1ScopeTextBlock}
            size="display"
            label="Focusing the MVP"
            body="Working with DataOps and experts, we scoped the data to fit our timeline, priorities, and highest impact."
          />
          <PageCenterLine />
        </Section>

        {/* ── section.overview-prototype-1-mountain ── */}
        <Section className={styles.priorityMountain}>
          <PriorityMountain />
          <PageCenterLine endAbove="[data-priority-summit]" />
        </Section>

        {/* ── section.overview-prototype-1-priority-rings — hidden: the contour
            rings were dropped for the ridgeline mountain above
            (SHOW_PRIORITY_RINGS) ── */}
        {SHOW_PRIORITY_RINGS && (
          <Section className={styles.priorityRings}>
            <PriorityRings />
            <PageCenterLine endAbove="[data-ring-summit]" />
          </Section>
        )}

        {/* ── section.overview-prototype-2-intro ── */}
        <Section className={styles.overviewPrototype2Intro}>
          <LabelBlock
            className={styles.overviewPrototype2IntroTextBlock}
            size="display"
            label="Overview Prototype 2"
            body={
              <>
                The updated overview helped answer our{" "}
                <Tooltip
                  className={styles.overviewPrototype2IntroQuestions}
                  content={
                    <>
                      What do we own?
                      <br />
                      What does it cost?
                      <br />
                      How is it being used?
                      <br />
                      Are we compliant?
                    </>
                  }
                >
                  core questions
                </Tooltip>{" "}
                in a more specific and actionable way.
              </>
            }
          />
        </Section>

        {/* ── section.overview-prototype-2-decisions ── */}
        <Section className={styles.overviewPrototype2Decisions}>
          <LazyMount>
            <OverviewPrototype2DecisionsMap />
          </LazyMount>
          <PageCenterLine startBelow="[data-prototype-embed]" />
        </Section>

        {/* ── section.all-software-view ── */}
        <Section className={styles.allSoftwareView}>
          <LabelBlock
            className={styles.allSoftwareViewTextBlock}
            size="display"
            label="All Software View"
            body="A complete, filterable catalog of everything owned."
          />
          {/* Detail line hidden for now:
          <Block size="lg" className={styles.allSoftwareViewDetailBlock}>
            This would enable teams to isolate exactly the subset of titles they
            needed to act on.
          </Block>
          */}
          <PageCenterLine />
        </Section>

        {/* ── section.all-software-prototype ── */}
        <Section className={styles.allSoftwarePrototype}>
          <AllSoftwareViewTabs />
          <PageCenterLine endAbove="[data-prototype-tabs]" />
          <PageCenterLine startBelow="[data-all-software-embed]" />
        </Section>

        {/* ── section.table-anatomy ── (absorbed section.row-anatomy — embed sits
            128px below the label, in the same height-hugging section) */}
        <Section className={styles.tableAnatomy}>
          <LabelBlock
            className={styles.tableAnatomyLabel}
            size="display"
            label="Table Anatomy"
            body="Every column was redesigned to communicate status and urgency at a glance."
          />
          <Block size="2xl" reveal className={styles.tableAnatomyDetailBlock}>
            Tooltips providing label definitions and calculation transparency,
            so users can interpret data with confidence.
          </Block>
          <div className={styles.tableAnatomyEmbed}>
            <LazyMount>
              <RowAnatomyMap />
            </LazyMount>
          </div>
          <PageCenterLine endAbove="table" />
        </Section>

        {/* ── section.tool-tips-final-design ── */}
        <Section className={styles.toolTipsFinalDesign}>
          <ToolTipsImages />
          {/* Out of the bottom edge of the middle (Opportunity) tooltip card. */}
          <PageCenterLine startBelow="[data-tooltip-images] > :nth-child(2)" />
        </Section>

        {/* ── section.software-profile ── */}
        <Section className={styles.softwareProfile}>
          <LabelBlock
            className={styles.softwareProfileTextBlock}
            size="display"
            label="Software Profile"
            body="The source of truth for a unique asset, unifying identity data, organizational context, and operational history."
          />
          <PageCenterLine />
        </Section>

        {SHOW_CUT_SECTIONS && (
          <>
            {/* ── section.prototype-validation ── */}
            {/* TEMP: hidden — restore by uncommenting the Section below.
            Card player walks Intent → Insights → Prototype 02 switch →
            Decisions in one sequence; Timeline sidebar (right column) tracks
            the phase. See OverviewPrototypeSection. Previously a separate
            section.overview-prototypes below this one. */}
            {/* <Section className={styles.prototypeValidation}>
          <OverviewPrototypeSection />
        </Section> */}

            {/* ── section.gaps-identified ── hidden */}
            {/* <Section className={styles.gapsIdentified}>
          <div className={styles.gapsIdentifiedWrapper}>
            <LabelBlock
              className={styles.gapsIdentifiedTextBlock}
              size="display"
              body="With gaps identified and alignment forming, I had the confidence to start design work for the rest of the software experience."
              support=""
            />
          </div>
        </Section> */}

            {/* ── section.core-attribute-intent ── hidden
        <Section className={styles.coreAttributeIntent}>
          <LabelBlock
            className={styles.coreAttributeIntentTextBlock}
            size="display"
            label="Core Attribute Intent"
            body="The challenge was defining the core row-level attributes and data points,
            that would lead stakholders to action. This is where reclaiming would take place."
          />
        </Section>
        */}

            {/* ── section.all-software-prototype-1 ── hidden
        <Section className={styles.allSoftwarePrototype1}>
          <LazyMount>
            <AllSoftwarePrototype1Map />
          </LazyMount>
        </Section>
        */}

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
          </>
        )}

        {/* ── section.profile-prototype-1 ── */}
        {/* Absorbed section.software-profile-quote (quote now left column here).
            Static Assumption/Finding cards + image replaced by the live hotspot
            experience — see SoftwareProfileLegacyHotspots.tsx. */}
        <Section className={styles.profilePrototype1}>
          {/* Quote column hidden — landing-view intro + QuoteBlock:
              "I designed the landing view to immediately answer the two most
              critical questions:" / "What is this software costing us? Is it
              actually being used?" */}
          <LazyMount>
            <SoftwareProfilePrototype1Map />
          </LazyMount>
          <PageCenterLine endAbove="[data-question-row]" />
          <PageCenterLine startBelow="[data-profile-design-embed]" />
        </Section>

        <Section className={styles.lifecycleTimeline}>
          <LabelBlock
            className={styles.lifecycleTimelineTextBlock}
            size="display"
            label="Lifecycle Timeline"
            body="A record of key events across an asset's operational life."
          />
          <PageCenterLine />
        </Section>

        <Section className={styles.generatingEvents}>
          <GeneratingEventsContent />
        </Section>

        {/* ── section.final-lifecycle-timeline ── */}
        {/* Static before/after CardColumns + image replaced by the live hotspot
            experience — see LifecycleTimelineHotspots.tsx. */}
        <Section className={styles.finalLifecycleTimeline}>
          {/* Display block replaced by the embed's own caption (same label size
              as By Department / By Cost Center):
          <LabelBlock
            className={styles.finalLifecycleTimelineTextBlock}
            size="display"
            label="Lifecycle Timeline Prototype 01"
            body=""
          />
          */}
          <div className={styles.finalLifecycleTimelineEmbed}>
            <LazyMount>
              <LifecycleTimelinePrototypeMap />
            </LazyMount>
          </div>
        </Section>

        {SHOW_CUT_SECTIONS && (
          <>
            <DataScrollController fadeIn>
              <Section className={styles.unifyingSystems}>
                <div className={styles.unifyingSystemsLeft}>
                  <LabelBlock
                    size="display"
                    label="Unifying Systems"
                    body="Connecting software data to employee, device, and financial records was central to delivering on XOPS' core promise."
                  />
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
          </>
        )}

        {/* Setting a Blueprint + Testing The Experience — hidden for now (not removed). */}
        {SHOW_CUT_SECTIONS && (
          <>
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
                  stakeholder and leadership chats with a starting point to
                  align on what mattered, challenge what didn&apos;t, and define
                  direction collectively.
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
                <Block
                  size="lg"
                  className={styles.testingTheExperienceDetailBlock}
                >
                  Rather than validating each view in isolation, I wanted
                  feedback to reflect how teams would actually move through the
                  system, from portfolio to catalog to individual record, so
                  that gaps in continuity, logic, and data consistency would
                  surface naturally.
                </Block>
              </div>
              <ImgCard
                className={styles.testingTheExperienceImgCard}
                caption="Full Prototype"
                aspectRatio="16/9"
              >
                <LazyMount>
                  <LegacyExperienceEmbed />
                </LazyMount>
              </ImgCard>
            </Section>
          </>
        )}

        {SHOW_CUT_SECTIONS && (
          <>
            <Section className={styles.twoTrackValidation}>
              <LabelBlock
                size="display"
                label="Two Track Validation"
                body="Ongoing working sessions with our Director of Product kept design decisions aligned with our business strategy and buyer expectations. "
                className={styles.twoTrackValidationLabelBlock}
              />
              <Block size="lg" className={styles.twoTrackValidationDetailBlock}>
                Deeply involved in sales while leading engineering and
                integration efforts, they had a precise understanding of what
                enterprise teams needed and the technical depth to understand
                how to get there.
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
                  Each function experiences design through a different mental
                  model, surfacing issues that are easy to miss the longer one
                  stares at the same problem.
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
          </>
        )}

        {/* ── section.all-software-issues-embed ── hidden for now (not removed)
        <Section className={styles.allSoftwareIssuesEmbed}>
          <LazyMount>
            <AllSoftwareIssuesMap />
          </LazyMount>
        </Section>
        */}

        {SHOW_CUT_SECTIONS && (
          <>
            {/* ── section.all-software-final ── */}
            <Section className={styles.allSoftwareFinal}>
              <LabelBlock
                size="display"
                label="All Software: Final Design"
                body="The final design shifted the table from being a data display to a decision making surface."
              />
            </Section>
          </>
        )}

        {/* ── section.all-software-final-design ── hidden for now (not removed)
        <Section className={styles.allSoftwareFinalDesign}>
          <ImgCard caption="Final All Software View" height="100vh">
            <LazyMount>
              <FinalAllSoftwareEmbed />
            </LazyMount>
          </ImgCard>
        </Section>
        */}

        {SHOW_CUT_SECTIONS && (
          <>
            {/* ── section.tool-tips ── */}
            <Section className={styles.toolTips}>
              <LabelBlock
                size="display"
                label="Tooltips"
                body="Tooltips appear when hovering over information icons, providing metric definitions and calculation transparency, so users can interpret data with confidence."
                support=""
              />
            </Section>
          </>
        )}

        {SHOW_CUT_SECTIONS && (
          <>
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

            {/* ── section.software-profile-issues ── */}
            <Section className={styles.softwareProfileIssues}>
              <LabelBlock
                size="display"
                label="Software Profiles: Issues Identified"
                body="Profile designs suffered from similar patterns, key data presented in a way that was difficult to act on. Utilization, spend, and waste data felt scattered, forcing users to piece together insights that should have been immediate."
              />
            </Section>
          </>
        )}

        {/* ── section.profile-issue-annotations ── — hidden for now (not removed)
        <Section className={styles.profileIssueAnnotations}>
          <div className={styles.profileIssueAnnotationsEmbed}>
            <LazyMount>
              <SoftwareProfileIssuesMap />
            </LazyMount>
          </div>
        </Section>
        */}

        {SHOW_CUT_SECTIONS && (
          <>
            {/* ── section.software-profile-final ── */}
            <Section className={styles.softwareProfileFinal}>
              <LabelBlock
                size="display"
                label="Software Profiles: Final Design"
                body="The final design led with financial opportunity, guiding users through license ownership and utilization. Clear hierarchy and data grouping reduced cognitive load, for faster, more confident decision-making."
              />
            </Section>
          </>
        )}

        {/* ── section.profile-final-design ── — hidden for now (not removed)
        <Section className={styles.profileFinalDesign}>
          <div className={styles.profileFinalDesignEmbed}>
            <LazyMount>
              <SoftwareProfileFinalMap />
            </LazyMount>
          </div>
        </Section>
        */}

        {SHOW_CUT_SECTIONS && (
          <>
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
                      Delivering it accurately required a data collection
                      strategy and event definitions that depended on
                      integration output that wasn&apos;t ready at this phase.
                    </Block>
                  </Card>
                  <Card variant="filled" size="sm" label="Device Tab">
                    <Block size="sm" color="tertiary">
                      Deprioritized in favor of keeping Phase 1 focused on the
                      highest impact reclamation signals. Device-level data
                      would add depth in a future phase but wasn&apos;t
                      necessary to deliver on the core promise.
                    </Block>
                  </Card>
                  <Card variant="filled" size="sm" label="Financial Tab">
                    <Block size="sm" color="tertiary">
                      Contract terms, support costs, and historic spend are
                      often scattered across emails, invoices, spreadsheets, and
                      legal documents with no reliable integration path.
                      Shipping with incomplete records would have cost XOPS
                      customer trust during a critical evaluation period. Phase
                      2 required a data collection strategy before the tab could
                      deliver on its promise.
                    </Block>
                  </Card>
                </CardColumn>
              }
              image={
                <ImgCard
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
          </>
        )}

        {SHOW_CUT_SECTIONS && (
          <>
            {/* ── section.inactive-license-distribution ── */}
            <Section className={styles.inactiveLicenseDistribution}>
              <LabelBlock
                size="display"
                label="Inactive License Distribution"
                body="Phase 1's focus was lowering spend through confident license reclamation. To achieve this,"
                support="the employee tab evolved into an organizational breakdown of inactivity, showing where waste was concentrated and who to target first."
              />
            </Section>
          </>
        )}

        {/* ── section.distribution-overview ── */}
        {/* Static Assumption/Finding cards + images across all 3 static sections
            (section.distribution-overview / .inactive-by-departments /
            .inactive-by-costCenter) replaced by the live hotspot experience —
            see InactiveLicenseDistributionHotspots.tsx. */}
        <Section className={styles.inactiveLicenseDistributionEmbed}>
          <InactiveLicenseDistributionMap />
        </Section>

        {SHOW_CUT_SECTIONS && (
          <>
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
          </>
        )}

        {/* ── section.overview-final ── hidden for now (not removed)
        <Section className={styles.overviewFinal}>
          <ImgCard caption="Final Overview Page">
            <LazyMount>
              <OverviewSpendLifecycleEmbed />
            </LazyMount>
          </ImgCard>
        </Section>
        */}

        {/* ── section.final-experience ── */}
        <Section className={styles.finalExperience}>
          <ImgCard
            variant="embed"
            allowOverflow
            caption="Final Experience"
            height="100vh"
          >
            <LazyMount>
              <FinalExperienceEmbed />
            </LazyMount>
          </ImgCard>
        </Section>

        {SHOW_CUT_SECTIONS && (
          <>
            {/* ── section.completion ── */}
            <Section className={styles.completion}>
              <LabelBlock
                size="display"
                body="With the overview refined, the software observability foundation for Phase 1 was complete."
              />
            </Section>

            {/* ── section.final-design ── */}
            <Section className={styles.finalAllSoftwareDesign}>
              <ImgCard caption="Final All Software View" height="100vh">
                <LazyMount>
                  <FinalAllSoftwareEmbed />
                </LazyMount>
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
                    Established XOPS&apos;s first end-to-end software
                    experience, evolving the platform beyond device and employee
                    lifecycles into software observability and license
                    intelligence.
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
                    views became core artifacts in enterprise sales
                    conversations, giving sales teams a live demonstration of
                    the exact capabilities Fortune 500 prospects said they were
                    missing and positioning XOPS as a differentiated enterprise
                    solution.
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
                    optimization capabilities, contributing to millions in
                    unused license savings for enterprise customers like{" "}
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
                    spend-to-utilization connections at the department level are
                    the natural next step for Phase 2.
                  </Block>
                </Card>
                <Card variant="outline" labelSize="xs" label="Goal 3">
                  <Block size="md" color="tertiary">
                    Delivered. Inactive license distribution and reclamation
                    workflows translated utilization data into
                    dollar-denominated opportunities, giving enterprise
                    customers like Broadcom the intelligence to act on unused
                    licenses at scale.
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
                    Working closely with our Director of Product reinforced a
                    rigor I applied to every decision: every data point had to
                    earn its place, pressure-tested against its source,
                    dependencies, and how a Fortune 500 team would actually act
                    on it. That discipline sharpened engineering conversations
                    and ensured every metric held up the moment a customer tried
                    to use it.
                  </Block>
                </Card>
                <Card
                  variant="filled"
                  title="Tangible Artifacts Move Teams Faster Than Discussion"
                >
                  <Block size="md" color="tertiary">
                    In a fast-moving startup, a real prototype surfaces gaps,
                    opposing ideas, and priorities faster than any sketch or
                    abstract debate. The goal isn&apos;t to be right, it&apos;s
                    to put something concrete in front of cross-functional
                    partners whose different mental models will pressure-test
                    and strengthen the direction.
                  </Block>
                </Card>
                <Card
                  variant="filled"
                  title="Parallel Prototyping as a Velocity Tool"
                >
                  <Block size="md" color="tertiary">
                    AI compressed the path from ambiguity to direction. Work
                    that once took rounds of research synthesis, stakeholder
                    meetings, and competitor hunting could be explored and
                    validated in a fraction of the time.
                  </Block>
                </Card>
                <Card
                  variant="filled"
                  title="Transparency as a Trust Foundation"
                >
                  <Block size="md" color="tertiary">
                    Unifying data across systems creates a black-box risk, so I
                    treated transparency as a design requirement. I surfaced
                    metric definitions and calculations consistently across
                    every view to reduce ambiguity.
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

            {/* ── ARCHIVED — moved to the end of the case study ──
            Not Ready for Scale / Experience Issues, Customizable Columns /
            Custom Columns image. Kept in the page, not removed. */}
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
                <LazyMount>
                  <AllSoftwareExperienceIssuesHotspots />
                </LazyMount>
              </div>
            </Section>

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
              <ImgCard caption="Custom Columns">
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
          </>
        )}
      </main>
    </>
  );
}
