create extension if not exists pgcrypto with schema extensions;

create schema if not exists app_private;

do $$
begin
  create type public.app_user_role as enum ('admin', 'trainer', 'nutritionist', 'client');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.profile_status as enum ('active', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.approval_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.class_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.class_difficulty as enum ('beginner', 'intermediate', 'advanced');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.enrollment_status as enum ('active', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.billing_interval as enum ('monthly', 'quarterly', 'yearly');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subscription_status as enum (
    'pending',
    'active',
    'past_due',
    'cancelled',
    'expired'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.add_on_type as enum (
    'custom_meal_plan',
    'nutrition_consultation',
    'premium_trainer_program',
    'private_session',
    'premium_class_bundle',
    'advanced_ai_feature'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'cancelled',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.entitlement_type as enum (
    'subscription',
    'class',
    'class_bundle',
    'meal_plan',
    'consultation',
    'trainer_program',
    'private_session',
    'advanced_ai_feature'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.nutrition_product_type as enum (
    'custom_meal_plan',
    'nutrition_consultation'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.nutrition_order_status as enum (
    'pending_payment',
    'paid',
    'assigned',
    'in_progress',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.meal_plan_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.workout_progress_status as enum ('started', 'completed');
exception
  when duplicate_object then null;
end $$;

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function app_private.is_bootstrap_admin(email text)
returns boolean
language sql
immutable
set search_path = pg_catalog
as $$
  select lower(coalesce(email, '')) in (
    'franktamalejr@gmail.com',
    'juniorbeast177@gmail.com'
  );
$$;

create or replace function app_private.is_service_role()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.role()) = 'service_role', false);
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role public.app_user_role not null default 'client',
  status public.profile_status not null default 'active',
  full_name text,
  avatar_path text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_format_check
    check (email is null or position('@' in email) > 1)
);

create unique index if not exists profiles_email_unique_idx
on public.profiles (lower(email))
where email is not null;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_status_idx on public.profiles (status);

create or replace function app_private.current_user_role()
returns public.app_user_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role
  from public.profiles
  where id = (select auth.uid());
$$;

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(app_private.current_user_role() = 'admin', false);
$$;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when app_private.is_bootstrap_admin(new.email) then 'admin'::public.app_user_role
      else 'client'::public.app_user_role
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

create or replace function app_private.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if app_private.is_admin() or app_private.is_service_role() then
    return new;
  end if;

  if new.email is distinct from old.email
    or new.role is distinct from old.role
    or new.status is distinct from old.status then
    raise exception 'Only admins or secure backend functions can update protected profile fields.';
  end if;

  return new;
end;
$$;

create trigger prevent_profile_privilege_escalation
  before update on public.profiles
  for each row execute function app_private.prevent_profile_privilege_escalation();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function app_private.set_updated_at();

create table if not exists public.client_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  date_of_birth date,
  gender text,
  height_cm numeric(5, 2) check (height_cm is null or height_cm > 0),
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg > 0),
  fitness_goal text,
  medical_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_client_profiles_updated_at
  before update on public.client_profiles
  for each row execute function app_private.set_updated_at();

create table if not exists public.trainer_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  bio text,
  specialties text[] not null default '{}',
  certification_document_path text,
  approval_status public.approval_status not null default 'pending',
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainer_profiles_approval_consistency_check
    check (
      (approval_status = 'approved' and approved_by is not null and approved_at is not null)
      or (approval_status <> 'approved' and approved_at is null)
    )
);

create index if not exists trainer_profiles_approval_status_idx
on public.trainer_profiles (approval_status);

create trigger set_trainer_profiles_updated_at
  before update on public.trainer_profiles
  for each row execute function app_private.set_updated_at();

create table if not exists public.nutritionist_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  bio text,
  specialties text[] not null default '{}',
  certification_document_path text,
  approval_status public.approval_status not null default 'pending',
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutritionist_profiles_approval_consistency_check
    check (
      (approval_status = 'approved' and approved_by is not null and approved_at is not null)
      or (approval_status <> 'approved' and approved_at is null)
    )
);

create index if not exists nutritionist_profiles_approval_status_idx
on public.nutritionist_profiles (approval_status);

create trigger set_nutritionist_profiles_updated_at
  before update on public.nutritionist_profiles
  for each row execute function app_private.set_updated_at();

create or replace function app_private.prevent_approval_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if app_private.is_admin() or app_private.is_service_role() then
    return new;
  end if;

  if new.approval_status is distinct from old.approval_status
    or new.approved_by is distinct from old.approved_by
    or new.approved_at is distinct from old.approved_at then
    raise exception 'Only admins or secure backend functions can update approval fields.';
  end if;

  return new;
end;
$$;

create trigger prevent_trainer_approval_escalation
  before update on public.trainer_profiles
  for each row execute function app_private.prevent_approval_escalation();

create trigger prevent_nutritionist_approval_escalation
  before update on public.nutritionist_profiles
  for each row execute function app_private.prevent_approval_escalation();

create or replace function app_private.is_approved_trainer(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.trainer_profiles trainer
    join public.profiles profile on profile.id = trainer.user_id
    where trainer.user_id = $1
      and trainer.approval_status = 'approved'
      and profile.role = 'trainer'
      and profile.status = 'active'
  );
$$;

create or replace function app_private.is_approved_nutritionist(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.nutritionist_profiles nutritionist
    join public.profiles profile on profile.id = nutritionist.user_id
    where nutritionist.user_id = $1
      and nutritionist.approval_status = 'approved'
      and profile.role = 'nutritionist'
      and profile.status = 'active'
  );
$$;

create table if not exists public.fitness_classes (
  id uuid primary key default extensions.gen_random_uuid(),
  trainer_id uuid not null references public.trainer_profiles (user_id) on delete restrict,
  title text not null,
  description text,
  difficulty public.class_difficulty not null default 'beginner',
  status public.class_status not null default 'draft',
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  video_path text,
  thumbnail_path text,
  entitlement_required boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fitness_classes_publishable_media_check
    check (status <> 'published' or video_path is not null),
  constraint fitness_classes_published_at_check
    check (
      (status = 'published' and published_at is not null)
      or (status <> 'published')
    )
);

create index if not exists fitness_classes_trainer_id_idx
on public.fitness_classes (trainer_id);

create index if not exists fitness_classes_status_idx
on public.fitness_classes (status);

create trigger set_fitness_classes_updated_at
  before update on public.fitness_classes
  for each row execute function app_private.set_updated_at();

create table if not exists public.class_enrollments (
  id uuid primary key default extensions.gen_random_uuid(),
  class_id uuid not null references public.fitness_classes (id) on delete cascade,
  client_id uuid not null references public.client_profiles (user_id) on delete cascade,
  status public.enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_enrollments_unique_class_client unique (class_id, client_id),
  constraint class_enrollments_completed_at_check
    check ((status = 'completed' and completed_at is not null) or status <> 'completed')
);

create index if not exists class_enrollments_client_id_idx
on public.class_enrollments (client_id);

create index if not exists class_enrollments_class_id_idx
on public.class_enrollments (class_id);

create trigger set_class_enrollments_updated_at
  before update on public.class_enrollments
  for each row execute function app_private.set_updated_at();

create table if not exists public.subscription_plans (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  description text,
  price_amount numeric(12, 2) not null check (price_amount >= 0),
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  billing_interval public.billing_interval not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscription_plans_active_idx
on public.subscription_plans (is_active, sort_order);

create trigger set_subscription_plans_updated_at
  before update on public.subscription_plans
  for each row execute function app_private.set_updated_at();

create table if not exists public.user_subscriptions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id) on delete restrict,
  status public.subscription_status not null default 'pending',
  provider text not null,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscriptions_period_check
    check (
      current_period_start is null
      or current_period_end is null
      or current_period_end > current_period_start
    )
);

