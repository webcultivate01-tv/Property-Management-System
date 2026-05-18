import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login(data.email, data.password);
      toast.success('Welcome back!');

      // Send admins/agents to the admin panel; regular users back home.
      const fallback = ['super_admin', 'admin', 'agent'].includes(user?.role) ? '/admin' : '/';
      const target = location.state?.from?.pathname || fallback;
      navigate(target, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Cannot reach the API. Is the backend running on http://localhost:5000?'
          : err.message) ||
        'Login failed';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back — please enter your credentials."
      footer={
        <span className="text-xs text-slate-500">
          New accounts are created by your administrator.
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-[42px] text-slate-400" />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-[42px] text-slate-400" />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Sign In
        </Button>
      </form>
    </AuthShell>
  );
}
