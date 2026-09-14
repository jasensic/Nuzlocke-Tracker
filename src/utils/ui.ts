/**
 * Unified design system — implements DESIGN.md.
 *
 * Every view, card, button, chip and input must be built from the helpers below
 * so all tabs share one visual language. Two hard rules when writing markup:
 *
 * 1. Colors come from the semantic tokens declared in `src/index.css`
 *    (`brand-*`, `status-*`, `pokemon-*`), whose hex values match DESIGN.md
 *    (Bg / Surf / Card / Bord / Txt1 / Txt2 / CTA `#FF3B30`). Those tokens
 *    already flip with the `.dark` class, so components never need `dark:`
 *    variants for surfaces, borders or text. Raw palette classes
 *    (`bg-white`, `dark:bg-slate-900`, `text-slate-500`, `bg-emerald-100`, ...)
 *    are not allowed. The only exceptions are the Pokémon-type color systems
 *    (`pokemon-*` tokens, `TYPE_COLORS` in `pokemonMeta.ts`, `typeStyles.ts`)
 *    and the per-trainer identity tags in `trainerTranslations.ts`, whose
 *    palette is data, not styling; render those through `pillShape()` so at
 *    least the shape matches.
 * 2. Geometry follows DESIGN.md: cards and buttons are `12px` (`rounded-xl`).
 *    Type badges are `8px` (`rounded-lg`) or pill (`rounded-full`). Elevation
 *    in dark mode comes from borders and surface steps, not heavy shadows.
 */

export type ClassValue = string | false | null | undefined;

/** Joins conditional class names, dropping falsy values. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}

/* -------------------------------------------------------------------------- */
/* Tones                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Semantic intent of an element. Maps onto the status tokens:
 * success = alive/caught, danger = fainted/destructive, warning = pending,
 * info = boxed/informational, accent = primary brand action.
 */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

interface ToneTokens {
  /** Filled background with legible foreground. */
  solid: string;
  /** Tinted background + ink text + matching border. */
  soft: string;
  /** Text/icon color only. */
  ink: string;
  /** Border color only. */
  border: string;
  /** Background color only, for dots, bars and progress fills. */
  fill: string;
}

export const TONES: Record<Tone, ToneTokens> = {
  neutral: {
    solid: 'bg-brand-txt1 text-brand-bg',
    soft: 'bg-brand-surface text-brand-txt2 border-brand-border',
    ink: 'text-brand-txt2',
    border: 'border-brand-border',
    fill: 'bg-brand-txt2',
  },
  accent: {
    solid: 'bg-brand-accent text-white',
    soft: 'bg-brand-accent/10 text-brand-accent-ink border-brand-accent/25',
    ink: 'text-brand-accent-ink',
    border: 'border-brand-accent/40',
    fill: 'bg-brand-accent',
  },
  success: {
    solid: 'bg-status-live text-white',
    soft: 'bg-status-live/10 text-status-live-ink border-status-live/25',
    ink: 'text-status-live-ink',
    border: 'border-status-live/40',
    fill: 'bg-status-live',
  },
  warning: {
    solid: 'bg-status-pending text-gray-900',
    soft: 'bg-status-pending/12 text-status-pending-ink border-status-pending/30',
    ink: 'text-status-pending-ink',
    border: 'border-status-pending/40',
    fill: 'bg-status-pending',
  },
  danger: {
    solid: 'bg-status-faint text-white',
    soft: 'bg-status-faint/10 text-status-faint-ink border-status-faint/25',
    ink: 'text-status-faint-ink',
    border: 'border-status-faint/40',
    fill: 'bg-status-faint',
  },
  info: {
    solid: 'bg-status-boxed text-white',
    soft: 'bg-status-boxed/10 text-status-boxed-ink border-status-boxed/25',
    ink: 'text-status-boxed-ink',
    border: 'border-status-boxed/40',
    fill: 'bg-status-boxed',
  },
};

/* -------------------------------------------------------------------------- */
/* Surfaces & layout                                                          */
/* -------------------------------------------------------------------------- */

export const radius = {
  /** Cards, panels, modals and buttons — DESIGN.md §5.2 (`12px`). */
  panel: 'rounded-xl',
  card: 'rounded-xl',
  control: 'rounded-xl',
  /** Type badges may also use this `8px` radius. */
  badge: 'rounded-lg',
  pill: 'rounded-full',
} as const;

export const pad = {
  /** View-level panel. */
  panel: 'p-4 sm:p-5',
  /** Hero / feature panel that needs more air. */
  panelLg: 'p-5 sm:p-6',
  /** Card or list row. */
  card: 'p-3.5 sm:p-4',
  /** Dense toolbars and inset blocks. */
  compact: 'p-3',
} as const;

