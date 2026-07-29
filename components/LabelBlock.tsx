"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Label from "./Label";
import Block from "./Block";
import styles from "./LabelBlock.module.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

const WORD_DURATION = 0.25;
const WORD_STAGGER = 0.04;
const LABEL_DURATION = 0.2;
const LABEL_LEAD = 0.08;

type SizedProps = {
  size: "xs" | "sm" | "md" | "lg";
  label?: string;
  body?: string;
  support?: never;
  inverse?: boolean;
  className?: string;
};

type DisplayProps = {
  size: "display";
  label?: string;
  body?: string;
  support?: string;
  inverse?: boolean;
  className?: string;
};

type LabelBlockProps = SizedProps | DisplayProps;

export default function LabelBlock(props: LabelBlockProps) {
  const { label, body, className } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (props.size !== "display") return;

    const containerEl = containerRef.current;
    const labelEl = labelRef.current;
    const statementEl = statementRef.current;
    const supportEl = supportRef.current;
    if (!containerEl || (!statementEl && !supportEl)) return;

    // Resolve the primitive grey tokens to real colors up front — GSAP can't
    // tween to a raw `var(--token)` string, it just snaps at the end. Words
    // start blended into the section's own background, then reveal to the
    // readable color — which pair depends on which background this instance
    // sits on (dark surface-base vs. inverse light section bg).
    const isInverse = props.size === "display" && props.inverse;
    const startColor = getComputedStyle(containerEl)
      .getPropertyValue(isInverse ? "--color-grey-500" : "--color-grey-1000")
      .trim();
    const endColor = getComputedStyle(containerEl)
      .getPropertyValue(isInverse ? "--color-grey-900" : "--color-grey-500")
      .trim();

    let statementSplit: InstanceType<typeof SplitText> | null = null;
    let supportSplit: InstanceType<typeof SplitText> | null = null;

    const ctx = gsap.context(() => {
      statementSplit = statementEl
        ? new SplitText(statementEl, {
            type: "words",
            wordsClass: "labelBlockWord",
          })
        : null;
      supportSplit = supportEl
        ? new SplitText(supportEl, {
            type: "words",
            wordsClass: "labelBlockWord",
          })
        : null;

      if (statementSplit) gsap.set(statementSplit.words, { color: startColor });
      if (supportSplit) gsap.set(supportSplit.words, { color: startColor });
      if (labelEl) gsap.set(labelEl, { opacity: 0, y: 16 });

      // SplitText just reflowed this text into new word elements — force a
      // synchronous layout read so ScrollTrigger measures the settled result.
      void containerEl.offsetHeight;
      ScrollTrigger.refresh();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerEl,
          start: "top 67%",
          end: "center center",
          scrub: true,
        },
      });

      if (labelEl) {
        tl.to(
          labelEl,
          {
            opacity: 1,
            y: 0,
            duration: LABEL_DURATION,
            ease: "power2.out",
          },
          0,
        );
      }

      if (statementSplit) {
        tl.to(
          statementSplit.words,
          {
            color: endColor,
            duration: WORD_DURATION,
            stagger: WORD_STAGGER,
            ease: "none",
          },
          labelEl ? LABEL_LEAD : 0,
        );
      }

      if (supportSplit) {
        tl.to(
          supportSplit.words,
          {
            color: endColor,
            duration: WORD_DURATION,
            stagger: WORD_STAGGER,
            ease: "none",
          },
          ">",
        );
      }
    });

    return () => {
      ctx.revert();
      statementSplit?.revert();
      supportSplit?.revert();
    };
  }, [props.size]);

  if (props.size === "display") {
    const { support, inverse = false } = props;
    return (
      <div
        ref={containerRef}
        className={`${styles.labelBlock} ${styles.display}${inverse ? ` ${styles.inverse}` : ""}${className ? ` ${className}` : ""}`}
      >
        {label && (
          <Label ref={labelRef} size="xl" color={inverse ? "inverse" : "default"}>
            {label}
          </Label>
        )}
        {(body || support) && (
          <div className={styles.displayBody}>
            {body && (
              <p ref={statementRef} className={styles.statement}>
                {body}
              </p>
            )}
            {support && (
              <p ref={supportRef} className={styles.support}>
                {support}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  const { size, inverse = false } = props;
  return (
    <div
      className={`${styles.labelBlock} ${styles[size]}${className ? ` ${className}` : ""}`}
    >
      {label && <Label size={size} color={inverse ? "inverse" : "default"}>{label}</Label>}
      {body && (
        <Block size={size} color={inverse ? "inverse" : "tertiary"}>
          {body}
        </Block>
      )}
    </div>
  );
}
