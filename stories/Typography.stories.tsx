import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

type TokenRow = {
  name: string;
  family: string;
  weight: number;
  sizeVar: string;
  lhVar: string;
  lsVar: string;
  sizeLabel: string;
  lhLabel: string;
  lsLabel: string;
  fluid: boolean;
};

type ColorChange = {
  token: string;
  current: { hex: string; ref: string } | null;
  proposed: { hex: string; ref: string } | null;
  status: 'changed' | 'new' | 'unchanged';
};

// ──────────────────────────────────────────────────────────────
// Token data — mirrors globals.css
// ──────────────────────────────────────────────────────────────

const DISPLAY: TokenRow[] = [
  { name: 'display-2xl', family: 'Clash Display', weight: 600, sizeVar: '--text-display-2xl-size', lhVar: '--text-display-2xl-lh', lsVar: '--text-display-2xl-ls', sizeLabel: '40→90px', lhLabel: '44→99px', lsLabel: '-0.02em', fluid: true },
  { name: 'display-xl', family: 'Clash Display', weight: 600, sizeVar: '--text-display-xl-size', lhVar: '--text-display-xl-lh', lsVar: '--text-display-xl-ls', sizeLabel: '32→64px', lhLabel: '35→70px', lsLabel: '-0.02em', fluid: true },
  { name: 'display-xl-sm', family: 'Clash Display', weight: 600, sizeVar: '--text-display-xl-sm-size', lhVar: '--text-display-xl-sm-lh', lsVar: '--text-display-xl-sm-ls', sizeLabel: '26→52px', lhLabel: '29→57px', lsLabel: '-0.02em', fluid: true },
  { name: 'display-lg', family: 'Clash Display', weight: 600, sizeVar: '--text-display-lg-size', lhVar: '--text-display-lg-lh', lsVar: '--text-display-lg-ls', sizeLabel: '28→48px', lhLabel: '31→53px', lsLabel: '-0.02em', fluid: true },
  { name: 'display-md', family: 'Clash Display', weight: 600, sizeVar: '--text-display-md-size', lhVar: '--text-display-md-lh', lsVar: '--text-display-md-ls', sizeLabel: '18→24px', lhLabel: '20→26px', lsLabel: '-0.02em', fluid: true },
  { name: 'display-sm', family: 'Clash Display', weight: 600, sizeVar: '--text-display-sm-size', lhVar: '--text-display-sm-lh', lsVar: '--text-display-sm-ls', sizeLabel: '16→20px', lhLabel: '18→22px', lsLabel: '-0.02em', fluid: true },
];

const HEADING: TokenRow[] = [
  { name: 'heading-xl', family: 'Cabinet Grotesk', weight: 700, sizeVar: '--text-heading-xl-size', lhVar: '--text-heading-xl-lh', lsVar: '--text-heading-xl-ls', sizeLabel: '20→32px', lhLabel: '25→40px', lsLabel: '-0.01em', fluid: true },
  { name: 'heading-lg', family: 'Cabinet Grotesk', weight: 700, sizeVar: '--text-heading-lg-size', lhVar: '--text-heading-lg-lh', lsVar: '--text-heading-lg-ls', sizeLabel: '18→24px', lhLabel: '22→30px', lsLabel: '-0.01em', fluid: true },
  { name: 'heading-md', family: 'Cabinet Grotesk', weight: 700, sizeVar: '--text-heading-md-size', lhVar: '--text-heading-md-lh', lsVar: '--text-heading-md-ls', sizeLabel: '16→18px', lhLabel: '20→22px', lsLabel: '-0.01em', fluid: true },
  { name: 'heading-sm', family: 'Cabinet Grotesk', weight: 700, sizeVar: '--text-heading-sm-size', lhVar: '--text-heading-sm-lh', lsVar: '--text-heading-sm-ls', sizeLabel: '14→16px', lhLabel: '17→20px', lsLabel: '-0.01em', fluid: true },
  { name: 'heading-xs', family: 'Cabinet Grotesk', weight: 700, sizeVar: '--text-heading-xs-size', lhVar: '--text-heading-xs-lh', lsVar: '--text-heading-xs-ls', sizeLabel: '12→14px', lhLabel: '15→17px', lsLabel: '-0.01em', fluid: true },
];

