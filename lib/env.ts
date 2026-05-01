export type RequiredEnvKey =
  | 'EXPO_PUBLIC_SUPABASE_URL'
  | 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY';

export type ForbiddenPublicEnvKey =
  | 'EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'
  | 'EXPO_PUBLIC_SUPABASE_SECRET_KEY'
  | 'EXPO_PUBLIC_DGATEWAY_SECRET_KEY'
  | 'EXPO_PUBLIC_DGATEWAY_API_SECRET'
  | 'EXPO_PUBLIC_PAYMENT_SECRET_KEY'
  | 'EXPO_PUBLIC_PAYMENT_PROVIDER_SECRET';

export type PublicEnv = Readonly<{
  supabaseUrl: string;
  supabasePublishableKey: string;
}>;

function assertRequiredEnv(key: RequiredEnvKey, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function assertNoForbiddenPublicEnv() {
  const forbiddenValues: [ForbiddenPublicEnvKey, string | undefined][] = [
    ['EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY', process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY],
    ['EXPO_PUBLIC_SUPABASE_SECRET_KEY', process.env.EXPO_PUBLIC_SUPABASE_SECRET_KEY],
    ['EXPO_PUBLIC_DGATEWAY_SECRET_KEY', process.env.EXPO_PUBLIC_DGATEWAY_SECRET_KEY],
    ['EXPO_PUBLIC_DGATEWAY_API_SECRET', process.env.EXPO_PUBLIC_DGATEWAY_API_SECRET],
    ['EXPO_PUBLIC_PAYMENT_SECRET_KEY', process.env.EXPO_PUBLIC_PAYMENT_SECRET_KEY],
    ['EXPO_PUBLIC_PAYMENT_PROVIDER_SECRET', process.env.EXPO_PUBLIC_PAYMENT_PROVIDER_SECRET],
  ];

  const exposedSecretKey = forbiddenValues.find(([, value]) => Boolean(value))?.[0];

  if (exposedSecretKey) {
    throw new Error(`Forbidden public environment variable configured: ${exposedSecretKey}`);
  }
}

function assertValidSupabaseUrl(value: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL must be a valid URL.');
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL must use HTTPS.');
  }
}

function loadPublicEnv(): PublicEnv {
  assertNoForbiddenPublicEnv();

  const supabaseUrl = assertRequiredEnv(
    'EXPO_PUBLIC_SUPABASE_URL',
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  );
  const supabasePublishableKey = assertRequiredEnv(
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  assertValidSupabaseUrl(supabaseUrl);

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}

export const env: PublicEnv = loadPublicEnv();
