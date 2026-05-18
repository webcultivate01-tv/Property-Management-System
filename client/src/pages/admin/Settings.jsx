import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/admin/PageHeader';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/user.service';

export default function Settings() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const siteForm = useForm({ defaultValues: { siteName: '', tagline: '', email: '', phone: '', address: '' } });
  const profileForm = useForm({ defaultValues: { name: user?.name || '', phone: user?.phone || '' } });
  const passwordForm = useForm({ defaultValues: { currentPassword: '', newPassword: '' } });

  useEffect(() => {
    api
      .get('/services/settings')
      .then((res) => {
        const s = res.data?.data;
        if (s) siteForm.reset({
          siteName: s.siteName,
          tagline: s.tagline,
          email: s.email,
          phone: s.phone,
          address: s.address,
        });
      })
      .finally(() => setLoading(false));
    profileForm.reset({ name: user?.name, phone: user?.phone || '' });
  }, [user, profileForm, siteForm]);

  const saveSettings = async (data) => {
    setBusy(true);
    try {
      await api.patch('/services/settings', data);
      toast.success('Site settings updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (data) => {
    setBusy(true);
    try {
      await userService.updateProfile(data);
      toast.success('Profile updated');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (data) => {
    setBusy(true);
    try {
      await userService.changePassword(data);
      toast.success('Password updated');
      passwordForm.reset({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your site information and account preferences"
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={siteForm.handleSubmit(saveSettings)} className="lg:col-span-2 bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card p-6 space-y-4">
          <h3 className="font-display font-bold text-lg">Site Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Site name" {...siteForm.register('siteName')} />
            <Input label="Tagline" {...siteForm.register('tagline')} />
            <Input label="Email" type="email" {...siteForm.register('email')} />
            <Input label="Phone" {...siteForm.register('phone')} />
          </div>
          <Textarea label="Address" rows={2} {...siteForm.register('address')} />
          <div className="flex justify-end">
            <Button type="submit" loading={busy}>Save settings</Button>
          </div>
        </form>

        <div className="space-y-6">
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card p-6 space-y-4">
            <h3 className="font-display font-bold text-lg">My Profile</h3>
            <Input label="Name" {...profileForm.register('name')} />
            <Input label="Phone" {...profileForm.register('phone')} />
            <Button type="submit" loading={busy} className="w-full">Update profile</Button>
          </form>

          <form onSubmit={passwordForm.handleSubmit(changePassword)} className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card p-6 space-y-4">
            <h3 className="font-display font-bold text-lg">Change Password</h3>
            <Input label="Current password" type="password" {...passwordForm.register('currentPassword', { required: true })} />
            <Input label="New password" type="password" {...passwordForm.register('newPassword', { required: true, minLength: 6 })} />
            <Button type="submit" loading={busy} className="w-full">Change password</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
