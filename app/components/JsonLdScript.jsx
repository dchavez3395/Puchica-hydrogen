/**
 * Render a JSON-LD <script> tag. Place this near the top of a route's
 * default export so it appears in the SSR HTML, not after hydration.
 *
 * Lives in a `.jsx` file (not `app/lib/seo.js`) because the Vite/oxc
 * parser is configured to only allow JSX in `.jsx`/`.tsx` files.
 *
 * @param {{data: object}} props
 */
export function JsonLdScript({data}) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}
