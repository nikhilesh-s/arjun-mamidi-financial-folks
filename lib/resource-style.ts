export const RESOURCE_STYLE_MARKER = /\n?\[\[ff-resource-style:([a-z-]+)\]\]$/;

export const RESOURCE_STYLE_OPTIONS = {
  classic: {
    key: 'classic',
    label: 'Book',
    iconClass: 'ti-book-2',
    iconBgClass: 'bg-[var(--accent-primary)]',
    buttonClass: 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)]',
  },
  games: {
    key: 'games',
    label: 'Video Game',
    iconClass: 'ti-device-gamepad-2',
    iconBgClass: 'bg-sky-500',
    buttonClass: 'bg-sky-500 hover:bg-sky-400',
  },
  brain: {
    key: 'brain',
    label: 'Brain',
    iconClass: 'ti-brain',
    iconBgClass: 'bg-[var(--accent-yellow)]',
    buttonClass: 'bg-[var(--accent-yellow)] hover:brightness-95 text-[#333333]',
  },
} as const;

export type ResourceStyleKey = keyof typeof RESOURCE_STYLE_OPTIONS;

export const DEFAULT_RESOURCE_STYLE: ResourceStyleKey = 'classic';

export function parseResourceStyle(description: string) {
  const match = description.match(RESOURCE_STYLE_MARKER);
  const styleKey = (match?.[1] as ResourceStyleKey | undefined) || DEFAULT_RESOURCE_STYLE;
  const normalizedStyle = RESOURCE_STYLE_OPTIONS[styleKey] ? styleKey : DEFAULT_RESOURCE_STYLE;

  return {
    styleKey: normalizedStyle,
    plainDescription: description.replace(RESOURCE_STYLE_MARKER, '').trim(),
  };
}

export function serializeResourceDescription(description: string, styleKey: ResourceStyleKey) {
  const cleanDescription = description.replace(RESOURCE_STYLE_MARKER, '').trim();
  return `${cleanDescription}\n[[ff-resource-style:${styleKey}]]`;
}
