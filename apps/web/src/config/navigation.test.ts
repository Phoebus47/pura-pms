import { navigationItems, type NavigationItem } from './navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Bed,
  CreditCard,
  FileText,
  Settings,
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
        expect(typeof item.name).toBe('string');
        expect(typeof item.href).toBe('string');
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

    it('should include Reports navigation item', () => {
      const reportsItem = navigationItems.find(
        (item) => item.name === 'Reports',
      );
      expect(reportsItem).toBeDefined();
      expect(reportsItem?.href).toBe('/reports');
      expect(reportsItem?.icon).toBe(FileText);
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
        'Billing',
        'Reports',
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

  describe('NavigationItem type', () => {
    it('should match NavigationItem interface', () => {
      const validItem: NavigationItem = {
        name: 'Test',
        href: '/test',
        icon: LayoutDashboard,
      };

      expect(validItem.name).toBe('Test');
      expect(validItem.href).toBe('/test');
      expect(validItem.icon).toBe(LayoutDashboard);
    });
  });
});
