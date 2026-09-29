import { brands, cars, generations } from "@/data/cars";
import { posterSizes, products } from "@/data/products";
import { templates } from "@/data/templates";
import { shippingDestinations, shippingRules } from "@/data/shipping";
import { demoReviews } from "@/data/reviews";
import { mediaItems } from "@/data/media";
import { sampleOrders } from "@/data/orders";
import type { CarEntry } from "@/domain/catalog";
import type { Customer } from "@/domain/customer";
import type { Order } from "@/domain/order";
import type {
  CarRepository,
  ContentRepository,
  CustomerRepository,
  OrderRepository,
  ProductRepository,
  Repositories,
  TemplateRepository,
} from "../types";
import { newId } from "@/lib/ids";

/* LOCAL DEMO IMPLEMENTATIONS. Order/customer writes live in per-isolate memory
 * (Workers do not share memory between isolates) — good enough to demo the
 * flow; replace with a database-backed repository for real orders. */

const buildEntries = (): readonly CarEntry[] => {
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const carById = new Map(cars.map((c) => [c.id, c]));
  const entries: CarEntry[] = [];
  for (const generation of generations) {
    const car = carById.get(generation.carId);
    const brand = car ? brandById.get(car.brandId) : undefined;
    if (car && brand) entries.push({ brand, car, generation });
  }
  return entries;
};

const entries = buildEntries();

const carRepository: CarRepository = {
  listBrands: async () => [...brands].sort((a, b) => b.popularity - a.popularity),
  listEntries: async () => [...entries].sort((a, b) => b.generation.popularity - a.generation.popularity),
  getEntryBySlug: async (slug) => entries.find((e) => e.generation.slug === slug) ?? null,
};

const productRepository: ProductRepository = {
  listProducts: async () => products,
  getProductBySlug: async (slug) => products.find((p) => p.slug === slug) ?? null,
  getProductById: async (id) => products.find((p) => p.id === id) ?? null,
  getVariant: async (productId, sizeId) =>
    products.find((p) => p.id === productId)?.variants.find((v) => v.sizeId === sizeId) ?? null,
  listSizes: async () => posterSizes,
  listShippingDestinations: async () => shippingDestinations,
  getShippingRules: async () => shippingRules,
};

const templateRepository: TemplateRepository = {
  list: async () => templates,
  getById: async (id) => templates.find((t) => t.id === id) ?? null,
};

interface MemoryStore {
  orders: Map<string, Order>;
  customers: Map<string, Customer>;
}

const globalStore = globalThis as typeof globalThis & { __scStore?: MemoryStore };
const store: MemoryStore = (globalStore.__scStore ??= {
  orders: new Map(sampleOrders.map((o) => [o.id, o])),
  customers: new Map(),
});

const MAX_MEMORY_ORDERS = 500;

const orderRepository: OrderRepository = {
  get: async (id) => store.orders.get(id) ?? null,
  create: async (order) => {
    const existing = store.orders.get(order.id);
    if (existing) return existing;
    if (store.orders.size >= MAX_MEMORY_ORDERS) {
      // Evict the oldest non-seed order so abuse cannot grow memory unbounded.
      const oldest = [...store.orders.keys()].find((k) => !sampleOrders.some((s) => s.id === k));
      if (oldest) store.orders.delete(oldest);
    }
    store.orders.set(order.id, order);
    return order;
  },
};

const customerRepository: CustomerRepository = {
  upsertByEmail: async (input) => {
    const key = input.email.trim().toLowerCase();
    const existing = store.customers.get(key);
    const customer: Customer = {
      id: existing?.id ?? newId("cus"),
      name: input.name,
      email: key,
      ...(input.phone ? { phone: input.phone } : {}),
    };
    store.customers.set(key, customer);
    return customer;
  },
};

const contentRepository: ContentRepository = {
  listReviews: async () => demoReviews,
  listMedia: async () => mediaItems,
};

export const localRepositories: Repositories = {
  cars: carRepository,
  products: productRepository,
  templates: templateRepository,
  orders: orderRepository,
  customers: customerRepository,
  content: contentRepository,
};
