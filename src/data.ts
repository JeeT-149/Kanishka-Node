export type Category = "single" | "blends" | "tea" | "gear";

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "single", label: "Single Origin Coffee" },
  { id: "blends", label: "Blends" },
  { id: "tea", label: "Tea" },
  { id: "gear", label: "Brew Gear" },
];

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.id === c)!.label;

export type Product = {
  id: string;
  name: string;
  category: Category;
  origin?: string;
  weight: string;
  price: number;
  rating: number;
  reviews: number;
  roast?: 1 | 2 | 3 | 4 | 5;
  notes: string[];
  description: string;
  brew?: string;
  images: string[];
  featured?: number;
};

// Currency configuration using Intl.NumberFormat
// Change 'GBP' / 'en-GB' to 'INR' / 'en-IN' to switch from £ to ₹ in a single line
export const CURRENCY = {
  locale: "en-GB",
  code: "GBP", // e.g. "INR" for ₹, "USD" for $, "EUR" for €
};

const currencyFormatter = new Intl.NumberFormat(CURRENCY.locale, {
  style: "currency",
  currency: CURRENCY.code,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatMoney = (amountInMajorUnits: number): string => currencyFormatter.format(amountInMajorUnits);
export const money = formatMoney;

// Helper to avoid floating-point arithmetic errors: calculate in smallest unit (pence / paise)
export const toMinor = (major: number): number => Math.round(major * 100);
export const fromMinor = (minor: number): number => minor / 100;
export const formatMinor = (minor: number): string => currencyFormatter.format(minor / 100);

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=1100&fit=crop&auto=format&q=80`;

// High-resolution photography on neutral studio backgrounds matching the design
const bag = [
  "1559056199-641a0ac8b55e", // 0: Clean artisan pouch (no Brazil label)
  "1605711599412-775918dbe770", // 1: Minimalist coffee bag
  "1593084264959-d8297ea0725c", // 2: Craft paper pouch
  "1695245503558-5cdb37f49092", // 3: Kraft paper coffee bag on warm surface
  "1614792440169-b30e7f734f58", // 4: White minimalist bag with clean studio shadow
  "1708961352625-82e59dd0c0af", // 5: Green specialty pouch on dark roasted coffee beans
  "1712402832925-d41c446883d3", // 6: Modern coffee package
  "1642505171999-d704cd50f93c", // 7: Clean package on neutral table
  "1514432324607-a09d9b4aefdd", // 8: Dark roast coffee package
].map(u);

const bean = [
  "1620154562329-b4d6c9fac183",
  "1699806678863-07164145876b",
  "1620154561953-0756754dd76d",
  "1620154562294-b5de7281e05d",
].map(u);

const tea = [
  "1606163017137-888c0177b3dd", // 0: Loose tea leaves pile on clean white neutral background
  "1760602180499-382146d5eb02", // 1: Loose whole leaf tea
  "1610111793912-b8a45b3f94b4", // 2: Black tea leaves in ceramic dish
  "1632088691096-ba95dd63a647", // 3: Dried tea leaves
  "1610112278819-069287c86d03", // 4: Loose emerald green tea leaves
  "1610111794807-83a64d32ef72", // 5: Green tea
  "1610643625267-aee6dae3ca22", // 6: Genmaicha tea on neutral dish
].map(u);

const gear = [
  "1587955245893-389f2215c6eb", // 0: Ceramic pour-over set
  "1729277133095-bff46b56c29a", // 1: Pour-over brewing
  "1592417766326-088bf3da80c5", // 2: Gooseneck kettle
  "1595827295672-97a059484442", // 3: Hand grinder, matte black
  "1522726336270-3a0053210f06", // 4: Precision digital brew scale
  "1541469406036-71229832e06e", // 5: Stainless kettle pour
].map(u);

export const PRODUCTS: Product[] = [
  {
    id: "ethiopia-yirgacheffe",
    name: "Yirgacheffe Kochere",
    category: "single",
    origin: "Ethiopia Yirgacheffe",
    weight: "250g",
    price: 19,
    rating: 4.9,
    reviews: 214,
    roast: 1,
    notes: ["Jasmine", "Bergamot", "Peach"],
    description:
      "A washed lot from smallholders around Kochere, dried slowly on raised beds. Delicate, floral and tea-like, with a bright citrus finish.",
    brew: "V60, 1:16 ratio, 94°C, 3:00 total",
    images: [bag[0], bean[0]],
    featured: 1,
  },
  {
    id: "colombia-huila",
    name: "Huila Las Margaritas",
    category: "single",
    origin: "Colombia Huila",
    weight: "250g",
    price: 17,
    rating: 4.7,
    reviews: 168,
    roast: 2,
    notes: ["Red apple", "Panela", "Cacao nib"],
    description:
      "Sweet, rounded and easy to love. Grown at 1,750m by a cooperative of 40 families near Pitalito.",
    brew: "Espresso 1:2 in 28s, or Aeropress 1:15",
    images: [bag[1], bean[1]],
    featured: 2,
  },
  {
    id: "kenya-nyeri",
    name: "Nyeri Gatomboya AA",
    category: "single",
    origin: "Kenya Nyeri",
    weight: "250g",
    price: 21,
    rating: 4.8,
    reviews: 129,
    roast: 2,
    notes: ["Blackcurrant", "Grapefruit", "Brown sugar"],
    description:
      "Juicy and structured, the classic Kenyan profile. SL28 and SL34 varieties, double-washed and soaked.",
    brew: "Chemex, 1:15, 95°C, 4:30 total",
    images: [bag[2], bean[2]],
    featured: 3,
  },
  {
    id: "guatemala-antigua",
    name: "Antigua Volcán de Fuego",
    category: "single",
    origin: "Guatemala Antigua",
    weight: "500g",
    price: 29,
    rating: 4.5,
    reviews: 97,
    roast: 3,
    notes: ["Milk chocolate", "Almond", "Orange zest"],
    description:
      "Grown in volcanic ash soil on the slopes of Fuego. Balanced, chocolatey and a dependable daily brew.",
    brew: "French press, 1:14, 4:00 steep",
    images: [bag[3], bean[3]],
  },
  {
    id: "brazil-cerrado",
    name: "Cerrado Mineiro Natural",
    category: "single",
    origin: "Brazil Cerrado",
    weight: "500g",
    price: 26,
    rating: 4.4,
    reviews: 83,
    roast: 3,
    notes: ["Hazelnut", "Toffee", "Dried fig"],
    description:
      "Naturally processed and low in acidity, a soft and nutty coffee that takes milk beautifully.",
    brew: "Moka pot or espresso",
    images: [bag[4], bean[0]],
  },
  {
    id: "sumatra-mandheling",
    name: "Sumatra Lintong Wet-Hulled",
    category: "single",
    origin: "Indonesia Sumatra",
    weight: "250g",
    price: 18,
    rating: 3.8,
    reviews: 41,
    roast: 4,
    notes: ["Cedar", "Dark cocoa", "Tobacco leaf"],
    description:
      "Earthy and heavy-bodied. A polarising coffee, loved by those who want depth over brightness.",
    brew: "French press, 1:15",
    images: [bag[5], bean[1]],
  },
  {
    id: "rwanda-nyamasheke",
    name: "Nyamasheke Washed",
    category: "single",
    origin: "Rwanda Nyamasheke",
    weight: "250g",
    price: 18,
    rating: 4.6,
    reviews: 72,
    roast: 2,
    notes: ["Red grape", "Black tea", "Honey"],
    description:
      "A clean, sweet lot from the shores of Lake Kivu, with a silky body and a long honeyed finish.",
    brew: "Kalita Wave, 1:16, 93°C",
    images: [bag[2], bean[2]],
  },
  {
    id: "kiln-house-blend",
    name: "Kiln House Blend",
    category: "blends",
    origin: "Brazil, Colombia",
    weight: "500g",
    price: 24,
    rating: 4.8,
    reviews: 402,
    roast: 3,
    notes: ["Caramel", "Roasted almond", "Cocoa"],
    description:
      "Our everyday coffee. Medium roasted for sweetness and comfort, built to work in any brewer you own.",
    brew: "Any method; we love it as a flat white",
    images: [bag[6], bean[3]],
    featured: 4,
  },
  {
    id: "morning-ember",
    name: "Morning Ember",
    category: "blends",
    origin: "Ethiopia, Guatemala",
    weight: "250g",
    price: 15,
    rating: 4.6,
    reviews: 188,
    roast: 2,
    notes: ["Stone fruit", "Milk chocolate", "Lemon"],
    description: "Bright but gentle. A lighter blend for slow weekends and filter lovers.",
    brew: "Batch brew, 60g per litre",
    images: [bag[7], bean[0]],
  },
  {
    id: "midnight-espresso",
    name: "Midnight Espresso",
    category: "blends",
    origin: "Sumatra, Brazil",
    weight: "500g",
    price: 27,
    rating: 4.7,
    reviews: 255,
    roast: 5,
    notes: ["Dark chocolate", "Molasses", "Smoke"],
    description: "Dense, syrupy and bittersweet. Roasted dark but never burnt, built for milk drinks.",
    brew: "Espresso 1:2 in 30s",
    images: [bag[8], bean[1]],
  },
  {
    id: "decaf-swiss-water",
    name: "Decaf Swiss Water Colombia",
    category: "blends",
    origin: "Colombia",
    weight: "250g",
    price: 16,
    rating: 4.2,
    reviews: 64,
    roast: 3,
    notes: ["Toffee", "Walnut", "Red apple"],
    description: "Chemical-free decaffeination keeps the sweetness. For the evening cup.",
    brew: "Aeropress or espresso",
    images: [bag[1], bean[2]],
  },
  {
    id: "holiday-reserve-limited-edition-whole-bean-gift-box-with-hand-numbered-tin",
    name: "Winter Reserve Limited Edition Whole Bean Gift Box with Hand-Numbered Tin and Tasting Card",
    category: "blends",
    origin: "Ethiopia, Kenya, Colombia",
    weight: "3 × 100g",
    price: 48,
    rating: 4.9,
    reviews: 33,
    roast: 2,
    notes: ["Spice", "Orange peel", "Dark berry"],
    description:
      "Three small lots in one numbered tin, with a card to guide a side-by-side tasting. Available while stocks last.",
    brew: "Pour over, 1:16",
    images: [bag[3], bean[3]],
  },
  {
    id: "darjeeling-first-flush",
    name: "Darjeeling First Flush",
    category: "tea",
    origin: "India Darjeeling",
    weight: "100g",
    price: 16,
    rating: 4.8,
    reviews: 152,
    notes: ["Muscatel", "Fresh cut grass", "Apricot"],
    description:
      "Picked in early spring from the Castleton gardens. Light, lively and quietly complex.",
    brew: "2.5g per 200ml, 85°C, 3 minutes",
    images: [tea[0], tea[1]],
    featured: 5,
  },
  {
    id: "assam-breakfast",
    name: "Assam Mangalam Breakfast",
    category: "tea",
    origin: "India Assam",
    weight: "250g",
    price: 14,
    rating: 4.6,
    reviews: 210,
    notes: ["Malt", "Honey", "Dark bread"],
    description: "Robust and malty with a deep amber cup. Stands up to milk and a splash of sugar.",
    brew: "3g per 200ml, 98°C, 4 minutes",
    images: [tea[2], tea[3]],
  },
  {
    id: "japanese-sencha",
    name: "Japanese Sencha Yabukita",
    category: "tea",
    origin: "Japan Shizuoka",
    weight: "100g",
    price: 17,
    rating: 4.7,
    reviews: 119,
    notes: ["Sea air", "Sweet pea", "Lemon balm"],
    description: "Steamed green tea with a vivid emerald cup. Savoury, fresh and green.",
    brew: "4g per 200ml, 70°C, 60 seconds",
    images: [tea[4], tea[5]],
  },
  {
    id: "genmaicha",
    name: "Toasted Genmaicha",
    category: "tea",
    weight: "100g",
    price: 12,
    rating: 4.3,
    reviews: 76,
    notes: ["Toasted rice", "Popcorn", "Sweet grass"],
    description: "Sencha blended with roasted brown rice. Nutty, comforting and low in caffeine.",
    images: [tea[6], tea[0]],
  },
  {
    id: "oolong-alishan",
    name: "Alishan High Mountain Oolong",
    category: "tea",
    origin: "Taiwan Alishan",
    weight: "100g",
    price: 22,
    rating: 4.9,
    reviews: 88,
    notes: ["Orchid", "Cream", "Green apple"],
    description: "Grown above 1,200m in cool mist. Buttery, floral and endlessly re-steepable.",
    brew: "5g per 150ml, 95°C, five short infusions",
    images: [tea[1], tea[2]],
  },
  {
    id: "earl-grey-smoked",
    name: "Smoked Earl Grey",
    category: "tea",
    origin: "China Yunnan",
    weight: "100g",
    price: 13,
    rating: 4.1,
    reviews: 57,
    notes: ["Bergamot", "Pine smoke", "Black pepper"],
    description: "Lapsang and bergamot oil in an unlikely, delicious pairing.",
    brew: "3g per 200ml, 96°C, 4 minutes",
    images: [tea[3], tea[4]],
  },
  {
    id: "hand-grinder",
    name: "Hand Grinder, Matte Black",
    category: "gear",
    weight: "620g",
    price: 79,
    rating: 4.8,
    reviews: 301,
    notes: ["48mm burrs", "Steel body", "30 clicks"],
    description: "Precise, quiet and travels well. Stainless conical burrs deliver even grounds from espresso to French press.",
    brew: "Dial 12 clicks for pour-over, 5 for espresso",
    images: [gear[3], gear[4]],
  },
  {
    id: "pour-over-kit",
    name: "Ceramic Pour-Over Set",
    category: "gear",
    weight: "54g",
    price: 54,
    rating: 4.6,
    reviews: 144,
    notes: ["Dripper", "Carafe", "40 filters"],
    description: "A glazed ceramic dripper, a glass carafe and a starter pack of paper filters.",
    brew: "Recommended with 02 filter papers and 300-500ml brews",
    images: [gear[0], gear[1]],
  },
  {
    id: "gooseneck-kettle",
    name: "Gooseneck Kettle 0.9L",
    category: "gear",
    weight: "1.1kg",
    price: 68,
    rating: 4.7,
    reviews: 205,
    notes: ["Precise pour", "Stainless", "Gas and induction"],
    description: "A balanced, slow-pouring spout makes bloom and spiral technique easy.",
    brew: "Heat water to 92-96°C for optimal extraction",
    images: [gear[2], gear[5]],
  },
  {
    id: "digital-scale",
    name: "Brew Scale with Timer",
    category: "gear",
    weight: "420g",
    price: 49,
    rating: 4.0,
    reviews: 62,
    notes: ["0.1g accuracy", "Water-resistant", "USB-C"],
    description: "Weigh, time and repeat. Reliable accuracy for the home brewer.",
    brew: "Tare carafe, start timer with first water pour",
    images: [gear[4], gear[3]],
  },
];

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id);