export const surface = {
  page: 'bg-brand-bg text-brand-txt1',
  header: 'bg-brand-surface/95 border-b border-brand-border backdrop-blur-md',
  footer: 'bg-brand-surface border-t border-brand-border',
  /** Top-level section container. Elevation is the Card/Bord token pair, not a drop shadow. */
  panel: 'bg-brand-card border border-brand-border rounded-xl',
  /** Card or list row sitting inside a panel. */
  card: 'bg-brand-card border border-brand-border rounded-xl',
  /** Recessed block: toolbars, inputs backdrop, note boxes. */
  inset: 'bg-brand-surface border border-brand-border rounded-xl',
  /** Full-bleed modal backdrop. */
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-bg/70 backdrop-blur-sm animate-fade-in',
  /** Modal shell; pair with a width constraint such as `max-w-2xl`. */
  modal:
    'relative w-full bg-brand-card border border-brand-border rounded-xl overflow-hidden animate-pop-in',
  /** Mobile bottom navigation — DESIGN.md §3.2 (`64px`, Surf, top Bord). */
  bottomNav:
    'lg:hidden fixed bottom-0 inset-x-0 z-50 h-16 flex items-stretch bg-brand-surface border-t border-brand-border',
} as const;

export const layout = {
  /** Vertical rhythm between the sections of a tab. */
  view: 'space-y-5 sm:space-y-6',
  /** Horizontal page gutters, matching the header and footer. */
  container: 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8',
  divider: 'border-t border-brand-border',
} as const;

export const anim = {
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-fade-in-up',
  popIn: 'animate-pop-in',
} as const;

/** Hover treatment for clickable cards and rows. */
export const hoverLift =
  'transition-colors duration-150 hover:bg-brand-card-hover hover:border-brand-accent/40';

/** Shared keyboard focus treatment. Applied by every control helper. */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg';

/**
 * View-level section container.
 * @example <div className={panel()}>…</div>
 */
export function panel(extra?: ClassValue): string {
  return cn(surface.panel, pad.panel, 'transition-colors', extra);
}

/** Feature/hero panel with wider padding. */
export function panelLg(extra?: ClassValue): string {
  return cn(surface.panel, pad.panelLg, 'transition-colors', extra);
}

/**
 * Card or list row. Pass `interactive` for hover affordance and `tone` to tint
 * the card (e.g. a completed route uses `tone: 'success'`).
 */
export function card(options?: {
  interactive?: boolean;
  tone?: Tone;
  active?: boolean;
  padding?: keyof typeof pad | 'none';
  extra?: ClassValue;
}): string {
  const { interactive, tone, active, padding = 'card', extra } = options ?? {};
  const tinted = tone && tone !== 'neutral';
  return cn(
    'border rounded-xl transition-colors',
    tinted ? TONES[tone].soft : 'bg-brand-card border-brand-border',
    active && 'border-brand-accent/60 ring-1 ring-brand-accent/25',
    interactive && !tinted && hoverLift,
    interactive && tinted && 'transition-colors duration-150',
    padding !== 'none' && pad[padding],
    extra
  );
}

/** Recessed block for toolbars, note boxes and nested detail areas. */
export function inset(extra?: ClassValue): string {
  return cn(surface.inset, pad.compact, extra);
}

/* -------------------------------------------------------------------------- */
/* Typography                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Type scale from DESIGN.md §2.1 (Inter):
 * Heading 24px/700/1.25 · Subheading 18px/600/1.35 · Body 14px/400/1.5 · Caption 12px/400–500/1.4
 */
export const text = {
  /** Screen title — Heading. */
  pageTitle: 'text-2xl font-bold text-brand-txt1 tracking-tight leading-tight',
  /** Section heading — Subheading. */
  sectionTitle: 'text-lg font-semibold text-brand-txt1 leading-snug',
  /** Card heading — Subheading, slightly tighter in dense rows. */
  cardTitle: 'text-lg font-semibold text-brand-txt1 leading-snug',
  /** Emphasis inside a card. */
  subtitle: 'text-sm font-semibold text-brand-txt1 leading-normal',
  /** Overline label above a group of controls or values. */
  label: 'text-xs font-medium uppercase tracking-wider text-brand-txt2 leading-snug',
  /** Overline label that carries more weight in the hierarchy. */
  labelStrong: 'text-xs font-semibold uppercase tracking-wider text-brand-txt1 leading-snug',
  /** Body copy. */
  body: 'text-sm font-normal text-brand-txt1 leading-normal',
  /** Caption / supporting copy. */
  muted: 'text-xs font-medium text-brand-txt2 leading-snug',
  /** Dense metadata: dates, counters, footnotes. */
  meta: 'text-xs font-normal text-brand-txt2 leading-snug',
  /** Big number in a stat tile — Heading size. */
  stat: 'text-2xl font-bold text-brand-txt1 tabular-nums tracking-tight leading-tight',
  /** Inline textual action. */
  link: 'font-semibold text-brand-accent-ink hover:underline cursor-pointer transition-colors',
} as const;

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

