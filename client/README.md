# Kiln & Leaf Ops — Frontend Client

The web operations dashboard for **Kiln & Leaf Roasters**, providing a streamlined, accessible interface for managing roastery workflows, batch roasting logs, cupping evaluations, and administrator status approvals.

---

## Design System & Heritage

This frontend application reuses and refines the editorial design system from the candidate's separate React assessment ("Kiln & Leaf"), repurposed specifically for operations:
- **Typography**: Fraunces display serif headings paired with DM Sans for crisp tabular legibility.
- **Palette**: Warm paper (`#f7f4ee`), deep ink (`#161412`), subtle sunk cards (`#fbfaf6`), and roasted terracotta accent (`#8c3a14`).
- **Accessible Status Tone**: Text labels + indicator tone (never color alone):
  - **Pending**: Neutral stone
  - **In Progress**: Terracotta accent
  - **Testing**: Amber
  - **Completed**: Emerald green
- **Responsiveness**: Fully responsive with fluid breakpoints tailored for Mobile (390px), Tablet (768px), and Desktop (1440px).
- **Accessibility (a11y)**: Explicit `<label>` elements, `aria-invalid`, `aria-describedby` error linkages, visible focus rings, and `@media (prefers-reduced-motion: reduce)` compliance.

---

## Application Routes

| Path | Access Guard | Description |
|---|---|---|
| `/` | Public | Automatic root redirect: sends authenticated users to `/tasks` and guests to `/login`. |
| `/login` | Public | Sign-in form with inline validation, error banners, and one-click demo credentials fill. |
| `/register` | Public | New operator registration with live password requirement hints (min 8 chars, letter + number). |
| `/tasks` | `RequireAuth` | Operator task workspace with URL query sync (`?status=&q=&page=`), debounced search, and pagination. |
| `/tasks/new` | `RequireAuth` | Task dispatch form with 120-character limit counter and protocol notes. |
| `/tasks/:id` | `RequireAuth` | Task detail with metadata, owner details (for admins), and admin-exclusive status lifecycle selector. |
| `/tasks/:id/edit`| `RequireAuth` | Revision form strictly limited to title and description (status updates are forbidden via PUT). |
| `/admin` | `RequireAdmin`| Administrative console: metric stat cards with CSS proportion bars, live task lifecycle table with inline status updates, and staff directory. |
| `/forbidden` | Public | Accessible 403 Forbidden page for non-administrators. |
| `*` | Public | Custom 404 page for nonexistent or moved records. |

---

## Environment Configuration

Create a `.env` file in `client/` based on `.env.example`:

```env
# URL of the Express backend API
VITE_API_URL=http://localhost:4000/api

# Display quick-fill demo buttons on the login screen
VITE_SHOW_DEMO_LOGINS=true
```

---

## Scripts

```bash
# Run development server (Vite)
npm run dev

# Typecheck and build production bundle
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# Format with Prettier
npm run format
```
