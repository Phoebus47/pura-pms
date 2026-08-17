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
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    labelKey: 'nav.settings',
  },
];
