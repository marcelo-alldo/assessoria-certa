import PageTitle from '@/components/PageTitle';

/**
 * The Whatsapp Header component.
 */

function WhatsappHeader() {
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Conecte seu WhatsApp" />
    </div>
  );
}

export default WhatsappHeader;
