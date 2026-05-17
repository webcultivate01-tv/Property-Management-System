import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search, Plus, Pencil, Trash2, UserCog, ShieldCheck, ShieldOff,
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/admin/PageHeader';
import { ExportMenu } from '@/components/admin/ExportMenu';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { fetchAllPages } from '@/lib/exportAll';

const ROLE_LABEL = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  agent: 'Agent',
};

/**
 * Reusable management table for staff records.
 *
 * Props:
 *   title          – page heading
 *   description    – page subheading (function or string; receives total count)
 *   roleFilter     – array of role values to fetch & manage on this page
 *   roleOptions    – array of role values selectable in the create/edit form
 *   defaultRole    – role pre-selected when creating a new record
 *   emptyTitle     – heading shown when no records match
 *   exportFilename – base filename for exports
 *   exportTitle    – heading printed on the exported PDF
 */
export default function UserManagement({
  title,
  description,
  roleFilter,
  roleOptions,
  defaultRole,
  emptyTitle = 'No records yet',
  exportFilename = 'users',
  exportTitle = 'Team Members',
}) {
  const { user: me } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const rolesParam = useMemo(() => roleFilter.join(','), [roleFilter]);

  const createSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
        role: z.enum(roleOptions),
      }),
    [roleOptions]
  );

  const editSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2),
        phone: z.string().optional(),
        role: z.enum(roleOptions),
        isActive: z.boolean(),
      }),
    [roleOptions]
  );

  const fetchData = () => {
    setLoading(true);
    userService
      .list({ page, limit: 10, search, roles: rolesParam })
      .then((res) => {
        setItems(res.data || []);
        setMeta(res.meta || { totalPages: 1, total: 0 });
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page, search, rolesParam]);

  const createForm = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { role: defaultRole },
  });
  const editForm = useForm({ resolver: zodResolver(editSchema) });

  const openEdit = (u) => {
    setEditing(u);
    editForm.reset({
      name: u.name,
      phone: u.phone || '',
      role: u.role,
      isActive: u.isActive,
    });
  };

  const onCreate = async (data) => {
    setBusy(true);
    try {
      await userService.create(data);
      toast.success('Created');
      setCreating(false);
      createForm.reset({ role: defaultRole });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  const onEdit = async (data) => {
    if (!editing) return;
    setBusy(true);
    try {
      await userService.update(editing._id, data);
      toast.success('Updated');
      setEditing(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await userService.remove(deleting._id);
      toast.success('Deleted');
      setDeleting(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      await userService.update(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'Deactivated' : 'Activated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const exportColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role', format: (v) => ROLE_LABEL[v] || v },
    { key: 'isActive', label: 'Status', format: (v) => (v ? 'Active' : 'Inactive') },
    { key: 'lastLogin', label: 'Last Login', format: (v) => (v ? formatDate(v) : '—') },
    { key: 'createdAt', label: 'Joined', format: (v) => formatDate(v) },
  ];

  const desc =
    typeof description === 'function'
      ? description(meta.total)
      : description || `${meta.total} member(s)`;

  const canCreate = me?.role === 'super_admin';

  return (
    <div>
      <PageHeader
        title={title}
        description={desc}
        actions={
          <>
            <ExportMenu
              getData={() => fetchAllPages(userService.list, { search, roles: rolesParam })}
              columns={exportColumns}
              filename={exportFilename}
              title={exportTitle}
            />
            {canCreate && (
              <Button onClick={() => setCreating(true)}>
                <Plus size={16} /> Add
              </Button>
            )}
          </>
        }
      />

      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200/60 dark:border-white/10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-16" />))}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={UserCog} title={emptyTitle} description="Add team members to collaborate." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Member</th>
                  <th className="text-left px-4 py-3 font-semibold">Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Joined</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {items.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white grid place-items-center font-bold">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${
                        u.role === 'super_admin'
                          ? 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300'
                          : u.role === 'agent'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                      }`}>
                        {ROLE_LABEL[u.role] || u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => toggleActive(u)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" title="Toggle active">
                          {u.isActive ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                        </button>
                        <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" title="Edit">
                          <Pencil size={15} />
                        </button>
                        {me?.role === 'super_admin' && me._id !== u._id && (
                          <button onClick={() => setDeleting(u)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && items.length > 0 && (
          <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
        )}
      </div>

      {/* CREATE */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Add new member"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={createForm.handleSubmit(onCreate)} loading={busy}>Create</Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={createForm.handleSubmit(onCreate)}>
          <Input label="Name" {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
          <Input label="Email" type="email" {...createForm.register('email')} error={createForm.formState.errors.email?.message} />
          <Input label="Password" type="password" {...createForm.register('password')} error={createForm.formState.errors.password?.message} />
          <Input label="Phone (optional)" {...createForm.register('phone')} />
          <Select label="Role" {...createForm.register('role')}>
            {roleOptions.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </Select>
        </form>
      </Modal>

      {/* EDIT */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit member"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={editForm.handleSubmit(onEdit)} loading={busy}>Save</Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={editForm.handleSubmit(onEdit)}>
          <Input label="Name" {...editForm.register('name')} error={editForm.formState.errors.name?.message} />
          <Input label="Phone" {...editForm.register('phone')} />
          <Select label="Role" {...editForm.register('role')}>
            {roleOptions.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </Select>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 accent-brand-600" {...editForm.register('isActive')} />
            <span className="font-medium">Active</span>
          </label>
        </form>
      </Modal>

      {/* DELETE */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete member?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" onClick={onDelete} loading={busy}>Delete</Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          Delete <span className="font-semibold">{deleting?.name}</span>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
