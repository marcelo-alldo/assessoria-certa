import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';
import authRoles from '@auth/authRoles';

i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('tr', 'navigation', tr);
i18n.addResourceBundle('ar', 'navigation', ar);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    translate: 'Dashboard',
    type: 'item',
    icon: 'material-outline:bar_chart',
    url: 'dashboard',
    auth: authRoles.collaborator,
  },
  {
    id: 'reports',
    title: 'Relatórios',
    translate: 'Relatórios',
    type: 'item',
    icon: 'material-outline:query_stats',
    url: 'reports',
    auth: authRoles.collaborator,
  },
  {
    id: 'panels',
    title: 'Painéis',
    translate: 'Painéis',
    type: 'collapse',
    icon: 'heroicons-outline:table-cells',
    auth: authRoles.collaborator,
    children: [
      {
        id: 'scrumboard',
        title: 'Leads',
        type: 'item',
        url: 'scrumboard',
      },
      {
        id: 'clients-scrumboard',
        title: 'Clientes',
        type: 'item',
        url: 'clients-scrumboard',
      },
    ],
  },
  {
    id: 'leads',
    title: 'Leads',
    translate: 'Leads',
    type: 'item',
    icon: 'heroicons-outline:user-plus',
    url: 'leads',
    auth: authRoles.collaborator,
  },
  {
    id: 'clients',
    title: 'Clientes',
    translate: 'Clientes',
    type: 'item',
    icon: 'heroicons-outline:user-group',
    url: 'clients',
    auth: authRoles.collaborator,
  },
  {
    id: 'collaborators',
    title: 'Colaboradores',
    translate: 'Colaboradores',
    type: 'item',
    icon: 'heroicons-outline:users',
    url: 'collaborators',
    auth: authRoles.user,
  },
  {
    id: 'subscriptions',
    title: 'Assinaturas',
    translate: 'Assinaturas',
    type: 'item',
    icon: 'heroicons-outline:credit-card',
    url: 'subscriptions',
    auth: authRoles.user,
  },
  {
    id: 'chats',
    title: 'Conversas',
    translate: 'Conversas',
    type: 'item',
    icon: 'material-outline:chat',
    url: 'chats',
    auth: authRoles.collaborator,
  },
  {
    id: 'message-templates',
    title: 'Mensagens\u00A0Modelo',
    translate: 'Mensagens\u00A0Modelo',
    type: 'item',
    icon: 'heroicons-outline:document-duplicate',
    url: 'message-templates',
    auth: authRoles.collaborator,
  },
  {
    id: 'scheduled-messages',
    title: 'Mensagens Agendadas',
    translate: 'Mensagens\u00A0Agendadas',
    type: 'item',
    icon: 'material-outline:schedule',
    url: 'scheduled-messages',
    auth: authRoles.collaborator,
  },
  {
    id: 'calendar-events',
    title: 'Calendario',
    translate: 'Calendario',
    type: 'item',
    icon: 'heroicons-outline:calendar-days',
    url: 'calendar',
    auth: authRoles.collaborator,
  },
  {
    id: 'divider',
    type: 'divider',
    auth: authRoles.user,
  },
  {
    id: 'configs',
    title: 'Configurações',
    translate: 'Configurações',
    type: 'collapse',
    icon: 'heroicons-outline:cog-6-tooth',
    auth: authRoles.user,
    children: [
      {
        id: 'status',
        title: 'Status',
        type: 'item',
        url: '/configs/status',
      },
      {
        id: 'about',
        title: 'Sobre a Empresa',
        type: 'item',
        url: '/configs/about',
      },
      {
        id: 'products',
        title: 'Produtos',
        type: 'item',
        url: '/configs/products',
        end: true,
      },
      {
        id: 'keys',
        title: 'Chaves',
        type: 'item',
        url: '/configs/keys',
      },
      {
        id: 'whatsapp',
        title: 'WhatsApp',
        type: 'item',
        url: '/configs/whatsapp',
      },
      {
        id: 'testing',
        title: 'Controle\u00A0de\u00A0Teste',
        type: 'item',
        url: '/configs/testing',
      },
    ],
  },
  {
    id: 'flows',
    title: 'Fluxos',
    translate: 'Fluxos',
    type: 'item',
    icon: 'material-outline:account_tree',
    url: '/flows',
    auth: authRoles.user,
  },
  {
    id: 'marketing-panels',
    title: 'Marketing',
    translate: 'Marketing',
    type: 'collapse',
    icon: 'heroicons-outline:megaphone',
    auth: authRoles.collaborator,
    children: [
      {
        id: 'marketing-dashboard',
        title: 'Dashboard',
        type: 'item',
        url: 'marketing/dashboard',
      },
      {
        id: 'origins-marketing',
        title: 'Origens',
        translate: 'Origens',
        type: 'item',
        url: 'marketing/origins',
      },
    ],
  },

  {
    id: 'admin-dashboard',
    title: 'Dashboard',
    translate: 'Dashboard',
    type: 'item',
    icon: 'material-outline:bar_chart',
    url: 'admin/dashboard',
    auth: authRoles.admin,
  },
  {
    id: 'admin-users',
    title: 'Usuários',
    translate: 'Usuários',
    type: 'item',
    icon: 'heroicons-outline:user-group',
    url: 'admin/users',
    auth: authRoles.admin,
  },
  {
    id: 'admin-generate-key-offline',
    title: 'Chave\u00A0Offline',
    translate: 'Chave\u00A0Offline',
    type: 'item',
    icon: 'heroicons-outline:key',
    url: 'admin/generate-key-offline',
    auth: authRoles.admin,
  },
];

export default navigationConfig;
