# Design System Tokens

## Primitives

Raw values. Never used directly in components — always referenced through semantic tokens.

### Color

#### Grey

| Name    | Value   |
| ------- | ------- |
| 50      | #FBFCFF |
| 100     | #F7FAFF |
| 200     | #EEF5FF |
| 300     | #E6EFFE |
| 400     | #DEEAFE |
| Default | #D6E5FE |
| 600     | #ABB7CB |
| 700     | #808998 |
| 800     | #555C66 |
| 900     | #2B2E33 |
| 1000    | #151719 |
| 1100    | #0B0B0D |

#### Blue

| Name    | Value   |
| ------- | ------- |
| 50      | #E7F4FF |
| 100     | #CFE9FF |
| 200     | #9FD2FF |
| 300     | #6FBCFF |
| 400     | #3FA5FF |
| Default | #0F8FFF |
| 600     | #0C72CC |
| 700     | #095699 |
| 800     | #063966 |
| 900     | #031D33 |
| 1000    | #020E1A |

#### Yellow

| Name    | Value   |
| ------- | ------- |
| 50      | #FFFBEC |
| 100     | #FFF7D8 |
| 200     | #FFEEB1 |
| 300     | #FFE68A |
| 400     | #FFDD63 |
| Default | #FFD53C |
| 600     | #F1BA30 |
| 700     | #E3A024 |
| 800     | #D48518 |
| 900     | #BF5D06 |

---

## Semantic Tokens

Mapped references. These are what components use — never raw primitives.

### Surface

| Token                       | References     |
| --------------------------- | -------------- |
| --surface-base              | grey/1100      |
| --surface-card              | grey/1000      |
| --surface-card-border       | grey/900       |
| --surface-card-border-hover | yellow/default |

### Navigation

| Token                        | References     |
| ---------------------------- | -------------- |
| --nav-bg                     | grey/1000      |
| --nav-link-text              | grey/600       |
| --nav-button-bg              | grey/1100      |
| --nav-button-border          | yellow/default |
| --nav-button-text            | yellow/default |
| --nav-menu-item-text         | grey/50        |
| --nav-menu-item-border       | grey/900       |
| --nav-menu-item-border-hover | blue/default   |
| --nav-menu-item-bg-hover     | blue/default   |

### Actions

| Token                           | References     |
| ------------------------------- | -------------- |
| --action-primary-bg             | yellow/default |
| --action-primary-bg-hover       | grey/1100      |
| --action-primary-border         | yellow/default |
| --action-primary-border-hover   | yellow/default |
| --action-primary-text           | grey/1100      |
| --action-primary-text-hover     | yellow/default |
| --action-secondary-bg           | grey/1100      |
| --action-secondary-bg-hover     | grey/50        |
| --action-secondary-border       | grey/1100      |
| --action-secondary-border-hover | grey/1100      |
| --action-secondary-text         | grey/50        |
| --action-secondary-text-hover   | grey/1100      |

### Text

| Token            | References   |
| ---------------- | ------------ |
| --text-primary   | grey/50      |
| --text-secondary | grey/600     |
| --text-accent    | blue/default |

---

## Typography

### Primitives

#### Font Families

| Name         | Value                                    |
| ------------ | ---------------------------------------- |
| font-display | 'Clash Display', system-ui, sans-serif   |
| font-body    | 'Cabinet Grotesk', system-ui, sans-serif |

#### Font Weights

| Name            | Value |
| --------------- | ----- |
| weight-regular  | 400   |
| weight-semibold | 600   |
| weight-bold     | 700   |

#### Base

| Name           | Value  |
| -------------- | ------ |
| font-base      | 16px   |
| device-desktop | 1440px |
| device-mobile  | 393px  |

---

### Semantic Tokens

#### Type Scale

