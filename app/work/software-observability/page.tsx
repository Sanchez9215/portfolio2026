import Nav from "@/components/Nav";
import Section from "@/components/Section";
import LabelBlock from "@/components/LabelBlock";
import TitleBlock from "@/components/TitleBlock";
import Block from "@/components/Block";
import Card from "@/components/Card";
import SectionIntroduction from "@/components/case-studies/software-observability/SectionIntroduction";
import ContextBlock from "@/components/ContextBlock";
import MessageThread from "@/components/case-studies/software-observability/MessageThread";
import QuoteBlock from "@/components/QuoteBlock";
import MetricCard from "@/components/MetricCard";
import InsightGoalRow from "@/components/InsightGoalRow";
import ContentHub from "@/components/ContentHub";
import ImgCard from "@/components/ImgCard";
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
          <Block size="lg" className={styles.theProblemDetailBlock}>
            This one came from leadership ping after a sales call...
          </Block>
          <MessageThread className={styles.theProblemMessageThread} />
          <LabelBlock
            className={styles.theProblemTextBlock}
            size="display"
            label="The Problem"
            body="Enterprise software data is spread across various disconnected systems."
            support="IT, Finance and Operations teams often make decisions working off of different numbers."
          />
        </Section>

        <Section>
          <QuoteBlock
            className={styles.userQuoteBlock}
            quote="Making aligned, confident decisions on spend, compliance and resource allocation..."
            emphasis="Nearly impossible."
          />
        </Section>

        <Section>
          <div className={styles.supportMetricsCards}>
            <MetricCard
              value="50%"
              label="Of all software licenses go unused or underutilized."
            />
            <MetricCard
              value="$45M"
              label="Average company cost in wasted spend."
            />
          </div>
        </Section>

        <Section>
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
            <div className={styles.researchTextBlockMds}>
              <LabelBlock
                size="xs"
                label="The Current Landscape"
                className={styles.researchTextBlockMd}
              />
              <LabelBlock
                size="xs"
                label="Data Points & Metrics"
                className={styles.researchTextBlockMd}
              />
              <LabelBlock
                size="xs"
                label="Terms & Definitions"
                className={styles.researchTextBlockMd}
              />
            </div>
          </div>
        </Section>

        <Section className={styles.insightsGoals}>
          <div className={styles.insightsGoalsLeft}>
            <LabelBlock
              size="display"
              label="Insights & Goals"
              body="That groundwork allowed me to close the knowledge gap fast,"
              support="letting us move past the basics and straight to decision making."
            />
            <div className={styles.insightsGoalsRows}>
              <InsightGoalRow
                items={[
                  {
                    label: "Insight 01",
                    title: "No one could define the true cost of software.",
                    body: "Total purchased licenses, assigned licenses, and spend lived in separate systems owned by separate teams. No unified view.",
                  },
                  {
                    label: "Goal",
                    title:
                      "One source of truth for ownership, spend, and health.",
                    body: "Unite licenses purchased, assignments, and spend in one view so finance and IT share the same numbers, and compliance risk is visible before it becomes a liability.",
                  },
                ]}
              />
              <InsightGoalRow
                items={[
                  {
                    label: "Insight 02",
                    title: "Renewals were a recurring financial risk.",
                    body: "Without consolidated spend data and proactive renewal visibility, contracts auto-renewed for unused software before anyone could intervene.",
                  },
                  {
                    label: "Goal",
                    title:
                      "Enable data confidence to negotiate, forecast, and allocate with authority.",
                    body: "Reconcile internal records against publisher and vendor data to expose discrepancies, and connect spend to utilization by department and employee so every budget conversation is backed by verified, operational intelligence.",
                  },
                ]}
              />
              <InsightGoalRow
                items={[
                  {
                    label: "Insight 03",
                    title: "Utilization data was rarely actionable.",
                    body: "Usage telemetry was pulled in isolation, but without connecting it to license ownership, compliance posture, and cost, it was just noise.",
                  },
                  {
                    label: "Goal",
                    title:
                      "Surface financial waste of unused licenses and make reclamation actionable.",
                    body: "Translate utilization data into dollar opportunity, identifying titles, departments, and employee segments with inactive, unassigned, or offboarded licenses so teams can prioritize reclamation with precision.",
                  },
                ]}
              />
            </div>
          </div>
          <ContextBlock side="right" className={styles.insightsGoalsContext}>
            <span className={styles.insightsGoalsContextTitle}>
              The Experts
            </span>
            <div className={styles.insightsGoalsDescriptions}>
              <TitleBlock
                size="md"
                title="Chief Product Officer"
                body="Former CIO"
              />
              <TitleBlock
                size="md"
                title="VP of Customer Operations"
                body="Former Director of IT & Technology Infrastructure"
              />
              <TitleBlock
                size="md"
                title="Director of Product"
                body="Former Lead Data & Gen AI Architect"
              />
            </div>
          </ContextBlock>
        </Section>

        <Section className={styles.frameworkAdaptation}>
          <LabelBlock
            className={styles.frameworkAdaptationTextBlock}
            size="display"
            label="Framework Adaptation & Data Requirements"
            body="The software experience needed to integrate seamlessly into the platform,"
            support="and the data points required to deliver on value propositions needed to be established."
          />
          <Block size="lg" className={styles.frameworkAdaptationDetailBlock}>
            I wasn&apos;t a SAM expert but I had a deep understanding of our
            product strategy when integrating any new lifecycle into the
            platform.
          </Block>
        </Section>

        <Section className={styles.observabilityFirst}>
          <div className={styles.observabilityFirstTop}>
            <ContextBlock
              side="none"
              className={styles.observabilityFirstContext}
            >
              <p className={styles.observabilityFirstHeading}>
                Observability first.
              </p>
              <Block size="lg">
                At XOPS, observability meant total visibility into the
                enterprise estate, its asset and employee relationships and
                operational truth by unifying HR, IT, and financial system data.
              </Block>
              <Block size="lg">
                This was achieved through a framework applied to every domain
                lifecycle managed within the platform...
              </Block>
            </ContextBlock>
            <div className={styles.observabilityFirstFramework}>
              <div className={styles.observabilityFirstFilledRow}>
                <Card variant="filled" label="Overview" labelSize="md">
                  <Block size="md" color="tertiary">
                    Real-time distribution view of assets across lifecycle
                    stages, filterable from a single worksite to global
                    operations.
                  </Block>
                </Card>
                <Card variant="filled" label="All Assets" labelSize="md">
                  <Block size="md" color="tertiary">
                    A complete, filterable view of every managed asset owned,
                    letting users segment by region, entity relationship,
                    financial allocation, or operational status.
                  </Block>
                </Card>
                <Card variant="filled" label="Assets Profile" labelSize="md">
                  <Block size="md" color="tertiary">
                    Combines core attributes, entity relationships and an
                    end-to-end lifecycle timeline in a single unified record.
                  </Block>
                </Card>
                <Card variant="filled" label="Insights" labelSize="md">
                  <Block size="md" color="tertiary">
                    Translates lifecycle data into clear trends and signals to
                    identify cost reduction opportunities and validate
                    autonomous execution.
                  </Block>
                </Card>
              </div>
              <div className={styles.observabilityFirstConnectorRow}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.observabilityFirstConnector} />
                ))}
              </div>
              <div className={styles.observabilityFirstOutlineRow}>
                <Card
                  variant="outline"
                  label="Software Overview"
                  labelSize="md"
                >
                  <Block size="md" color="tertiary">
                    A complete portfolio view of every title across lifecycle
                    stages, surfacing spend, compliance risk, and renewal
                    exposure at a glance.
                  </Block>
                </Card>
                <Card variant="outline" label="All Software" labelSize="md">
                  <Block size="md" color="tertiary">
                    A complete, filterable catalog of every title in the
                    organization, letting teams isolate exactly what they need
                    to act on.
                  </Block>
                </Card>
                <Card variant="outline" label="Software Profile" labelSize="md">
                  <Block size="md" color="tertiary">
                    A software title record that surfaces licensing posture,
                    utilization health, spend, and compliance standing.
                  </Block>
                </Card>
                <Card
                  variant="outline"
                  label="Software Insights"
                  labelSize="md"
                >
                  <Block size="md" color="tertiary">
                    Surfaces portfolio trends to identify optimization
                    opportunities, forecast renewals, and validate license
                    reclamations.
                  </Block>
                </Card>
              </div>
            </div>
          </div>
          <div className={styles.observabilityFirstBottom}>
            <p className={styles.observabilityFirstSupport}>
              This establishes the foundation that autonomous workflows and AI
              agents operate on.
            </p>
            <Block size="lg">
              Once software was adapted to our observability framework, we
              needed to establish the data foundation. What data points are
              critical for this to work?
            </Block>
          </div>
        </Section>

        <Section className={styles.data}>
          <ContextBlock side="none" className={styles.dataContext}>
            <p className={styles.dataHeading}>
              Data<span className={styles.dataTrackedPeriod}>.</span>
              Data<span className={styles.dataTrackedPeriod}>.</span>
              Data
            </p>
            <Block size="lg">
              Each data point represented a building block towards fulfilling
              goals. This was a baseline, not a final spec. As integration work
              progressed and the team learned what data was actually available,
              the model would continue to evolve.
            </Block>
          </ContextBlock>
          <div className={styles.dataContainer}>
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

        <Section>
          <div className={styles.dataOpsEditorialContent}>
            <p className={styles.dataOpsHeading}>
              Data Ops had higher priorities{" "}
              <span className={styles.dataOpsHeadingMuted}>
                before software data integrations.
              </span>
            </p>
            <Block size="lg" className={styles.dataOpsDetailBlock}>
              I didn&apos;t know which sources would be available, how complete
              the data would be, or whether every field would survive the
              integration.
            </Block>
          </div>
        </Section>

        <Section>
          <LabelBlock
            className={styles.modularDesignApproach}
            size="display"
            body="I took a modular design approach."
            support="Every view crafted so that removing a metric or entire data category would not break the experience or the story it was telling."
          />
        </Section>

        <Section className={styles.parallelPrototyping}>
          <div className={styles.parallelPrototypingRow}>
            <ImgCard
              className={styles.parallelPrototypingImgCard}
              caption="Claude Prototype"
            >
              <img
                src="/images/software-observability/claude-overview.jpg"
                alt="Claude AI prototype of the Overview page"
              />
            </ImgCard>
            <LabelBlock
              className={styles.parallelPrototypingTextBlock}
              size="display"
              label="Parallel Prototyping"
              body="I kicked off design with the Overview page. The module's entry point."
              support="This would establish core metrics, visual language, and data groupings that everything else would inherit."
            />
          </div>
          <div className={styles.parallelPrototypingRow}>
            <Block size="lg" className={styles.parallelPrototypingDetailBlock}>
              I generated a set of parallel prototypes in both Claude and Figma
              Make to identify where outputs converged, validate logical data
              groupings, and pressure-test the information architecture before
              committing to a direction.
            </Block>
            <ImgCard
              className={styles.parallelPrototypingMultiCard}
              images={[
                {
                  src: "/images/software-observability/figma-overview-01.jpg",
                  alt: "Figma Prototype 01",
                  caption: "Figma Prototype 01",
                },
                {
                  src: "/images/software-observability/figma-overview-02.jpg",
                  alt: "Figma Prototype 02",
                  caption: "Figma Prototype 02",
                },
              ]}
            />
          </div>
        </Section>

        <Section className={styles.prototypeValidation}>
          <div className={styles.prototypeValidationTopRow}>
            <div className={styles.prototypeValidationTopLeft}>
              <LabelBlock
                className={styles.prototypeValidationTextBlock}
                size="display"
                label="Prototype Validation"
                body="Using the outputs as strategic context, I created a prototype"
                support="to focus the direction through sessions with leadership and subject matter experts."
              />
              <Block
                size="lg"
                className={styles.prototypeValidationTopLeftBody}
              >
                The feedback I received pushed beyond surface-level fixes, it
                surfaced domain nuances that only come from people who have
                lived inside these systems.
              </Block>
            </div>
            <div className={styles.prototypeValidationTopRight}>
              <Block size="lg">
                To align internal stakeholders on terminology and concepts, I
                paired the latest prototype with a living glossary and intent
                document covering metric definitions, calculations, and the
                intent behind each data point presented.
              </Block>
            </div>
          </div>
          <div className={styles.prototypeValidationContainer}>
            <ol className={styles.prototypeValidationColumn}>
              <Card variant="filled" size="sm" label="Geographic Filtering">
                <TitleBlock
                  size="sm"
                  title="Assumption"
                  body="Regional segmentation was a natural extension of the structure used across every lifecycle overview."
                />
                <TitleBlock
                  size="sm"
                  title="Finding"
                  body="Software usage rights, compliance obligations, and contractual terms vary significantly by jurisdiction, making regional data misleading without the proper legal and data foundation."
                />
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Licensing Model Breakdown"
              >
                <TitleBlock
                  size="sm"
                  title="Assumption"
                  body="Commercial vs open source licensing models were a meaningful high level portfolio split."
                />
                <TitleBlock
                  size="sm"
                  title="Finding"
                  body="The design was missing key licensing models like subscription, perpetual, usage-based, and enterprise agreement. Analyzing software titles by licensing model was critical to knowing how cost behaves and where financial exposure lives."
                />
              </Card>
              <Card variant="filled" size="sm" label="Expiring Licenses">
                <TitleBlock
                  size="sm"
                  title="Assumption"
                  body="License expiration was a straightforward renewal signal worth surfacing."
                />
                <TitleBlock
                  size="sm"
                  title="Finding"
                  body="Enterprise agreements operate at the contract level, not the license level, making per-license expiration irrelevant."
                />
              </Card>
              <Card variant="filled" size="sm" label="Compliance Granularity">
                <TitleBlock
                  size="sm"
                  title="Assumption"
                  body="Compliance risk mapped to a defined set of states, compliant, at risk, non-compliant."
                />
                <TitleBlock
                  size="sm"
                  title="Finding"
                  body="The conditions that create compliance exposure were more specific than the status groupings communicated."
                />
              </Card>
            </ol>
            <ImgCard
              className={styles.prototypeValidationImgCard}
              caption="Overview Prototype 01"
            >
              <img
                src="/images/software-observability/img.prototype-1.jpg"
                alt="Prototype 01 — Software Overview"
              />
            </ImgCard>
            <ol className={styles.prototypeValidationColumn}>
              <Card variant="filled" size="sm" label="Inactivity Threshold">
                <TitleBlock
                  size="sm"
                  title="Assumption"
                  body="Thresholds vary across software types. I set 60 days as a starting point for discussion."
                />
                <TitleBlock
                  size="sm"
                  title="Finding"
                  body="A consistent baseline mattered more than precision per title at this phase, precision could come later through configurability."
                />
              </Card>
              <Card variant="filled" size="sm" label="Over-Assignment">
                <TitleBlock
                  size="sm"
                  title="Assumption"
                  body="License pools had hard limits and couldn't be exceeded."
                />
                <TitleBlock
                  size="sm"
                  title="Finding"
                  body="Over-assignment is possible, and non-compliance can trigger publisher audits costing organizations millions."
                />
              </Card>
              <Card variant="filled" size="sm" label="Stage-Level Alerting">
                <TitleBlock
                  size="sm"
                  title="Assumption"
                  body="Surfacing proactive alerts at the stage level would differentiate the platform as a system of intelligence."
                />
                <TitleBlock
                  size="sm"
                  title="Finding"
                  body="The direction resonated strongly with leadership as a product differentiator."
                />
              </Card>
              <Card variant="filled" size="sm" label="Lifecycle Stage Terms">
                <TitleBlock
                  size="sm"
                  title="Assumption"
                  body="A standard set of lifecycle stages could be synthesized from industry research."
                />
                <TitleBlock
                  size="sm"
                  title="Finding"
                  body="No single industry standard exists. Stage sets varied widely across tools and organizations."
                />
              </Card>
            </ol>
          </div>
          <div className={styles.prototypeValidationContainer}>
            <ol className={styles.prototypeValidationColumn}>
              <Card variant="filled" size="sm" label="Geographic Filtering">
                <TitleBlock
                  size="sm"
                  title="Decision"
                  body="Regional segmentation was a natural extension of the structure used across every lifecycle overview."
                />
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Licensing Model Breakdown"
              >
                <TitleBlock
                  size="sm"
                  title="Decision"
                  body="Redesigned the License Overview card to break down total spend by licensing model, and elevated its placement in the hierarchy to reflect its value as a primary signal for portfolio decisions."
                />
              </Card>
              <Card variant="filled" size="sm" label="Expiring Licenses">
                <TitleBlock
                  size="sm"
                  title="Decision"
                  body="Removed expiring license insight and reframed it to be based on contract-level data. Renewal data would be found within the Renewal stage tab and eventually within Software Profiles."
                />
              </Card>
              <Card variant="filled" size="sm" label="Compliance Granularity">
                <TitleBlock
                  size="sm"
                  title="Decision"
                  body="Replaced status-based groupings with non-compliance type, surfacing shadow IT, version and edition mismatch, and duplicate assignments as the primary signals."
                />
              </Card>
            </ol>
            <ImgCard
              className={styles.prototypeValidationImgCard}
              caption="Overview Prototype 02"
            >
              <img
                src="/images/software-observability/overview-prototype-2.jpg"
                alt="Prototype 02 — Software Overview"
              />
            </ImgCard>
            <ol className={styles.prototypeValidationColumn}>
              <Card variant="filled" size="sm" label="Inactivity Threshold">
                <TitleBlock
                  size="sm"
                  title="Decision"
                  body="Adjusted default to 90 days as the baseline until title-level configurability could be introduced. Educational tooltips later surfaced this information so users understood how inactivity was being measured."
                />
              </Card>
              <Card variant="filled" size="sm" label="Over-Assignment">
                <TitleBlock
                  size="sm"
                  title="Decision"
                  body="Added over-assignment as a distinct utilization state across the data model and all views."
                />
              </Card>
              <Card variant="filled" size="sm" label="Stage-Level Alerting">
                <TitleBlock
                  size="sm"
                  title="Decision"
                  body="Deprioritized for the current phase and flagged as a strategic opportunity for a later release."
                />
              </Card>
              <Card variant="filled" size="sm" label="Lifecycle Stages">
                <TitleBlock
                  size="sm"
                  title="Decision"
                  body="Refined the stage set in close collaboration with our CPO to accurately reflect the operational language and pain points of enterprise IT organizations."
                />
              </Card>
            </ol>
          </div>
        </Section>

        <Section>
          <div className={styles.gapsIdentifiedWrapper}>
            <LabelBlock
              className={styles.gapsIdentifiedTextBlock}
              size="display"
              body="With gaps identified and alignment forming, I had the confidence to"
              support=" start design work for the rest of the software experience."
            />
            <Block size="lg" className={styles.gapsIdentifiedDetailBlock}>
              As I finalized the Overview page designs, I kicked off designs for
              the All Software view and Software Profiles.
            </Block>
          </div>
        </Section>

        <Section className={styles.allSoftwareView}>
          <LabelBlock
            className={styles.allSoftwareViewTextBlock}
            size="display"
            label="All Software View"
            body="The design would be consistent with the structure established across all asset views."
            support="The intent was to provide a complete, filterable catalog of all software owned by the organization."
          />
          <Block size="lg" className={styles.allSoftwareViewDetailBlock}>
            This would enable teams to isolate exactly the subset they need to
            act on through a rich set of filterable attributes.
          </Block>
        </Section>

        <Section className={styles.coreAttributeIntent}>
          <LabelBlock
            className={styles.coreAttributeIntentTextBlock}
            size="display"
            label="Core Attribute Intent"
            body="The challenge was defining the right row-level attributes and data points,"
            support="so teams could find what they needed fast without friction."
          />
          <div className={styles.coreAttributeIntentWrapper}>
            <div className={styles.coreAttributeIntentAnnotationGroupTop}>
              <Card
                variant="filled"
                size="sm"
                label="Spend-first Prioritization"
              >
                <Block size="sm" color="tertiary">
                  The table is sorted by total spend to surface the highest
                  financial exposure, helping teams focus effort where savings
                  potential is greatest.
                </Block>
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Identification Columns"
              >
                <Block size="sm" color="tertiary">
                  Software name, Publisher and Vendor provide essential context
                  for identifying what the product is, who created it, and who
                  it was purchased through.
                </Block>
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Category"
              >
                <Block size="sm" color="tertiary">
                  Groups software by function, letting teams compare spend and
                  utilization across similar tools and identify redundant tools
                  for consolidation opportunities.
                </Block>
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Total Spend"
              >
                <Block size="sm" color="tertiary">
                  Quantifies what the organization is paying for each title,
                  establishing the financial baseline every other signal gets
                  measured against.
                </Block>
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Licenses Purchased"
              >
                <Block size="sm" color="tertiary">
                  Establishes the baseline for total licenses owned to support
                  allocation decisions, onboarding planning, and renewal
                  negotiations.
                </Block>
              </Card>
            </div>
            <div className={styles.coreAttributeIntentRow}>
              <ImgCard
                className={styles.coreAttributeIntentImgCard}
                caption="All Software Prototype 01"
              >
                <img
                  src="/images/software-observability/all-software-prototype-1.jpg"
                  alt="All Software Prototype 01"
                />
              </ImgCard>
              <div className={styles.coreAttributeIntentAnnotationGroupRight}>
                <Card variant="filled" label="Utilization Rate" size="sm">
                  <Block size="sm" color="tertiary">
                    Represents the percentage of licenses actively being used,
                    allowing teams to identify reclamation opportunities, inform
                    renewal decisions and negotiation strategy.
                  </Block>
                </Card>
                <Card variant="filled" label="Inactive" size="sm">
                  <Block size="sm" color="tertiary">
                    Quantifies the number of assigned licenses not being
                    actively used (no activity in last 90 days), identifying
                    reclamation opportunities and wasted spend.
                  </Block>
                </Card>
                <Card variant="filled" label="Renewal" size="sm">
                  <Block size="sm" color="tertiary">
                    Provides urgency context for renewal decisions before a
                    contract renews.
                  </Block>
                </Card>
              </div>
            </div>
          </div>
        </Section>

        <Section className={styles.softwareProfile}>
          <LabelBlock
            className={styles.softwareProfileTextBlock}
            size="display"
            label="Software Profile"
            body="Profiles serve as the single source of truth for every title,"
            support="combining identity data, organizational context, and a complete operational history into one record."
          />
          <Block size="lg" className={styles.softwareProfileDetailBlock}>
            The intent was to make a software title&apos;s record the definitive
            place to assess licensing, utilization health, spend, compliance,
            and lifecycle events so teams could act on waste and make confident
            renewal and optimization decisions without leaving the platform.
          </Block>
        </Section>

        <Section>
          <div className={styles.softwareProfileQuoteWrapper}>
            <Block size="lg" className={styles.softwareProfileQuoteDetailBlock}>
              I designed the landing view to immediately answer the two most
              critical questions:
            </Block>
            <QuoteBlock quote="What is this software costing us and is it actually being used?" />
          </div>
        </Section>

        <Section className={styles.utilizationAndCost}>
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
        </Section>

        <Section>
          <div
            className="col-span-full grid items-start"
            style={{ gridTemplateColumns: '2fr 8fr 2fr', gap: 'var(--spacing-3xl)' }}
          >
            <div className="flex flex-col" style={{ gap: 'var(--spacing-xl)' }}>
              <Card variant="filled" size="sm" label="Product Identity">
                <Block size="sm" color="tertiary">
                  Aside from providing product identification at a glance,
                  publisher logos strengthen the overall product polish and
                  visual clarity of the platform.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Ownership">
                <Block size="sm" color="tertiary">
                  Ownership fields established a clear chain of custody,
                  maintaining consistency with ownership patterns used across
                  other asset profiles.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Purchased Licenses">
                <Block size="sm" color="tertiary">
                  Presents entitlement scale and contract spend upfront as
                  baseline context, helping stakeholders understand investment
                  size before reviewing usage performance.
                </Block>
              </Card>
            </div>
            <ImgCard caption="Profile Prototype 01">
              <img
                src="/images/software-observability/profile-prototype-1.jpg"
                alt="Profile Prototype 01"
              />
            </ImgCard>
            <ol
              className="flex flex-col"
              style={{ listStyle: 'none', margin: 0, padding: 0, gap: 'var(--spacing-xl)' }}
            >
              <Card variant="filled" size="sm" label="Utilization Summary">
                <Block size="sm" color="tertiary">
                  Prioritized as the first actionable data type as it
                  immediately reveals waste, enabling quick identification of
                  reclaim opportunities without deep system dependency.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Cost Impact">
                <Block size="sm" color="tertiary">
                  Translates unused licenses into financial impact to drive
                  fast, data-backed renewal and optimization decisions.
                </Block>
              </Card>
            </ol>
          </div>
        </Section>

        <Section className={styles.lifecycleTimeline}>
          <LabelBlock
            className={styles.lifecycleTimelineTextBlock}
            size="display"
            label="Lifecycle Timeline"
            body="A single source of truth for key events across an asset's operational life, giving teams visibility into..."
          />
          <div className={styles.lifecycleTimelineWrapper}>
            <div className={styles.lifecycleTimelineItem}>
              <p className={styles.lifecycleTimelineWord}>What?</p>
            </div>
            <div className={styles.lifecycleTimelineItem}>
              <p className={styles.lifecycleTimelineWord}>When?</p>
            </div>
            <div className={styles.lifecycleTimelineItem}>
              <p className={styles.lifecycleTimelineWord}>Why?</p>
            </div>
            <div className={styles.lifecycleTimelineItem}>
              <p className={styles.lifecycleTimelineWord}>Who?</p>
              <Block size="lg" color="secondary">
                ...without piecing together data from disconnected systems.
              </Block>
            </div>
          </div>
        </Section>

        <Section className={styles.generatingEvents}>
          <LabelBlock
            className={styles.generatingEventsTextBlock}
            size="display"
            label="Generating Realistic Events"
            body="I took the initiative"
            support="to establish lifecycle event definitions independently."
          />
          <Block size="md" className={styles.generatingEventsDetailBlock}>
            Definitions were still pending from the product and integration
            side. Taking this step allowed me to build a tangible prototype that
            enabled productive cross-functional conversations.
          </Block>
        </Section>

        <Section className={styles.eventIterations}>
          <ImgCard className={styles.eventIterationsImgCard} caption="Claude Output">
            <img
              src="/images/software-observability/claude-timeline-output.jpg"
              alt="Claude Output — lifecycle events"
            />
          </ImgCard>
          <ImgCard className={styles.eventIterationsImgCard} caption="Timeline Prototype">
            <img
              src="/images/software-observability/timeline-prototype-1.jpg"
              alt="Timeline Prototype"
            />
          </ImgCard>
          <ContextBlock side="none" className={styles.eventIterationsContext}>
            <Block size="md" color="secondary">
              Reaching a realistic, scalable set of timeline events took some iterations.
            </Block>
            <div className={styles.eventIterationsItems}>
              <TitleBlock
                size="md"
                title="Initial Generation"
                body="Using the latest software lifecycle stages developed with our CPO, I leveraged Claude to generate a set of key events spanning a software title's life."
              />
              <TitleBlock
                size="md"
                title="The Problem"
                body="The output was events that were too granular for enterprise scale and too specific to generalize across other software titles."
              />
              <TitleBlock
                size="md"
                title="Refining for Scale"
                body="I worked with Claude to refine the events into reusable aggregate milestones, structured to lead with a quantitative data point where applicable, for easy digestion and scale comprehension."
              />
            </div>
          </ContextBlock>
        </Section>

        <Section className={styles.unifyingSystems}>
          <div className={styles.unifyingSystemsTopRow}>
            <div className={styles.unifyingSystemsEditorialContent}>
              <LabelBlock
                size="display"
                label="Unifying Systems"
                body="Connecting software data to employee, device, and financial"
                support="records was central to delivering on XOPS' core promise."
              />
              <Block size="lg">
                To define what each relationship should surface, I took the same
                parallel prototyping approach as the Overview page, prompting
                Claude &amp; Figma Make with the problem context and stakeholder
                needs to generate directional variations.
              </Block>
            </div>
            <ImgCard
              className={styles.unifyingSystemsProfileCard}
              caption="Claude Profile Prototype"
            >
              <img
                src="/images/software-observability/img.claude-profile.jpg"
                alt="Claude Profile Prototype"
              />
            </ImgCard>
          </div>
          <ImgCard
            images={[
              {
                src: "/images/software-observability/figma-profile-01.jpg",
                alt: "Figma Employee Tab Prototype",
                caption: "Figma Employee Tab Prototype",
              },
              {
                src: "/images/software-observability/figma-profile-02.jpg",
                alt: "Figma Financial Tab Prototype",
                caption: "Figma Financial Tab Prototype",
              },
              {
                src: "/images/software-observability/figma-profile-03.jpg",
                alt: "Figma Devices Tab Prototype",
                caption: "Figma Devices Tab Prototype",
              },
            ]}
          />
        </Section>
      </main>
    </>
  );
}