export type BtnVariant =
  /** Main call to action; filled with the tone (accent by default). */
  | 'primary'
  /** Default action: card background with a border. */
  | 'secondary'
  /** Low emphasis, no chrome until hovered. */
  | 'ghost'
  /** Tinted background, used for scoped/contextual actions. */
  | 'soft'
  /** Filled with the given tone, without the accent glow of `primary`. */
  | 'solid';

export type BtnSize = 'xs' | 'sm' | 'md' | 'lg';

const BTN_SIZE: Record<BtnSize, string> = {
  xs: 'gap-1 px-2 py-1 text-xs rounded-xl',
  sm: 'gap-1.5 px-3 py-1.5 text-xs rounded-xl',
  md: 'gap-2 px-4 py-2 text-sm rounded-xl',
  /** DESIGN.md §3.1 — padding `14px 24px`, radius `12px`. */
  lg: 'gap-2 px-6 py-3.5 text-sm rounded-xl',
};

const BTN_BASE = cn(
  'inline-flex items-center justify-center font-semibold whitespace-nowrap select-none cursor-pointer',
  'transition-all duration-150 active:scale-[0.98]',
  'disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100',
  focusRing
);

/** Color treatment of a button, without any sizing. */
function btnLook(variant: BtnVariant, tone: Tone): string {
  switch (variant) {
    case 'primary':
      return cn(
        TONES[tone].solid,
        'border border-transparent shadow-sm',
        tone === 'accent' ? 'hover:bg-brand-accent-hover shadow-brand-accent/25' : 'hover:brightness-110'
      );
    case 'solid':
      return cn(TONES[tone].solid, 'border border-transparent hover:brightness-110');
    case 'soft':
      return cn(TONES[tone].soft, 'border hover:brightness-105');
    case 'ghost':
      return cn(
        'border border-transparent bg-transparent',
        tone === 'neutral' || tone === 'accent'
          ? 'text-brand-txt2 hover:text-brand-txt1 hover:bg-brand-surface'
          : cn(TONES[tone].ink, 'hover:bg-brand-surface')
      );
    case 'secondary':
    default:
      return cn(
        'bg-transparent text-brand-txt1 border border-brand-border',
        'hover:bg-brand-surface'
      );
  }
}

/**
 * Button classes.
 * @example btn('primary', 'lg')                  // main CTA
 * @example btn('secondary')                      // default action
 * @example btn('soft', 'sm', 'danger')           // scoped destructive action
 * @example btn('ghost', 'xs', 'neutral', 'w-full')
 */
export function btn(
  variant: BtnVariant = 'secondary',
  size: BtnSize = 'sm',
  tone: Tone = 'accent',
  extra?: ClassValue
): string {
  return cn(BTN_BASE, BTN_SIZE[size], btnLook(variant, tone), extra);
}

/** Square icon-only button. Always pass an `aria-label` or `title`. */
export function iconBtn(
  variant: BtnVariant = 'secondary',
  size: 'sm' | 'md' = 'sm',
  tone: Tone = 'accent',
  extra?: ClassValue
): string {
  return cn(
    BTN_BASE,
    'rounded-xl',
    size === 'sm' ? 'p-1.5' : 'p-2',
    btnLook(variant, tone),
    extra
  );
}

/**
 * Segmented control / tab strip. Use for the header nav, view scopes and any
 * mutually exclusive option row.
 */
export const segmented = {
  group: 'inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-brand-bg/80 border border-brand-border',
  item(active: boolean, extra?: ClassValue): string {
    return cn(
      'inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap cursor-pointer',
      'transition-all duration-150',
      focusRing,
      active
        ? 'font-semibold bg-brand-card text-brand-accent'
        : 'font-medium text-brand-txt2 hover:text-brand-txt1 hover:bg-brand-card/60',
      extra
    );
  },
} as const;

/** Bottom navigation item — DESIGN.md §3.2. Active state uses the primary CTA color. */
export function bottomNavItem(active: boolean, extra?: ClassValue): string {
  return cn(
    'flex-1 h-full flex flex-col items-center justify-center gap-0.5 text-xs cursor-pointer transition-colors',
    focusRing,
    active ? 'font-semibold text-brand-accent' : 'font-medium text-brand-txt2',
    extra
  );
}

