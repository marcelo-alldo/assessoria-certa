import PageTitle from '@/components/PageTitle';

/**
 * The Subscription header component.
 */

interface SubscriptionHeaderProps {
  subscriptionName: string;
}

function SubscriptionHeader({ subscriptionName }: SubscriptionHeaderProps) {
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title={`Assinatura - ${subscriptionName}`} backNavigation />
    </div>
  );
}

export default SubscriptionHeader;
