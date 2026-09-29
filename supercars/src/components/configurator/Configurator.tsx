"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { CartItem, Customization } from "@/domain/cart";
import type { TemplateId, SizeId } from "@/domain/catalog";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { IconArrow, IconArrowLeft, IconCheck } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { getSnapshot } from "@/lib/cart-store";
import { normalizeText } from "@/lib/validation";
import { openCartDrawer } from "@/lib/ui-store";
import { useCart } from "@/lib/use-cart";
import { useCartQuote } from "@/lib/use-cart-quote";
import { ConfiguratorSkeleton } from "./ConfiguratorSkeleton";
import { PreviewPanel } from "./PreviewPanel";
import { StepCar } from "./StepCar";
import { StepPersonalize } from "./StepPersonalize";
import { StepPreview } from "./StepPreview";
import { StepSize } from "./StepSize";
import { StepStyle } from "./StepStyle";
import { StepSummary } from "./StepSummary";
import { Stepper } from "./Stepper";
import { INITIAL_STATE, STEPS, canContinue, configReducer, initialFromParams, stateFromCartItem, toCustomization, validateCustomization, type Catalog, type Step } from "./config-state";
import { useDesignPreview } from "./use-design-preview";

const HEADINGS: Record<Step, { title: string; lead: string }> = {
  1: { title: "Choose your car.", lead: "Search the catalog and pick your model and generation." },
  2: { title: "Choose your style.", lead: "Five design templates. You can change it any time." },
  3: { title: "Choose your size.", lead: "Pick a finish and a size. Prices update instantly." },
  4: { title: "Make it yours.", lead: "Add your name and, if you like, a line of text, a year and a place." },
  5: { title: "Your preview.", lead: "We compose the poster from your car, style and details." },
  6: { title: "Ready to add.", lead: "Check the details, then add it to your cart." },
};

const PRICE_PROBE_NAME = "PRICE";

