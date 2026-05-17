import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z
  .object({
    password: z.string().min(6, 'Min 6 characters'),
    confirm: z.string().min(6, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Password updated. Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Choose a strong new password."
      footer={
        <Link to="/login" className="text-brand-600 font-semibold hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="New password" type="password" {...register('password')} error={errors.password?.message} />
        <Input label="Confirm password" type="password" {...register('confirm')} error={errors.confirm?.message} />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Update Password
        </Button>
      </form>
    </AuthShell>
  );
}
