# Product Brief

We are building an AI powered fitness and nutrition mobile application for a client.

The application has four roles:
admin
trainer
nutritionist
client

The app has:
Client area
Trainer area
Nutritionist area
Admin area

Clients:
Complete client onboarding
Subscribe to the platform.
Browse video classes.
Watch entitled videos.
Track workout progress.
Request custom meal plans.
Fill nutrition questionnaires.
View meal plans.
View grocery lists.
Book nutrition consultations.
Buy paid add ons.
View payment history.

Trainers:
Complete trainer onboarding.
Create classes.
Upload videos.
Upload thumbnails.
Manage their own classes.
View enrolled clients.
View class performance.
View earnings summaries.

Nutritionists:
Complete nutritionist onboarding.
Create their profile.
View assigned nutrition orders.
Review client questionnaires.
Build custom meal plans.
Create meal templates.
Generate grocery lists.
Manage nutrition consultations.
View revenue summaries.

Admins:
Manage users.
Approve trainers.
Approve nutritionists.
Manage classes.
Manage nutrition orders.
Manage meal products.
Manage subscription plans.
Manage add ons.
View payments.
Manage entitlements.
View reports.

Authentication:
Use Supabase Auth.
Support Google.
Support Apple.
Support email.
Do not build admin control for authentication providers inside the app.

Payments:
The app is subscription based.
Extra paid features include custom meal plans, nutrition consultations, premium trainer programs, private sessions, premium class bundles, and advanced AI features.

Payment providers:
Primary provider is DGateway.
Secondary future provider is I&M Bank gateway.
Use a provider adapter pattern.

Media:
Most classes are video based.
Support GIFs for exercise demonstrations where useful.
Use Supabase Storage.
Paid videos must use signed URLs only.
