import { FolderOpen, Settings2, SquarePen } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const pages = [
  { id: 'brief', label: 'Nouveau Brief', icon: SquarePen },
  { id: 'projects', label: 'Projets', icon: FolderOpen },
  { id: 'settings', label: 'Réglages', icon: Settings2 },
] as const;

export type Page = (typeof pages)[number]['id'];
export const pageTitles: Record<Page, string> = {
  brief: 'Nouveau Brief',
  projects: 'Projets',
  settings: 'Réglages',
};

export function AppSidebar({
  activePage,
  onNavigate,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  function item(page: (typeof pages)[number]) {
    return (
      <SidebarMenuItem key={page.id}>
        <SidebarMenuButton
          isActive={activePage === page.id}
          aria-current={activePage === page.id ? 'page' : undefined}
          tooltip={page.label}
          onClick={() => {
            onNavigate(page.id);
            if (isMobile) setOpenMobile(false);
          }}
        >
          <page.icon aria-hidden="true" />
          <span>{page.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-5 group-data-[collapsible=icon]:px-2">
        <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:sr-only">
          Hackathon Givaudan
        </span>
        <SquarePen
          className="hidden size-4 group-data-[collapsible=icon]:block"
          aria-hidden="true"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <nav aria-label="Navigation principale">
              <SidebarMenu>{pages.slice(0, 2).map(item)}</SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <nav aria-label="Réglages de l’application">
          <SidebarMenu>{item(pages[2])}</SidebarMenu>
        </nav>
      </SidebarFooter>
    </Sidebar>
  );
}
