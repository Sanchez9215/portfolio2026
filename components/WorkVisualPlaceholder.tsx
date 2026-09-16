/**
 * WorkVisualPlaceholder — stands in for a case study's thumbnail or live
 * embed in a WorkCaseStudyRow until the real visual exists.
 *
 * Purely a filled block: the row's own .embedWrap already supplies the
 * 16/10 ratio, the top-corner radius, and the clip, and stretches its child
 * to fill. Decorative, so it's hidden from assistive tech.
 */

import styles from "./WorkVisualPlaceholder.module.css";

export default function WorkVisualPlaceholder() {
  return <div className={styles.placeholder} aria-hidden="true" />;
}