| Token       | Family       | Weight   | Desktop (rem) | Desktop (px) | Mobile (rem) | Mobile (px) | Line Height Desktop | Line Height Mobile | Letter Spacing |
| ----------- | ------------ | -------- | ------------- | ------------ | ------------ | ----------- | ------------------- | ------------------ | -------------- |
| display-2xl | font-display | bold     | 4.5rem        | 72px         | 2.5rem       | 40px        | 4.95rem / 79px      | 2.75rem / 44px     | -0.02em        |
| display-xl  | font-display | bold     | 4rem          | 64px         | 2rem         | 32px        | 4.4rem / 70px       | 2.2rem / 35px      | -0.02em        |
| display-lg  | font-display | bold     | 3rem          | 48px         | 1.75rem      | 28px        | 3.3rem / 53px       | 1.925rem / 31px    | -0.02em        |
| heading-xl  | font-body    | bold     | 2rem          | 32px         | 1.25rem      | 20px        | 2.5rem / 40px       | 1.5625rem / 25px   | -0.01em        |
| heading-lg  | font-body    | bold     | 1.5rem        | 24px         | 1.125rem     | 18px        | 1.875rem / 30px     | 1.4rem / 22px      | -0.01em        |
| heading-md  | font-body    | bold     | 1.125rem      | 18px         | 1rem         | 16px        | 1.4rem / 22px       | 1.25rem / 20px     | -0.01em        |
| heading-sm  | font-body    | bold     | 1rem          | 16px         | 0.875rem     | 14px        | 1.25rem / 20px      | 1.09rem / 17px     | -0.01em        |
| heading-xs  | font-body    | bold     | 0.875rem      | 14px         | 0.75rem      | 12px        | 1.09rem / 17px      | 0.94rem / 15px     | -0.01em        |
| body-lg     | font-body    | regular  | 1rem          | 16px         | 1rem         | 16px        | 1.5rem / 24px       | 1.5rem / 24px      | 0              |
| body-md     | font-body    | regular  | 0.875rem      | 14px         | 0.875rem     | 14px        | 1.3rem / 21px       | 1.3rem / 21px      | 0              |
| body-sm     | font-body    | regular  | 0.75rem       | 12px         | 0.75rem      | 12px        | 1.125rem / 18px     | 1.125rem / 18px    | 0              |
| label-2xl   | font-display | semibold | 2.5rem        | 40px         | 1.5rem       | 24px        | 2.75rem / 44px      | 1.65rem / 26px     | 0              |
| label-xl    | font-display | semibold | 1.5rem        | 24px         | 1.125rem     | 18px        | 1.875rem / 30px     | 1.4rem / 22px      | 0              |
| label-md    | font-display | semibold | 1rem          | 16px         | 1rem         | 16px        | 1.5rem / 24px       | 1.5rem / 24px      | 0              |
| label-sm    | font-display | semibold | 0.875rem      | 14px         | 0.875rem     | 14px        | 1.3rem / 21px       | 1.3rem / 21px      | 0              |

#### Type Role Mapping

| Use Case               | Token       |
| ---------------------- | ----------- |
| Hero headline          | display-2xl |
| Supporting text        | display-2xl |
| Large nav menu text    | label-2xl   |
| Large button text      | label-xl    |
| Regular button text    | label-md    |
| Small button text      | label-sm    |
| Section headings       | heading-xl  |
| Case study card titles | display-lg  |
| Body copy              | body-lg     |
| Captions / metadata    | body-sm     |

---

## Border Width & Style

### Primitives

| Name        | Value |
| ----------- | ----- |
| border-none | 0     |
| border-sm   | 1px   |
| border-md   | 4px   |
| border-lg   | 8px   |

### Semantic Tokens

| Token                  | References | Use Case               |
| ---------------------- | ---------- | ---------------------- |
| --border-card          | border-sm  | Card borders           |
| --border-button        | border-md  | Button borders         |
| --border-focus         | border-lg  | Focus states (planned) |
| --border-style-default | solid      | All borders            |

## Icon & Image

### Primitives

| Name     | Value |
| -------- | ----- |
| icon-sm  | 16px  |
| icon-md  | 24px  |
| icon-lg  | 32px  |
| icon-xl  | 48px  |
| icon-2xl | 64px  |

---

## Spacing

### Primitives

| Name        | Value |
| ----------- | ----- |
| spacing-xs  | 4px   |
| spacing-sm  | 8px   |
| spacing-md  | 16px  |
| spacing-lg  | 24px  |
| spacing-xl  | 32px  |
| spacing-2xl | 48px  |
| spacing-3xl | 64px  |
| spacing-4xl | 96px  |
| spacing-5xl | 128px |

### Semantic Tokens

| Token                         | References  | Use Case                       |
| ----------------------------- | ----------- | ------------------------------ |
| --spacing-nav-padding         | spacing-md  | Nav bar padding                |
| --spacing-section-padding-x   | spacing-xl  | Section left and right padding |
| --spacing-section-padding-top | spacing-3xl | Section top padding            |
| --spacing-card-padding        | spacing-xl  | Card internal padding          |

---

## Z-Index

| Token       | Value | Use Case          |
| ----------- | ----- | ----------------- |
| --z-nav     | 100   | Sticky navigation |
| --z-overlay | 200   | Nav menu overlay  |
| --z-modal   | 300   | Modals (planned)  |

---

## Breakpoints

| Token                | Value  | Use Case         |
| -------------------- | ------ | ---------------- |
| --breakpoint-mobile  | 393px  | Mobile viewport  |
| --breakpoint-desktop | 1440px | Desktop viewport |

---

## Border Radius

### Primitives

| Name        | Value  |
| ----------- | ------ |
| radius-none | 0      |
| radius-md   | 16px   |
| radius-lg   | 48px   |
| radius-full | 9999px |

### Semantic Tokens

| Token            | References  | Use Case                                 |
| ---------------- | ----------- | ---------------------------------------- |
| --radius-lg      | radius-lg   | Case study cards, large surfaces         |
| --radius-default | radius-md   | Standard buttons, inputs, small elements |
| --radius-pill    | radius-full | Pill buttons                             |