/** Toggleable filter chip, e.g. weather and method selectors. */
export function filterChip(active: boolean, tone: Tone = 'accent', extra?: ClassValue): string {
  return cn(
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer',
    'transition-all duration-150 active:scale-[0.98] border',
    focusRing,
    active
      ? cn(TONES[tone].solid, 'border-transparent shadow-xs')
      : 'bg-brand-surface text-brand-txt2 border-brand-border hover:text-brand-txt1 hover:border-brand-accent/40',
    extra
  );
}

/* -------------------------------------------------------------------------- */
/* Form fields                                                                */
/* -------------------------------------------------------------------------- */

const FIELD_BASE = cn(
  'w-full rounded-xl bg-brand-surface border border-brand-border text-brand-txt1',
  'placeholder:text-brand-txt2/70 transition-colors hover:border-brand-accent/40',
  focusRing
);

export const field = {
  /** Label above an input. */
  label: 'block text-xs font-medium uppercase tracking-wider text-brand-txt2 leading-snug mb-1',
  input: cn(FIELD_BASE, 'px-3 py-2 text-sm'),
  inputSm: cn(FIELD_BASE, 'px-2.5 py-1.5 text-xs'),
  select: cn(FIELD_BASE, 'px-3 py-2 text-xs font-semibold cursor-pointer'),
  textarea: cn(FIELD_BASE, 'px-3 py-2 text-sm resize-y min-h-20'),
  /** Wrapper for an input that carries a leading icon. */
  withIcon: 'relative flex-1',
  icon: 'w-4 h-4 text-brand-txt2 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
  /** Extra left padding for the input inside `withIcon`. */
  iconInputPad: 'pl-9',
} as const;

/* -------------------------------------------------------------------------- */
/* Pills, badges & tiles                                                      */
/* -------------------------------------------------------------------------- */

const PILL_SIZE = {
  /** Uppercase micro-label. */
  xs: 'px-2 py-0.5 text-[10px] uppercase tracking-wider',
  /** Sentence-case chip. */
  sm: 'px-2.5 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
} as const;

export type PillSize = keyof typeof PILL_SIZE;

/** Tinted pill: statuses, counters, metadata. */
export function pill(tone: Tone = 'neutral', size: PillSize = 'xs', extra?: ClassValue): string {
  return cn(
    'inline-flex items-center gap-1 rounded-full border font-bold whitespace-nowrap',
    PILL_SIZE[size],
    TONES[tone].soft,
    extra
  );
}

/**
 * Pill geometry and weight with no colors attached, for the few pills whose
 * palette comes from data (trainer identity tags, Pokémon type maps). Combine
 * with that data-provided color string instead of a `Tone`.
 */
export function pillShape(size: PillSize = 'xs', extra?: ClassValue): string {
  return cn(
    'inline-flex items-center gap-1 rounded-full border font-bold whitespace-nowrap',
    PILL_SIZE[size],
    extra
  );
}

/** Filled pill, for the one badge that must dominate its row. */
export function pillSolid(tone: Tone = 'accent', size: PillSize = 'xs', extra?: ClassValue): string {
  return cn(
    'inline-flex items-center gap-1 rounded-full border border-transparent font-bold whitespace-nowrap',
    PILL_SIZE[size],
    TONES[tone].solid,
    extra
  );
}

/** Metric tile used in the stat grids of every view. */
export function statTile(tone: Tone = 'neutral', extra?: ClassValue): string {
  return cn(
    'rounded-xl border p-3.5 transition-colors',
    tone === 'neutral' ? 'bg-brand-surface border-brand-border' : TONES[tone].soft,
    extra
  );
}

/** Icon container that sits next to a title. */
export function iconTile(tone: Tone = 'accent', extra?: ClassValue): string {
  return cn(
    'inline-flex items-center justify-center rounded-xl p-2 border',
    tone === 'neutral' ? 'bg-brand-surface border-brand-border text-brand-txt2' : TONES[tone].soft,
    extra
  );
}

/** Empty-state block: icon bubble + title + hint. */
export const emptyState = {
  wrapper: cn(surface.panel, 'p-10 sm:p-12 text-center space-y-3'),
  bubble:
    'w-14 h-14 rounded-full bg-brand-surface border border-brand-border mx-auto flex items-center justify-center text-brand-txt2',
  title: 'text-base font-bold text-brand-txt1',
  hint: 'text-xs text-brand-txt2 max-w-sm mx-auto',
} as const;

/** Sprite frame used wherever a Pokémon artwork is shown. */
export function spriteFrame(interactive = false, extra?: ClassValue): string {
  return cn(
    'rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center shrink-0 overflow-hidden',
    interactive &&
      cn('cursor-pointer transition-all duration-150 hover:border-brand-accent/50 hover:scale-105', focusRing),
    extra
  );
}
