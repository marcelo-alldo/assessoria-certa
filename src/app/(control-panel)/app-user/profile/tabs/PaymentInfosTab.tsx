import { useGetCreditCardsQuery, useDeleteCreditCardMutation, useSetDefaultCreditCardMutation, CreditCardType } from '@/store/api/creditCardApi';
import { Button, Card, CardContent, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CreditCardModal from './components/CreditCardModal';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

function PaymentInfosTab() {
  const { data: creditCardsResponse, refetch: refetchCreditCards, isFetching: isFetchingCreditCards } = useGetCreditCardsQuery();
  const [deleteCreditCard, { isLoading: isLoadingDelete }] = useDeleteCreditCardMutation();
  const [setDefaultCreditCard, { isLoading: isLoadingSetDefault }] = useSetDefaultCreditCardMutation();
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useAppDispatch();

  function handleOpenModal() {
    setOpenModal(true);
  }

  const [deletedCardUid, setDeletedCardUid] = useState<CreditCardType | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleOpenDeleteModal = (card: CreditCardType) => {
    setDeletedCardUid(card);
    setOpenDeleteModal(true);
  };

  function handleDeleteCard() {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      deleteCreditCard(deletedCardUid?.uid)
        .unwrap()
        .then((response) => {
          refetchCreditCards();
          setOpenDeleteModal(false);
          setDeletedCardUid(null);
          dispatch(
            showMessage({
              message: response?.msg,
              autoHideDuration: 3000,
              variant: 'success',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
        })
        .catch((error) => {
          dispatch(
            showMessage({
              message: error?.data?.msg,
              autoHideDuration: 3000,
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
        });
    }
  }

  function handleSetAsDefault(uid: string) {
    setDefaultCreditCard(uid)
      .unwrap()
      .then((response) => {
        refetchCreditCards();
        showMessage({
          message: response?.msg,
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
      })
      .catch((error) => {
        dispatch(
          showMessage({
            message: error?.data?.msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
  }

  return (
    <Box className="flex flex-col gap-4 max-w-xl">
      <Box className="flex flex-col gap-2">
        {Array.isArray(creditCardsResponse?.data) && creditCardsResponse.data.length > 0 ? (
          creditCardsResponse.data.map((card) => (
            <Card key={card.uid} variant="outlined" sx={{ p: 0, boxShadow: 1, borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px !important' }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      transform: 'scale(0.4)',
                      transformOrigin: 'center',
                      width: '120px',
                      height: '76px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Cards
                      number={`**** **** **** ${card?.creditCardNumber || ''}`}
                      name={card?.cardName || ''}
                      cvc=""
                      focused=""
                      issuer={card?.creditCardBrand}
                      preview={true}
                    />
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>Cartão final {card?.creditCardNumber || ''}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card?.creditCardBrand?.charAt(0).toUpperCase() + card?.creditCardBrand?.slice(1)}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  {card.isActive && (
                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{ px: 1, py: 0.5, bgcolor: 'success.100', borderRadius: 1, fontWeight: 500 }}
                    >
                      Principal
                    </Typography>
                  )}
                  {!card.isActive && (
                    <Tooltip title="Tornar principal">
                      <IconButton
                        size="small"
                        onClick={() => handleSetAsDefault(card.uid)}
                        disabled={isLoadingSetDefault || isFetchingCreditCards}
                        sx={{ color: 'primary.main' }}
                      >
                        <FuseSvgIcon size={18}>material-solid:star</FuseSvgIcon>
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Excluir cartão">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteModal(card)}
                      disabled={isLoadingDelete || isFetchingCreditCards}
                      sx={{ color: 'error.main' }}
                    >
                      <FuseSvgIcon size={18}>material-solid:delete</FuseSvgIcon>
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography color="text.secondary" variant="body2">
            Nenhum cartão cadastrado.
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        color="secondary"
        className="whitespace-nowrap"
        sx={{ mt: 2, alignSelf: 'flex-start' }}
        onClick={handleOpenModal}
        startIcon={<FuseSvgIcon size={20}>material-outline:add</FuseSvgIcon>}
      >
        Cadastrar novo cartão
      </Button>

      <DefaultConfirmModal
        onConfirm={handleDeleteCard}
        open={openDeleteModal}
        message={`Você realmente deseja excluir o cartão com final ${deletedCardUid?.creditCardNumber}, esta ação não poder ser desfeita!`}
        title="Excluir cartão"
        loading={isLoadingDelete}
        confirmDisabled={isLoadingDelete || isFetchingCreditCards}
        onCancel={() => {
          setOpenDeleteModal(false);
          setDeletedCardUid(null);
        }}
      />
      <CreditCardModal open={openModal} setOpen={setOpenModal} refetch={refetchCreditCards} />
    </Box>
  );
}

export default PaymentInfosTab;
