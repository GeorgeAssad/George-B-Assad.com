/** Typed analytics events. Props must never contain personal data. */
export interface AnalyticsEventMap {
  page_view: { path: string };
  car_search: { queryLength: number; results: number };
  car_selected: { carSlug: string };
  style_selected: { templateId: string };
  size_selected: { sizeId: string };
  preview_generated: { carSlug: string; templateId: string; sizeId: string };
  add_to_cart: { carSlug: string; templateId: string; sizeId: string; quantity: number };
  checkout_started: { itemCount: number };
  demo_purchase_completed: { orderId: string; itemCount: number };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
