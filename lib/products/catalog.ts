import type { Product } from "@/lib/types";
import { RESTAURANT_ID } from "@/lib/constants";

export type ProductCategory = "Crousty" | "Spicy" | "Sweet" | "Drink";

export type CatalogItem = {
  slug: string;
  name: string;
  price: number;
  category: ProductCategory;
  description: string;
};

/** Stable IDs for cart / orders when using local catalog */
const ID: Record<string, string> = {
  "crousty-spicy": "a1000001-0000-4000-8000-000000000001",
  "crousty-curry-spicy": "a1000001-0000-4000-8000-000000000002",
  "crousty-curry-sweet": "a1000001-0000-4000-8000-000000000003",
  "crousty-curry-thai": "a1000001-0000-4000-8000-000000000004",
  "crousty-mix": "a1000001-0000-4000-8000-000000000005",
  "crousty-sweet": "a1000001-0000-4000-8000-000000000006",
  "crousty-classic": "a1000001-0000-4000-8000-000000000007",
  "crousty-curry-mix": "a1000001-0000-4000-8000-000000000008",
  "creme-dessert-bueno": "a1000002-0000-4000-8000-000000000001",
  "creme-dessert-ferrero": "a1000002-0000-4000-8000-000000000002",
  "creme-dessert-pistache": "a1000002-0000-4000-8000-000000000003",
  "creme-dessert-caramel-speculoos": "a1000002-0000-4000-8000-000000000004",
  "creme-dessert-nutella": "a1000002-0000-4000-8000-000000000005",
  "creme-dessert-vanille-framboise": "a1000002-0000-4000-8000-000000000006",
  "creme-dessert-bounty": "a1000002-0000-4000-8000-000000000007",
  "creme-dessert-raffaello": "a1000002-0000-4000-8000-000000000008",
  "creme-dessert-framboise-pistache": "a1000002-0000-4000-8000-000000000009",
  "creme-brulee": "a1000002-0000-4000-8000-000000000010",
  "tiramisu-caramel": "a1000003-0000-4000-8000-000000000001",
  "tiramisu-pistache": "a1000003-0000-4000-8000-000000000002",
  "tiramisu-bueno": "a1000003-0000-4000-8000-000000000003",
  "tiramisu-chocolat": "a1000003-0000-4000-8000-000000000004",
};

