// Unified Users page — shows every account in the system (admin / agent / user).
// Use Admins.jsx and Agents.jsx for filtered views of just the staff.

import UserManagement from './UserManagement';

export default function Users() {
  return (
    <UserManagement
      title="Users"
      description={(n) => `${n} account${n === 1 ? '' : 's'} in the system`}
      roleFilter={['super_admin', 'admin', 'agent', 'user']}
      roleOptions={['user', 'agent', 'admin', 'super_admin']}
      defaultRole="user"
      emptyTitle="No users yet"
      exportFilename="users"
      exportTitle="All Users"
      allowSyncFromInquiries
    />
  );
}
