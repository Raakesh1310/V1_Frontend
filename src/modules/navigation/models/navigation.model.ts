export interface SBRouteData {
  title?: string;
  activeTopNav?: string;
  breadcrumbs?: Breadcrumb[];
  includeDashboardLayout?: boolean;
}

export interface Breadcrumb {
  text: string;
  link?: string;
  active?: boolean;
}

export interface SideNavItems {
  [index: string]: SideNavItem;
}

export interface SideNavItem {
  icon?: string;
  text: string;
  link?: string;
  submenu?: SideNavItem[];
  new?: boolean;
  roles: string[];
}

export interface SideNavSection {
  text?: string;
  items: string[];
}

export interface SideNavSectionItem {
  text: string;
  roles: string[];
}
