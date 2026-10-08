# Kiln & Leaf — Storefront

A refined, boutique e-commerce storefront for **Kiln & Leaf Roasters**, purveyors of small-batch specialty coffee and rare-leaf teas roasted and blended in Leeds since 2016.

Built with React 19, Vite, Tailwind CSS v4, and React Router.

---

## Features

- **Product Catalog & Filtering**: Seamless category filtering across Single Origin Coffee, Blends, Tea, and Brew Gear with live search.
- **Product Detail Experience**: Complete gallery with image switcher, roast level indicator, origin details, tasting notes, and recommended brew guides.
- **Shopping Cart & Slide-Over Drawer**: Responsive cart drawer and dedicated `/cart` page with line-item management and order summary.
- **Precision Currency Handling**: Single configuration utility powered by `Intl.NumberFormat` with minor-unit (pence/paise) arithmetic to eliminate floating-point rounding errors.
- **State Handling**: Comprehensive states including skeleton loading screens, graceful error recovery, empty search results, and custom 404 page.
- **Mobile Optimized**: Clean responsive layouts, unsticky mobile filter row for maximum screen real estate, and thumb-friendly controls.
- **WCAG AA Compliance**: High-contrast typography (>8:1 ratio on page background) ensuring clear legibility across all metadata and UI elements.

---

## Tech Stack

- **Runtime & UI**: [React 19](https://react.dev/) + React DOM 19
- **Routing**: [React Router](https://reactrouter.com/) (Hash-based navigation)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Build Tool**: [Vite](https://vite.dev/) with `@vitejs/plugin-react`
- **Typography**: [Fraunces](https://fonts.google.com/specimen/Fraunces) (Display headings) & [DM Sans](https://fonts.google.com/specimen/DM+Sans) (Body & UI)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Development Server

Start the local development server:

```bash
npm run dev
```

The application will be available at **`http://localhost:5173`**.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on port 5173 with hot module replacement (HMR) |
| `npm run build` | Compiles the production bundle to `dist/` |
| `npm run preview` | Locally previews the production build on port 5173 |
| `npm run format` | Runs the code formatter (`oxfmt`) |

---

## Design System & Tokens

Defined in `src/index.css` via Tailwind v4 `@theme`:

| Token | Hex | Role & Contrast |
| :--- | :--- | :--- |
| `paper` | `#F7F4EE` | Warm tactile canvas background |
| `card` | `#FBFAF6` | Slightly elevated surface for inputs and summary cards |
| `sunk` | `#EFEAE0` | Recessed wells for images and skeleton loaders |
| `line` | `#E2DCD0` | Subtle 1px structural dividers |
| `mute` | `#4E473F` | High-contrast secondary text (8.4:1 contrast ratio, WCAG AA & AAA compliant) |
| `ink` | `#161412` | Deep charcoal primary typography (16:1 contrast ratio) |
| `accent` | `#8C3A14` | Terracotta roast accent for buttons, badges, and highlights |

---

## Project Structure

```
├── index.html              # HTML entrypoint
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration with React and Tailwind v4
└── src/
    ├── main.tsx            # Application entrypoint
    ├── App.tsx             # Root router configuration
    ├── Layout.tsx          # Shell layout (Navbar, Footer, CartDrawer)
    ├── index.css           # Global CSS, Google Fonts, Tailwind tokens
    ├── data.ts             # Product catalog, categories, currency formatting
    ├── store.tsx           # Cart state context with minor-unit math
    ├── ui.tsx              # Core reusable UI components
    └── pages/
        ├── Home.tsx        # Storefront listing, hero, filters, product grid
        ├── Product.tsx     # Product detail view
        ├── Cart.tsx        # Full cart review page
        └── NotFound.tsx    # 404 page
```
