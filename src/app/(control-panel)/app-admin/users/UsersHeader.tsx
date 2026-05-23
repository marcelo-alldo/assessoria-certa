import PageTitle from '@/components/PageTitle';

/**
 * The users header component.
 */

function UsersHeader() {
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Lista de Usuários" />
    </div>
  );
}

export default UsersHeader;
