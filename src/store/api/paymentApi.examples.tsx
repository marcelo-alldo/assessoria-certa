/**
 * Exemplo de uso da Payment API
 *
 * Esta API fornece endpoints para gerenciar pagamentos no sistema.
 */

import {
  useGetPaymentsQuery,
  useGetPaymentByUidQuery,
  useGetPaymentsByUserQuery,
  useGetPaymentsBySubscriptionQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useUpdatePaymentStatusMutation,
  useDeletePaymentMutation,
  CreatePaymentType,
  StatusPayment,
} from '@/store/api/paymentApi';

// ============================================
// EXEMPLOS DE USO
// ============================================

/**
 * 1. Listar todos os pagamentos com paginação
 */
function ListPaymentsExample() {
  const { data, isLoading, error } = useGetPaymentsQuery('page=1&limit=10');

  if (isLoading) return <div>Carregando...</div>;

  if (error) return <div>Erro ao carregar pagamentos</div>;

  return (
    <div>
      {data?.data.map((payment) => (
        <div key={payment.uid}>
          {payment.description} - R$ {payment.value}
        </div>
      ))}
      <div>
        
      
        Página {data?.page} de {data?.totalPages}
      </div>
    </div>
  );
}

/**
 * 2. Buscar pagamento por UID
 */
function GetPaymentExample() {
const paymentUid = 'uuid-here';
  const { data, isLoading } = useGetPaymentByUidQuery(paymentUid);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h3>{data?.data.description}</h3>
      <p>Valor: R$ {data?.data.value}</p>
      <p>Status: {data?.data.status}</p>
      <p>Vencimento: {data?.data.dueDate}</p>
    </div>
  );
}

/**
 * 3. Listar pagamentos de um usuário específico
 */
function GetUserPaymentsExample() {
const userUid = 'user-uuid-here';
  const { data, isLoading } = useGetPaymentsByUserQuery(userUid);

  return (
    <div>
      <h3>Pagamentos do usuário ({data?.total})</h3>
      {data?.data.map((payment) => (
        <div key={payment.uid}>
          {payment.description} - {payment.status}
        </div>
      ))}
    </div>
  );
}

/**
 * 4. Listar pagamentos de uma assinatura específica
 */
function GetSubscriptionPaymentsExample() {
const subscriptionUid = 'subscription-uuid-here';
  const { data, isLoading } = useGetPaymentsBySubscriptionQuery(subscriptionUid);

  return (
    <div>
      <h3>Pagamentos da assinatura ({data?.total})</h3>
      {data?.data.map((payment) => (
        <div key={payment.uid}>
          {payment.description} - R$ {payment.value}
        </div>
      ))}
    </div>
  );
}

/**
 * 5. Criar novo pagamento
 */
nction CreatePaymentExample() {
  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  const handleCreatePayment = async () => {
    const newPayment: CreatePaymentType = {
      userUid: 'usr-uuid',
      type: 'CREDIT_CARD',
      value: 199.9,
      description: 'Pagamento de assinatura mensal',
      dueDate: '2026-02-15',
      source: 'AUTOMATIC',
      userSubscriptionUid: 'subscription-uuid',
      discount: 10,
  discountType: 'PERCENTAGE',
    };

    try {
      const response = await createPayment(newPayment).unwrap();
      alert(response.msg);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
  }
  };

  return (
    <button onClick={handleCreatePayment} disabled={isLoading}>
      {isLoading ? 'Criando...' : 'Criar Pagamento'}
    </button>
  );
}

/**
 * 6. Atualizar pagamento
 */
nction UpdatePaymentExample() {
  const [updatePayment, { isLoading }] = useUpdatePaymentMutation();

  const handleUpdatePayment = async (paymentUid: string) => {
    try {
      const response = await updatePayment({
        uid: paymentUid,
        status: 'RECIVED',
        description: 'Pagamento atualizado',
  value: 189.9,
      }).unwrap();
      alert(response.msg);
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
  }
  };

  return (
    <button onClick={() => handleUpdatePayment('payment-uuid')} disabled={isLoading}>
      {isLoading ? 'Atualizando...' : 'Atualizar Pagamento'}
    </button>
  );
}

/**
 * 7. Atualizar apenas o status do pagamento
 */
