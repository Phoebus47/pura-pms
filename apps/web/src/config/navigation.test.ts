import {
  moreBottomNavItems,
  navigationItems,
  primaryBottomNavItems,
  type NavigationItem,
} from './navigation';
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
  Wallet,
  MoonStar,
  Building2,
  Percent,
  TrendingUp,
  Layers,
  ClipboardCheck,
  Printer,
  AlarmClock,
  Stamp,
} from 'lucide-react';

describe('navigation', () => {
  describe('navigationItems', () => {
    it('should export navigationItems array', () => {
      expect(Array.isArray(navigationItems)).toBe(true);
      expect(navigationItems.length).toBeGreaterThan(0);
    });

    it('should have correct structure for each item', () => {
      navigationItems.forEach((item) => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('href');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('labelKey');
        expect(typeof item.name).toBe('string');
        expect(typeof item.href).toBe('string');
        expect(typeof item.labelKey).toBe('string');
        expect(item.icon).toBeDefined();
      });
    });

    it('should include Dashboard navigation item', () => {
      const dashboardItem = navigationItems.find(
        (item) => item.name === 'Dashboard',
      );
      expect(dashboardItem).toBeDefined();
      expect(dashboardItem?.href).toBe('/');
      expect(dashboardItem?.icon).toBe(LayoutDashboard);
    });

    it('should include Reservations navigation item', () => {
      const reservationsItem = navigationItems.find(
        (item) => item.name === 'Reservations',
      );
      expect(reservationsItem).toBeDefined();
      expect(reservationsItem?.href).toBe('/reservations');
      expect(reservationsItem?.icon).toBe(Calendar);
    });

    it('should include Guests navigation item', () => {
      const guestsItem = navigationItems.find((item) => item.name === 'Guests');
      expect(guestsItem).toBeDefined();
      expect(guestsItem?.href).toBe('/guests');
      expect(guestsItem?.icon).toBe(Users);
    });

    it('should include Rooms navigation item', () => {
      const roomsItem = navigationItems.find((item) => item.name === 'Rooms');
      expect(roomsItem).toBeDefined();
      expect(roomsItem?.href).toBe('/rooms');
      expect(roomsItem?.icon).toBe(Bed);
    });

    it('should include Billing navigation item', () => {
      const billingItem = navigationItems.find(
        (item) => item.name === 'Billing',
      );
      expect(billingItem).toBeDefined();
      expect(billingItem?.href).toBe('/billing');
      expect(billingItem?.icon).toBe(CreditCard);
    });

    it('should include Shifts navigation item', () => {
      const shiftsItem = navigationItems.find((item) => item.name === 'Shifts');
      expect(shiftsItem).toBeDefined();
      expect(shiftsItem?.href).toBe('/shifts');
      expect(shiftsItem?.icon).toBe(Clock);
    });

    it('should include Reports navigation item', () => {
      const reportsItem = navigationItems.find(
        (item) => item.name === 'Reports',
      );
      expect(reportsItem).toBeDefined();
      expect(reportsItem?.href).toBe('/reports');
      expect(reportsItem?.icon).toBe(FileText);
    });

    it('should include Exchange rates navigation item', () => {
      const fxItem = navigationItems.find(
        (item) => item.name === 'Exchange rates',
      );
      expect(fxItem).toBeDefined();
      expect(fxItem?.href).toBe('/exchange-rates');
      expect(fxItem?.icon).toBe(ArrowLeftRight);
    });

    it('should include Tax invoices navigation item', () => {
      const item = navigationItems.find(
        (navItem) => navItem.name === 'Tax invoices',
      );
      expect(item).toBeDefined();
      expect(item?.href).toBe('/tax-invoices');
      expect(item?.icon).toBe(Receipt);
    });

    it('should include Accounts receivable navigation item', () => {
      const item = navigationItems.find(
        (navItem) => navItem.name === 'Accounts receivable',
      );
      expect(item).toBeDefined();
      expect(item?.href).toBe('/ar-accounts');
      expect(item?.icon).toBe(Landmark);
    });

    it('should include Card pre-auths navigation item', () => {
      const item = navigationItems.find(
        (navItem) => navItem.name === 'Card pre-auths',
      );
      expect(item).toBeDefined();
      expect(item?.href).toBe('/card-preauths');
      expect(item?.icon).toBe(Wallet);
    });

    it('should include Rates navigation item', () => {
      const item = navigationItems.find((navItem) => navItem.name === 'Rates');
      expect(item).toBeDefined();
      expect(item?.href).toBe('/rates');
      expect(item?.icon).toBe(Percent);
    });

    it('should include Yield navigation item', () => {
      const item = navigationItems.find((navItem) => navItem.name === 'Yield');
      expect(item).toBeDefined();
      expect(item?.href).toBe('/yield');
      expect(item?.icon).toBe(TrendingUp);
    });

    it('should include Blocks navigation item', () => {
      const item = navigationItems.find((navItem) => navItem.name === 'Blocks');
      expect(item).toBeDefined();
      expect(item?.href).toBe('/blocks');
      expect(item?.icon).toBe(Layers);
    });

    it('should include Housekeeping navigation item', () => {
      const item = navigationItems.find(
        (navItem) => navItem.name === 'Housekeeping',
      );
      expect(item).toBeDefined();
      expect(item?.href).toBe('/housekeeping');
      expect(item?.icon).toBe(ClipboardCheck);
    });

    it('should include Hardware navigation item', () => {
      const item = navigationItems.find(
        (navItem) => navItem.name === 'Hardware',
      );
      expect(item).toBeDefined();
      expect(item?.href).toBe('/hardware-bridge');
      expect(item?.icon).toBe(Printer);
    });

    it('should include Wake-up calls navigation item', () => {
      const item = navigationItems.find(
        (navItem) => navItem.name === 'Wake-up calls',
      );
      expect(item).toBeDefined();
      expect(item?.href).toBe('/wake-up-calls');
      expect(item?.icon).toBe(AlarmClock);
    });

    it('should include TM.30 navigation item', () => {
      const item = navigationItems.find((navItem) => navItem.name === 'TM.30');
      expect(item).toBeDefined();
      expect(item?.href).toBe('/tm30');
      expect(item?.icon).toBe(Stamp);
    });

    it('should include Partner hotels navigation item', () => {
      const item = navigationItems.find(
        (navItem) => navItem.name === 'Partner hotels',
      );
      expect(item).toBeDefined();
      expect(item?.href).toBe('/partner-hotels');
      expect(item?.icon).toBe(Building2);
    });

    it('should include Night Audit navigation item', () => {
      const item = navigationItems.find(
        (navItem) => navItem.name === 'Night Audit',
      );
      expect(item).toBeDefined();
      expect(item?.href).toBe('/night-audit');
      expect(item?.icon).toBe(MoonStar);
    });

    it('should include Settings navigation item', () => {
      const settingsItem = navigationItems.find(
        (item) => item.name === 'Settings',
      );
      expect(settingsItem).toBeDefined();
      expect(settingsItem?.href).toBe('/settings');
      expect(settingsItem?.icon).toBe(Settings);
    });

    it('should have all required navigation items', () => {
      const expectedItems = [
        'Dashboard',
        'Reservations',
        'Guests',
        'Rooms',
        'Housekeeping',
        'Hardware',
        'Rates',
        'Yield',
        'Blocks',
        'Billing',
        'Shifts',
        'Night Audit',
        'Reports',
        'Exchange rates',
        'Tax invoices',
        'Accounts receivable',
        'Card pre-auths',
        'Partner hotels',
        'Settings',
      ];

      const itemNames = navigationItems.map((item) => item.name);
      expectedItems.forEach((expectedName) => {
        expect(itemNames).toContain(expectedName);
      });
    });

    it('should have unique hrefs', () => {
      const hrefs = navigationItems.map((item) => item.href);
      const uniqueHrefs = new Set(hrefs);
      expect(uniqueHrefs.size).toBe(hrefs.length);
    });

    it('should have unique names', () => {
      const names = navigationItems.map((item) => item.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('primaryBottomNavItems', () => {
    it('should list five primary tabs including Billing', () => {
      expect(primaryBottomNavItems.map((item) => item.name)).toEqual([
        'Dashboard',
        'Reservations',
        'Guests',
        'Rooms',
        'Billing',
      ]);
      expect(primaryBottomNavItems.map((item) => item.href)).toEqual([
        '/',
        '/reservations',
        '/guests',
        '/rooms',
        '/billing',
      ]);
    });
  });

  describe('moreBottomNavItems', () => {
    it('should keep extra items in the overflow menu', () => {
      expect(moreBottomNavItems.map((item) => item.name)).toEqual([
        'Shifts',
        'Night Audit',
        'Reports',
        'Exchange rates',
        'Tax invoices',
        'Accounts receivable',
        'Card pre-auths',
        'Partner hotels',
        'Rates',
        'Yield',
        'Blocks',
        'Housekeeping',
        'Hardware',
        'Wake-up calls',
        'TM.30',
        'Settings',
      ]);
      expect(moreBottomNavItems.map((item) => item.href)).toEqual([
        '/shifts',
        '/night-audit',
        '/reports',
        '/exchange-rates',
        '/tax-invoices',
        '/ar-accounts',
        '/card-preauths',
        '/partner-hotels',
        '/rates',
        '/yield',
        '/blocks',
        '/housekeeping',
        '/hardware-bridge',
        '/wake-up-calls',
        '/tm30',
        '/settings',
      ]);
    });
  });

  describe('NavigationItem type', () => {
    it('should match NavigationItem interface', () => {
      const validItem: NavigationItem = {
        name: 'Test',
        href: '/test',
        icon: LayoutDashboard,
        labelKey: 'nav.dashboard',
      };

      expect(validItem.name).toBe('Test');
      expect(validItem.href).toBe('/test');
      expect(validItem.icon).toBe(LayoutDashboard);
    });
  });
});
