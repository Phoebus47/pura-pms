import {
  LayoutDashboard,
  Calendar,
  Users,
  Bed,
  CreditCard,
  Clock,
  MoonStar,
  FileText,
  Settings,
  ArrowLeftRight,
  Receipt,
  Landmark,
  Wallet,
  Building2,
  Percent,
  TrendingUp,
  Layers,
  ClipboardCheck,
  Printer,
  AlarmClock,
  Stamp,
  PackageSearch,
  MessageSquare,
  Star,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  labelKey: string;
}

export const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    labelKey: 'nav.dashboard',
  },
  {
    name: 'Reservations',
    href: '/reservations',
    icon: Calendar,
    labelKey: 'nav.reservations',
  },
  {
    name: 'Guests',
    href: '/guests',
    icon: Users,
    labelKey: 'nav.guests',
  },
  { name: 'Rooms', href: '/rooms', icon: Bed, labelKey: 'nav.rooms' },
  {
    name: 'Housekeeping',
    href: '/housekeeping',
    icon: ClipboardCheck,
    labelKey: 'nav.housekeeping',
  },
  {
    name: 'Hardware',
    href: '/hardware-bridge',
    icon: Printer,
    labelKey: 'nav.hardwareBridge',
  },
  {
    name: 'Rates',
    href: '/rates',
    icon: Percent,
    labelKey: 'nav.rates',
  },
  {
    name: 'Yield',
    href: '/yield',
    icon: TrendingUp,
    labelKey: 'nav.yield',
  },
  {
    name: 'Blocks',
    href: '/blocks',
    icon: Layers,
    labelKey: 'nav.blocks',
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    labelKey: 'nav.billing',
  },
  {
    name: 'Shifts',
    href: '/shifts',
    icon: Clock,
    labelKey: 'nav.shifts',
  },
  {
    name: 'Night Audit',
    href: '/night-audit',
    icon: MoonStar,
    labelKey: 'nav.nightAudit',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    labelKey: 'nav.reports',
  },
  {
    name: 'Exchange rates',
    href: '/exchange-rates',
    icon: ArrowLeftRight,
    labelKey: 'nav.exchangeRates',
  },
  {
    name: 'Tax invoices',
    href: '/tax-invoices',
    icon: Receipt,
    labelKey: 'nav.taxInvoices',
  },
  {
    name: 'Accounts receivable',
    href: '/ar-accounts',
    icon: Landmark,
    labelKey: 'nav.arAccounts',
  },
  {
    name: 'Card pre-auths',
    href: '/card-preauths',
    icon: Wallet,
    labelKey: 'nav.cardPreauths',
  },
  {
    name: 'Partner hotels',
    href: '/partner-hotels',
    icon: Building2,
    labelKey: 'nav.partnerHotels',
  },
  {
    name: 'Wake-up calls',
    href: '/wake-up-calls',
    icon: AlarmClock,
    labelKey: 'nav.wakeUpCalls',
  },
  {
    name: 'TM.30',
    href: '/tm30',
    icon: Stamp,
    labelKey: 'nav.tm30',
  },
  {
    name: 'Lost & found',
    href: '/lost-found',
    icon: PackageSearch,
    labelKey: 'nav.lostFound',
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    labelKey: 'nav.messages',
  },
  {
    name: 'Feedback',
    href: '/feedback',
    icon: Star,
    labelKey: 'nav.feedback',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    labelKey: 'nav.settings',
  },
];

export const primaryBottomNavItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    labelKey: 'nav.dashboard',
  },
  {
    name: 'Reservations',
    href: '/reservations',
    icon: Calendar,
    labelKey: 'nav.reservations',
  },
  {
    name: 'Guests',
    href: '/guests',
    icon: Users,
    labelKey: 'nav.guests',
  },
  { name: 'Rooms', href: '/rooms', icon: Bed, labelKey: 'nav.rooms' },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    labelKey: 'nav.billing',
  },
];

export const moreBottomNavItems: NavigationItem[] = [
  {
    name: 'Shifts',
    href: '/shifts',
    icon: Clock,
    labelKey: 'nav.shifts',
  },
  {
    name: 'Night Audit',
    href: '/night-audit',
    icon: MoonStar,
    labelKey: 'nav.nightAudit',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    labelKey: 'nav.reports',
  },
  {
    name: 'Exchange rates',
    href: '/exchange-rates',
    icon: ArrowLeftRight,
    labelKey: 'nav.exchangeRates',
  },
  {
    name: 'Tax invoices',
    href: '/tax-invoices',
    icon: Receipt,
    labelKey: 'nav.taxInvoices',
  },
  {
    name: 'Accounts receivable',
    href: '/ar-accounts',
    icon: Landmark,
    labelKey: 'nav.arAccounts',
  },
  {
    name: 'Card pre-auths',
    href: '/card-preauths',
    icon: Wallet,
    labelKey: 'nav.cardPreauths',
  },
  {
    name: 'Partner hotels',
    href: '/partner-hotels',
    icon: Building2,
    labelKey: 'nav.partnerHotels',
  },
  {
    name: 'Rates',
    href: '/rates',
    icon: Percent,
    labelKey: 'nav.rates',
  },
  {
    name: 'Yield',
    href: '/yield',
    icon: TrendingUp,
    labelKey: 'nav.yield',
  },
  {
    name: 'Blocks',
    href: '/blocks',
    icon: Layers,
    labelKey: 'nav.blocks',
  },
  {
    name: 'Housekeeping',
    href: '/housekeeping',
    icon: ClipboardCheck,
    labelKey: 'nav.housekeeping',
  },
  {
    name: 'Hardware',
    href: '/hardware-bridge',
    icon: Printer,
    labelKey: 'nav.hardwareBridge',
  },
  {
    name: 'Wake-up calls',
    href: '/wake-up-calls',
    icon: AlarmClock,
    labelKey: 'nav.wakeUpCalls',
  },
  {
    name: 'TM.30',
    href: '/tm30',
    icon: Stamp,
    labelKey: 'nav.tm30',
  },
  {
    name: 'Lost & found',
    href: '/lost-found',
    icon: PackageSearch,
    labelKey: 'nav.lostFound',
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    labelKey: 'nav.messages',
  },
  {
    name: 'Feedback',
    href: '/feedback',
    icon: Star,
    labelKey: 'nav.feedback',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    labelKey: 'nav.settings',
  },
];
