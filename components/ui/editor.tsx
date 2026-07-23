interface EditorProps {
  html: string;
  className?: string;
}

export function Editor({ html, className = "" }: EditorProps) {
  return (
    <div
      className={[
        "prose-editor text-body text-ink",
        "[&_h2]:text-display-sm [&_h2]:text-forest [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:first:mt-0",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2",
        "[&_p]:leading-relaxed [&_p]:text-muted [&_p]:mt-0 [&_p]:mb-4",
        "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul_li]:mb-1 [&_ul_li]:text-muted",
        "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol_li]:mb-1 [&_ol_li]:text-muted",
        "[&_a]:text-forest [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-leaf",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        className,
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