nction UpdatePaymentStatusExample() {
  const [updateStatus, { isLoading }] = useUpdatePaymentStatusMutation();

  const handleUpdateStatus = async (paymentUid: string, newStatus: StatusPayment) => {
    try {
      const response = await updateStatus({
        uid: paymentUid,
  status: newStatus,
      }).unwrap();

      console.log('Status atualizado:', response.data);
      alert(response.msg);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
  }
  };

  return (><button onClick={() => handleUpdateStatus('payment-uuid', 'RECEIVED')}>Marcar como Recebido</button>
      <button onClick={() => handleUpdateStatus('payment-uuid', 'CANCELED')}>utton ondiv>
  );
/**
 * 8. Deletar pagamento
 */
function DeletePaymentExample() {
  const [deletePayment, { isLoading }] = useDeletePaymentMutation();

  const handleDeletePayment = async (paymentUid: string) => {
    if (!confirm('Deseja realmente excluir este pagamento?')) return;

  try {
      const response = await deletePayment(paymentUid).unwrap();
      console.log('Pagamento excluído');
  alert(response.msg);
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
    }
  };

  return (
    <button onClick={() => handleDeletePayment('payment-uuid')} disabled={isLoading}>
      {isLoading ? 'Excluindo...' : 'Excluir Pagamento'}
  </button>
  );
}

/**
 * 9. Exemplo completo com tabela de pagamentos
 */
function PaymentsTableExample() {
  const userUid = 'user-uuid';
  const { data: payments, isLoading, refetch } = useGetPaymentsByUserQuery(userUid);
  const [updateStatus] = useUpdatePaymentStatusMutation();
  const [deletePayment] = useDeletePaymentMutation();

  const handleChangeStatus = async (paymentUid: string, status: StatusPayment) => {
    try {
      await updateStatus({ uid: paymentUid, status }).unwrap();
    refetch(); // Recarrega a lista
      alert('Status atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const handleDelete = async (paymentUid: string) => {
    if (!confirm('Deseja excluir este pagamento?')) return;

  try {
      await deletePayment(paymentUid).unwrap();
      refetch();
  alert('Pagamento excluído com sucesso!');
    } catch (error) {
      alert('Erro ao excluir pagamento');
    }
  };

  if (isLoading) return <div>Carregando pagamentos...</div>;

  return (
  <div>
      <h2>Pagamentos ({payments?.total})</h2>
    <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Vencimento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {payments?.data.map((payment) => (
            <tr key={payment.uid}>
              <td>{payment.description}</td>
              <td>R$ {payment.value}</td>
              <td>{payment.type}</td>
              <td>{payment.status}</td>
              <td>{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
              <td>
                <button onClick={() => handleChangeStatus(payment.uid, 'RECEIVED')}>Recebido</button>
                <button onClick={() => handleDelete(payment.uid)}>Excluir</button>
              </td>
            </tr>
          ))}
    </div>

// ============================================
// TIPOS DISPONÍVEIS
// ============================================

/**
 * StatusPayment (Status do Pagamento):
 * - PENDING: Pendente
 * - RECEIVED: Recebido
 * - CANCELED: Cancelado
 * - CONFIRMED: Confirmado
 * - OVERDUE: Vencido
 * - REFUNDED: Reembolsado
 * - REFUSED: Recusado
 * - RECEIVED_IN_CASH: Recebido em dinheiro
 * - REFUND_REQUESTED: Reembolso solicitado
 * - REFUND_IN_PROGRESS: Reembolso em andamento
 * - CHARGEBACK_REQUESTED: Chargeback solicitado
 * - CHARGEBACK_DISPUTE: Disputa de chargeback
 * - AWAITING_CHARGEBACK_REVERSAL: Aguardando reversão de chargeback
 * - DUNNING_REQUESTED: Cobrança solicitada
 * - DUNNING_RECEIVED: Cobrança recebida
 * - AWAITING_RISK_ANALYSIS: Aguardando análise de risco
 */

/**
 * BillingType (Tipo de Cobrança):
 * - BOLETO: Boleto bancário
 * - CREDIT_CARD: Cartão de crédito
 * - DEBIT_CARD: Cartão de débito
 * - TRANSFER: Transferência bancária
 * - DEPOSIT: Depósito
 * - PIX: PIX
 */

/**
 * TypeDiscount (Tipo de Desconto):
 * - PERCENTAGE: Percentual
 * - FIXED: Valor fixo
 */

/**
 * TypeSource (Origem do Pagamento):
 * - MANUAL: Manual
 * - AUTOMATIC: Automático
 * - ALLDO: Sistema Alldo
 * - EXTERNAL: Externo
 */

export {};
