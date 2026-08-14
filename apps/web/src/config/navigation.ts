import {
  LayoutDashboard,
  Calendar,
  Users,
  Bed,
  CreditCard,
  Clock,
  FileText,
  Settings,
  ArrowLeftRight,
  Receipt,
  Landmark,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Reservations', href: '/reservations', icon: Calendar },
  { name: 'Guests', href: '/guests', icon: Users },
  { name: 'Rooms', href: '/rooms', icon: Bed },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Shifts', href: '/shifts', icon: Clock },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Exchange rates', href: '/exchange-rates', icon: ArrowLeftRight },
  { name: 'Tax invoices', href: '/tax-invoices', icon: Receipt },
  { name: 'Accounts receivable', href: '/ar-accounts', icon: Landmark },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const primaryBottomNavItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Reservations', href: '/reservations', icon: Calendar },
  { name: 'Guests', href: '/guests', icon: Users },
  { name: 'Rooms', href: '/rooms', icon: Bed },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

export const moreBottomNavItems: NavigationItem[] = [
  { name: 'Shifts', href: '/shifts', icon: Clock },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Exchange rates', href: '/exchange-rates', icon: ArrowLeftRight },
  { name: 'Tax invoices', href: '/tax-invoices', icon: Receipt },
  { name: 'Accounts receivable', href: '/ar-accounts', icon: Landmark },
  { name: 'Settings', href: '/settings', icon: Settings },
];
