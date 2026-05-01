# Deans Fitness App Frontend

Production-grade AI-powered fitness and nutrition mobile application built with Expo, React Native, TypeScript, and Expo Router.

## Product Scope

The application supports four role-based areas:

- `client`: onboarding, subscriptions, video classes, entitled video playback, workout progress, nutrition questionnaires, meal plans, grocery lists, consultations, add-ons, and payment history.
- `trainer`: onboarding, class creation, protected media uploads, class management, enrolled clients, performance metrics, and earnings summaries.
- `nutritionist`: onboarding, assigned nutrition orders, questionnaire review, custom meal plans, meal templates, grocery lists, consultations, and revenue summaries.
- `admin`: user management, trainer/nutritionist approvals, classes, nutrition orders, products, plans, payments, entitlements, and reports.

## Technical Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Supabase Auth, Postgres, Storage, and Edge Functions
- TanStack Query
- React Hook Form
- Zod
- expo-haptics

## Architecture Rules

- Use feature-based folders under `source/features`.
- Use Expo Router only for route files and layouts under `app`.
- Keep business logic out of screen files.
- Do not call Supabase directly inside React components.
- Use services for data access, hooks for orchestration, schemas for validation, and types for strict contracts.
- Every React component file must contain exactly one React component.
- Shared UI belongs in `source/shared/ui`.
- Theme tokens belong in `source/shared/theme`; do not hard-code colors in screens.
- Important screens must support loading, empty, error, and offline states.

## Theme System

Theme files live in `source/shared/theme`:

- `tokens.ts`: shared spacing, radii, typography, opacity, and elevation tokens.
- `themes.ts`: typed theme definitions for Titan Black, Vital White, and Pulse AI.
- `ThemeProvider.tsx`: React provider that exposes `theme`, `themeName`, `tokens`, and `setTheme`.

Selected theme is persisted locally with `@react-native-async-storage/async-storage`.

## Security Rules

- Use Supabase Row Level Security for authorization.
- Never trust frontend role state.
- Never trust route params.
- Never put Supabase service role keys in the mobile app.
- Never put payment provider secret keys in the mobile app.
- Never expose paid videos through public URLs.
- Use signed URLs for protected media.
- Feature access must rely on verified entitlements, not raw payment status.

## Environment

Expo public environment variables are validated in `lib/env.ts`.

Required mobile-safe variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Forbidden public variables include Supabase service/secret keys and payment provider secrets. Backend-only secrets must stay in Supabase Edge Functions or other secure server environments.

The Supabase client is initialized in `lib/supabase.ts` with React Native-compatible auth session persistence.

## Auth Module

Module 1 auth is implemented with Supabase Auth, Expo Router route groups, TanStack Query, React Hook Form, Zod, and Expo deep linking.

Routes:

- `app/(public)/sign-in.tsx`
- `app/(public)/sign-up.tsx`
- `app/(public)/forgot-password.tsx`
- `app/(public)/auth-callback.tsx`
- `app/(protected)/home.tsx`

Auth rules:

- Supabase calls live in `source/features/auth/services` and `source/features/profiles/services`.
- Screens call hooks and compose UI only.
- Profile reads use the server-backed `profiles` table.
- Admin assignment is handled by the database bootstrap trigger, not frontend state.
- OAuth redirect scheme is `deansfitness://auth-callback`.
- Add `deansfitness://auth-callback` and `deansfitness://**` to Supabase Auth redirect URLs before testing OAuth.
- Onboarding routes currently contain placeholder screens only; full onboarding belongs to the onboarding module.
- Supabase auth storage uses AsyncStorage on device and a no-op adapter during static rendering.

## Database

Initial schema migration:

- `supabase/migrations/20260501000100_initial_schema.sql`

The migration creates the first-version application tables, foreign keys, constraints, indexes, timestamp triggers, bootstrap admin profile handling, private RLS helper functions, and initial RLS policies. Direct payment and subscription state writes are intentionally left to secure backend execution paths.

## Payments

The app is subscription-based from launch and supports paid add-ons. Payment gateway logic must be abstracted behind a provider adapter.

- Initial provider: DGateway
- Future provider: I&M Bank gateway
- Payment creation, verification, subscription changes, entitlement sync, and webhook handling must run through Supabase Edge Functions.
- Do not create fake payment success states.
- Do not unlock paid features without verified payment and a valid entitlement.

## Current Structure

```txt
app/
  (admin)/
  (client)/
  (nutritionist)/
  (onboarding)/
  (public)/
  (trainer)/
  _layout.tsx

source/
  core/
    navigation/
    providers/
  shared/
    hooks/
    services/
    theme/
    types/
    ui/
    utils/
  features/
    admin/
    auth/
    classes/
    entitlements/
    media/
    nutrition/
    nutritionist/
    onboarding/
    payments/
    profiles/
    subscriptions/
    trainer/
    workout-progress/
  edge-functions/

supabase/
  migrations/
  policies/
  seed/
```

The current project setup intentionally contains structure and placeholders only. Screens, business logic, payment adapters, Supabase services, schemas, and route implementations should be added in later phases.

## Development

Install dependencies:

```bash
npm install
```

Run TypeScript verification:

```bash
npx tsc --noEmit
```

Run lint:

```bash
npm run lint
```
