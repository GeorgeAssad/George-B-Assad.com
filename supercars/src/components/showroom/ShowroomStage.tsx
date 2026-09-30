import type { ElementType, ReactNode } from "react";

interface ShowroomStageProps {
  readonly children: ReactNode;
  /** Big outlined word behind the content (usually the model name). Decorative. */
  readonly word?: string;
  readonly wordClassName?: string;
  readonly className?: string;
  readonly as?: ElementType;
  readonly cone?: boolean;
  readonly floor?: boolean;
  /** id of the heading that names this stage when it is a `<section>`. */
  readonly labelledBy?: string;
}

/**
 * The site's lighting: near-black studio, a cone of light from above, a glossy floor fading out at the horizon,
 * a red glow low in the frame and a touch of film grain. Always dark, in both themes.
 */
export function ShowroomStage({ children, word, wordClassName = "top-[2%] text-[clamp(7rem,24vw,22rem)]", className = "", as: Tag = "div", cone = true, floor = true, labelledBy }: ShowroomStageProps) {
  return (
    <Tag aria-labelledby={labelledBy} className={`on-dark studio-stage grain relative isolate overflow-hidden text-fg ${className}`}>
      {cone && <div className="spotlight-cone" aria-hidden="true" />}
      {word && <span aria-hidden="true" className={`outlined-word ${wordClassName}`}>{word}</span>}
      {floor && <div className="studio-floor absolute inset-x-0 bottom-0 -z-[3] h-[38%]" aria-hidden="true" />}
      {children}
    </Tag>
  );
}
