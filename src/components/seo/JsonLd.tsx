// Inline JSON-LD <script> block. Drop this anywhere in a server component
// and Google / Bing / DuckDuckGo will pick up the schema.org data on crawl.
//
// Use the generator functions in `structured-data.ts` for typed shapes;
// pass the result to <JsonLd data={...} />.

interface Props {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  /** Optional id for debugging — appears as the script tag's id attribute. */
  id?: string;
}

export default function JsonLd({ data, id }: Props) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
