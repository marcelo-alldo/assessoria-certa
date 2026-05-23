import PageTitle from '@/components/PageTitle';

/**
 * The chatsheader component.
 */

function ChatsHeader() {
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Conversas" />
    </div>
  );
}

export default ChatsHeader;
