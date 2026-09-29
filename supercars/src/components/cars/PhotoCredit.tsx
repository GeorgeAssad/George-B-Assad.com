import type { CarPhoto } from "@/domain/catalog";

/** The attribution line a licence like CC BY requires, linking to the licence and to the original. */
export function PhotoCredit({ photo, className = "" }: { photo: CarPhoto; className?: string }) {
  const { credit } = photo;
  return (
    <p className={`spec ${className}`}>
      Photo: {credit.author} ·{" "}
      <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline underline-offset-2 hover:text-fg">{credit.licenseName}</a>
      {" "}·{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg">Wikimedia Commons</a>
      <span className="sr-only"> (links open in a new tab)</span>
    </p>
  );
}
