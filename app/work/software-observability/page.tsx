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
import CardRow from "@/components/CardRow";
import CardColumn from "@/components/CardColumn";
import SectionImg from "@/components/SectionImg";
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
              <CardRow>
                <Card variant="filled" label="Overview" labelSize="sm">
                  <Block size="sm" color="tertiary">
                    Real-time distribution view of assets across lifecycle
                    stages, filterable from a single worksite to global
                    operations.
                  </Block>
                </Card>
                <Card variant="filled" label="All Assets" labelSize="sm">
                  <Block size="sm" color="tertiary">
                    A complete, filterable view of every managed asset owned,
                    letting users segment by region, entity relationship,
                    financial allocation, or operational status.
                  </Block>
                </Card>
                <Card variant="filled" label="Assets Profile" labelSize="sm">
                  <Block size="sm" color="tertiary">
                    Combines core attributes, entity relationships and an
                    end-to-end lifecycle timeline in a single unified record.
                  </Block>
                </Card>
                <Card variant="filled" label="Insights" labelSize="sm">
                  <Block size="sm" color="tertiary">
                    Translates lifecycle data into clear trends and signals to
                    identify cost reduction opportunities and validate
                    autonomous execution.
                  </Block>
                </Card>
              </CardRow>
              <div className={styles.observabilityFirstConnectorRow}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.observabilityFirstConnector} />
                ))}
              </div>
              <CardRow>
                <Card
                  variant="outline"
                  label="Software Overview"
                  labelSize="sm"
                >
                  <Block size="sm" color="tertiary">
                    A complete portfolio view of every title across lifecycle
                    stages, surfacing spend, compliance risk, and renewal
                    exposure at a glance.
                  </Block>
                </Card>
                <Card variant="outline" label="All Software" labelSize="sm">
                  <Block size="sm" color="tertiary">
                    A complete, filterable catalog of every title in the
                    organization, letting teams isolate exactly what they need
                    to act on.
                  </Block>
                </Card>
                <Card variant="outline" label="Software Profile" labelSize="sm">
                  <Block size="sm" color="tertiary">
                    A software title record that surfaces licensing posture,
                    utilization health, spend, and compliance standing.
                  </Block>
                </Card>
                <Card
                  variant="outline"
                  label="Software Insights"
                  labelSize="sm"
                >
                  <Block size="sm" color="tertiary">
                    Surfaces portfolio trends to identify optimization
                    opportunities, forecast renewals, and validate license
                    reclamations.
                  </Block>
                </Card>
              </CardRow>
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
        </Section>

        {/* ── section.overview-prototype-1 ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
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
            </CardColumn>
          }
          image={
            <ImgCard caption="Overview Prototype 01">
              <img
                src="/images/software-observability/img.prototype-1.jpg"
                alt="Prototype 01 — Software Overview"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
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
            </CardColumn>
          }
        />

        {/* ── section.overview-prototype-2 ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
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
            </CardColumn>
          }
          image={
            <ImgCard caption="Overview Prototype 02">
              <img
                src="/images/software-observability/overview-prototype-2.jpg"
                alt="Prototype 02 — Software Overview"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
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
            </CardColumn>
          }
        />

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
        </Section>

        {/* ── section.all-software-prototype-1 ── */}
        <SectionImg
          layout="corner"
          before={
            <CardRow size="span2">
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
              <Card variant="filled" size="sm" label="Identification Columns">
                <Block size="sm" color="tertiary">
                  Software name, Publisher and Vendor provide essential context
                  for identifying what the product is, who created it, and who
                  it was purchased through.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Category">
                <Block size="sm" color="tertiary">
                  Groups software by function, letting teams compare spend and
                  utilization across similar tools and identify redundant tools
                  for consolidation opportunities.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Total Spend">
                <Block size="sm" color="tertiary">
                  Quantifies what the organization is paying for each title,
                  establishing the financial baseline every other signal gets
                  measured against.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Licenses Purchased">
                <Block size="sm" color="tertiary">
                  Establishes the baseline for total licenses owned to support
                  allocation decisions, onboarding planning, and renewal
                  negotiations.
                </Block>
              </Card>
            </CardRow>
          }
          image={
            <ImgCard caption="All Software Prototype 01">
              <img
                src="/images/software-observability/all-software-prototype-1.jpg"
                alt="All Software Prototype 01"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
              <Card variant="filled" label="Utilization Rate" size="sm">
                <Block size="sm" color="tertiary">
                  Represents the percentage of licenses actively being used,
                  allowing teams to identify reclamation opportunities, inform
                  renewal decisions and negotiation strategy.
                </Block>
              </Card>
              <Card variant="filled" label="Inactive" size="sm">
                <Block size="sm" color="tertiary">
                  Quantifies the number of assigned licenses not being actively
                  used (no activity in last 90 days), identifying reclamation
                  opportunities and wasted spend.
                </Block>
              </Card>
              <Card variant="filled" label="Renewal" size="sm">
                <Block size="sm" color="tertiary">
                  Provides urgency context for renewal decisions before a
                  contract renews.
                </Block>
              </Card>
            </CardColumn>
          }
        />

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

        {/* ── section.profile-prototype-1 ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
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
            </CardColumn>
          }
          image={
            <ImgCard caption="Profile Prototype 01">
              <img
                src="/images/software-observability/profile-prototype-1.jpg"
                alt="Profile Prototype 01"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
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
            </CardColumn>
          }
        />

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

        {/* ── section.event-iterations ── */}
        <SectionImg
          layout="row"
          image={[
            <ImgCard caption="Claude Output">
              <img
                src="/images/software-observability/claude-timeline-output.jpg"
                alt="Claude Output — lifecycle events"
              />
            </ImgCard>,
            <ImgCard caption="Timeline Prototype">
              <img
                src="/images/software-observability/timeline-prototype-1.jpg"
                alt="Timeline Prototype"
              />
            </ImgCard>,
          ]}
          after={
            <div className={styles.eventIterationsAfter}>
              <LabelBlock
                size="display"
                body="Reaching a realistic, scalable set of timeline events took some iterations."
              />
              <CardColumn>
                <Card variant="filled" size="sm" label="Initial Generation">
                  <Block size="sm" color="tertiary">
                    Using the latest software lifecycle stages developed with
                    our CPO, I leveraged Claude to generate a set of key events
                    spanning a software title's life.
                  </Block>
                </Card>
                <Card variant="filled" size="sm" label="The Problem">
                  <Block size="sm" color="tertiary">
                    The output was events that were too granular for enterprise
                    scale and too specific to generalize across other software
                    titles.
                  </Block>
                </Card>
                <Card variant="filled" size="sm" label="Refining for Scale">
                  <Block size="sm" color="tertiary">
                    I worked with Claude to refine the events into reusable
                    aggregate milestones, structured to lead with a quantitative
                    data point where applicable, for easy digestion and scale
                    comprehension.
                  </Block>
                </Card>
              </CardColumn>
            </div>
          }
        />

        {/* ── section.final-lifecycle-timeline ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
              <Card variant="filled" size="sm" label="Event Search">
                <Block size="sm" color="tertiary">
                  Enables users to instantly locate specific lifecycle events
                  without manually scrolling through long timelines.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Event Filtering by Type">
                <Block size="sm" color="tertiary">
                  Reduces noise by allowing teams to focus only on events
                  relevant to their role or task.
                </Block>
              </Card>
            </CardColumn>
          }
          image={
            <ImgCard caption="Profile Prototype 02">
              <img
                src="/images/software-observability/timeline-prototype-2.jpg"
                alt="Profile Prototype 02 — Final Lifecycle Timeline"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
              <Card variant="filled" size="sm" label="Timeline Navigation">
                <Block size="sm" color="tertiary">
                  Built for enterprise customers managing multi-year
                  subscription histories, enabling effortless navigation across
                  extensive event timelines.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Milestone Based Events">
                <Block size="sm" color="tertiary">
                  Milestone events reduce noise and surface lifecycle moments
                  that provide operational insights. I proposed introducing
                  custom configuration in a future iteration so enterprises
                  could define milestone triggers that reflect their unique
                  workflows and performance measures.
                </Block>
              </Card>
            </CardColumn>
          }
        />

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

        <Section className={styles.unifyingSystemsPrototype}>
          <LabelBlock
            size="display"
            label="Setting a Blueprint"
            body="I synthesized my findings "
            support="into a prototype that covered the data relationships."
          />
          <Block size="lg">
            The intent wasn&apos;t to present a solution, but to walk into
            stakeholder and leadership chats with a starting point to align on
            what mattered, challenge what didn&apos;t, and define direction
            collectively.
          </Block>
          <ImgCard
            images={[
              {
                src: "/images/software-observability/employee-tab.jpg",
                alt: "Employee Tab Prototype",
                caption: "Employee Tab Prototype",
              },
              {
                src: "/images/software-observability/financial-tab.jpg",
                alt: "Financial Tab Prototype",
                caption: "Financial Tab Prototype",
              },
              {
                src: "/images/software-observability/device-tab.jpg",
                alt: "Figma Devices Tab Prototype",
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
              body="With the Overview finalized, I connected the All Software and Profile views into a"
              support="single navigable prototype to test them as one experience."
            />
            <Block size="lg" className={styles.testingTheExperienceDetailBlock}>
              Rather than validating each view in isolation, I wanted feedback
              to reflect how teams would actually move through the system, from
              portfolio to catalog to individual record, so that gaps in
              continuity, logic, and data consistency would surface naturally.
            </Block>
          </div>
          <ImgCard
            className={styles.testingTheExperienceImgCard}
            caption="Full Prototype"
          />
        </Section>

        <Section className={styles.twoTrackValidation}>
          <LabelBlock
            size="display"
            label="Two Track Validation"
            body="Ongoing working sessions with our Director of Product "
            support="kept design decisions aligned with our business strategy and buyer expectations."
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
              body="In parallel, I facilitated cross-functional sessions "
              support="with customer success, PMs, engineers, and strategic advisors"
            />
            <Block
              size="lg"
              className={styles.crossFunctionalSessionsDetailBlock}
            >
              Bringing multiple perspectives at once is a strategy I rely on
              throughout my process. Each function experiences design through a
              different mental model, surfacing issues that are easy to miss the
              longer one stares at the same problem.
            </Block>
          </div>
        </Section>

        <Section>
          <LabelBlock
            className={styles.phaseOneClarityTextBlock}
            size="display"
            body="Together these sessions gave me clarity"
            support="to finalize designs for Phase 1 Software Observability."
          />
        </Section>

        <Section className={styles.allSoftwareDirectionIssues}>
          <LabelBlock
            size="display"
            label="All Software: Issues Identified"
            body="Early designs surfaced the right data"
            support="but failed to make it actionable at a glance."
          />
        </Section>

        {/* ── section.direction-issue-annotations ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
              <Card variant="filled" size="sm" label="Product Identification">
                <Block size="sm" color="tertiary">
                  Without strong visual cues or clear identifiers, users had to
                  pause and interpret instead of immediately recognizing the
                  product they were reviewing.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="System Wide Scaling">
                <Block size="sm" color="tertiary">
                  As software data evolved to support additional personas,
                  tables would eventually overflow pushing key information into
                  horizontal scroll. This was already visible in other lifecycle
                  views and needed a scalable fix.
                </Block>
              </Card>
            </CardColumn>
          }
          image={
            <ImgCard caption="All Software Prototype">
              <img
                src="/images/software-observability/all-software-prototype-1.jpg"
                alt="All Software Prototype — Issues Identified"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
              <Card variant="filled" size="sm" label="Renewal">
                <Block size="sm" color="tertiary">
                  A date alone doesn't reveal whether something is approaching,
                  at risk, or past due, forcing users to interpret urgency
                  mentally.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Disconnected Metrics">
                <Block size="sm" color="tertiary">
                  Too many numbers, not enough meaning. Metrics shown without
                  relationship context failed to guide decisions or communicate
                  value.
                </Block>
              </Card>
            </CardColumn>
          }
        />

        <Section className={styles.allSoftwareExperienceIssues}>
          <LabelBlock
            size="display"
            body="While solving for All Software, I captured issues with our current table experience"
            support="that would compound as we introduced more lifecycle data to the platform."
          />
        </Section>

        {/* ── section.experience-issue-annotations ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
              <Card variant="filled" size="sm" label="Asset Count Badge">
                <Block size="sm" color="tertiary">
                  The count badge was heavy visually, pulling focus away from
                  primary content and adding weight to already dense views.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Region Filters">
                <Block size="sm" color="tertiary">
                  Region filters shared the same styling as primary and
                  secondary buttons despite serving a different role.
                </Block>
              </Card>
            </CardColumn>
          }
          image={
            <ImgCard caption="All Software Prototype">
              <img
                src="/images/software-observability/all-software-prototype-1.jpg"
                alt="All Software Prototype — Experience Issues"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
              <Card variant="filled" size="sm" label="Table Headers">
                <Block size="sm" color="tertiary">
                  Table headers used a filled style that added unnecessary
                  density and signaled a legacy pattern.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Row Heights">
                <Block size="sm" color="tertiary">
                  Tight rows cause entries and columns to blend together,
                  forcing users to work harder to scan and interpret large
                  volumes of data.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Data Overload">
                <Block size="sm" color="tertiary">
                  As more data was introduced, tables would become increasingly
                  dense, pushing critical data behind horizontal scroll and
                  making it harder for teams to find what they needed to act on.
                </Block>
              </Card>
            </CardColumn>
          }
        />

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
          <ImgCard caption="AI Prototype 02">
            <img
              src="/images/software-observability/all-software-final.jpg"
              alt="All Software Final Design"
            />
          </ImgCard>
        </Section>

        {/* ── section.table-anatomy ── */}
        <Section className={styles.tableAnatomy}>
          <LabelBlock
            size="display"
            label="Table Anatomy"
            body="All elements were redesigned to communicate status and urgency at a glance."
          />
        </Section>

        {/* ── section.row-anatomy ── */}
        <SectionImg
          layout="column"
          before={
            <CardRow>
              <Card variant="filled" size="sm" label="Publisher Logo">
                <Block size="sm" color="tertiary">
                  Publisher logos created an immediate visual anchor, helping
                  users recognize the product instantly without needing to read
                  the full text.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Utilization Tag">
                <Block size="sm" color="tertiary">
                  Color-coded tags made usage status instantly scannable,
                  without requiring interpretation of raw numbers.
                </Block>
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Supporting Baseline Metrics"
              >
                <Block size="sm" color="tertiary">
                  Displaying ownership and spend at the end of the row anchors
                  the evaluation, giving teams an immediate sense of usage,
                  waste, and opportunity scale.
                </Block>
              </Card>
            </CardRow>
          }
          image={
            <ImgCard caption="AI Prototype 02">
              <img
                src="/images/software-observability/row-anatomy.jpg"
                alt="Table Row Anatomy"
              />
            </ImgCard>
          }
          after={
            <CardRow>
              <Card variant="filled" size="sm" label="Vendor">
                <Block size="sm" color="tertiary">
                  Vendor provides instant procurement context, helping teams
                  link spend, renewals, and contracts without digging through
                  external systems.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Category">
                <Block size="sm" color="tertiary">
                  Category gives clarity as to what the tool does, reducing
                  interpretation effort and helping identify redundant software.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Opportunity">
                <Block size="sm" color="tertiary">
                  Introducing a monetary "opportunity" value turned low usage
                  into clear business impact, helping teams quickly understand
                  where savings exist.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Renewal Date + Countdown">
                <Block size="sm" color="tertiary">
                  Pairing renewal dates with a countdown provided urgency at a
                  glance, reducing the cognitive load of mentally calculating
                  proximity.
                </Block>
              </Card>
            </CardRow>
          }
        />

        {/* ── section.tool-tips ── */}
        <Section className={styles.toolTips}>
          <LabelBlock
            size="display"
            label="Tooltips"
            body="Tooltips appear when hovering over information icons, providing"
            support="metric definitions and calculation transparency, so users can interpret data with confidence."
          />
        </Section>

        {/* ── section.tool-tips-final-design ── */}
        <Section className={styles.toolTipsFinalDesign}>
          <ImgCard
            images={[
              {
                src: "/images/software-observability/utilization-tooltip.jpg",
                caption: "Utilization Tool Tip",
              },
              {
                src: "/images/software-observability/opportunity-tooltip.jpg",
                caption: "Opportunity Tool Tip",
              },
              {
                src: "/images/software-observability/renewal-tooltip.jpg",
                caption: "Renewal Tool Tip",
              },
            ]}
          />
        </Section>

        {/* ── section.design-system-refinements ── */}
        <Section className={styles.designSystemRefinements}>
          <LabelBlock
            className={styles.designSystemRefinementsTextBlock}
            size="display"
            label="Design System Refinements"
            body="More data meant increasingly cluttered views. This led me to propose system-wide refinements"
            support="that kept views clear, modern, and easy to navigate."
          />
          <Block
            className={styles.designSystemRefinementsDetailBlock}
            size="md"
          >
            These updates reduced visual weight, improved scannability, and
            ensured users could quickly focus on what mattered.
          </Block>
        </Section>

        {/* ── section.refinement-annotations ── */}
        <SectionImg
          layout="corner"
          before={
            <CardRow size="span2">
              <Card variant="filled" size="sm" label="Asset Count Badge">
                <Block size="sm" color="tertiary">
                  Lightening the style keeps the count visible without
                  overpowering the hierarchy.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Region Filters">
                <Block size="sm" color="tertiary">
                  Region filters previously used primary/secondary button
                  styling, updating their treatment aligned them with tab
                  behavior, reinforcing consistent UI patterns.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="New Filter Treatment">
                <Block size="sm" color="tertiary">
                  Switching to a clear "Add Filter" button improves recognition
                  and reduces cognitive friction when users want to refine the
                  data set.
                </Block>
              </Card>
            </CardRow>
          }
          image={
            <ImgCard caption="AI Prototype 02">
              <img
                src="/images/software-observability/system-refinements.jpg"
                alt="System Refinements"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
              <Card variant="filled" size="sm" label="Table Headers">
                <Block size="sm" color="tertiary">
                  Removing the header fill lightened the view and introduced
                  more whitespace, creating a cleaner, more modern table that is
                  easier to scan and avoids the dense, legacy feel.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Side Scroll">
                <Block size="sm" color="tertiary">
                  Adding a subtle drop shadow communicates overflow without
                  visual distraction, helping users understand where additional
                  content exists.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Row Heights">
                <Block size="sm" color="tertiary">
                  More generous row spacing reduces crowding and increases
                  visual rhythm, allowing users to process information with less
                  cognitive strain.
                </Block>
              </Card>
            </CardColumn>
          }
        />

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
          <ImgCard caption="AI Prototype 02">
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

        {/* ── section.software-profile-issues ── */}
        <Section className={styles.softwareProfileIssues}>
          <LabelBlock
            size="display"
            label="Software Profiles: Issues Identified"
            body="Profile designs suffered from similar patterns, key data presented in a way that was difficult to act on. Utilization, spend, and waste data felt scattered, forcing users to piece together insights that should have been immediate."
          />
        </Section>

        {/* ── section.profile-issue-annotations ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
              <Card variant="filled" size="sm" label="Mixed Metrics">
                <Block size="sm" color="tertiary">
                  Mixing cost, volume, and utilization metrics in the same block
                  disrupts the flow of information, forcing users to piece
                  together related data on their own.
                </Block>
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Primary & Secondary Owner"
              >
                <Block size="sm" color="tertiary">
                  The header gives prominent space to show operational contacts
                  whose roles rarely influence strategic renewal or licensing
                  decisions.
                </Block>
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Low Visibility of Underutilized Cost"
              >
                <Block size="sm" color="tertiary">
                  Educational tooltips help clarify status definitions and
                  calculation logic in context, improving transparency and
                  decision speed by reducing ambiguity.
                </Block>
              </Card>
            </CardColumn>
          }
          image={
            <ImgCard caption="Profile Prototype 01">
              <img
                src="/images/software-observability/profile-prototype-1.jpg"
                alt="Profile Prototype 01 — Software Profile Issues"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
              <Card variant="filled" size="sm" label="No Renewal Context">
                <Block size="sm" color="tertiary">
                  No renewal date or renewal urgency indicator, leaving teams
                  without essential context for timing reclamation efforts or
                  planning negotiations.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Purchased Licenses">
                <Block size="sm" color="tertiary">
                  Presented in isolation, leaving users to mentally link it to
                  the Assigned, Active, Inactive, and Unassigned figures beneath
                  it.
                </Block>
              </Card>
            </CardColumn>
          }
        />

        {/* ── section.software-profile-final ── */}
        <Section className={styles.softwareProfileFinal}>
          <LabelBlock
            size="display"
            label="Software Profiles: Final Design"
            body="The final design led with financial opportunity, guiding users through license ownership and utilization. Clear hierarchy and data grouping reduced cognitive load, for faster, more confident decision-making."
          />
        </Section>

        {/* ── section.profile-final-design ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
              <Card
                variant="filled"
                size="sm"
                label="Opportunity-First Framing"
              >
                <Block size="sm" color="tertiary">
                  Leading with the opportunity banner allows teams to
                  immediately understand savings potential before analyzing
                  usage details.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Opportunity Breakdown">
                <Block size="sm" color="tertiary">
                  Splits opportunity into inactive and unassigned licenses,
                  clarifying which savings come from reclamation and which point
                  to over-purchasing or operational inefficiencies.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Licenses Purchased">
                <Block size="sm" color="tertiary">
                  Creates a single ownership snapshot. Grouping assigned,
                  unassigned, and utilization, enables faster understanding of
                  license distribution.
                </Block>
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Improving Time-to-Insight"
              >
                <Block size="sm" color="tertiary">
                  Color-coded status tags convert raw metrics into instant
                  visual signals, helping teams quickly identify underuse,
                  over-assignment, and risk without manual interpretation.
                </Block>
              </Card>
            </CardColumn>
          }
          image={
            <ImgCard caption="Final Software Profile Design">
              <img
                src="/images/software-observability/software-profile-final.jpg"
                alt="Final Software Profile Design"
              />
            </ImgCard>
          }
          after={
            <CardColumn>
              <Card
                variant="filled"
                size="sm"
                label="Decision-Ready Renewal Context"
              >
                <Block size="sm" color="tertiary">
                  Surfaces renewal timing at the top to establish urgency and
                  frame optimization decisions within a clear contractual
                  timeline.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Vendor & Account Contact">
                <Block size="sm" color="tertiary">
                  Replaces ambiguous internal ownership with vendor and account
                  contact, aligning the profile with how enterprise licensing
                  decisions are actually made.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Utilization Status">
                <Block size="sm" color="tertiary">
                  Simplified labels and drill-downs let teams quickly access the
                  users holding licenses in each state, supporting faster review
                  and targeted reclamation.
                </Block>
              </Card>
              <Card
                variant="filled"
                size="sm"
                label="Explicit Reclaimable Total"
              >
                <Block size="sm" color="tertiary">
                  Explicitly labeling unused licenses (inactive + unassigned)
                  removes mental math and gives teams a clear, defensible target
                  for reclamation or contract renegotiation.
                </Block>
              </Card>
            </CardColumn>
          }
        />

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
        <SectionImg
          layout="row"
          before={
            <CardColumn>
              <Card
                variant="filled"
                size="sm"
                label="Operational vs Budget Ownership"
              >
                <Block size="sm" color="tertiary">
                  Compare department and cost center perspectives to understand
                  where inactivity occurs and who controls the spend.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Top Contributors Focus">
                <Block size="sm" color="tertiary">
                  Surfaces the departments or cost centers responsible for the
                  largest share of inactivity, prioritizing action where it
                  delivers the highest return.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Metric Selection">
                <Block size="sm" color="tertiary">
                  Lets teams move instantly from scope to impact, switching
                  between volume and dollars without changing context or losing
                  focus.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Employee Drill-Down">
                <Block size="sm" color="tertiary">
                  Transforms aggregated insight into action by exposing the
                  exact users behind inactive licenses, enabling targeted
                  reclamation and clean handoffs.
                </Block>
              </Card>
            </CardColumn>
          }
          image={
            <ImgCard
              images={[
                {
                  src: "/images/software-observability/charts.jpg",
                  alt: "Charts — Inactive License Distribution",
                  caption: "Charts",
                },
                {
                  src: "/images/software-observability/analysis.jpg",
                  alt: "Analysis — Inactive License Distribution",
                  caption: "Analysis",
                },
                {
                  src: "/images/software-observability/drill-down.jpg",
                  alt: "Drill-Down — Inactive License Distribution",
                  caption: "Drill-Down",
                },
              ]}
            />
          }
        />

        {/* ── section.inactive-by-departments ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
              <Card
                variant="filled"
                size="sm"
                label="Licenses Assigned to Former Employees"
              >
                <Block size="sm" color="tertiary">
                  Licenses assigned to former employees surface the most
                  immediate, low-risk reclamation opportunities and expose gaps
                  between HR, IT, and Finance offboarding workflows.
                </Block>
              </Card>
            </CardColumn>
          }
          image={
            <ImgCard
              images={[
                {
                  src: "/images/software-observability/department-count.jpg",
                  alt: "Department by Count",
                  caption: "Department by Count",
                },
                {
                  src: "/images/software-observability/department-cost.jpg",
                  alt: "Department by Cost",
                  caption: "Department by Cost",
                },
              ]}
            />
          }
          after={
            <CardColumn>
              <Card variant="filled" size="sm" label="Cost Breakdown">
                <Block size="sm" color="tertiary">
                  Converts inactive license volume into annualized dollar impact
                  using unit pricing, helping leaders prioritize action based on
                  financial exposure and budget ownership rather than raw
                  counts.
                </Block>
              </Card>
            </CardColumn>
          }
        />

        {/* ── section.inactive-by-costCenter ── */}
        <SectionImg
          layout="row"
          before={
            <CardColumn>
              <Card variant="filled" size="sm" label="Count Breakdown">
                <Block size="sm" color="tertiary">
                  Surfaces where inactive licenses concentrate by budget owner,
                  revealing which cost centers are driving the largest volume of
                  unused access.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Cost Breakdown">
                <Block size="sm" color="tertiary">
                  Converts inactive license volume into annualized dollar
                  impact, allowing teams to prioritize reclamation by financial
                  exposure rather than raw count.
                </Block>
              </Card>
              <Card variant="filled" size="sm" label="Employee Drilldown">
                <Block size="sm" color="tertiary">
                  Turns cost center insights into action by exposing the exact
                  employees holding inactive licenses, enabling fast reclamation
                  and clean operational follow-through.
                </Block>
              </Card>
            </CardColumn>
          }
          image={
            <ImgCard
              images={[
                {
                  src: "/images/software-observability/costCenter-count.jpg",
                  alt: "Cost Center by Count",
                  caption: "Cost Center by Count",
                },
                {
                  src: "/images/software-observability/costCenter-cost.jpg",
                  alt: "Cost Center by Cost",
                  caption: "Cost Center by Cost",
                },
                {
                  src: "/images/software-observability/costCenter-drillDown.jpg",
                  alt: "Employees by Cost Center",
                  caption: "Employees by Cost Center",
                },
              ]}
            />
          }
        />

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
          <ImgCard caption="Final Overview Page">
            <img
              src="/images/software-observability/overview-final.jpg"
              alt="Final Overview Page"
            />
          </ImgCard>
        </Section>

        {/* ── section.completion ── */}
        <Section className={styles.completion}>
          <QuoteBlock quote="With the overview refined, the software observability foundation for Phase 1 was complete." />
        </Section>

        {/* ── section.final-design ── */}
        <Section className={styles.finalAllSoftwareDesign}>
          <ImgCard caption="Final All Software View">
            <img
              src="/images/software-observability/final-design.jpg"
              alt="Final All Software View"
            />
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
            Enterprise customers received their first actionable view of software waste, laying the foundation for autonomous license optimization.
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
                Established XOPS&apos;s first end-to-end software experience, evolving the platform beyond device and employee lifecycles into software observability and license intelligence.
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
                In production, the software overview, portfolio, and profile views became core artifacts in enterprise sales conversations, giving sales teams a live demonstration of the exact capabilities Fortune 500 prospects said they were missing and positioning XOPS as a differentiated enterprise solution.
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
                This foundational work later powered advanced software optimization capabilities, contributing to millions in unused license savings for enterprise customers like{" "}
                <a href="https://www.xops.io/case-study/broadcom" target="_blank" rel="noopener noreferrer">
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
                Delivered. A single source of truth for software ownership, spend, and health gave finance and IT a unified view for the first time, eliminating the data fragmentation that made confident decisions impossible.
              </Block>
            </Card>
            <Card variant="outline" labelSize="xs" label="Goal 2">
              <Block size="md" color="tertiary">
                Directional. The financial context and spend visibility delivered in Phase 1 established the data foundation. Deeper reconciliation against publisher and vendor records and spend-to-utilization connections at the department level are the natural next step for Phase 2.
              </Block>
            </Card>
            <Card variant="outline" labelSize="xs" label="Goal 3">
              <Block size="md" color="tertiary">
                Delivered. Inactive license distribution and reclamation workflows translated utilization data into dollar-denominated opportunities, giving enterprise customers like Broadcom the intelligence to act on unused licenses at scale.
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
                Working closely with our Director of Product reinforced a rigor I applied to every decision: every data point had to earn its place, pressure-tested against its source, dependencies, and how a Fortune 500 team would actually act on it. That discipline sharpened engineering conversations and ensured every metric held up the moment a customer tried to use it.
              </Block>
            </Card>
            <Card variant="filled" title="Tangible Artifacts Move Teams Faster Than Discussion">
              <Block size="md" color="tertiary">
                In a fast-moving startup, a real prototype surfaces gaps, opposing ideas, and priorities faster than any sketch or abstract debate. The goal isn&apos;t to be right, it&apos;s to put something concrete in front of cross-functional partners whose different mental models will pressure-test and strengthen the direction.
              </Block>
            </Card>
            <Card variant="filled" title="Parallel Prototyping as a Velocity Tool">
              <Block size="md" color="tertiary">
                AI compressed the path from ambiguity to direction. Work that once took rounds of research synthesis, stakeholder meetings, and competitor hunting could be explored and validated in a fraction of the time.
              </Block>
            </Card>
            <Card variant="filled" title="Transparency as a Trust Foundation">
              <Block size="md" color="tertiary">
                Unifying data across systems creates a black-box risk, so I treated transparency as a design requirement. I surfaced metric definitions and calculations consistently across every view to reduce ambiguity.
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
