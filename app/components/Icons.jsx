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

export const IconHeart = (p) => (
  <Svg {...p}>
    <path d="M19 14c1.5-1.5 3-3.4 3-5.5A4.5 4.5 0 0 0 12 5 4.5 4.5 0 0 0 2 8.5C2 11 4 13 6 14.5l6 5.5 7-6Z" />
  </Svg>
);

export const IconShirt = (p) => (
  <Svg {...p}>
    <path d="M20.4 5.6 16 4a4 4 0 0 1-8 0L3.6 5.6a1 1 0 0 0-.6 1.3l1 3a1 1 0 0 0 1.3.6L7 10v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-9l1.7.5a1 1 0 0 0 1.3-.6l1-3a1 1 0 0 0-.6-1.3Z" />
  </Svg>
);

export const IconLaptop = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M2 20h20" />
  </Svg>
);

export const IconHome = (p) => (
  <Svg {...p}>
    <path d="m3 10 9-7 9 7" />
    <path d="M5 9v11h14V9" />
    <path d="M10 20v-6h4v6" />
  </Svg>
);

export const IconSparkles = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
    <path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
  </Svg>
);

export const IconLeaf = (p) => (
  <Svg {...p}>
    <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 9-4 14-9 16Z" />
    <path d="M4 20c4-6 8-8 13-9" />
  </Svg>
);

export const IconGift = (p) => (
  <Svg {...p}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M5 12v8h14v-8" />
    <path d="M12 8v12" />
    <path d="M12 8S10.5 4 8 4a2 2 0 0 0 0 4Zm0 0s1.5-4 4-4a2 2 0 0 1 0 4Z" />
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

export const IconX = (p) => (
  <Svg {...p}>
    <path d="M4 4l16 16M20 4 4 20" />
  </Svg>
);

export const IconTiktok = (p) => (
  <Svg {...p}>
    <path d="M16 3c.3 2.3 1.8 3.9 4 4.2v3c-1.6 0-3-.5-4-1.3V15a5.5 5.5 0 1 1-5.5-5.5c.4 0 .7 0 1 .1v3a2.5 2.5 0 1 0 1.5 2.3V3h3Z" />
  </Svg>
);

/** Map a collection/category title to an icon component. */
export function categoryIcon(title = '', props) {
  const t = title.toLowerCase();
  if (/fashion|cloth|apparel|wear|shirt|sweater|jacket/.test(t)) return <IconShirt {...props} />;
  if (/electronic|tech|gadget|device|audio|phone|laptop/.test(t)) return <IconLaptop {...props} />;
  if (/home|kitchen|decor|furnitur/.test(t)) return <IconHome {...props} />;
  if (/beauty|skin|makeup|fragrance|care/.test(t)) return <IconSparkles {...props} />;
  if (/pet|dog|cat/.test(t)) return <IconBag {...props} />;
  if (/outdoor|garden|sport|plant/.test(t)) return <IconLeaf {...props} />;
  if (/gift|sale|deal|best|trending/.test(t)) return <IconGift {...props} />;
  return <IconBag {...props} />;
}
