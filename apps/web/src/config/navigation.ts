import {
  LayoutDashboard,
  Calendar,
  Users,
  Bed,
  CreditCard,
  FileText,
  Settings,
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
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];