create index if not exists user_subscriptions_user_id_idx
on public.user_subscriptions (user_id);

create index if not exists user_subscriptions_plan_id_idx
on public.user_subscriptions (plan_id);

create index if not exists user_subscriptions_status_idx
on public.user_subscriptions (status);

create unique index if not exists user_subscriptions_provider_id_unique_idx
on public.user_subscriptions (provider, provider_subscription_id)
where provider_subscription_id is not null;

create trigger set_user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row execute function app_private.set_updated_at();

create table if not exists public.add_on_products (
  id uuid primary key default extensions.gen_random_uuid(),
  type public.add_on_type not null,
  name text not null,
  description text,
  price_amount numeric(12, 2) not null check (price_amount >= 0),
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists add_on_products_active_idx
on public.add_on_products (is_active, type);

create trigger set_add_on_products_updated_at
  before update on public.add_on_products
  for each row execute function app_private.set_updated_at();

create table if not exists public.payments (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  subscription_id uuid references public.user_subscriptions (id) on delete set null,
  add_on_product_id uuid references public.add_on_products (id) on delete set null,
  provider text not null,
  provider_payment_id text,
  status public.payment_status not null default 'pending',
  amount numeric(12, 2) not null check (amount >= 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  metadata jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_verified_status_check
    check ((status = 'succeeded' and verified_at is not null) or status <> 'succeeded')
);

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

create unique index if not exists payments_provider_id_unique_idx
on public.payments (provider, provider_payment_id)
where provider_payment_id is not null;

create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function app_private.set_updated_at();

create table if not exists public.user_entitlements (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entitlement_type public.entitlement_type not null,
  resource_type text,
  resource_id uuid,
  subscription_id uuid references public.user_subscriptions (id) on delete set null,
  source_payment_id uuid references public.payments (id) on delete set null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_entitlements_expiry_check
    check (expires_at is null or expires_at > starts_at)
);

create index if not exists user_entitlements_user_id_idx
on public.user_entitlements (user_id);

create index if not exists user_entitlements_lookup_idx
on public.user_entitlements (user_id, entitlement_type, resource_type, resource_id);

create index if not exists user_entitlements_active_idx
on public.user_entitlements (user_id, revoked_at, expires_at);

create trigger set_user_entitlements_updated_at
  before update on public.user_entitlements
  for each row execute function app_private.set_updated_at();

create or replace function app_private.has_active_class_entitlement(user_id uuid, class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_entitlements entitlement
    where entitlement.user_id = $1
      and entitlement.revoked_at is null
      and (entitlement.expires_at is null or entitlement.expires_at > now())
      and (
        entitlement.entitlement_type = 'subscription'
        or entitlement.entitlement_type = 'class_bundle'
        or (
          entitlement.entitlement_type = 'class'
          and entitlement.resource_type = 'fitness_class'
          and entitlement.resource_id = $2
        )
      )
  );
$$;

create table if not exists public.nutrition_products (
  id uuid primary key default extensions.gen_random_uuid(),
  type public.nutrition_product_type not null,
  name text not null,
  description text,
  price_amount numeric(12, 2) not null check (price_amount >= 0),
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nutrition_products_active_idx
on public.nutrition_products (is_active, type);

create trigger set_nutrition_products_updated_at
  before update on public.nutrition_products
  for each row execute function app_private.set_updated_at();

create table if not exists public.nutrition_orders (
  id uuid primary key default extensions.gen_random_uuid(),
  client_id uuid not null references public.client_profiles (user_id) on delete restrict,
  product_id uuid not null references public.nutrition_products (id) on delete restrict,
  payment_id uuid references public.payments (id) on delete set null,
  assigned_nutritionist_id uuid references public.nutritionist_profiles (user_id) on delete set null,
  status public.nutrition_order_status not null default 'pending_payment',
  requested_at timestamptz not null default now(),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_orders_completed_at_check
    check ((status = 'completed' and completed_at is not null) or status <> 'completed'),
  constraint nutrition_orders_id_client_unique unique (id, client_id)
);

create index if not exists nutrition_orders_client_id_idx
on public.nutrition_orders (client_id);

create index if not exists nutrition_orders_assigned_nutritionist_id_idx
on public.nutrition_orders (assigned_nutritionist_id);

create index if not exists nutrition_orders_status_idx
on public.nutrition_orders (status);

create trigger set_nutrition_orders_updated_at
  before update on public.nutrition_orders
  for each row execute function app_private.set_updated_at();

create table if not exists public.nutrition_questionnaires (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null,
  client_id uuid not null,
  goals text,
  dietary_preferences text[] not null default '{}',
  allergies text[] not null default '{}',
  medical_notes text,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_questionnaires_order_unique unique (order_id),
  constraint nutrition_questionnaires_order_client_fk
    foreign key (order_id, client_id)
    references public.nutrition_orders (id, client_id)
    on delete cascade
);

create index if not exists nutrition_questionnaires_client_id_idx
on public.nutrition_questionnaires (client_id);

create trigger set_nutrition_questionnaires_updated_at
  before update on public.nutrition_questionnaires
  for each row execute function app_private.set_updated_at();

create table if not exists public.meal_plans (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid references public.nutrition_orders (id) on delete set null,
  client_id uuid not null references public.client_profiles (user_id) on delete cascade,
  created_by uuid not null references public.nutritionist_profiles (user_id) on delete restrict,
  title text not null,
  description text,
  status public.meal_plan_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_plans_published_at_check
    check ((status = 'published' and published_at is not null) or status <> 'published')
);

create index if not exists meal_plans_client_id_idx on public.meal_plans (client_id);
create index if not exists meal_plans_created_by_idx on public.meal_plans (created_by);
create index if not exists meal_plans_status_idx on public.meal_plans (status);

create trigger set_meal_plans_updated_at
  before update on public.meal_plans
  for each row execute function app_private.set_updated_at();

create table if not exists public.meal_plan_days (
  id uuid primary key default extensions.gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans (id) on delete cascade,
  day_number integer not null check (day_number > 0),
  title text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_plan_days_unique_day unique (meal_plan_id, day_number)
);

create index if not exists meal_plan_days_meal_plan_id_idx
on public.meal_plan_days (meal_plan_id);

create trigger set_meal_plan_days_updated_at
  before update on public.meal_plan_days
  for each row execute function app_private.set_updated_at();

create table if not exists public.meals (
  id uuid primary key default extensions.gen_random_uuid(),
  meal_plan_day_id uuid not null references public.meal_plan_days (id) on delete cascade,
  name text not null,
  meal_type text not null,
  instructions text,
  calories integer check (calories is null or calories >= 0),
  protein_grams numeric(8, 2) check (protein_grams is null or protein_grams >= 0),
  carbs_grams numeric(8, 2) check (carbs_grams is null or carbs_grams >= 0),
  fat_grams numeric(8, 2) check (fat_grams is null or fat_grams >= 0),
  image_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meals_meal_plan_day_id_idx
on public.meals (meal_plan_day_id);

create trigger set_meals_updated_at
  before update on public.meals
  for each row execute function app_private.set_updated_at();

create table if not exists public.grocery_lists (
  id uuid primary key default extensions.gen_random_uuid(),
  client_id uuid not null references public.client_profiles (user_id) on delete cascade,
  nutritionist_id uuid references public.nutritionist_profiles (user_id) on delete set null,
  order_id uuid references public.nutrition_orders (id) on delete set null,
  meal_plan_id uuid references public.meal_plans (id) on delete cascade,
  title text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists grocery_lists_client_id_idx
on public.grocery_lists (client_id);

create index if not exists grocery_lists_nutritionist_id_idx
on public.grocery_lists (nutritionist_id);

create trigger set_grocery_lists_updated_at
  before update on public.grocery_lists
  for each row execute function app_private.set_updated_at();

create table if not exists public.meal_templates (
  id uuid primary key default extensions.gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionist_profiles (user_id) on delete cascade,
  name text not null,
  description text,
  meal_type text,
  template_data jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meal_templates_nutritionist_id_idx
on public.meal_templates (nutritionist_id);

create index if not exists meal_templates_active_idx
on public.meal_templates (is_active);

create trigger set_meal_templates_updated_at
  before update on public.meal_templates
  for each row execute function app_private.set_updated_at();

create table if not exists public.workout_progress (
  id uuid primary key default extensions.gen_random_uuid(),
  client_id uuid not null references public.client_profiles (user_id) on delete cascade,
  class_id uuid not null references public.fitness_classes (id) on delete cascade,
  status public.workout_progress_status not null default 'started',
  progress_percentage integer not null default 0 check (
    progress_percentage >= 0 and progress_percentage <= 100
  ),
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_progress_unique_client_class unique (client_id, class_id),
  constraint workout_progress_completed_check
    check (
      (status = 'completed' and progress_percentage = 100 and completed_at is not null)
      or status = 'started'
    )
);

create index if not exists workout_progress_client_id_idx
on public.workout_progress (client_id);

create index if not exists workout_progress_class_id_idx
on public.workout_progress (class_id);

create trigger set_workout_progress_updated_at
  before update on public.workout_progress
  for each row execute function app_private.set_updated_at();

create or replace function app_private.can_read_nutrition_order(order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.nutrition_orders nutrition_order
    where nutrition_order.id = $1
      and (
        nutrition_order.client_id = (select auth.uid())
        or nutrition_order.assigned_nutritionist_id = (select auth.uid())
        or app_private.is_admin()
      )
  );
$$;

create or replace function app_private.can_manage_nutrition_order(order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.nutrition_orders nutrition_order
    where nutrition_order.id = $1
      and (
        nutrition_order.assigned_nutritionist_id = (select auth.uid())
        or app_private.is_admin()
      )
  );
$$;

create or replace function app_private.can_read_meal_plan(meal_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.meal_plans meal_plan
    left join public.nutrition_orders nutrition_order on nutrition_order.id = meal_plan.order_id
    where meal_plan.id = $1
      and (
        (meal_plan.client_id = (select auth.uid()) and meal_plan.status = 'published')
        or meal_plan.created_by = (select auth.uid())
        or nutrition_order.assigned_nutritionist_id = (select auth.uid())
        or app_private.is_admin()
      )
  );
$$;

create or replace function app_private.can_manage_meal_plan(meal_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.meal_plans meal_plan
    left join public.nutrition_orders nutrition_order on nutrition_order.id = meal_plan.order_id
    where meal_plan.id = $1
      and (
        meal_plan.created_by = (select auth.uid())
        or nutrition_order.assigned_nutritionist_id = (select auth.uid())
        or app_private.is_admin()
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.trainer_profiles enable row level security;
alter table public.nutritionist_profiles enable row level security;
alter table public.fitness_classes enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.add_on_products enable row level security;
alter table public.payments enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.nutrition_products enable row level security;
alter table public.nutrition_orders enable row level security;
alter table public.nutrition_questionnaires enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_plan_days enable row level security;
alter table public.meals enable row level security;
alter table public.grocery_lists enable row level security;
alter table public.meal_templates enable row level security;
alter table public.workout_progress enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or app_private.is_admin());

create policy "profiles_insert_own_client_profile"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()) and role = 'client');

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "profiles_admin_manage_all"
on public.profiles for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "client_profiles_select_own_or_admin"
on public.client_profiles for select
to authenticated
using (user_id = (select auth.uid()) or app_private.is_admin());

create policy "client_profiles_insert_own"
on public.client_profiles for insert
to authenticated
with check (user_id = (select auth.uid()) or app_private.is_admin());

create policy "client_profiles_update_own_or_admin"
on public.client_profiles for update
to authenticated
using (user_id = (select auth.uid()) or app_private.is_admin())
with check (user_id = (select auth.uid()) or app_private.is_admin());

create policy "client_profiles_admin_delete"
on public.client_profiles for delete
to authenticated
using (app_private.is_admin());

create policy "trainer_profiles_select_own_or_admin"
on public.trainer_profiles for select
to authenticated
using (user_id = (select auth.uid()) or app_private.is_admin());

create policy "trainer_profiles_insert_own_pending"
on public.trainer_profiles for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and approval_status = 'pending'
  and approved_by is null
  and approved_at is null
);

create policy "trainer_profiles_update_own_or_admin"
on public.trainer_profiles for update
to authenticated
using (user_id = (select auth.uid()) or app_private.is_admin())
with check (user_id = (select auth.uid()) or app_private.is_admin());

create policy "trainer_profiles_admin_delete"
on public.trainer_profiles for delete
to authenticated
using (app_private.is_admin());

create policy "nutritionist_profiles_select_own_or_admin"
on public.nutritionist_profiles for select
to authenticated
using (user_id = (select auth.uid()) or app_private.is_admin());

create policy "nutritionist_profiles_insert_own_pending"
on public.nutritionist_profiles for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and approval_status = 'pending'
  and approved_by is null
  and approved_at is null
);

create policy "nutritionist_profiles_update_own_or_admin"
on public.nutritionist_profiles for update
to authenticated
using (user_id = (select auth.uid()) or app_private.is_admin())
with check (user_id = (select auth.uid()) or app_private.is_admin());

create policy "nutritionist_profiles_admin_delete"
on public.nutritionist_profiles for delete
to authenticated
using (app_private.is_admin());

create policy "fitness_classes_select_published_owner_or_admin"
on public.fitness_classes for select
to authenticated
using (
  status = 'published'
  or trainer_id = (select auth.uid())
  or app_private.is_admin()
);

create policy "fitness_classes_insert_approved_trainer_or_admin"
on public.fitness_classes for insert
to authenticated
with check (
  app_private.is_admin()
  or (
    trainer_id = (select auth.uid())
    and app_private.is_approved_trainer((select auth.uid()))
  )
);

create policy "fitness_classes_update_owner_or_admin"
on public.fitness_classes for update
to authenticated
using (trainer_id = (select auth.uid()) or app_private.is_admin())
with check (trainer_id = (select auth.uid()) or app_private.is_admin());

create policy "fitness_classes_delete_owner_or_admin"
on public.fitness_classes for delete
to authenticated
using (trainer_id = (select auth.uid()) or app_private.is_admin());

create policy "class_enrollments_select_related_or_admin"
on public.class_enrollments for select
to authenticated
using (
  client_id = (select auth.uid())
  or app_private.is_admin()
  or exists (
    select 1
    from public.fitness_classes fitness_class
    where fitness_class.id = class_enrollments.class_id
      and fitness_class.trainer_id = (select auth.uid())
  )
);

create policy "class_enrollments_insert_own_or_admin"
on public.class_enrollments for insert
to authenticated
with check (
  app_private.is_admin()
  or (
    client_id = (select auth.uid())
    and exists (
      select 1
      from public.fitness_classes fitness_class
      where fitness_class.id = class_id
        and fitness_class.status = 'published'
        and (
          fitness_class.entitlement_required = false
          or app_private.has_active_class_entitlement((select auth.uid()), fitness_class.id)
        )
    )
  )
);

create policy "class_enrollments_update_own_or_admin"
on public.class_enrollments for update
to authenticated
using (client_id = (select auth.uid()) or app_private.is_admin())
with check (client_id = (select auth.uid()) or app_private.is_admin());

create policy "class_enrollments_admin_delete"
on public.class_enrollments for delete
to authenticated
using (app_private.is_admin());

create policy "subscription_plans_select_active_or_admin"
on public.subscription_plans for select
to authenticated
using (is_active = true or app_private.is_admin());

create policy "subscription_plans_admin_manage"
on public.subscription_plans for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "user_subscriptions_select_own_or_admin"
on public.user_subscriptions for select
to authenticated
using (user_id = (select auth.uid()) or app_private.is_admin());

create policy "add_on_products_select_active_or_admin"
on public.add_on_products for select
to authenticated
using (is_active = true or app_private.is_admin());

create policy "add_on_products_admin_manage"
on public.add_on_products for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "payments_select_own_or_admin"
on public.payments for select
to authenticated
using (user_id = (select auth.uid()) or app_private.is_admin());

create policy "user_entitlements_select_own_or_admin"
on public.user_entitlements for select
to authenticated
using (user_id = (select auth.uid()) or app_private.is_admin());

create policy "user_entitlements_admin_manage"
on public.user_entitlements for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "nutrition_products_select_active_or_admin"
on public.nutrition_products for select
to authenticated
using (is_active = true or app_private.is_admin());

create policy "nutrition_products_admin_manage"
on public.nutrition_products for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "nutrition_orders_select_related_or_admin"
on public.nutrition_orders for select
to authenticated
using (
  client_id = (select auth.uid())
  or assigned_nutritionist_id = (select auth.uid())
  or app_private.is_admin()
);

create policy "nutrition_orders_insert_own_client_order"
on public.nutrition_orders for insert
to authenticated
with check (
  client_id = (select auth.uid())
  and status = 'pending_payment'
  and payment_id is null
  and assigned_nutritionist_id is null
  and completed_at is null
);

create policy "nutrition_orders_update_assigned_or_admin"
on public.nutrition_orders for update
to authenticated
using (assigned_nutritionist_id = (select auth.uid()) or app_private.is_admin())
with check (assigned_nutritionist_id = (select auth.uid()) or app_private.is_admin());

create policy "nutrition_orders_admin_delete"
on public.nutrition_orders for delete
to authenticated
using (app_private.is_admin());

create policy "nutrition_questionnaires_select_related_or_admin"
on public.nutrition_questionnaires for select
to authenticated
using (
  client_id = (select auth.uid())
  or app_private.can_read_nutrition_order(order_id)
);

create policy "nutrition_questionnaires_insert_own_order"
on public.nutrition_questionnaires for insert
to authenticated
with check (
  client_id = (select auth.uid())
  and exists (
    select 1
    from public.nutrition_orders nutrition_order
    where nutrition_order.id = order_id
      and nutrition_order.client_id = (select auth.uid())
  )
);

create policy "nutrition_questionnaires_update_own_order"
on public.nutrition_questionnaires for update
to authenticated
using (client_id = (select auth.uid()))
with check (client_id = (select auth.uid()));

create policy "nutrition_questionnaires_admin_delete"
on public.nutrition_questionnaires for delete
to authenticated
using (app_private.is_admin());

create policy "meal_plans_select_related_or_admin"
on public.meal_plans for select
to authenticated
using (app_private.can_read_meal_plan(id));

create policy "meal_plans_insert_approved_nutritionist_or_admin"
on public.meal_plans for insert
to authenticated
with check (
  app_private.is_admin()
  or (
    created_by = (select auth.uid())
    and app_private.is_approved_nutritionist((select auth.uid()))
    and exists (
      select 1
      from public.nutrition_orders nutrition_order
      where nutrition_order.id = order_id
        and nutrition_order.client_id = meal_plans.client_id
        and nutrition_order.assigned_nutritionist_id = (select auth.uid())
    )
  )
);

create policy "meal_plans_update_creator_assigned_or_admin"
on public.meal_plans for update
to authenticated
using (app_private.can_manage_meal_plan(id))
with check (app_private.can_manage_meal_plan(id));

create policy "meal_plans_delete_creator_assigned_or_admin"
on public.meal_plans for delete
to authenticated
using (app_private.can_manage_meal_plan(id));

create policy "meal_plan_days_select_related_or_admin"
on public.meal_plan_days for select
to authenticated
using (app_private.can_read_meal_plan(meal_plan_id));

create policy "meal_plan_days_insert_manageable_plan"
on public.meal_plan_days for insert
to authenticated
with check (app_private.can_manage_meal_plan(meal_plan_id));

create policy "meal_plan_days_update_manageable_plan"
on public.meal_plan_days for update
to authenticated
using (app_private.can_manage_meal_plan(meal_plan_id))
with check (app_private.can_manage_meal_plan(meal_plan_id));

create policy "meal_plan_days_delete_manageable_plan"
on public.meal_plan_days for delete
to authenticated
using (app_private.can_manage_meal_plan(meal_plan_id));

create policy "meals_select_related_or_admin"
on public.meals for select
to authenticated
using (
  exists (
    select 1
    from public.meal_plan_days meal_plan_day
    where meal_plan_day.id = meals.meal_plan_day_id
      and app_private.can_read_meal_plan(meal_plan_day.meal_plan_id)
  )
);

create policy "meals_insert_manageable_plan"
on public.meals for insert
to authenticated
with check (
  exists (
    select 1
    from public.meal_plan_days meal_plan_day
    where meal_plan_day.id = meals.meal_plan_day_id
      and app_private.can_manage_meal_plan(meal_plan_day.meal_plan_id)
  )
);

create policy "meals_update_manageable_plan"
on public.meals for update
to authenticated
using (
  exists (
    select 1
    from public.meal_plan_days meal_plan_day
    where meal_plan_day.id = meals.meal_plan_day_id
      and app_private.can_manage_meal_plan(meal_plan_day.meal_plan_id)
  )
)
with check (
  exists (
    select 1
    from public.meal_plan_days meal_plan_day
    where meal_plan_day.id = meals.meal_plan_day_id
      and app_private.can_manage_meal_plan(meal_plan_day.meal_plan_id)
  )
);

create policy "meals_delete_manageable_plan"
on public.meals for delete
to authenticated
using (
  exists (
    select 1
    from public.meal_plan_days meal_plan_day
    where meal_plan_day.id = meals.meal_plan_day_id
      and app_private.can_manage_meal_plan(meal_plan_day.meal_plan_id)
  )
);

create policy "grocery_lists_select_related_or_admin"
on public.grocery_lists for select
to authenticated
using (
  client_id = (select auth.uid())
  or nutritionist_id = (select auth.uid())
  or app_private.is_admin()
);

create policy "grocery_lists_insert_assigned_nutritionist_or_admin"
on public.grocery_lists for insert
to authenticated
with check (
  app_private.is_admin()
  or (
    nutritionist_id = (select auth.uid())
    and app_private.is_approved_nutritionist((select auth.uid()))
    and order_id is not null
    and app_private.can_manage_nutrition_order(order_id)
    and exists (
      select 1
      from public.nutrition_orders nutrition_order
      where nutrition_order.id = order_id
        and nutrition_order.client_id = grocery_lists.client_id
    )
  )
);

create policy "grocery_lists_update_nutritionist_or_admin"
on public.grocery_lists for update
to authenticated
using (nutritionist_id = (select auth.uid()) or app_private.is_admin())
with check (nutritionist_id = (select auth.uid()) or app_private.is_admin());

create policy "grocery_lists_delete_nutritionist_or_admin"
on public.grocery_lists for delete
to authenticated
using (nutritionist_id = (select auth.uid()) or app_private.is_admin());

create policy "meal_templates_select_owner_or_admin"
on public.meal_templates for select
to authenticated
using (nutritionist_id = (select auth.uid()) or app_private.is_admin());

create policy "meal_templates_insert_approved_nutritionist_or_admin"
on public.meal_templates for insert
to authenticated
with check (
  app_private.is_admin()
  or (
    nutritionist_id = (select auth.uid())
    and app_private.is_approved_nutritionist((select auth.uid()))
  )
);

create policy "meal_templates_update_owner_or_admin"
on public.meal_templates for update
to authenticated
using (nutritionist_id = (select auth.uid()) or app_private.is_admin())
with check (nutritionist_id = (select auth.uid()) or app_private.is_admin());

create policy "meal_templates_delete_owner_or_admin"
on public.meal_templates for delete
to authenticated
using (nutritionist_id = (select auth.uid()) or app_private.is_admin());

create policy "workout_progress_select_related_or_admin"
on public.workout_progress for select
to authenticated
using (
  client_id = (select auth.uid())
  or app_private.is_admin()
  or exists (
    select 1
    from public.fitness_classes fitness_class
    where fitness_class.id = workout_progress.class_id
      and fitness_class.trainer_id = (select auth.uid())
  )
);

create policy "workout_progress_insert_own"
on public.workout_progress for insert
to authenticated
with check (client_id = (select auth.uid()));

create policy "workout_progress_update_own"
on public.workout_progress for update
to authenticated
using (client_id = (select auth.uid()))
with check (client_id = (select auth.uid()));

create policy "workout_progress_admin_delete"
on public.workout_progress for delete
to authenticated
using (app_private.is_admin());

revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;
grant execute on all functions in schema app_private to authenticated;
