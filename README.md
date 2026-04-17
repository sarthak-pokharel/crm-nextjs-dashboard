# CRM Suite / Dashboard

Next.js frontend for CRM Suite. Full CRUD interfaces for all CRM entities, real-time data visualization, permission-aware UI, and multi-organization support.

<!-- Architecture diagram placeholder -->

## Screenshots

![Dashboard Overview](../docs/images/1.png)

![Lead Management](../docs/images/2.png)

![Deal Pipeline](../docs/images/3.png)

![Contact Details](../docs/images/4.png)

![Company Management](../docs/images/5.png)

![Task Management](../docs/images/6.png)

![Role-Based Permissions](../docs/images/7.png)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS v4 |
| Data Fetching | TanStack React Query v5 |
| Icons | Lucide React |
| Styling | clsx, tailwind-merge, class-variance-authority |
| Package Manager | npm |

## Features

### Dashboard
- Stat cards for key metrics (leads, deals, revenue, conversion)
- Donut chart (deal stages), bar chart (monthly activity)
- Top deals table, recent activity feed

### CRM Modules
- **Leads** / List with score indicators, status badges, quick actions. Detail with notes and timeline.
- **Deals** / Pipeline view with stages, values, close dates. Detail with notes and timeline.
- **Contacts** / Searchable list with stat cards. Detail with relationship data.
- **Companies** / Directory with size and industry. Detail with location and about section.
- **Activities** / Log with type filtering. Detail with full context.
- **Tasks** / Priority indicators, overdue counters, completion tracking. Detail with assignment management.

### Auth and Permissions
- JWT session management with auto-redirect on expiry
- Permission-aware components (show/hide by role)
- PermissionGuard wrapper, React Context provider, permission hooks

### Multi-Org
- Sidebar organization switcher
- Scoped data per active organization
- User invite and role assignment per org

## Project Structure

```
app/
  page.tsx                # Dashboard with charts and metrics
  leads/                  # List, detail, create
  deals/                  # List, detail, create
  contacts/               # List, detail, create
  companies/              # List, detail, create
  activities/             # List, detail, create
  tasks/                  # List, detail, create
  organizations/          # Org management
  roles/                  # Role and permission config
  users/                  # User management
  settings/               # Settings
  login/ register/        # Auth pages

components/               # Custom component library
  button, table, stat-card, header, modal,
  details, sidebar, form, input, select,
  textarea, organization-switcher, permission-guard

lib/
  api-client.ts           # HTTP client
  hooks.ts                # React Query data hooks
  permissions.ts          # Permission utilities
  PermissionsProvider.tsx  # Permission context
  providers.tsx           # App providers
```

## Getting Started

### Prerequisites

- Node.js >= 18, npm >= 9
- CRM Suite backend running on `http://localhost:3000`

### Setup

```bash
npm install

# Configure .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000

npm run dev               # http://localhost:3001
```

### Production

```bash
npm run build
npm run start
```

## Scripts

| Script | Description |
|---|---|
| `dev` | Development with hot reload |
| `build` | Production build |
| `start` | Production server |
| `lint` | Lint codebase |

## License

MIT
