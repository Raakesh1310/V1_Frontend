import { SideNavItem } from '@modules/navigation/models';

export { SideNavItem };

export class MockSideNavItem implements SideNavItem {
  text = 'TEST';
  link = 'TEST';
  icon = '';
  new = false;
  roles: string[] = [];
  submenu: SideNavItem[] = [];
}
