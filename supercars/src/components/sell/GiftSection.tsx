import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { WallPoster } from "@/components/showroom/WallPoster";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { IconGift } from "@/components/ui/icons";
import { TrustPoints } from "./TrustPoints";

const IDEAS = ["A birthday", "Their first car", "The car they sold", "A new driver", "Christmas"] as const;

/** Gift angle: who it is for, what the gift option does, one contextual way in (the framed poster). */
export function GiftSection({ entry, template, deliveryDays }: { entry: CarEntry; template: DesignTemplate; deliveryDays: string }) {
  return (
    <section aria-labelledby="gift-title" className="container-x section-t">
      <Reveal className="card grid overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-10 lg:p-12">
          <span className="icon-tile icon-tile-soft"><IconGift size={22} /></span>
          <h2 id="gift-title" className="h-display h-section mt-5 max-w-[16ch]">A gift they will actually hang.</h2>
          <p className="lead mt-3 max-w-[44ch]">Their car, their name, their year. Made for one person, so it never feels like a last-minute present.</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Gift ideas">
            {IDEAS.map((idea) => <li key={idea} className="rounded-full bg-fill px-3 py-1.5 text-[0.875rem] font-medium">{idea}</li>)}
          </ul>
          <TrustPoints className="mt-6" items={["Gift note in the box", "No prices on the packing slip", `Delivered in ${deliveryDays} business days`]} />
          <div className="mt-8">
            <Button href="/create?product=framed-car-poster" size="lg" variant="secondary">Design a framed gift</Button>
          </div>
        </div>
        <div className="wall relative flex items-center justify-center px-[18%] py-10 sm:py-14 lg:px-[16%]" aria-hidden="true">
          <WallPoster entry={entry} template={template} name="DAD" text="HAPPY 60TH" kind="framed-poster" className="w-full max-w-[17rem]" />
          <span className="absolute bottom-[9%] right-[10%] flex rotate-6 items-center gap-1.5 rounded-md bg-white px-3 py-2 text-[0.8125rem] font-medium text-[#1d1d1f] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]">
            <IconGift size={14} /> For Dad
          </span>
        </div>
      </Reveal>
    </section>
  );
}
