import UserManagement from './UserManagement';

export default function Agents() {
  return (
    <UserManagement
      title="Agents"
      description={(n) => `${n} agent${n === 1 ? '' : 's'} working with customers`}
      roleFilter={['agent']}
      roleOptions={['agent']}
      defaultRole="agent"
      emptyTitle="No agents yet"
      exportFilename="agents"
      exportTitle="Agents"
    />
  );
}
