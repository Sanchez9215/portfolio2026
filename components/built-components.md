## built-components.md format

| design-system name      | file                                                                          |
| ----------------------- | ----------------------------------------------------------------------------- |
| menu-item               | components/MenuItem.tsx                                                       |
| button                  | components/Button.tsx                                                         |
| nav                     | components/Nav.tsx                                                            |
| case-study-card         | components/CaseStudyCard.tsx                                                  |
| label                   | components/Label.tsx — Clash Display, semibold, uppercase; sizes: xs\|sm\|md\|lg\|xl |
| title                   | components/Title.tsx — Cabinet Grotesk bold; sizes: xs\|sm\|md\|lg           |
| block                   | components/Block.tsx — Cabinet Grotesk regular; sizes: xs\|sm\|md\|lg; color: primary\|secondary(default)\|tertiary |
| label-block             | components/LabelBlock.tsx — Label + optional Block(tertiary); sizes: xs\|sm\|md\|lg\|display; display adds body(statement) + support slots (both Cabinet bold) |
| title-block             | components/TitleBlock.tsx — Title + optional Block(tertiary); sizes: xs\|sm\|md\|lg |
| card                    | components/Card.tsx — variant: filled\|outline\|ghost; size(xs\|sm\|md\|lg) sets default labelSize+titleSize; labelSize+titleSize as explicit overrides; separator; gap(xs\|sm\|md\|lg\|xl, default md); headerGap(xs\|sm\|md\|lg\|xl, default sm); exposes data-tb-heading on header |
| img-card                | components/ImgCard.tsx — Card(outline) + image + caption; single or multi-image |
| section                 | components/Section.tsx                                                        |
| section-introduction    | components/case-studies/software-observability/SectionIntroduction.tsx        |
| message-thread          | components/case-studies/software-observability/MessageThread.tsx              |
| quote-block             | components/QuoteBlock.tsx                                                     |
| metric-card             | components/MetricCard.tsx                                                     |
| context-block           | components/ContextBlock.tsx                                                   |
| insight-goal-row        | components/InsightGoalRow.tsx — items: [{label, title, body}, {label, title, body}]; Card(ghost, separator) per item + SVG dashed connector |
| content-hub             | components/ContentHub.tsx                                                     |
