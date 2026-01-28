import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ConnectorControllerApiFactory, ConnectorItem, FolderConnectors, PageControllerApiFactory } from "../../../api";
import { useLocation } from "react-router-dom";
import NavTreeView, { NavTreeViewItem } from "../shared/NavTreeView";
import SourceIcon from "@mui/icons-material/Source";
import SidebarHeader from '../shared/SidebarHeader';


// Sources content component - only mounts when sources nav is active
const SourcesContent: React.FC = () => {
  const location = useLocation();

  const { data: view } = useQuery(
    ['folder-connector-view'],
    async () => (await ConnectorControllerApiFactory().getFolderConnectorViewUsingGET()).data,
    {
      refetchInterval: 5000,
    }
  );

  const treeItems: NavTreeViewItem[] = view?.folderSources
    ? [...view.folderSources]
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .map((source) => ({
        labelText: source.siteName || 'Unknown Source',
        labelIcon: SourceIcon,
        linkTo: source.id ? `/source/${source.id}` : undefined,
        inboxCount: source.total || 0,
        iconUrl: source.faviconUrl,
      }))
    : [];

  return (
    <>
      {treeItems.length > 0 && (
        <NavTreeView
          treeItems={treeItems}
          ariaLabel="sources"
          defaultExpanded={[]}
          selectedNodeId={location.pathname}
          emphasizeCounts={true}
        />
      )}
    </>
  );
};

const Sources = () => {
  return (
    <>
      <SidebarHeader title="Sources" />
      <SourcesContent />
    </>
  );
};

export default Sources;
