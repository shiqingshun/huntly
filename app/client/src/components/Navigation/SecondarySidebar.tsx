import React from "react";
import "./SecondarySidebar.css";
import { useLocation } from "react-router-dom";
import { useNavigation, PrimaryNavItem } from "../../contexts/NavigationContext";

import { LibraryNav } from "./Library";
import { FeedsNav } from "./Feeds";
import { SettingsNav } from "./Settings";
import { SourcesNav } from "./Sources";

// Navigation items that have a secondary sidebar
const SIDEBAR_NAV_ITEMS = new Set<PrimaryNavItem>(['saved', 'sources', 'feeds', 'settings']);

// Wrapper component for consistent sidebar structure
const SidebarWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="secondary-sidebar">
    <div className="secondary-sidebar-content shiqingshun">
      {children}
    </div>
  </div>
);

const SecondarySidebar: React.FC = () => {
  const { activeNav } = useNavigation();
  const location = useLocation();

  console.log("SecondarySidebar rendered with activeNav:", activeNav);
  
  // Only render for navigation items that have secondary sidebars
  if (!SIDEBAR_NAV_ITEMS.has(activeNav)) {
    return null;
  }

  return (
    <SidebarWrapper>
      {activeNav === 'saved' && <LibraryNav />}
      {activeNav === 'feeds' && <FeedsNav />}
      {activeNav === 'sources' && <SourcesNav />}
      {activeNav === 'settings' && <SettingsNav selectedNodeId={location.pathname} showHeader />}
    </SidebarWrapper>
  );
};

export default SecondarySidebar;
