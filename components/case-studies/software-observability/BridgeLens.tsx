import LabelBlock from "@/components/LabelBlock";
import Block from "@/components/Block";
import styles from "./BridgeLens.module.css";

// Figma node 2385:964 — the bridge's lens block. The snaking line that wraps it
// is drawn by BridgeSpine, which measures this element's edges.
export default function BridgeLens() {
  return (
    <div className={styles.lens} data-bridge-lens="true">
      <LabelBlock
        size="display"
        body="Building a unified and actionable solution meant understanding the core questions through each role's distinct lens."
      />
      <Block size="2xl" reveal>
        I collected each role&apos;s questions across the four categories, then
        worked with experts to filter the critical ones that would define our
        MVP.
      </Block>
    </div>
  );
}
