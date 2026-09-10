import {sectionFields, sectionText} from '~/lib/sections';

/**
 * A prose block: heading plus paragraphs.
 *
 * Shopify's `multi_line_text_field` stores newlines literally, so paragraphs
 * are split here rather than injected as HTML. That is a deliberate choice —
 * accepting rich_text and rendering it with dangerouslySetInnerHTML would make
 * every merchant edit a potential XSS vector, and nothing on a category page
 * needs more formatting than paragraphs.
 *
 * @param {{section: object}}
 */
export function SectionRichText({section}) {
  const fields = sectionFields(section);
  const heading = sectionText(fields, 'heading');
  const body = sectionText(fields, 'body');

  if (!heading && !body) return null;

  const paragraphs = body
    .split(/\n{2,}|\r\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return (
    <section className="pk-section-prose">
      <div className="pk-section-prose__inner">
        {heading ? (
          <h2 className="pk-section-prose__heading">{heading}</h2>
        ) : null}
        {paragraphs.map((paragraph) => (
          <p className="pk-section-prose__body" key={paragraph.slice(0, 48)}>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
