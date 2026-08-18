/**
 * Lucide-style line icons (24px grid, 2px stroke, currentColor).
 * Used across the storefront in place of emoji.
 */
function Svg({size = 22, children, fill = 'none', ...props}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconTruck = (p) => (
  <Svg {...p}>
    <path d="M14 18V6a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" />
    <path d="M14 9h4l3 3v5a1 1 0 0 1-1 1h-1" />
    <circle cx="6.5" cy="18.5" r="1.8" />
    <circle cx="17.5" cy="18.5" r="1.8" />
  </Svg>
);

export const IconReturn = (p) => (
  <Svg {...p}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
  </Svg>
);

export const IconShield = (p) => (
  <Svg {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

export const IconSparkles = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
    <path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
  </Svg>
);

export const IconBag = (p) => (
  <Svg {...p}>
    <path d="M6 8h12l1 12H5L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </Svg>
);

export const IconInstagram = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </Svg>
);

export const IconFacebook = (p) => (
  <Svg {...p}>
    <path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2V3Z" />
  </Svg>
);

export const IconTiktok = (p) => (
  <Svg {...p}>
    <path d="M16 3c.3 2.3 1.8 3.9 4 4.2v3c-1.6 0-3-.5-4-1.3V15a5.5 5.5 0 1 1-5.5-5.5c.4 0 .7 0 1 .1v3a2.5 2.5 0 1 0 1.5 2.3V3h3Z" />
  </Svg>
);

export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconMinus = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="M5 12l4 4L19 6" />
  </Svg>
);

export const IconChevronLeft = (p) => (
  <Svg {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
);

export const IconChevronRight = (p) => (
  <Svg {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

export const IconPackage = (p) => (
  <Svg {...p}>
    <path d="M16.5 9.4 12 12 7.5 9.4" />
    <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="M3.3 7 12 12l8.7-5" />
    <path d="M12 22V12" />
  </Svg>
);

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);