export const PRODUCT_CATALOG: CatalogItem[] = [
  {
    slug: "crousty-classic",
    name: "Crousty Classic",
    price: 750,
    category: "Crousty",
    description:
      "Riz blanc, poulet crousty, sauce blanche, oignons frits, persil.",
  },
  {
    slug: "crousty-spicy",
    name: "Crousty Spicy",
    price: 750,
    category: "Spicy",
    description:
      "Riz blanc, poulet crousty, sauce blanche, sauce piquante, oignons frits, persil.",
  },
  {
    slug: "crousty-sweet",
    name: "Crousty Sweet",
    price: 750,
    category: "Sweet",
    description:
      "Riz blanc, poulet crousty, sauce blanche, sauce sucrée, oignons frits, persil.",
  },
  {
    slug: "crousty-mix",
    name: "Crousty Mix",
    price: 800,
    category: "Crousty",
    description:
      "Riz blanc, poulet crousty, sauce blanche, sauce sucrée, sauce piquante, oignons frits, persil.",
  },
  {
    slug: "crousty-curry-thai",
    name: "Crousty Curry Thai",
    price: 800,
    category: "Crousty",
    description:
      "Riz blanc, poulet crousty, sauce curry, oignons frits, persil.",
  },
  {
    slug: "crousty-curry-spicy",
    name: "Crousty Curry Spicy",
    price: 800,
    category: "Spicy",
    description:
      "Riz blanc, poulet crousty, sauce curry, sauce piquante, oignons frits, persil.",
  },
  {
    slug: "crousty-curry-sweet",
    name: "Crousty Curry Sweet",
    price: 800,
    category: "Sweet",
    description:
      "Riz blanc, poulet crousty, sauce curry, sauce sucrée, oignons frits, persil.",
  },
  {
    slug: "crousty-curry-mix",
    name: "Crousty Curry Mix",
    price: 850,
    category: "Crousty",
    description:
      "Riz blanc, poulet crousty, sauce curry, sauce piquante, sauce sucrée, oignons frits, persil.",
  },
  {
    slug: "creme-dessert-bueno",
    name: "Crème Dessert Bueno",
    price: 400,
    category: "Sweet",
    description: "Crème dessert onctueuse saveur Bueno, pot 170g.",
  },
  {
    slug: "creme-dessert-nutella",
    name: "Crème Dessert Nutella",
    price: 450,
    category: "Sweet",
    description: "Crème dessert chocolat-noisette, pot 170g.",
  },
  {
    slug: "creme-dessert-ferrero",
    name: "Crème Dessert Ferrero",
    price: 450,
    category: "Sweet",
    description: "Crème dessert chocolat premium, pot 170g.",
  },
  {
    slug: "creme-dessert-pistache",
    name: "Crème Dessert Pistache",
    price: 450,
    category: "Sweet",
    description: "Crème dessert pistache, pot 170g.",
  },
  {
    slug: "creme-dessert-caramel-speculoos",
    name: "Crème Dessert Caramel Speculoos",
    price: 400,
    category: "Sweet",
    description: "Crème dessert caramel et speculoos, pot 170g.",
  },
  {
    slug: "creme-dessert-raffaello",
    name: "Crème Dessert Raffaello",
    price: 400,
    category: "Sweet",
    description: "Crème dessert coco-amande, pot 170g.",
  },
  {
    slug: "creme-dessert-bounty",
    name: "Crème Dessert Bounty",
    price: 400,
    category: "Sweet",
    description: "Crème dessert coco, pot 170g.",
  },
  {
    slug: "creme-dessert-vanille-framboise",
    name: "Crème Dessert Vanille Framboise",
    price: 400,
    category: "Sweet",
    description: "Crème dessert vanille et framboise, pot 170g.",
  },
  {
    slug: "creme-dessert-framboise-pistache",
    name: "Crème Dessert Framboise Pistache",
    price: 450,
    category: "Sweet",
    description: "Crème dessert framboise et pistache, pot 170g.",
  },
  {
    slug: "creme-brulee",
    name: "Crème Brûlée",
    price: 350,
    category: "Sweet",
    description: "Crème brûlée vanille caramélisée, pot 120g.",
  },
  {
    slug: "tiramisu-pistache",
    name: "Tiramisu Pistache",
    price: 500,
    category: "Sweet",
    description: "Tiramisu pistache en couches, portion individuelle.",
  },
  {
    slug: "tiramisu-caramel",
    name: "Tiramisu Caramel",
    price: 500,
    category: "Sweet",
    description: "Tiramisu caramel beurre salé, portion individuelle.",
  },
  {
    slug: "tiramisu-bueno",
    name: "Tiramisu Bueno",
    price: 500,
    category: "Sweet",
    description: "Tiramisu saveur Bueno, portion individuelle.",
  },
  {
    slug: "tiramisu-chocolat",
    name: "Tiramisu Chocolat",
    price: 500,
    category: "Sweet",
    description: "Tiramisu chocolat intense, portion individuelle.",
  },
];

export function catalogToProducts(): Product[] {
  return PRODUCT_CATALOG.map((item) => ({
    id: ID[item.slug] ?? item.slug,
    restaurant_id: RESTAURANT_ID,
    name: item.name,
    price: item.price,
    image: `/products/${item.slug}.png`,
    category: item.category.toLowerCase(),
    is_available: true,
    description: item.description,
  }));
}

export const FEATURED_SLUGS = [
  "crousty-curry-spicy",
  "crousty-classic",
  "creme-dessert-nutella",
  "tiramisu-pistache",
];
