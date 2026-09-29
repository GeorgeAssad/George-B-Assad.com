import { notFound } from "next/navigation";
import { CarPhotoImage } from "@/components/cars/CarPhotoImage";
import { StudioCar } from "@/components/cars/StudioCar";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { getRepositories } from "@/server/repositories";

/**
 * DEV-ONLY render target for `npm run og` (Open Graph and template preview images).
 * Returns 404 in any production build, so it is never reachable on the deployed site.
 */
export const dynamic = "force-dynamic";

const COPY: Record<string, { eyebrow: string; title: string; sub: string }> = {
  home: { eyebrow: "Personalized automotive artwork", title: "Turn your car into art.", sub: "Pick your car. Choose a style. Add your name." },
  create: { eyebrow: "The poster designer", title: "Create your poster.", sub: "Your car, five styles, three sizes — preview it live." },
  shop: { eyebrow: "Shop", title: "Posters made for your car.", sub: "Print or framed. Made to order." },
};

export default async function OgPreview({ params }: { params: Promise<{ key: string[] }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { key } = await params;
  const [kind, id] = key;
  const repos = getRepositories();
  const templates = await repos.templates.list();
  const racing = templates.find((t) => t.id === "racing")!;

  if (kind === "template" && id) {
    const tpl = templates.find((t) => t.id === id);
    const m3 = await repos.cars.getEntryBySlug("bmw-m3-g80");
    if (!tpl || !m3) notFound();
    return (
      <div id="og" style={{ position: "fixed", inset: 0, zIndex: 9999, width: 600, height: 840, background: "#050506" }}>
        <PosterPreview template={tpl} vehicle={m3.generation.vehicle} customization={{ name: "GEORGE", text: "Sunday Drive", year: "2024" }} vehicleName={m3.generation.displayName} specs={m3.generation.specs} sizeId="40x60" />
      </div>
    );
  }

  const carEntry = kind === "car" && id ? await repos.cars.getEntryBySlug(id) : await repos.cars.getEntryBySlug("nissan-gt-r-r35");
  if (!carEntry) notFound();
  const photo = carEntry.generation.photos[0];
  const copy = kind === "car" ? { eyebrow: carEntry.brand.name, title: `${carEntry.car.name} ${carEntry.generation.generation}`, sub: `Personalized poster · ${carEntry.generation.specs.years}` } : COPY[kind ?? "home"] ?? COPY.home!;

  return (
    <div id="og" style={{ position: "fixed", inset: 0, zIndex: 9999, width: 1200, height: 630, overflow: "hidden", background: "radial-gradient(ellipse 60% 70% at 78% 100%, rgba(225,6,0,0.34), transparent 70%), #050506" }}>
      {photo?.mode === "cutout" ? (
        <>
          <div className="studio-floor" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 210 }} />
          <div style={{ position: "absolute", right: 40, bottom: 120, width: 700 }}>
            <StudioCar slug={carEntry.generation.slug} photo={photo} priority sizes="700px" />
          </div>
        </>
      ) : photo ? (
        <>
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 860 }}>
            <CarPhotoImage slug={carEntry.generation.slug} photo={photo} priority sizes="860px" className="photo-cinema" alt="" />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #050506 0, #050506 26%, rgba(5,5,6,0.78) 40%, rgba(5,5,6,0.1) 66%, transparent 100%), linear-gradient(0deg, rgba(5,5,6,0.85) 0, transparent 34%)" }} />
        </>
      ) : (
        <div className="tech-grid" style={{ position: "absolute", inset: 0, opacity: 0.6 }} />
      )}
      <div style={{ position: "absolute", left: 72, top: 64, right: photo ? 640 : 560 }}>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="h-display" style={{ marginTop: 22, fontSize: copy.title.length > 16 ? 104 : 128, lineHeight: 0.9 }}>{copy.title}</h1>
        <p style={{ marginTop: 26, fontSize: 26, color: "#b4b6bd", maxWidth: 520 }}>{copy.sub}</p>
      </div>
      <div style={{ position: "absolute", left: 72, bottom: 56, display: "flex", alignItems: "center", gap: 14 }}>
        <span className="logo-mark" aria-hidden="true"><span>SC</span></span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, letterSpacing: "0.14em", textTransform: "uppercase" }}>Super<span style={{ color: "#ff4d40" }}>Cars</span></span>
      </div>
      {photo && photo.credit.licenseName.startsWith("CC BY") && (
        <p style={{ position: "absolute", left: 72, bottom: 22, margin: 0, fontSize: 14, color: "rgba(255,255,255,0.62)" }}>
          Photo: {photo.credit.author} · {photo.credit.licenseName} · Wikimedia Commons
        </p>
      )}
      {photo ? (
        <div style={{ position: "absolute", right: 56, bottom: 44, width: 190, transform: "rotate(5deg)", boxShadow: "0 30px 60px -16px rgba(0,0,0,0.95)" }}>
          <PosterPreview template={racing} vehicle={carEntry.generation.vehicle} customization={{ name: "GEORGE", year: "2024" }} vehicleName={carEntry.generation.displayName} specs={carEntry.generation.specs} sizeId="50x70" />
        </div>
      ) : (
        <>
          <div style={{ position: "absolute", right: 96, top: 50, width: 360, transform: "rotate(5deg)", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.9)" }}>
            <PosterPreview template={racing} vehicle={carEntry.generation.vehicle} customization={{ name: "GEORGE", year: "2024" }} vehicleName={carEntry.generation.displayName} specs={carEntry.generation.specs} sizeId="50x70" />
          </div>
          <div style={{ position: "absolute", right: -30, bottom: -14, width: 620 }}>
            <VehicleArt vehicle={carEntry.generation.vehicle} shadowOpacity={0.9} />
          </div>
        </>
      )}
    </div>
  );
}
