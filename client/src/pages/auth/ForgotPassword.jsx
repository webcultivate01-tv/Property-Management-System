import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({ email: z.string().email('Valid email required') });

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/forgot-password', data);
      toast.success('Check your email for the reset link.');
      // In dev, the API returns the reset URL — surface it for convenience
      if (res.data?.data?.resetUrl) {
        toast(`Dev link: ${res.data.data.resetUrl}`, { duration: 8000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="We'll send you a link to reset your password."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Send Reset Link
        </Button>
      </form>
    </AuthShell>
  );
}
