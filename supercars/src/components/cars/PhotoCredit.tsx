import type { CarPhoto } from "@/domain/catalog";

/**
 * The attribution line a licence like CC BY requires (author, licence, link to the original),
 * or a plain label for images we own or generated ourselves.
 */
export function PhotoCredit({ photo, className = "" }: { photo: CarPhoto; className?: string }) {
  const { credit } = photo;
  if (credit.kind === "own") {
    return <p className={`spec ${className}`}>Image: {credit.author}{credit.note ? ` · ${credit.note}` : ""}</p>;
  }
  return (
    <p className={`spec ${className}`}>
      Photo: {credit.author} ·{" "}
      <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline underline-offset-2 hover:text-fg">{credit.licenseName}</a>
      {" "}·{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg">{credit.sourceName ?? "Source"}</a>
      <span className="sr-only"> (links open in a new tab)</span>
    </p>
  );
}
