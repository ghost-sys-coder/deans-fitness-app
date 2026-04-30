# Database Plan

Required tables:
profiles
client_profiles
trainer_profiles
nutritionist_profiles
fitness_classes
class_enrollments
subscription_plans
user_subscriptions
add_on_products
payments
user_entitlements
nutrition_products
nutrition_orders
nutrition_questionnaires
meal_plans
meal_plan_days
meals
grocery_lists
meal_templates
workout_progress

Storage buckets:
class-videos
class-thumbnails
exercise-gifs
meal-images
certification-documents
profile-avatars

Authorization:
Use Supabase Row Level Security on every protected table.

profiles:
Users can read and update their own profile.
Admins can manage all profiles.
Role changes must not rely on frontend state.

fitness_classes:
Authenticated users can read published classes.
Trainers can manage their own classes.
Admins can manage all classes.

nutrition_orders:
Clients can create and read their own orders.
Assigned nutritionists can read and update assigned orders.
Admins can manage all orders.

meal_plans:
Clients can read published meal plans created for them.
Nutritionists can manage meal plans they created.
Admins can manage all meal plans.

payments:
Users can read their own payments.
Admins can read all payments.
Payment status should only be updated by secure backend functions.

user_entitlements:
Users can read their own entitlements.
Admins and secure backend functions can manage entitlements.
Feature access should check entitlements, not raw payments.
