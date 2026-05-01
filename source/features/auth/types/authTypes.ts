export type AuthCredentials = {
  email: string;
  password: string;
};

export type PasswordResetRequest = {
  email: string;
};

export type OAuthProvider = 'apple' | 'google';
