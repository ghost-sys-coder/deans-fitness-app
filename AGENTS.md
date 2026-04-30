# Deans Fitness App Codex Instructions

We are building a production grade AI powered fitness and nutrition mobile application.

Stack:
Expo
React Native
TypeScript
Expo Router
Supabase Auth
Supabase Postgres
Supabase Storage
Supabase Edge Functions
TanStack Query
React Hook Form
Zod
expo haptics

Core rule:
Every file must contain only one React component.
Do not define multiple React components in one file.
Extract shared UI into separate component files.
Extract business logic into hooks, services, utils, schemas, types, or Edge Functions.

Architecture rules:
Use feature based folders.
Use strict TypeScript.
Use Expo Router for navigation.
Use TanStack Query for server state.
Use React Hook Form and Zod for forms.
Use Supabase Row Level Security for authorization.
Never trust frontend role state.
Never trust route params.
Never put Supabase service role keys in the mobile app.
Never put payment provider secret keys in the mobile app.
Never expose paid videos through public URLs.
Use signed URLs for protected media.
Use theme tokens. Do not hard code colors in screens.
Use loading, empty, error, and offline states on important screens.
Use haptics for important interactions.

Roles:
admin
trainer
nutritionist
client

Bootstrap admin emails:
<franktamalejr@gmail.com>
<juniorbeast177@gmail.com>

Product areas:
Client area
Trainer area
Nutritionist area
Admin area

Payment model:
The app is subscription based from launch.
The app also supports paid add ons.
Payment gateway must be abstracted behind a provider adapter.
Start with DGateway.
Design the payment layer so I&M Bank gateway can be added later.

Do not hard code DGateway everywhere.
Use Supabase Edge Functions for payment creation, verification, subscription creation, cancellation, and webhook handling.

Design themes:
Titan Black
Vital White
Pulse AI

Non negotiables:
No file with more than one component.
No Supabase calls directly inside components.
No business logic inside screen files.
No frontend only permission checks.
No service role key in the app.
No public URLs for paid content.
No untyped gateway responses.
No fake payment success states.
No feature unlock without verified payment or valid entitlement.
