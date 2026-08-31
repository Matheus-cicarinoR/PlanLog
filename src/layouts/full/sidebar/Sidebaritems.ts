import { uniqueId } from "lodash";

export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  isPro?: boolean
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number | string;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  isPro?: boolean
}

const SidebarContent: MenuItem[] = [
  {
    heading: "Gestão de Frotas",
    children: [
      {
        name: "Dashboard",
        icon: "solar:widget-add-line-duotone",
        id: uniqueId(),
        url: "/",
        isPro: false,
      },
      {
        name: "Agenda & Calendário",
        icon: "solar:calendar-bold-duotone",
        id: uniqueId(),
        url: "/agenda",
        isPro: false,
      },
      {
        name: "Máquinas",
        icon: "lucide:tractor",
        id: uniqueId(),
        url: "/maquinas",
        isPro: false,
      },
      {
        name: "Serviços",
        icon: "solar:clipboard-list-line-duotone",
        id: uniqueId(),
        url: "/servicos",
        isPro: false,
      },
      {
        name: "Clientes",
        icon: "solar:users-group-rounded-bold-duotone",
        id: uniqueId(),
        url: "/clientes",
        isPro: false,
      },
      {
        name: "Manutenções",
        icon: "solar:settings-minimalistic-line-duotone",
        id: uniqueId(),
        url: "/manutencoes",
        isPro: false,
      },
      {
        name: "Operadores",
        icon: "solar:users-group-two-rounded-line-duotone",
        id: uniqueId(),
        url: "/operadores",
        isPro: false,
      },
      {
        name: "Combustível",
        icon: "solar:gas-station-line-duotone",
        id: uniqueId(),
        url: "/combustivel",
        isPro: false,
      },
      {
        name: "Relatórios",
        icon: "solar:document-text-line-duotone",
        id: uniqueId(),
        url: "/relatorios",
        isPro: false,
      }
    ],
  },
  {
    heading: "Configurações & Ajuda",
    children: [
      {
        name: "Usuários",
        icon: "solar:shield-user-line-duotone",
        id: uniqueId(),
        url: "/usuarios",
        isPro: false,
      },
      {
        name: "Central de Ajuda (Wiki)",
        icon: "solar:book-bookmark-bold-duotone",
        id: uniqueId(),
        url: "/ajuda",
        isPro: false,
      }
    ],
  }
];

export default SidebarContent;
