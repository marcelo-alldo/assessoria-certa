/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import {
  Avatar,
  IconButton,
  TextField,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Popover,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import { useAppDispatch } from '@/store/hooks';
import { useSendWhatsappAudioMutation, useSendMediaMutation, useSendTextMutation } from '@/store/api/whatsappApi';
import { useCreateClientMutation, useGetClientsQuery, useUpdateClientMutation } from '@/store/api/clientsApi';
import { useGetAttendantsQuery, useTransferAttendantMutation } from '@/store/api/attendantHistoryApi';
import { useAddTagToLeadMutation, useAddTagToClientMutation } from '@/store/api/tagsApi';
import { useGetLeadsQuery, useUpdateLeadMutation } from '@/store/api/leadsApi';
import { useCreateScheduledMessagesMutation } from '../../scheduled-messages/scheduledMessagesApi';
import { useGetPresignedUrlMutation } from '@/store/api/storageApi';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import TagsDropdown from '@/components/TagsDropdown';
import WhatsAppPreview from '@/components/WhatsAppPreview';
import Emojis from './Emojis';
import ChatMessageBubble from './ChatMessageBubble';
import TransferChatModal from './TransferChatModal';
import AudioRecorder from './AudioRecorder';
import ImagePreviewModal from './ImagePreviewModal';
import DocumentPreviewModal from './DocumentPreviewModal';
import MessageTemplateAutocomplete from '@/app/(control-panel)/app-user/scheduled-messages/components/MessageTemplateAutocomplete';
import { db } from '@/configs/firebase';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { addMessageToChat } from '../chatsSlice';
import useUser from '@auth/useUser';
import { useThemeMediaQuery } from '@fuse/hooks';
import { compressImage, WHATSAPP_IMAGE_OPTIONS } from '@/utils/imageCompression';
import extractLastNumberFromRemoteJid from '@/utils/extractLastNumberFromRemoteJid';
import { MessageTemplateType } from '@/app/(control-panel)/app-user/message-templates/messageTemplatesApi';

const S3_UPLOAD_THRESHOLD = 4 * 1024 * 1024; // 4MB - arquivos maiores que isso vão para S3

interface ChatScreenProps {
  config: any;
  setLoading: (loading: boolean) => void;
  chats?: any[];
}

function formatPhone(phone: string): string {
  const num = phone.startsWith('55') ? phone.slice(2) : phone;
  const ddd = num.slice(0, 2);
  const rest = num.slice(2);

  if (rest.length === 9) {
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }

  if (rest.length === 8) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  return phone;
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Hoje';

  if (isYesterday(date)) return 'Ontem';

  if (isThisWeek(date, { weekStartsOn: 0 })) {
    return format(date, 'EEEE', { locale: ptBR });
  }

  return format(date, 'dd/MM/yyyy');
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function ChatScreen({ config }: ChatScreenProps) {
  const { remoteJid } = useParams();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { data: userLogged } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chat, setChat] = useState<any | null>(null);
  const [lastAttendant, setLastAttendant] = useState<any | null>(null);
  const [conversationData, setConversationData] = useState<any | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tagsAnchorEl, setTagsAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorAttach, setAnchorAttach] = useState<null | HTMLElement>(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openUnregisteredContact, setOpenUnregisteredContact] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [openTemplateModal, setOpenTemplateModal] = useState(false);
  const [contactType, setContactType] = useState<'lead' | 'client' | 'attend'>('lead');
  const [contactName, setContactName] = useState('');
  const [notesValue, setNotesValue] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateType | null>(null);
  const [isLoadingSendMedia, setIsLoadingSendMedia] = useState(false);

  const {
    data: attendants,
    isLoading: isLoadingAttendants,
    refetch: refetchAttendants,
  } = useGetAttendantsQuery(`remoteJid=${remoteJid}`, {
    skip: !remoteJid,
    refetchOnMountOrArgChange: true,
  });

  const phoneRaw = remoteJid?.split('@')[0]?.split('-')?.pop() || '';
  const phoneDigits = phoneRaw.startsWith('55') ? phoneRaw.slice(2) : phoneRaw;

  const { data: clientSearch, refetch: refetchClient } = useGetClientsQuery(`page=1&pageSize=1&search=${phoneDigits}`, {
    skip: !phoneDigits,
  });

  const { data: leadSearch, refetch: refetchLead } = useGetLeadsQuery(`page=1&pageSize=1&search=${phoneDigits}`, {
    skip: !phoneDigits,
  });

  const [sendText, { isLoading: isLoadingSendText }] = useSendTextMutation();
  const [sendAudio, { isLoading: isLoadingSendAudio }] = useSendWhatsappAudioMutation();
  const [sendMedia] = useSendMediaMutation();
  const [createClient, { isLoading: isLoadingCreateClient }] = useCreateClientMutation();
  const [transferAttendant, { isLoading: isLoadingTransferAttendant }] = useTransferAttendantMutation();
  const [addTagToLead, { isLoading: isLoadingAddTagToLead }] = useAddTagToLeadMutation();
  const [addTagToClient, { isLoading: isLoadingAddTagToClient }] = useAddTagToClientMutation();
  const [updateLead] = useUpdateLeadMutation();
  const [updateClient] = useUpdateClientMutation();
  const [createScheduledMessage, { isLoading: isLoadingScheduledMessage }] = useCreateScheduledMessagesMutation();

  const [getPresignedUrl] = useGetPresignedUrlMutation();
  const uploadToS3 = async (file: File, uploadUrl: string): Promise<void> => {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao fazer upload para S3:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Erro ao fazer upload para S3: ${response.status} - ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('❌ Exceção durante upload S3:', {
        message: error.message,
        name: error.name,
        error,
      });
      throw error;
    }
  };

  const currentContactTags = useMemo(() => {
    const targetType = conversationData?.type === 'client' ? 'client' : 'lead';

    if (targetType === 'client') {
      return clientSearch?.data?.[0]?.clientTags || [];
    } else if (targetType === 'lead') {
      return leadSearch?.data?.[0]?.leadTags || [];
    }

    return [];
  }, [conversationData?.type, clientSearch, leadSearch]);

  let lastDate: string | null = null;

  useEffect(() => {
    if (conversationData?.name) {
      setContactName(`${conversationData.name}`);
    }
  }, [conversationData]);

  useEffect(() => {
    setChatMessages([]);
    setChat(null);
    setConversationData(null);
  }, [remoteJid]);

  useEffect(() => {
    if (!remoteJid || !config?.data?.value) {
      return;
    }

    //remoteJid busca por dois formatos Ex: [ '555193749665-555184406522', '555193749665-5551984406522' ]
    const getRemoteJidVariants = (jid: string): string[] => {
      const parts = jid.split('-');

      if (parts.length !== 2) return [jid];

      const [prefix, suffix] = parts;
      const variants: string[] = [jid];

      if (suffix.startsWith('55') && suffix.length === 12) {
        // Adiciona o '9' após o DDI (55) + DDD (2 dígitos) → formato longo
        variants.push(`${prefix}-${suffix.slice(0, 4)}9${suffix.slice(4)}`);
      } else if (suffix.startsWith('55') && suffix.length === 13) {
        // Remove o '9' na posição 4 → formato curto
        variants.push(`${prefix}-${suffix.slice(0, 4)}${suffix.slice(5)}`);
      }

      return variants;
    };

    const jidVariants = getRemoteJidVariants(remoteJid);
    const messagesBySub: Record<string, any[]> = {};

    const unsubChats = jidVariants.map((jid) => {
      const collectionPath = `chats/${config.data.value}/conversations/${jid}/messages`;
      return onSnapshot(query(collection(db, collectionPath), orderBy('timestamp', 'desc'), limit(100)), (snapshot) => {
        messagesBySub[jid] = snapshot.docs.map((d) => (d.id ? { ...d.data(), id: d.id } : d.data()));
        const merged = Object.values(messagesBySub).flat();
        const seen = new Set<string>();
        const deduped = merged.filter((msg) => {
          if (msg.id && seen.has(msg.id)) return false;

          if (msg.id) seen.add(msg.id);

          return true;
        });
        setChatMessages(deduped.sort((a, b) => a.timestamp - b.timestamp));
      });
    });

    const unsubConversations = jidVariants.map((jid) => {
      const conversationPath = `chats/${config.data.value}/conversations/${jid}`;
      return onSnapshot(doc(db, conversationPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
          setConversationData(docSnapshot.data());
        }
      });
    });

    return () => {
      unsubChats.forEach((unsub) => unsub());
      unsubConversations.forEach((unsub) => unsub());
    };
  }, [remoteJid, config?.data?.value]);

  useEffect(() => {
    let merged: any[] = [...chatMessages];

    if (attendants?.data?.length) {
      merged = [...chatMessages, ...attendants.data].sort((a, b) => a.timestamp - b.timestamp);
      setLastAttendant(attendants.data[attendants.data.length - 1]);
    } else {
      setLastAttendant(null);
    }

    setChat(merged);
  }, [chatMessages, attendants]);

  useEffect(() => {
    async function updateUnRead() {
      await updateDoc(doc(db, `chats/${config?.data?.value}/conversations`, remoteJid), {
        unReadMessages: 0,
      });
    }

    if (remoteJid) {
      updateUnRead();
    }
  }, [chat, remoteJid]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chat]);

  useEffect(() => {
    if (
      !isLoadingAttendants &&
      !isLoadingCreateClient &&
      !isLoadingTransferAttendant &&
      !isLoadingSendText &&
      !isLoadingSendAudio &&
      !isLoadingSendMedia
    ) {
      setLoadingChat(false);
    } else {
      setLoadingChat(true);
    }
  }, [
    isLoadingAttendants,
    isLoadingCreateClient,
    isLoadingTransferAttendant,
    isLoadingSendText,
    isLoadingSendAudio,
    isLoadingSendMedia,
    isLoadingAddTagToLead,
    isLoadingAddTagToClient,
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTagsClose = () => setTagsAnchorEl(null);

  const handleAttachClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorAttach(event.currentTarget);
  };

  const handleAttachClose = () => {
    setAnchorAttach(null);
  };

  const handleImageClick = () => {
    handleAttachClose();
    imageInputRef.current?.click();
  };

  const handleDocClick = () => {
    handleAttachClose();
    docInputRef.current?.click();
  };
  const canSendMessage = useCallback(() => {
    if (!chatMessages || chatMessages.length === 0) {
      return {
        canSend: false,
        reason: 'Ainda não há mensagens neste chat. Aguarde uma mensagem do contato para iniciar a conversa.',
      };
    }

    const contactMessages = chatMessages.filter((msg) => msg.from !== config?.data?.value && msg.type !== 'attendantHistory' && msg.timestamp);

    if (contactMessages.length === 0) {
      return {
        canSend: false,
        reason: 'Ainda não há mensagens neste chat. Aguarde uma mensagem do contato para iniciar a conversa.',
      };
    }

    const lastContactMessage = contactMessages[contactMessages.length - 1];
    const lastMessageTime = new Date(Number(lastContactMessage.timestamp) * 1000);
    const now = new Date();
    const timeDifference = now.getTime() - lastMessageTime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      return {
        canSend: false,
        reason: 'Só é possível conversar com o contato dentro de 24h da última mensagem dele.',
      };
    }

    if (lastAttendant?.userUid === userLogged?.uid && lastAttendant?.status === 'IN_PROGRESS') {
      return { canSend: true };
    }

    return {
      canSend: false,
      reason: 'Você precisa atender este chat para enviar mensagens.',
    };
  }, [chatMessages, config, lastAttendant, userLogged]);

  const handleSendText = () => {
    if (isLoadingSendText) return;

    const { canSend, reason } = canSendMessage();

    if (!canSend) {
      dispatch(
        showMessage({
          message: reason,
          autoHideDuration: 4000,
          variant: 'warning',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
      return;
    }

    if (inputValue && inputValue.trim()) {
      sendText({
        phone: remoteJid.split('-')[1],
        text: inputValue,
      }).then(() => {
        setInputValue('');

        if (messagesEndRef.current) {
          messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
      });
    }
  };

  const handleAudioSend = async (audioBlob: Blob) => {
    if (isLoadingSendAudio) return;

    const { canSend, reason } = canSendMessage();

    if (!canSend) {
      dispatch(
        showMessage({
          message: reason,
          autoHideDuration: 4000,
          variant: 'warning',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
      return;
    }

    if (audioBlob) {
      const audioBase64 = await blobToBase64(audioBlob);
      const number = remoteJid.split('@')[0].split('-').pop();

      sendAudio({
        number: number,
        audio: audioBase64,
      })
        .then((response) => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
          }

          dispatch(addMessageToChat({ chatId: response?.data?.data?.key?.remoteJid, message: response?.data?.data }));
        })
        .catch((error) => {
          console.error('❌ Erro ao enviar áudio:', {
            error: error,
            number: number,
            remoteJid: chat?.remoteJid,
          });
        });
    }
  };

  const onEmojiSelect = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    setShowEmojis(false);

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isImage = file.type.startsWith('image/');

    if (isImage) {
      setSelectedImageFile(file);
      setShowImagePreview(true);
    } else {
      setSelectedDocumentFile(file);
      setShowDocumentPreview(true);
    }

    event.target.value = '';
  };

  const handleDirectFileUpload = async (file: File, caption?: string) => {
    const mediaType = 'document';
    const phoneNumber = remoteJid.split('@')[0].split('-').pop();

    try {
      // Se o arquivo for maior que 4MB, fazer upload via S3
      if (file.size >= S3_UPLOAD_THRESHOLD) {
        // Obter URL presigned do backend
        const response = await getPresignedUrl({ fileName: file.name, fileType: file.type, fileSize: file.size }).unwrap();

        const { uploadUrl, s3Key } = response.data;

        // Fazer upload para S3
        await uploadToS3(file, uploadUrl);

        // Enviar mensagem com s3Key
        await sendMedia({
          number: formatPhone(phoneNumber),
          mediaType,
          mimeType: file.type,
          caption: caption || '',
          s3Key,
          fileName: file.name,
        })
          .unwrap()
          .then((response) => {
            dispatch(addMessageToChat({ chatId: remoteJid, message: response?.data }));
          });
      } else {
        // Arquivo menor que 4MB, converter para base64
        const toBase64 = (file: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

        const base64 = await toBase64(file);

        await sendMedia({
          number: formatPhone(phoneNumber),
          mediaType,
          mimeType: file.type,
          caption: caption || '',
          media: base64,
          fileName: file.name,
        })
          .unwrap()
          .then((response) => {
            dispatch(addMessageToChat({ chatId: remoteJid, message: response?.data }));
          });
      }
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      throw error;
    }
  };

  const handleImageSend = async (caption: string) => {
    if (!selectedImageFile) return;

    setIsLoadingSendMedia(true);

    try {
      const compressedFile = await compressImage(selectedImageFile, WHATSAPP_IMAGE_OPTIONS);
      const phoneNumber = remoteJid.split('@')[0].split('-').pop();

      // Se o arquivo comprimido for maior que 4MB, fazer upload via S3
      if (compressedFile.size >= S3_UPLOAD_THRESHOLD) {
        // Obter URL presigned do backend
        const response = await getPresignedUrl({
          fileName: compressedFile.name,
          fileType: compressedFile.type,
          fileSize: compressedFile.size,
        }).unwrap();

        const { uploadUrl, s3Key } = response.data;

        // Fazer upload para S3
        await uploadToS3(compressedFile, uploadUrl);

        // Enviar mensagem com s3Key
        await sendMedia({
          number: formatPhone(phoneNumber),
          mediaType: 'image',
          mimeType: compressedFile.type,
          caption: caption,
          s3Key,
          fileName: compressedFile.name,
        })
          .unwrap()
          .then((response) => {
            dispatch(addMessageToChat({ chatId: remoteJid, message: response?.data }));
            setShowImagePreview(false);
            setSelectedImageFile(null);
          });
      } else {
        // Arquivo menor que 4MB, converter para base64
        const toBase64 = (file: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

        const base64 = await toBase64(compressedFile);

        await sendMedia({
          number: formatPhone(phoneNumber),
          mediaType: 'image',
          mimeType: compressedFile.type,
          caption: caption,
          media: base64,
          fileName: compressedFile.name,
        })
          .unwrap()
          .then((response) => {
            dispatch(addMessageToChat({ chatId: remoteJid, message: response?.data }));
            setShowImagePreview(false);
            setSelectedImageFile(null);
          });
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      dispatch(
        showMessage({
          message: 'Erro ao enviar imagem. Tente novamente.',
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    } finally {
      setIsLoadingSendMedia(false);
    }
  };

  const handleDocumentSend = async (file: File, caption?: string) => {
    setIsLoadingSendMedia(true);
    try {
      await handleDirectFileUpload(file, caption);
      setShowDocumentPreview(false);
      setSelectedDocumentFile(null);
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      dispatch(
        showMessage({
          message: 'Erro ao enviar documento. Tente novamente.',
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    } finally {
      setIsLoadingSendMedia(false);
    }
  };

  const handleTransferAttendant = (query: string) => {
    const contactNumber = extractLastNumberFromRemoteJid(remoteJid);

    transferAttendant({ remoteJid, phone: contactNumber, query })
      .unwrap()
      .then((response) => {
        refetchAttendants();
        setShowTransferModal(false);
        dispatch(
          showMessage({
            message: response.msg,
            variant: 'success',
          }),
        );
      })
      .catch((error) => {
        refetchAttendants();
        dispatch(
          showMessage({
            message: error.data.msg,
            variant: 'error',
          }),
        );
      });
  };

  const handleAttendChat = async () => {
    try {
      handleTransferAttendant('');
    } catch (error) {
      console.error('Erro ao assumir lead:', error);
      dispatch(
        showMessage({
          message: 'Erro ao iniciar atendimento. Tente novamente.',
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    }
  };

  const handleTransferToCollaborator = (userUid: string) => {
    handleTransferAttendant(`userUid=${userUid}`);
  };

  const handleFinalizeChat = () => {
    handleTransferAttendant('status=FINALIZED');
    setShowFinalizeModal(false);
  };

  const handleCreateClient = (attendant?: boolean) => {
    const phoneNumber = remoteJid.split('@')[0].split('-').pop();
    createClient({
      name: contactName,
      phone: formatPhone(phoneNumber || ''),
      deleteLead: true,
    })
      .unwrap()
      .then(async () => {
        setOpenConfirmModal(false);
        setOpenUnregisteredContact(false);
        dispatch(
          showMessage({
            message: 'Contato transformado em apoiador com sucesso!',
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );

        await updateDoc(doc(db, `chats/${config?.data?.value}/conversations`, remoteJid), {
          type: 'client',
        });

        handleTransferAttendant('status=CONVERTED');
      })
      .catch((error) => {
        dispatch(
          showMessage({
            message: error?.data?.msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      });

    if (attendant) {
      handleTransferAttendant('');
    }
  };

  const handleTagSelect = async (tag: any) => {
    try {
      let targetType: 'client' | 'lead' = conversationData?.type === 'client' ? 'client' : 'lead';

      if (!conversationData?.type && clientSearch?.data?.length) {
        targetType = 'client';
      }

      if (targetType === 'client') {
        const clientUid = clientSearch?.data?.[0]?.uid;

        if (!clientUid) throw new Error('Apoiador não encontrado para este contato.');

        await addTagToClient({ clientUid, tagUid: tag.uid }).unwrap();
        // Refetch para atualizar lista de tags do cliente
        refetchClient?.();
      } else {
        const leadUid = leadSearch?.data?.[0]?.uid;

        if (!leadUid) throw new Error('Lead não encontrado para este contato.');

        await addTagToLead({ leadUid, tagUid: tag.uid }).unwrap();
        // Refetch para atualizar lista de tags do lead
        refetchLead?.();
      }

      dispatch(
        showMessage({
          message: `Tag "${tag.name}" adicionada com sucesso!`,
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
      handleTagsClose();
    } catch (error: any) {
      dispatch(
        showMessage({
          message: error?.data?.msg || 'Erro ao adicionar tag',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    }
  };

  const handleOpenNotesModal = () => {
    try {
      let targetType: 'client' | 'lead' = conversationData?.type === 'client' ? 'client' : 'lead';

      if (!conversationData?.type && clientSearch?.data?.length) {
        targetType = 'client';
      }

      if (targetType === 'client') {
        const clientItem = clientSearch?.data?.[0];
        const currentNotes = clientItem?.clientProfile?.notes || '';
        setNotesValue(currentNotes || '');
      } else {
        const leadItem = leadSearch?.data?.[0];
        const currentNotes = leadItem?.notes || '';
        setNotesValue(currentNotes || '');
      }

      setShowNotesModal(true);
    } catch (e) {
      setNotesValue('');
      setShowNotesModal(true);
    }
  };

  const handleSaveNotes = async () => {
    if (isSavingNotes) return;

    setIsSavingNotes(true);
    try {
      let targetType: 'client' | 'lead' = conversationData?.type === 'client' ? 'client' : 'lead';

      if (!conversationData?.type && clientSearch?.data?.length) {
        targetType = 'client';
      }

      if (targetType === 'client') {
        const clientUid = clientSearch?.data?.[0]?.uid;

        if (!clientUid) throw new Error('Apoiador não encontrado para este contato.');

        await updateClient({ uid: clientUid, profileUpdate: true, notes: notesValue }).unwrap();
      } else {
        const leadUid = leadSearch?.data?.[0]?.uid;

        if (!leadUid) throw new Error('Lead não encontrado para este contato.');

        await updateLead({ uid: leadUid, notes: notesValue }).unwrap();
      }

      dispatch(
        showMessage({
          message: 'Observação atualizada com sucesso!',
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
      setShowNotesModal(false);
    } catch (error: any) {
      dispatch(
        showMessage({
          message: error?.data?.msg || error?.message || 'Erro ao salvar observação.',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    } finally {
      setIsSavingNotes(false);
    }
  };

  const renderInputArea = useMemo(() => {
    const { canSend, reason } = canSendMessage();
    const needsToAttend = !lastAttendant?.userUid || lastAttendant?.userUid !== userLogged?.uid || lastAttendant?.status !== 'IN_PROGRESS';

    const inputAreaStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 24px',
      borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#23272a' : '#e0e0e0'}`,
      background: theme.palette.mode === 'dark' ? '#181a1b' : '#f1f1f1',
      zIndex: 2,
    };

    // CENÁRIO 1: Precisa atender
    if (needsToAttend && chatMessages.length > 0) {
      const contactMessages = chatMessages.filter((msg) => msg.from !== config?.data?.value && msg.type !== 'attendantHistory' && msg.timestamp);

      if (contactMessages.length > 0) {
        const lastContactMessage = contactMessages[contactMessages.length - 1];
        const lastMessageTime = new Date(Number(lastContactMessage.timestamp) * 1000);
        const now = new Date();
        const timeDifference = now.getTime() - lastMessageTime.getTime();
        const hoursDifference = timeDifference / (1000 * 60 * 60);

        if (hoursDifference <= 24) {
          return (
            <div style={{ ...inputAreaStyle, flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888', fontSize: 15 }}>
                Este chat não está sendo atendido por você. Clique no botão abaixo para assumir o atendimento.
              </span>
              <Button
                variant="contained"
                color={theme.palette.mode === 'dark' ? 'success' : 'primary'}
                onClick={handleAttendChat}
                disabled={isLoadingTransferAttendant}
                sx={{ borderRadius: 2, fontWeight: 600, fontSize: 15, padding: '8px 18px' }}
              >
                Atender
              </Button>
            </div>
          );
        }
      }
    }

    // CENÁRIO 2: Bloqueado
    if (reason) {
      return (
        <div style={{ ...inputAreaStyle, flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888', fontSize: 15 }}>{reason}</span>
        </div>
      );
    }

    // CENÁRIO 3: Input completo
    return (
      <div style={{ ...inputAreaStyle, position: 'relative' }}>
        <IconButton onClick={() => setShowEmojis(true)} size="large" disabled={!canSend}>
          <FuseSvgIcon size={24}>material-outline:sentiment_satisfied_alt</FuseSvgIcon>
        </IconButton>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <IconButton size="large" onClick={handleAttachClick} disabled={!canSend}>
            <FuseSvgIcon size={24}>material-outline:add</FuseSvgIcon>
          </IconButton>

          <Popover
            open={Boolean(anchorAttach)}
            anchorEl={anchorAttach}
            onClose={handleAttachClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: 3,
                p: 1,
                minWidth: 160,
                background: theme.palette.mode === 'dark' ? '#23272a' : '#fff',
              },
            }}
          >
            <Button
              fullWidth
              variant="text"
              startIcon={<FuseSvgIcon size={24}>material-outline:image</FuseSvgIcon>}
              onClick={handleImageClick}
              sx={{ justifyContent: 'flex-start', color: theme.palette.mode === 'dark' ? '#fff' : '#222' }}
            >
              Imagem
            </Button>
            <Button
              fullWidth
              variant="text"
              startIcon={<FuseSvgIcon size={24}>material-outline:description</FuseSvgIcon>}
              onClick={handleDocClick}
              sx={{ justifyContent: 'flex-start', color: theme.palette.mode === 'dark' ? '#fff' : '#222' }}
            >
              Documento
            </Button>
          </Popover>

          <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <TextField
          variant="outlined"
          placeholder={canSend ? 'Digite uma mensagem' : 'Não é possível enviar mensagens'}
          fullWidth
          size="medium"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={!canSend}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isLoadingSendText && canSend) {
              e.preventDefault();
              handleSendText();
            }
          }}
          sx={{ borderRadius: 4 }}
        />

        {inputValue && inputValue.trim() ? (
          <IconButton
            onClick={(e) => {
              if (!isLoadingSendText) {
                e.preventDefault();
                handleSendText();
              }
            }}
            disabled={isLoadingSendText}
          >
            {isLoadingSendText ? <CircularProgress size={24} /> : <FuseSvgIcon size={24}>material-outline:send</FuseSvgIcon>}
          </IconButton>
        ) : (
          <div style={{ position: 'relative' }}>
            <AudioRecorder onSendAudio={handleAudioSend} isLoading={isLoadingSendAudio} />
          </div>
        )}

        <Emojis open={showEmojis} setOpen={setShowEmojis} onSelect={onEmojiSelect} />
      </div>
    );
  }, [
    chatMessages,
    config?.data?.value,
    lastAttendant,
    userLogged?.uid,
    theme.palette.mode,
    anchorAttach,
    inputValue,
    isLoadingSendText,
    isLoadingSendAudio,
    isLoadingTransferAttendant,
    showEmojis,
    handleAttachClick,
    handleAttachClose,
    handleImageClick,
    handleDocClick,
    handleSendText,
    handleAudioSend,
    onEmojiSelect,
  ]);

  // const renderInputArea = () => {
  //   const { canSend, reason } = canSendMessage({ isTemplate: true });
  //   const needsToAttend = !lastAttendant?.userUid || lastAttendant?.userUid !== userLogged?.uid || lastAttendant?.status !== 'IN_PROGRESS';

  //   const inputAreaStyle = {
  //     display: 'flex',
  //     alignItems: 'center',
  //     gap: 8,
  //     padding: '12px 24px',
  //     borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#23272a' : '#e0e0e0'}`,
  //     background: theme.palette.mode === 'dark' ? '#181a1b' : '#f1f1f1',
  //     zIndex: 2,
  //   };

  //   // CENÁRIO 1: Precisa atender
  //   if (needsToAttend && chatMessages.length > 0) {
  //     const contactMessages = chatMessages.filter((msg) => msg.from !== config?.data?.value && msg.type !== 'attendantHistory' && msg.timestamp);

  //     if (contactMessages.length > 0) {
  //       const lastContactMessage = contactMessages[contactMessages.length - 1];
  //       const lastMessageTime = new Date(Number(lastContactMessage.timestamp) * 1000);
  //       const now = new Date();
  //       const timeDifference = now.getTime() - lastMessageTime.getTime();
  //       const hoursDifference = timeDifference / (1000 * 60 * 60);

  //       if (hoursDifference <= 24) {
  //         return (
  //           <div style={{ ...inputAreaStyle, flexDirection: 'column', justifyContent: 'center' }}>
  //             <span style={{ color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888', fontSize: 15 }}>
  //               Este chat não está sendo atendido por você. Clique no botão abaixo para assumir o atendimento.
  //             </span>
  //             <Button
  //               variant="contained"
  //               color={theme.palette.mode === 'dark' ? 'success' : 'primary'}
  //               onClick={handleAttendChat}
  //               disabled={isLoadingTransferAttendant}
  //               sx={{ borderRadius: 2, fontWeight: 600, fontSize: 15, padding: '8px 18px' }}
  //             >
  //               Atender
  //             </Button>
  //           </div>
  //         );
  //       }
  //     }
  //   }

  //   // CENÁRIO 2: Bloqueado
  //   if (reason) {
  //     return (
  //       <div style={{ ...inputAreaStyle, flexDirection: 'column', justifyContent: 'center' }}>
  //         <span style={{ color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888', fontSize: 15 }}>{reason}</span>
  //       </div>
  //     );
  //   }

  //   // CENÁRIO 3: Input completo
  //   return (
  //     <div style={{ ...inputAreaStyle, position: 'relative' }}>
  //       <IconButton onClick={() => setShowEmojis(true)} size="large" disabled={!canSend}>
  //         <FuseSvgIcon size={24}>material-outline:sentiment_satisfied_alt</FuseSvgIcon>
  //       </IconButton>

  //       <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
  //         <IconButton size="large" onClick={handleAttachClick} disabled={!canSend}>
  //           <FuseSvgIcon size={24}>material-outline:add</FuseSvgIcon>
  //         </IconButton>

  //         <Popover
  //           open={Boolean(anchorAttach)}
  //           anchorEl={anchorAttach}
  //           onClose={handleAttachClose}
  //           anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
  //           transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  //           PaperProps={{
  //             sx: {
  //               borderRadius: 2,
  //               boxShadow: 3,
  //               p: 1,
  //               minWidth: 160,
  //               background: theme.palette.mode === 'dark' ? '#23272a' : '#fff',
  //             },
  //           }}
  //         >
  //           <Button
  //             fullWidth
  //             variant="text"
  //             startIcon={<FuseSvgIcon size={24}>material-outline:image</FuseSvgIcon>}
  //             onClick={handleImageClick}
  //             sx={{ justifyContent: 'flex-start', color: theme.palette.mode === 'dark' ? '#fff' : '#222' }}
  //           >
  //             Imagem
  //           </Button>
  //           <Button
  //             fullWidth
  //             variant="text"
  //             startIcon={<FuseSvgIcon size={24}>material-outline:description</FuseSvgIcon>}
  //             onClick={handleDocClick}
  //             sx={{ justifyContent: 'flex-start', color: theme.palette.mode === 'dark' ? '#fff' : '#222' }}
  //           >
  //             Documento
  //           </Button>
  //         </Popover>

  //         <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
  //         <input
  //           ref={docInputRef}
  //           type="file"
  //           accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
  //           style={{ display: 'none' }}
  //           onChange={handleFileChange}
  //         />
  //       </div>

  //       <TextField
  //         variant="outlined"
  //         placeholder={canSend ? 'Digite uma mensagem' : 'Não é possível enviar mensagens'}
  //         fullWidth
  //         size="medium"
  //         value={inputValue}
  //         onChange={(e) => setInputValue(e.target.value)}
  //         disabled={!canSend}
  //         onKeyDown={(e) => {
  //           if (e.key === 'Enter' && !e.shiftKey && !isLoadingSendText && canSend) {
  //             e.preventDefault();
  //             handleSendText();
  //           }
  //         }}
  //         sx={{ borderRadius: 4 }}
  //       />

  //       {inputValue && inputValue.trim() ? (
  //         <IconButton
  //           onClick={(e) => {
  //             if (!isLoadingSendText) {
  //               e.preventDefault();
  //               handleSendText();
  //             }
  //           }}
  //           disabled={isLoadingSendText}
  //         >
  //           {isLoadingSendText ? <CircularProgress size={24} /> : <FuseSvgIcon size={24}>material-outline:send</FuseSvgIcon>}
  //         </IconButton>
  //       ) : (
  //         <div style={{ position: 'relative' }}>
  //           <AudioRecorder onSendAudio={handleAudioSend} isLoading={isLoadingSendAudio} />
  //         </div>
  //       )}

  //       <Emojis open={showEmojis} setOpen={setShowEmojis} onSelect={onEmojiSelect} />
  //     </div>
  //   );
  // };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark' ? '#161717' : '#ece5dd',
        padding: 0,
        overflowY: 'auto',
        backgroundImage: `linear-gradient(${theme.palette.mode === 'dark' ? '#242525cc' : '#efe7decc'}, ${theme.palette.mode === 'dark' ? '#242525cc' : '#efe7decc'}), url('/assets/images/banner/${theme.palette.mode === 'dark' ? 'whatsapp-cover-dark.svg' : 'whatsapp-cover-light.svg'}')`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
      }}
    >
      {isLoadingAttendants ? (
        <div className="flex flex-col flex-auto h-full justify-center items-center">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 20px',
              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
              background: theme.palette.mode === 'dark' ? '#1a1c1e' : '#fff',
              zIndex: 2,
              minHeight: 64,
            }}
          >
            {isMobile && (
              <IconButton onClick={() => navigate(-1)} size="small">
                <FuseSvgIcon size={22} color="primary">
                  heroicons-outline:arrow-long-left
                </FuseSvgIcon>
              </IconButton>
            )}
            {(() => {
              const avatarColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
              const contactName = clientSearch?.data?.length
                ? clientSearch.data[0]?.clientProfile?.name
                : leadSearch?.data?.length
                  ? leadSearch.data[0]?.name
                  : conversationData?.name || '';
              const letter = String(contactName)?.[0]?.toUpperCase() || '?';
              const color = avatarColors[letter?.charCodeAt(0) % avatarColors?.length] || '#6366f1';
              return (
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    fontSize: 17,
                    fontWeight: 700,
                    bgcolor: color,
                    color: '#fff',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}
                >
                  {letter}
                </Avatar>
              );
            })()}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{ fontWeight: 700, fontSize: { xs: 12, sm: 15 }, color: theme.palette.mode === 'dark' ? '#f1f3f5' : '#111827', lineHeight: 1.3 }}
              >
                {clientSearch?.data?.length
                  ? clientSearch.data[0]?.clientProfile?.name
                  : leadSearch?.data?.length
                    ? leadSearch.data[0]?.name
                    : conversationData?.name || formatPhone(remoteJid?.split('@')[0]?.split('-')[1] || '')}
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <div style={{ fontSize: 12, color: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af', marginTop: 1 }}>
                  {formatPhone(remoteJid?.split('@')[0]?.split('-')[1] || '')}
                </div>
              </Box>
              {currentContactTags.length > 0 && (
                <Box display={'flex'} gap={1} flexWrap={'wrap'} sx={{ marginTop: '2px' }}>
                  {currentContactTags.map((tag: any) => (
                    <span
                      key={tag.tag.uid}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: tag.tag.color ? `${tag.tag.color}` : 'rgba(156,163,175,0.2)',
                        color: theme.palette.mode === 'dark' ? 'black' : 'white',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {tag.tag.name}
                    </span>
                  ))}
                </Box>
              )}
            </div>
            <Box display={'flex'} alignItems={'center'} justifyItems={'center'}>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Tooltip title="Transferir">
                  <IconButton
                    size="large"
                    disabled={isLoadingTransferAttendant || lastAttendant?.userUid !== userLogged?.uid || lastAttendant?.status === 'FINALIZED'}
                    onClick={() => setShowTransferModal(true)}
                  >
                    <FuseSvgIcon size={24}>material-outline:multiple_stop</FuseSvgIcon>
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Tooltip title="Finalizar">
                  <IconButton
                    size="large"
                    disabled={
                      isLoadingTransferAttendant ||
                      !lastAttendant?.userUid ||
                      lastAttendant?.userUid !== userLogged?.uid ||
                      lastAttendant?.status === 'FINALIZED'
                    }
                    onClick={() => setShowFinalizeModal(true)}
                  >
                    <FuseSvgIcon size={24}>material-outline:check_circle</FuseSvgIcon>
                  </IconButton>
                </Tooltip>
              </Box>
              <Tooltip title="Mais detalhes">
                <IconButton size="large" onClick={handleMenuOpen}>
                  <FuseSvgIcon size={24}>material-outline:more_vert</FuseSvgIcon>
                </IconButton>
              </Tooltip>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem
                  disabled={chat?.isClient}
                  onClick={() => {
                    handleMenuClose();
                    setShowTransferModal(true);
                  }}
                  sx={{ display: { xs: 'block', sm: 'none' } }}
                >
                  Transferir Atendimento
                </MenuItem>
                <MenuItem
                  disabled={chat?.isClient}
                  onClick={() => {
                    handleMenuClose();
                    setShowFinalizeModal(true);
                  }}
                  sx={{ display: { xs: 'block', sm: 'none' } }}
                >
                  Finalizar Atendimento
                </MenuItem>
                <MenuItem
                  disabled={chat?.isClient}
                  onClick={() => {
                    handleMenuClose();
                    setContactType('client');
                    setOpenConfirmModal(true);
                  }}
                >
                  Transformar em Apoiador
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setTagsAnchorEl(anchorEl as HTMLElement);
                    handleMenuClose();
                  }}
                >
                  Adicionar Tag
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleOpenNotesModal();
                  }}
                >
                  Observações
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setOpenTemplateModal(true);
                  }}
                >
                  Enviar mensagem modelo
                </MenuItem>
              </Menu>
            </Box>
          </div>

          <TagsDropdown
            anchorEl={tagsAnchorEl}
            open={Boolean(tagsAnchorEl)}
            onClose={handleTagsClose}
            onTagSelect={handleTagSelect}
            cardTags={currentContactTags.map((item: any) => item?.tag).filter(Boolean)}
          />

          {loadingChat && <LinearProgress color="secondary" />}

          <div
            ref={messagesEndRef}
            style={{
              flex: 1,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              overflowY: 'auto',
            }}
          >
            {chat?.length > 0 ? (
              chat.map((msg) => {
                const msgDate = new Date(msg?.timestamp * 1000);
                const msgDateStr = format(msgDate, 'yyyy-MM-dd');
                let showDate = false;

                if (lastDate !== msgDateStr) {
                  showDate = true;
                  lastDate = msgDateStr;
                }

                return (
                  <React.Fragment key={msg?.id}>
                    {showDate && (
                      <div
                        key={`date-${msgDateStr}`}
                        style={{
                          alignSelf: 'center',
                          background: theme.palette.mode === 'dark' ? '#1D1F1F' : '#fff',
                          color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888',
                          borderRadius: 8,
                          padding: '4px 16px',
                          fontSize: 13,
                          margin: '8px 0',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        {getDateLabel(msgDate)}
                      </div>
                    )}
                    <ChatMessageBubble me={config?.data?.value} message={msg} />
                  </React.Fragment>
                );
              })
            ) : (
              <div style={{ color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888', textAlign: 'center', marginTop: 32 }}>
                Nenhuma mensagem encontrada.
              </div>
            )}
          </div>

          {renderInputArea}
        </>
      )}
      <Dialog open={showNotesModal} onClose={() => setShowNotesModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Observações</DialogTitle>
        <DialogContent>
          <TextField
            label="Escreva a observação"
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotesModal(false)} disabled={isSavingNotes}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveNotes} disabled={isSavingNotes || !notesValue.trim()}>
            {isSavingNotes ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      <DefaultConfirmModal
        onConfirm={() => {
          if (contactType === 'client') {
            handleCreateClient();
          }
        }}
        open={openConfirmModal}
        confirmDisabled={contactName?.trim() === ''}
        confirmText="Confirmar"
        message={
          <>
            <TextField
              label="Nome do contato"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              fullWidth
              sx={{ marginY: 2 }}
              autoFocus
            />
            Você tem certeza que deseja transformar este contato em Apoiador?
          </>
        }
        loading={isLoadingCreateClient}
        title={`Transformar contato em Apoiador`}
        onCancel={() => {
          setOpenConfirmModal(false);
          setContactName(chat?.pushName || '');
          setContactType('lead');
        }}
      />

      <DefaultConfirmModal
        open={openUnregisteredContact}
        onCancel={() => setOpenUnregisteredContact(false)}
        title="Contato não registrado"
        confirmText="Atender"
        confirmDisabled={contactName.trim() === '' || isLoadingCreateClient}
        loading={isLoadingCreateClient}
        onConfirm={() => {
          if (contactType === 'attend') {
            handleTransferAttendant('');
          } else if (contactType === 'client') {
            handleCreateClient(true);
          }
        }}
        message={
          <>
            <div style={{ marginBottom: 12 }}>
              Este contato não está cadastrado como leitor ou apoiador. Você pode cadastrar agora ou apenas atender.
            </div>
            <TextField
              label="Nome do contato"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              fullWidth
              autoFocus
              disabled={isLoadingCreateClient}
            />
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <RadioGroup value={contactType} onChange={(e) => setContactType(e.target.value as 'lead' | 'client' | 'attend')}>
                <FormControlLabel value="attend" control={<Radio />} label="Atender" />
                <FormControlLabel value="client" control={<Radio />} label="Transformar em Apoiador" />
              </RadioGroup>
            </FormControl>
          </>
        }
      />

      <DefaultConfirmModal
        open={showFinalizeModal}
        onCancel={() => setShowFinalizeModal(false)}
        onConfirm={handleFinalizeChat}
        title="Finalizar Atendimento"
        message="Tem certeza que deseja finalizar este atendimento? Esta ação não pode ser desfeita."
        confirmText="Finalizar"
        cancelText="Cancelar"
        loading={isLoadingTransferAttendant}
      />

      <TransferChatModal
        open={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={handleTransferToCollaborator}
        loading={isLoadingTransferAttendant}
        chatName={chat ? chat[0]?.name || '' : ''}
      />

      <ImagePreviewModal
        open={showImagePreview}
        onClose={() => {
          setShowImagePreview(false);
          setSelectedImageFile(null);
        }}
        onSend={handleImageSend}
        imageFile={selectedImageFile}
        loading={isLoadingSendMedia}
      />

      <DocumentPreviewModal
        open={showDocumentPreview}
        onClose={() => {
          setShowDocumentPreview(false);
          setSelectedDocumentFile(null);
        }}
        onSend={handleDocumentSend}
        file={selectedDocumentFile}
      />

      <DefaultConfirmModal
        open={openTemplateModal}
        onCancel={() => {
          setOpenTemplateModal(false);
          setSelectedTemplate(null);
        }}
        onConfirm={async () => {
          if (!selectedTemplate) return;

          const { canSend, reason } = canSendMessage();

          if (!canSend) {
            dispatch(
              showMessage({
                message: reason,
                autoHideDuration: 4000,
                variant: 'warning',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
              }),
            );
            return;
          }

          try {
            const recipient = {
              remoteJid: remoteJid,
              ...(conversationData?.type === 'client' && clientSearch?.data?.[0]?.uid ? { clientUid: clientSearch.data[0].uid } : {}),
              ...(conversationData?.type === 'lead' && leadSearch?.data?.[0]?.uid ? { leadUid: leadSearch.data[0].uid } : {}),
            };

            const scheduledMessageData = {
              title: `Mensagem Modelo - ${selectedTemplate.name}`,
              message: selectedTemplate.message,
              sendAt: new Date().toISOString(),
              messageTemplateUid: selectedTemplate.uid,
              newRecipients: [recipient],
            };

            await createScheduledMessage(scheduledMessageData).unwrap();

            setOpenTemplateModal(false);
            setSelectedTemplate(null);

            dispatch(
              showMessage({
                message: 'Mensagem modelo agendada com sucesso!',
                autoHideDuration: 3000,
                variant: 'success',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
              }),
            );

            if (messagesEndRef.current) {
              messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
          } catch (error: any) {
            dispatch(
              showMessage({
                message: error?.data?.msg || 'Falha ao enviar mensagem modelo',
                autoHideDuration: 4000,
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
              }),
            );
          }
        }}
        title="Enviar mensagem modelo"
        confirmText="Enviar"
        confirmDisabled={!selectedTemplate || isLoadingScheduledMessage}
        loading={isLoadingScheduledMessage}
        maxWidth="sm"
        message={
          <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
            <MessageTemplateAutocomplete value={selectedTemplate} onChange={setSelectedTemplate} label="Selecionar Template" />
            <div>
              <WhatsAppPreview message={selectedTemplate?.message || ''} />
            </div>
          </div>
        }
      />
    </div>
  );
}

export default ChatScreen;
