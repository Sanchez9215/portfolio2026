import type { Config } from "tailwindcss";

/**
 * Tailwind configuration — Edgar Sanchez Portfolio
 *
 * Every value references a CSS custom property defined in
 * styles/globals.css, which is itself derived from
 * design-system/tokens.json.  Nothing is hardcoded here.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    /* ----------------------------------------------------------
       COLORS
       Replace Tailwind's default palette with the token set.
       Utility classes:  bg-surface-card, text-primary,
                         border-nav-menu-item-border, etc.
       ---------------------------------------------------------- */
    colors: {
      transparent: "transparent",
      current: "currentColor",

      /* Primitive — Grey */
      "grey-50":   "var(--color-grey-50)",
      "grey-100":  "var(--color-grey-100)",
      "grey-200":  "var(--color-grey-200)",
      "grey-300":  "var(--color-grey-300)",
      "grey-400":  "var(--color-grey-400)",
      "grey-500":  "var(--color-grey-500)",
      "grey-600":  "var(--color-grey-600)",
      "grey-700":  "var(--color-grey-700)",
      "grey-800":  "var(--color-grey-800)",
      "grey-900":  "var(--color-grey-900)",
      "grey-1000": "var(--color-grey-1000)",
      "grey-1100": "var(--color-grey-1100)",

      /* Primitive — Blue */
      "blue-50":   "var(--color-blue-50)",
      "blue-100":  "var(--color-blue-100)",
      "blue-200":  "var(--color-blue-200)",
      "blue-300":  "var(--color-blue-300)",
      "blue-400":  "var(--color-blue-400)",
      "blue-500":  "var(--color-blue-500)",
      "blue-600":  "var(--color-blue-600)",
      "blue-700":  "var(--color-blue-700)",
      "blue-800":  "var(--color-blue-800)",
      "blue-900":  "var(--color-blue-900)",
      "blue-1000": "var(--color-blue-1000)",

      /* Primitive — Yellow */
      "yellow-50":  "var(--color-yellow-50)",
      "yellow-100": "var(--color-yellow-100)",
      "yellow-200": "var(--color-yellow-200)",
      "yellow-300": "var(--color-yellow-300)",
      "yellow-400": "var(--color-yellow-400)",
      "yellow-500": "var(--color-yellow-500)",
      "yellow-600": "var(--color-yellow-600)",
      "yellow-700": "var(--color-yellow-700)",
      "yellow-800": "var(--color-yellow-800)",
      "yellow-900": "var(--color-yellow-900)",

      /* Semantic — Surface */
      "surface-base":              "var(--surface-base)",
      "surface-card":              "var(--surface-card)",
      "surface-card-border":       "var(--surface-card-border)",
      "surface-card-border-hover": "var(--surface-card-border-hover)",

      /* Semantic — Nav */
      "nav-bg":                     "var(--nav-bg)",
      "nav-link-text":              "var(--nav-link-text)",
      "nav-button-bg":              "var(--nav-button-bg)",
      "nav-button-border":          "var(--nav-button-border)",
      "nav-button-text":            "var(--nav-button-text)",
      "nav-menu-item-text":         "var(--nav-menu-item-text)",
      "nav-menu-item-border":       "var(--nav-menu-item-border)",
      "nav-menu-item-border-hover": "var(--nav-menu-item-border-hover)",
      "nav-menu-item-bg-hover":     "var(--nav-menu-item-bg-hover)",

      /* Semantic — Action */
      "action-primary-bg":             "var(--action-primary-bg)",
      "action-primary-bg-hover":       "var(--action-primary-bg-hover)",
      "action-primary-border":         "var(--action-primary-border)",
      "action-primary-border-hover":   "var(--action-primary-border-hover)",
      "action-primary-text":           "var(--action-primary-text)",
      "action-primary-text-hover":     "var(--action-primary-text-hover)",
      "action-secondary-bg":           "var(--action-secondary-bg)",
      "action-secondary-bg-hover":     "var(--action-secondary-bg-hover)",
      "action-secondary-border":       "var(--action-secondary-border)",
      "action-secondary-border-hover": "var(--action-secondary-border-hover)",
      "action-secondary-text":         "var(--action-secondary-text)",
      "action-secondary-text-hover":   "var(--action-secondary-text-hover)",

      /* Semantic — Text */
      primary:   "var(--text-primary)",
      secondary: "var(--text-secondary)",
      accent:    "var(--text-accent)",
    },

    /* ----------------------------------------------------------
       FONT FAMILY
       Usage: font-display, font-body
       ---------------------------------------------------------- */
    fontFamily: {
      display: "var(--font-family-display)",
      body:    "var(--font-family-body)",
    },

    /* ----------------------------------------------------------
       FONT SIZE — typography scale
       Each entry is [fontSize, { lineHeight, letterSpacing }].
       Values resolve through CSS vars so the mobile media query
       in globals.css automatically switches them at 393 px.
       Usage: text-display-2xl, text-heading-lg, text-body-md …
       ---------------------------------------------------------- */
    fontSize: {
      "display-2xl": [
        "var(--text-display-2xl-size)",
        { lineHeight: "var(--text-display-2xl-lh)", letterSpacing: "var(--text-display-2xl-ls)" },
      ],
      "display-xl": [
        "var(--text-display-xl-size)",
        { lineHeight: "var(--text-display-xl-lh)", letterSpacing: "var(--text-display-xl-ls)" },
      ],
      "display-lg": [
        "var(--text-display-lg-size)",
        { lineHeight: "var(--text-display-lg-lh)", letterSpacing: "var(--text-display-lg-ls)" },
      ],
      "heading-xl": [
        "var(--text-heading-xl-size)",
        { lineHeight: "var(--text-heading-xl-lh)", letterSpacing: "var(--text-heading-xl-ls)" },
      ],
      "heading-lg": [
        "var(--text-heading-lg-size)",
        { lineHeight: "var(--text-heading-lg-lh)", letterSpacing: "var(--text-heading-lg-ls)" },
      ],
      "heading-md": [
        "var(--text-heading-md-size)",
        { lineHeight: "var(--text-heading-md-lh)", letterSpacing: "var(--text-heading-md-ls)" },
      ],
      "heading-sm": [
        "var(--text-heading-sm-size)",
        { lineHeight: "var(--text-heading-sm-lh)", letterSpacing: "var(--text-heading-sm-ls)" },
      ],
      "heading-xs": [
        "var(--text-heading-xs-size)",
        { lineHeight: "var(--text-heading-xs-lh)", letterSpacing: "var(--text-heading-xs-ls)" },
      ],
      "body-lg": [
        "var(--text-body-lg-size)",
        { lineHeight: "var(--text-body-lg-lh)", letterSpacing: "var(--text-body-lg-ls)" },
      ],
      "body-md": [
        "var(--text-body-md-size)",
        { lineHeight: "var(--text-body-md-lh)", letterSpacing: "var(--text-body-md-ls)" },
      ],
      "body-sm": [
        "var(--text-body-sm-size)",
        { lineHeight: "var(--text-body-sm-lh)", letterSpacing: "var(--text-body-sm-ls)" },
      ],
      "label-2xl": [
        "var(--text-label-2xl-size)",
        { lineHeight: "var(--text-label-2xl-lh)", letterSpacing: "var(--text-label-2xl-ls)" },
      ],
      "label-xl": [
        "var(--text-label-xl-size)",
        { lineHeight: "var(--text-label-xl-lh)", letterSpacing: "var(--text-label-xl-ls)" },
      ],
      "label-md": [
        "var(--text-label-md-size)",
        { lineHeight: "var(--text-label-md-lh)", letterSpacing: "var(--text-label-md-ls)" },
      ],
      "label-sm": [
        "var(--text-label-sm-size)",
        { lineHeight: "var(--text-label-sm-lh)", letterSpacing: "var(--text-label-sm-ls)" },
      ],
    },

    /* ----------------------------------------------------------
       FONT WEIGHT
       Usage: font-regular, font-semibold, font-bold
       ---------------------------------------------------------- */
    fontWeight: {
      regular:  "var(--font-weight-regular)",
      semibold: "var(--font-weight-semibold)",
      bold:     "var(--font-weight-bold)",
    },

    extend: {
      /* ----------------------------------------------------------
         SPACING — primitive + semantic
         Usage: p-xs, px-section-padding-x, gap-lg …
         ---------------------------------------------------------- */
      spacing: {
        xs:    "var(--spacing-xs)",
        sm:    "var(--spacing-sm)",
        md:    "var(--spacing-md)",
        lg:    "var(--spacing-lg)",
        xl:    "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
        "4xl": "var(--spacing-4xl)",
        "5xl": "var(--spacing-5xl)",
        /* Semantic */
        "nav-padding":         "var(--spacing-nav-padding)",
        "section-padding-x":   "var(--spacing-section-padding-x)",
        "section-padding-top": "var(--spacing-section-padding-top)",
        "card-padding":        "var(--spacing-card-padding)",
      },

      /* ----------------------------------------------------------
         BORDER RADIUS — primitive + semantic
         Usage: rounded-pill, rounded-default, rounded-lg …
         ---------------------------------------------------------- */
      borderRadius: {
        none:    "var(--border-radius-none)",
        md:      "var(--border-radius-md)",
        lg:      "var(--border-radius-lg)",
        full:    "var(--border-radius-full)",
        /* Semantic */
        default: "var(--radius-default)",
        pill:    "var(--radius-pill)",
      },

      /* ----------------------------------------------------------
         BORDER WIDTH — primitive + semantic
         Usage: border-card, border-button, border-focus …
         ---------------------------------------------------------- */
      borderWidth: {
        none:   "var(--border-width-none)",
        sm:     "var(--border-width-sm)",
        md:     "var(--border-width-md)",
        lg:     "var(--border-width-lg)",
        /* Semantic */
        card:   "var(--border-card)",
        button: "var(--border-button)",
        focus:  "var(--border-focus)",
      },

      /* ----------------------------------------------------------
         Z-INDEX — semantic
         Usage: z-nav, z-overlay, z-modal
         ---------------------------------------------------------- */
      zIndex: {
        nav:     "var(--z-nav)",
        overlay: "var(--z-overlay)",
        modal:   "var(--z-modal)",
      },

      /* ----------------------------------------------------------
         SIZE — icon scale (width + height shorthand)
         Usage: size-icon-md, size-icon-lg …
         ---------------------------------------------------------- */
      size: {
        "icon-sm":  "var(--icon-sm)",
        "icon-md":  "var(--icon-md)",
        "icon-lg":  "var(--icon-lg)",
        "icon-xl":  "var(--icon-xl)",
        "icon-2xl": "var(--icon-2xl)",
      },

      /* ----------------------------------------------------------
         SCREENS — match breakpoint tokens
         mobile  = 393 px  (Responsive/Mobile token set)
         desktop = 1440 px (Responsive/Desktop token set)
         ---------------------------------------------------------- */
      screens: {
        mobile:  "393px",
        desktop: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
