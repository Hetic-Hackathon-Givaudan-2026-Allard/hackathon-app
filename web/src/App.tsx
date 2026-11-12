import { useState } from 'react';
import { AppSidebar, pageTitles, type Page } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import NewBriefPage from '@/pages/NewBriefPage';
import ProjectsPage from '@/pages/ProjectsPage';
import SettingsPage from '@/pages/SettingsPage';

const pageComponents = {
  brief: NewBriefPage,
  projects: ProjectsPage,
  settings: SettingsPage,
} satisfies Record<Page, typeof NewBriefPage>;

export default function App() {
  const [activePage, setActivePage] = useState<Page>('brief');
  const ActivePage = pageComponents[activePage];

  return (
    <TooltipProvider>
      <Toaster richColors closeButton position="top-right" />
      <SidebarProvider>
        <AppSidebar activePage={activePage} onNavigate={setActivePage} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
            <SidebarTrigger aria-label="Ouvrir ou fermer la navigation" />
            <span className="text-sm font-medium">
              {pageTitles[activePage]}
            </span>
          </header>
          <section className="p-6 md:p-8" aria-labelledby="page-title">
            <ActivePage />
          </section>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