export function Configurator({ catalog }: { catalog: Catalog }) {
  const [state, dispatch] = useReducer(configReducer, INITIAL_STATE);
  const [ready, setReady] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [added, setAdded] = useState(false);
  const cart = useCart();
  const toast = useToast();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  /* ---- initial state from URL (deep links) or from a cart line (edit) ---- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    const line = editId ? getSnapshot().items.find((i) => i.id === editId) : undefined;
    dispatch({ type: "replace", state: line ? stateFromCartItem(line) : initialFromParams(params, catalog) });
    setReady(true);
  }, [catalog]);

  /* ---- derived data ---- */
  const entry = catalog.cars.find((c) => c.generation.slug === state.carSlug) ?? null;
  const template = catalog.templates.find((t) => t.id === state.templateId) ?? catalog.templates[0]!;
  const product = catalog.products.find((p) => p.id === state.productId) ?? catalog.products[0]!;
  const size = catalog.sizes.find((s) => s.id === state.sizeId) ?? catalog.sizes[0]!;
  const check = validateCustomization(state);

  // What appears on the poster while typing (normalised, never raw HTML).
  const display: Customization = useMemo(
    () => ({
      name: normalizeText(state.name).slice(0, 24),
      ...(state.text.trim() ? { text: normalizeText(state.text) } : {}),
      ...(state.year.trim() ? { year: normalizeText(state.year) } : {}),
      ...(state.location.trim() ? { location: normalizeText(state.location) } : {}),
    }),
    [state.name, state.text, state.year, state.location],
  );

  const request = useMemo(
    () => (entry && check.ok ? { carSlug: entry.generation.slug, templateId: state.templateId, sizeId: state.sizeId, customization: check.value } : null),
    // check.value identity changes every render; key on the primitives instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entry?.generation.slug, state.templateId, state.sizeId, state.name, state.text, state.year, state.location, check.ok],
  );
  const preview = useDesignPreview(request);

  // Price probe: name is irrelevant to price, so the quote refetches only when pricing inputs change.
  const probe: CartItem[] = useMemo(
    () => (entry ? [{ id: "probe", productId: state.productId, sizeId: state.sizeId, carSlug: entry.generation.slug, templateId: state.templateId, customization: { name: PRICE_PROBE_NAME }, quantity: state.quantity }] : []),
    [entry, state.productId, state.sizeId, state.templateId, state.quantity],
  );
  const quote = useCartQuote(probe, ready && entry !== null);
  const line = quote.quote?.lines[0];

  /* ---- effects ---- */
  useEffect(() => {
    if (state.step === 5 && preview.status === "idle" && request) void preview.run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, preview.status, request]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setShowErrors(false);
    headingRef.current?.focus({ preventScroll: true });
    topRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [state.step]);

  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (state.carSlug) p.set("car", state.carSlug);
    if (state.carSlug) p.set("style", state.templateId);
    if (state.carSlug) p.set("size", state.sizeId);
    if (state.productId !== INITIAL_STATE.productId) p.set("product", state.productId);
    if (state.editingId) p.set("edit", state.editingId);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [ready, state.carSlug, state.templateId, state.sizeId, state.productId, state.editingId]);

  // Any change after adding to the cart starts a fresh "unsaved" state.
  useEffect(() => setAdded(false), [state.carSlug, state.templateId, state.sizeId, state.productId, state.name, state.text, state.year, state.location, state.quantity]);

  if (!ready) return <ConfiguratorSkeleton />;

  const go = (step: Step) => dispatch({ type: "goto", step });
  const heading = HEADINGS[state.step];
  const editing = state.editingId !== null;

  /* ---- actions ---- */
  const onNext = () => {
    if (state.step === 4 && !check.ok) {
      setShowErrors(true);
      const first = Object.keys(check.errors)[0];
      if (first) document.querySelector<HTMLInputElement>(`input[id$="-${first}"]`)?.focus();
      return;
    }
    if (state.step === 6) return addToCart();
    go((state.step + 1) as Step);
  };

  const addToCart = () => {
    if (!entry || !check.ok) return;
    const item = { productId: state.productId, sizeId: state.sizeId, carSlug: entry.generation.slug, templateId: state.templateId, customization: check.value, quantity: state.quantity };
    if (state.editingId) cart.replace(state.editingId, item);
    else cart.add(item);
    track("add_to_cart", { carSlug: item.carSlug, templateId: item.templateId, sizeId: item.sizeId, quantity: item.quantity });
    toast({ title: editing ? "Cart updated" : "Added to cart", description: `${entry.generation.displayName} · ${template.name} · ${size.label}`, tone: "success" });
    setAdded(true);
    openCartDrawer();
  };

  const primaryLabel = state.step === 4 ? "Generate preview" : state.step === 6 ? (editing ? "Update cart" : "Add to cart") : "Continue";
  const primaryDisabled = state.step === 1 ? !canContinue(state) : state.step === 5 ? preview.status !== "ready" : state.step === 6 ? !check.ok || !line : false;

  return (
    <div className="container-x py-6 sm:py-10">
      <div ref={topRef} className="scroll-mt-20" />
      <p className="eyebrow">SC / Create{editing ? " — editing" : ""}</p>
      <div className="mt-5"><Stepper current={state.step} maxStep={state.maxStep} onGo={go} /></div>

      {/* Mobile: compact live preview pinned under the header (steps 2-4). */}
      {entry && state.step >= 2 && state.step <= 4 && (
        <div className="glass sticky top-16 z-30 -mx-4 mt-5 flex items-center gap-3 border-x-0 px-4 py-2 lg:hidden">
          <div className="w-11 flex-none overflow-hidden rounded-[3px] ring-1 ring-line-strong">
            <PosterPreview template={template} vehicle={entry.generation.vehicle} customization={display} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId={state.sizeId} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{entry.generation.displayName}</p>
            <p className="truncate text-xs text-muted">{template.name} · {size.label}</p>
          </div>
          {line ? <Price value={line.lineTotal} className="text-base" /> : <Skeleton className="h-5 w-14" />}
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <div className="min-w-0">
          <div key={state.step} className="page-enter">
            <h1 ref={headingRef} tabIndex={-1} className="h-display text-[clamp(2.6rem,7vw,4.5rem)] outline-none">{heading.title}</h1>
            <p className="mt-3 max-w-lg text-muted">{heading.lead}</p>

            <div className="mt-8">
              {state.step === 1 && <StepCar cars={catalog.cars} selected={state.carSlug} onSelect={(slug) => { dispatch({ type: "selectCar", slug }); track("car_selected", { carSlug: slug }); }} />}
              {state.step === 2 && entry && <StepStyle templates={catalog.templates} entry={entry} customization={display} selected={state.templateId} onSelect={(id: TemplateId) => { dispatch({ type: "selectTemplate", id }); track("style_selected", { templateId: id }); }} />}
              {state.step === 3 && <StepSize sizes={catalog.sizes} products={catalog.products} template={template} productId={state.productId} sizeId={state.sizeId} onProduct={(id) => dispatch({ type: "selectProduct", id })} onSize={(id: SizeId) => { dispatch({ type: "selectSize", id }); track("size_selected", { sizeId: id }); }} />}
              {state.step === 4 && <StepPersonalize state={state} showErrors={showErrors} onChange={(field, value) => dispatch({ type: "setField", field, value })} />}
              {state.step === 5 && (
                <>
                  {entry && <div className="mx-auto mb-8 max-w-[15rem] lg:hidden"><PreviewPanel entry={entry} template={template} customization={display} sizeId={state.sizeId} kind={product.kind} generating={preview.status === "running"} /></div>}
                  <StepPreview preview={preview} onRetry={() => void preview.run()} />
                </>
              )}
              {state.step === 6 && entry && check.ok && (
                <>
                  <div className="mx-auto mb-8 max-w-[15rem] lg:hidden"><PreviewPanel entry={entry} template={template} customization={display} sizeId={state.sizeId} kind={product.kind} /></div>
                  <StepSummary entry={entry} template={template} product={product} size={size} customization={check.value} quantity={state.quantity} onQuantity={(q) => dispatch({ type: "setQuantity", quantity: q })} onEdit={go} quote={quote.quote} quoteFailed={quote.status === "error"} />
                </>
              )}
            </div>
          </div>

          {/* Action bar: fixed on mobile, inline on desktop */}
          <div className="glass safe-bottom fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 px-4 pt-3 lg:static lg:mt-10 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:backdrop-blur-none">
            <div className="mx-auto flex max-w-xl items-center gap-3 lg:mx-0 lg:max-w-none">
              {state.step > 1 && (
                <Button variant="secondary" onClick={() => go((state.step - 1) as Step)} aria-label="Back" className="!px-0 size-12 flex-none !min-h-0 sm:!px-6 sm:size-auto sm:!min-h-12">
                  <IconArrowLeft size={18} /><span className="hidden sm:inline">Back</span>
                </Button>
              )}
              <div className="min-w-0 flex-1 text-right lg:text-left">
                {line ? (
                  <><p className="spec">{state.quantity > 1 ? `Total ×${state.quantity}` : "Price"}</p><Price value={line.lineTotal} precise className="text-lg" /></>
                ) : entry ? <Skeleton className="ml-auto h-9 w-24 lg:ml-0" /> : <p className="text-sm text-muted">Choose a car to see the price</p>}
              </div>
              {added && state.step === 6 ? (
                <Button size="lg" onClick={() => (editing ? (window.location.href = "/cart") : openCartDrawer())}><IconCheck size={18} /> View cart</Button>
              ) : (
                <Button size="lg" onClick={onNext} disabled={primaryDisabled} aria-disabled={primaryDisabled}>
                  {primaryLabel} {state.step !== 6 && <IconArrow size={18} />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop live preview */}
        <aside aria-label="Poster preview" className="hidden lg:block">
          <div className="sticky top-28">
            <PreviewPanel entry={entry} template={template} customization={display} sizeId={state.sizeId} kind={product.kind} generating={state.step === 5 && preview.status === "running"} />
            {entry && <p className="mt-4 text-center text-sm text-muted">{entry.generation.displayName} · {template.name} · {size.label}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
