import UserManagement from './UserManagement';

export default function Admins() {
  return (
    <UserManagement
      title="Admin Management"
      description={(n) => `${n} administrator${n === 1 ? '' : 's'} with console access`}
      roleFilter={['super_admin', 'admin']}
      roleOptions={['admin', 'super_admin']}
      defaultRole="admin"
      emptyTitle="No administrators yet"
      exportFilename="admins"
      exportTitle="Administrators"
    />
  );
}
