import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { emailPasswordSchema, type EmailPasswordFormValues } from '../schemas/authSchemas';
import { Button } from '@/source/shared/ui/Button';
import { Input } from '@/source/shared/ui/Input';
import { Text } from '@/source/shared/ui/Text';

type EmailPasswordFormProps = {
  isLoading: boolean;
  mode: 'sign-in' | 'sign-up';
  onSubmit: (values: EmailPasswordFormValues) => Promise<void>;
  submitLabel: string;
};

export function EmailPasswordForm({
  isLoading,
  mode,
  onSubmit,
  submitLabel,
}: EmailPasswordFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<EmailPasswordFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(emailPasswordSchema),
  });

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            autoCapitalize="none"
            autoComplete="email"
            errorMessage={errors.email?.message}
            keyboardType="email-address"
            label="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="you@example.com"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            autoCapitalize="none"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            errorMessage={errors.password?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Minimum 8 characters"
            secureTextEntry
            value={value}
          />
        )}
      />
      <Button isLoading={isLoading} label={submitLabel} onPress={handleSubmit(onSubmit)} />
      <Text variant="caption">
        Admin access is assigned by secure profile bootstrap, not from this form.
      </Text>
    </>
  );
}