const BODY: TokenRow[] = [
  { name: 'body-lg', family: 'Cabinet Grotesk', weight: 400, sizeVar: '--text-body-lg-size', lhVar: '--text-body-lg-lh', lsVar: '--text-body-lg-ls', sizeLabel: '16px', lhLabel: '24px', lsLabel: '0', fluid: false },
  { name: 'body-md', family: 'Cabinet Grotesk', weight: 400, sizeVar: '--text-body-md-size', lhVar: '--text-body-md-lh', lsVar: '--text-body-md-ls', sizeLabel: '14px', lhLabel: '21px', lsLabel: '0', fluid: false },
  { name: 'body-sm', family: 'Cabinet Grotesk', weight: 400, sizeVar: '--text-body-sm-size', lhVar: '--text-body-sm-lh', lsVar: '--text-body-sm-ls', sizeLabel: '12px', lhLabel: '18px', lsLabel: '0', fluid: false },
];

const LABEL: TokenRow[] = [
  { name: 'label-2xl', family: 'Clash Display', weight: 600, sizeVar: '--text-label-2xl-size', lhVar: '--text-label-2xl-lh', lsVar: '--text-label-2xl-ls', sizeLabel: '24→40px', lhLabel: '26→44px', lsLabel: '0', fluid: true },
  { name: 'label-xl', family: 'Clash Display', weight: 600, sizeVar: '--text-label-xl-size', lhVar: '--text-label-xl-lh', lsVar: '--text-label-xl-ls', sizeLabel: '18→24px', lhLabel: '22→30px', lsLabel: '0', fluid: true },
  { name: 'label-md', family: 'Clash Display', weight: 600, sizeVar: '--text-label-md-size', lhVar: '--text-label-md-lh', lsVar: '--text-label-md-ls', sizeLabel: '16px', lhLabel: '24px', lsLabel: '0', fluid: false },
  { name: 'label-sm', family: 'Clash Display', weight: 600, sizeVar: '--text-label-sm-size', lhVar: '--text-label-sm-lh', lsVar: '--text-label-sm-ls', sizeLabel: '14px', lhLabel: '21px', lsLabel: '0', fluid: false },
];

// Step 1 proposed color changes (CLAUDE.md Design System Update)
const COLOR_CHANGES: ColorChange[] = [
  { token: '--text-primary',          current: { hex: '#FBFCFF', ref: 'grey-50'  },  proposed: { hex: '#96A0B2', ref: 'grey-650 (new primitive)' }, status: 'changed'   },
  { token: '--text-display',          current: { hex: '#D6E5FE', ref: 'grey-500' },  proposed: { hex: '#E6EFFE', ref: 'grey-300'                 }, status: 'changed'   },
  { token: '--text-secondary',        current: { hex: '#ABB7CB', ref: 'grey-600' },  proposed: { hex: '#ABB7CB', ref: 'grey-600'                 }, status: 'unchanged' },
  { token: '--text-accent',           current: { hex: '#0F8FFF', ref: 'blue-500' },  proposed: { hex: '#0F8FFF', ref: 'blue-500'                 }, status: 'unchanged' },
  { token: '--text-body-highlight',   current: null,                                  proposed: { hex: '#D6E5FE', ref: 'grey-500'                 }, status: 'new'       },
  { token: '--text-editorial-primary',current: null,                                  proposed: { hex: '#D6E5FE', ref: 'grey-500'                 }, status: 'new'       },
  { token: '--text-editorial-detail', current: null,                                  proposed: { hex: '#808998', ref: 'grey-700'                 }, status: 'new'       },
  { token: '--nav-menu-item-text',    current: { hex: '#FBFCFF', ref: 'grey-50'  },  proposed: { hex: '#E6EFFE', ref: 'grey-300'                 }, status: 'changed'   },
  { token: '--action-secondary-text', current: { hex: '#FBFCFF', ref: 'grey-50'  },  proposed: { hex: '#E6EFFE', ref: 'grey-300'                 }, status: 'changed'   },
];

