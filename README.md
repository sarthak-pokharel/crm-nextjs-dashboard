# CRM Platform -- Dashboard

A modern, responsive CRM dashboard built with Next.js and React. Features real-time data visualization, full CRUD interfaces for all CRM entities, role-based UI guards, multi-organization support, and a polished component system. Designed as the frontend counterpart to the NestJS CRM backend.

## Screenshots

![Dashboard Overview](../docs/images/1.png)

![Lead Management](../docs/images/2.png)

![Deal Pipeline](../docs/images/3.png)

![Contact Details](../docs/images/4.png)

![Company Management](../docs/images/5.png)

![Task Management](../docs/images/6.png)

![Role-Based Permissions](../docs/images/7.png)

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript (strict mode)
- **UI:** React 19, Tailwind CSS v4
- **Data Fetching:** TanStack React Query v5 with custom hooks
- **Icons:** Lucide React
- **Styling Utilities:** clsx, tailwind-merge, class-variance-authority
- **Package Manager:** npm

## Features

### Dashboard Home
- Key performance metrics with stat cards (total leads, active deals, revenue, conversion rates)
- Donut chart for deal stage distribution
- Bar chart for monthly activity trends
- Top deals table with value and stage indicators
- Recent activity feed with timestamps

### CRM Modules
- **Leads** -- List view with stat cards, score indicators, status badges, and quick-action buttons. Detail pages with notes, timeline, and full edit capability.
- **Deals** -- Pipeline view with stage tracking, deal values, and close dates. Detail pages with notes section and timeline.
- **Contacts** -- Searchable contact list with stat cards and action buttons. Detail pages with relationship data and communication history.
- **Companies** -- Company directory with size and industry columns. Detail pages with location, about section, and timeline.
- **Activities** -- Activity log with type filtering and stat cards. Detail pages with full activity context.
- **Tasks** -- Task list with priority indicators, overdue counters, and completion tracking. Detail pages with assignment and due date management.

### Authentication
- Login and registration pages
- JWT-based session management
- Automatic token refresh and redirect on expiry
- Protected routes with auth guards

### Authorization and Permissions
- Permission-aware UI components that show/hide based on user roles
- PermissionGuard wrapper component for conditional rendering
- React Context-based permission provider
- Hooks for permission checking at any component level

### Multi-Organization Support
- Organization switcher in the sidebar
- Scoped data loading per active organization
- Organization management with user invite and role assignment

### Role Management
- Role listing with permission overview
- Granular permission editor per role
- Permission configuration for all CRM resources and actions

### User Management
- User directory with role and status information
- User detail editing
- Organization-scoped user management

## Project Structure

```
app/
  layout.tsx              # Root layout with providers
  layout-client.tsx       # Client-side layout with sidebar and navigation
  page.tsx                # Dashboard home with charts and metrics
  login/                  # Authentication pages
  register/
  leads/                  # Lead management (list, detail, create)
  deals/                  # Deal management (list, detail, create)
  contacts/               # Contact management (list, detail, create)
  companies/              # Company management (list, detail, create)
  activities/             # Activity management (list, detail, create)
  tasks/                  # Task management (list, detail, create)
  organizations/          # Organization management
  roles/                  # Role and permission management
  users/                  # User management
  settings/               # Application settings

components/
  button.tsx              # Button with variants (primary, ghost, danger) and icon support
  details.tsx             # Detail view with custom render functions
  form.tsx                # Form wrapper with consistent styling
  header.tsx              # Page header with title, subtitle, and action buttons
  input.tsx               # Form input with label and validation
  modal.tsx               # Modal dialog with backdrop blur
  select.tsx              # Dropdown select component
  sidebar.tsx             # Navigation sidebar with active route highlighting
  stat-card.tsx           # Metric card with trend indicators
  table.tsx               # Data table with sorting, loading states, and empty states
  textarea.tsx            # Multi-line text input
  organization-switcher.tsx  # Organization dropdown switcher
  permission-guard.tsx    # Conditional rendering based on permissions
  management-navbar.tsx   # Secondary navigation bar

hooks/
  use-organization.ts     # Organization context and switching

lib/
  api-client.ts           # HTTP client for backend API communication
  hooks.ts                # Shared data-fetching hooks with React Query
  permissions.ts          # Permission checking utilities
  PermissionsProvider.tsx  # React Context provider for permission state
  providers.tsx           # App-level provider composition
  usePermissionCheck.ts   # Hook for checking specific permissions
  useUserPermissions.ts   # Hook for fetching current user permissions
  utils.ts                # General utility functions (cn, formatters)
```

## Prerequisites

- Node.js >= 18
- npm >= 9
- CRM backend running on `http://localhost:3000`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start the development server

```bash
npm run dev
```

The dashboard runs on `http://localhost:3001` by default.

### 4. Build for production

```bash
npm run build
npm run start
```

## Component System

The dashboard uses a custom component library built with Tailwind CSS and class-variance-authority for consistent styling:

- **Button** -- Supports primary, ghost, and danger variants with configurable sizes and icon placement
- **Table** -- Features animated loading spinners, empty state messages, uppercase headers, and hover highlighting
- **StatCard** -- Displays metrics with optional trend indicators and hover shadow effects
- **Header** -- Page headers with right-aligned action button slots
- **Modal** -- Dialog overlays with sticky headers, backdrop blur, and rounded styling
- **Details** -- Key-value detail views with custom render function support for formatted values
- **Sidebar** -- Collapsible navigation with section labels and active route highlighting

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Lint the codebase |

## Architecture Decisions

- **App Router** -- Uses Next.js App Router with server and client components for optimal loading
- **React Query** -- All server state managed through TanStack React Query with automatic caching, background refetching, and optimistic updates
- **Permission-first UI** -- Components check permissions before rendering actions, ensuring users only see what they can access
- **Custom components over libraries** -- Purpose-built components instead of a UI library, keeping the bundle lean and the design consistent

## License

MIT
