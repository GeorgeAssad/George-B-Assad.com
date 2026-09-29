import { notFound, redirect } from "next/navigation";
import { slugSchema } from "@/lib/validation";
import { getRepositories } from "@/server/repositories";

/** /products/[slug]/customize hands off to the single configurator, preselecting the product. */
export default async function CustomizeRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) notFound();
  const product = await getRepositories().products.getProductBySlug(slug);
  if (!product) notFound();
  redirect(`/create?product=${encodeURIComponent(product.slug)}`);
}