// ──────────────────────────────────────────────────────────────
// Shared styles
// ──────────────────────────────────────────────────────────────

const S = {
  page: {
    background: '#0B0B0D',
    minHeight: '100vh',
    padding: '48px 64px',
    boxSizing: 'border-box',
  } as React.CSSProperties,

  sectionLabel: {
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#555C66',
    fontFamily: 'monospace',
    marginTop: 56,
    marginBottom: 4,
    display: 'block',
  } as React.CSSProperties,

  divider: {
    borderTop: '1px solid #2B2E33',
    paddingTop: 24,
    paddingBottom: 24,
  } as React.CSSProperties,

  chip: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#ABB7CB',
    background: '#151719',
    padding: '2px 8px',
    borderRadius: 4,
    display: 'inline-block',
    flexShrink: 0,
  } as React.CSSProperties,

  meta: {
    fontSize: 11,
    color: '#555C66',
    fontFamily: 'monospace',
  } as React.CSSProperties,
} as const;

// ──────────────────────────────────────────────────────────────
// Specimen sub-components
// ──────────────────────────────────────────────────────────────

function TokenEntry({ token }: { token: TokenRow }) {
  return (
    <div style={S.divider}>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={S.chip}>{token.name}</span>
        <span style={S.meta}>
          {token.family} · {token.weight} · {token.sizeLabel} / lh {token.lhLabel} / ls {token.lsLabel}
          {token.fluid ? ' · fluid' : ' · static'}
        </span>
      </div>
      <p style={{
        fontFamily: `'${token.family}', system-ui, sans-serif`,
        fontSize: `var(${token.sizeVar})`,
        lineHeight: `var(${token.lhVar})`,
        letterSpacing: `var(${token.lsVar})`,
        fontWeight: token.weight,
        color: '#E6EFFE',
        margin: 0,
      }}>
        Product design that speaks for itself
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Color-change sub-components
// ──────────────────────────────────────────────────────────────

function Swatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: hex, border: '1px solid #2B2E33', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#E6EFFE', lineHeight: 1.3 }}>{hex}</div>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#555C66', lineHeight: 1.3 }}>{label}</div>
      </div>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  changed: '#FFD53C',
  new: '#3FA5FF',
  unchanged: '#555C66',
};

function ColorRow({ change }: { change: ColorChange }) {
  return (
    <div style={{ ...S.divider, display: 'grid', gridTemplateColumns: '210px 1fr 1fr 80px', gap: 20, alignItems: 'start' }}>
      <div style={{ paddingTop: 6 }}>
        <span style={{ ...S.chip, fontSize: 10 }}>{change.token}</span>
      </div>

      <div style={{ background: '#151719', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555C66', marginBottom: 10, fontFamily: 'monospace' }}>Current</div>
        {change.current ? (
          <>
            <Swatch hex={change.current.hex} label={change.current.ref} />
            <p style={{ fontFamily: "'Cabinet Grotesk', system-ui, sans-serif", fontSize: 14, lineHeight: '21px', color: change.current.hex, margin: 0, marginTop: 8 }}>
              Senior product designer — 5 years B2B
            </p>
          </>
        ) : (
          <span style={{ fontSize: 11, color: '#555C66', fontFamily: 'monospace' }}>— does not exist</span>
        )}
      </div>

      <div style={{ background: '#151719', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555C66', marginBottom: 10, fontFamily: 'monospace' }}>Proposed</div>
        {change.proposed ? (
          <>
            <Swatch hex={change.proposed.hex} label={change.proposed.ref} />
            <p style={{ fontFamily: "'Cabinet Grotesk', system-ui, sans-serif", fontSize: 14, lineHeight: '21px', color: change.proposed.hex, margin: 0, marginTop: 8 }}>
              Senior product designer — 5 years B2B
            </p>
          </>
        ) : null}
      </div>

      <div style={{ paddingTop: 6 }}>
        <span style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: STATUS_COLOR[change.status], fontFamily: 'monospace', fontWeight: 700 }}>
          {change.status}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pages
// ──────────────────────────────────────────────────────────────

function SpecimenPage() {
  return (
    <div style={S.page}>
      <span style={{ ...S.sectionLabel, marginTop: 0 }}>Display — Clash Display · Semibold 600 · Fluid</span>
      {DISPLAY.map(t => <TokenEntry key={t.name} token={t} />)}

      <span style={S.sectionLabel}>Heading — Cabinet Grotesk · Bold 700 · Fluid</span>
      {HEADING.map(t => <TokenEntry key={t.name} token={t} />)}

      <span style={S.sectionLabel}>Body — Cabinet Grotesk · Regular 400 · Static</span>
      {BODY.map(t => <TokenEntry key={t.name} token={t} />)}

      <span style={S.sectionLabel}>Label — Clash Display · Semibold 600</span>
      {LABEL.map(t => <TokenEntry key={t.name} token={t} />)}
    </div>
  );
}

function ProposedChangesPage() {
  return (
    <div style={S.page}>
      <span style={{ ...S.sectionLabel, marginTop: 0 }}>Step 1 — Text color token changes</span>
      <div style={{ fontSize: 12, color: '#555C66', fontFamily: 'monospace', marginBottom: 8 }}>
        Resize the viewport to see fluid tokens respond. Color changes affect body copy contrast against the dark surface.
      </div>
      {COLOR_CHANGES.map(c => <ColorRow key={c.token} change={c} />)}

      <span style={S.sectionLabel}>Step 2 — New typography tokens</span>

      <div style={S.divider}>
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={S.chip}>body-xl</span>
          <span style={S.meta}>Cabinet Grotesk · 400 · 18px / lh 27px / ls 0 · static</span>
          <span style={{ fontSize: 9, color: '#3FA5FF', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>new</span>
        </div>
        <p style={{ fontFamily: "'Cabinet Grotesk', system-ui, sans-serif", fontSize: 18, lineHeight: '27px', letterSpacing: 0, fontWeight: 400, color: '#E6EFFE', margin: 0 }}>
          Product design that speaks for itself
        </p>
        <p style={{ fontFamily: "'Cabinet Grotesk', system-ui, sans-serif", fontSize: 18, lineHeight: '27px', letterSpacing: 0, fontWeight: 400, color: '#96A0B2', margin: '4px 0 0' }}>
          Same text in proposed --text-primary (grey-650 · #96A0B2)
        </p>
      </div>

      <div style={S.divider}>
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={S.chip}>editorial-lg</span>
          <span style={S.meta}>Cabinet Grotesk · 700 · 26→52px / lh 29→57px / ls -0.02em · fluid</span>
          <span style={{ fontSize: 9, color: '#3FA5FF', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>new</span>
        </div>
        <p style={{ fontFamily: "'Cabinet Grotesk', system-ui, sans-serif", fontSize: 'clamp(26px, 19.37px + 1.70vw, 52px)', lineHeight: 'clamp(29px, 21.86px + 1.83vw, 57px)', letterSpacing: '-0.02em', fontWeight: 700, color: '#D6E5FE', margin: 0 }}>
          editorial-primary · grey-500 · #D6E5FE
        </p>
        <p style={{ fontFamily: "'Cabinet Grotesk', system-ui, sans-serif", fontSize: 'clamp(26px, 19.37px + 1.70vw, 52px)', lineHeight: 'clamp(29px, 21.86px + 1.83vw, 57px)', letterSpacing: '-0.02em', fontWeight: 700, color: '#808998', margin: '4px 0 0' }}>
          editorial-detail · grey-700 · #808998
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Story exports
// ──────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
};

export default meta;

export const Specimen: StoryObj = {
  render: () => <SpecimenPage />,
};

export const ProposedChanges: StoryObj = {
  render: () => <ProposedChangesPage />,
};
