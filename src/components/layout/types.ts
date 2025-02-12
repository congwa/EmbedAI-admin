import { LinkProps } from '@tanstack/react-router'
import { type LucideIcon } from 'lucide-react'
import { type Icon } from '@tabler/icons-react'

interface User {
  name: string
  email: string
  avatar: string
}

interface Team {
  name: string
  logo: LucideIcon
  plan: string
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
}

type NavLink = BaseNavItem & {
  url: LinkProps['to']
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] })[]
  url?: never
}

export interface NavItem {
  title: string
  url?: string
  icon?: Icon | LucideIcon
  badge?: string
  items?: Omit<NavItem, 'items'>[]
  adminOnly?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

export interface SidebarData {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
