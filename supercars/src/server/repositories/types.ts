import type { Brand, CarEntry, DesignTemplate, PosterSize, Product, ProductVariant, SizeId, TemplateId } from "@/domain/catalog";
import type { Customer, CustomerInput } from "@/domain/customer";
import type { Order } from "@/domain/order";
import type { DemoReview } from "@/data/reviews";
import type { MediaItem } from "@/data/media";

/* REPOSITORY BOUNDARIES — the only way server code reads or writes data.
 * Today: local demo data. Later: PostgreSQL / Supabase / D1 behind the same
 * interfaces. Pages and services depend on these types, never on `data/*`. */

export interface CarRepository {
  listBrands(): Promise<readonly Brand[]>;
  listEntries(): Promise<readonly CarEntry[]>;
  getEntryBySlug(slug: string): Promise<CarEntry | null>;
}

export interface ProductRepository {
  listProducts(): Promise<readonly Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getVariant(productId: string, sizeId: SizeId): Promise<ProductVariant | null>;
  listSizes(): Promise<readonly PosterSize[]>;
}

export interface TemplateRepository {
  list(): Promise<readonly DesignTemplate[]>;
  getById(id: TemplateId): Promise<DesignTemplate | null>;
}

export interface OrderRepository {
  get(orderId: string): Promise<Order | null>;
  /** Idempotent by `order.id`: creating the same id twice returns the first order. */
  create(order: Order): Promise<Order>;
}

export interface CustomerRepository {
  upsertByEmail(input: CustomerInput): Promise<Customer>;
}

export interface ContentRepository {
  listReviews(): Promise<readonly DemoReview[]>;
  listMedia(): Promise<readonly MediaItem[]>;
}

export interface Repositories {
  readonly cars: CarRepository;
  readonly products: ProductRepository;
  readonly templates: TemplateRepository;
  readonly orders: OrderRepository;
  readonly customers: CustomerRepository;
  readonly content: ContentRepository;
}
