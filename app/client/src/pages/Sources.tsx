import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ConnectorControllerApiFactory } from "../api";
import MainContainer from "../components/MainContainer";
import Loading from "../components/Loading";

const Sources = () => {
  const navigate = useNavigate();

  const { data: view, isLoading } = useQuery(
    ['folder-connector-view'],
    async () => (await ConnectorControllerApiFactory().getFolderConnectorViewUsingGET()).data,
  );

  const primarySourceId = useMemo(() => {
    if (!view?.folderSources || view.folderSources.length === 0) {
      return null;
    }

    const sorted = [...view.folderSources].sort((a, b) => (b.total || 0) - (a.total || 0));
    return sorted[0]?.id ?? null;
  }, [view]);

  useEffect(() => {
    if (primarySourceId) {
      navigate(`/source/${primarySourceId}`, { replace: true });
    }
  }, [navigate, primarySourceId]);

  if (isLoading) {
    return (
      <MainContainer>
        <Loading />
      </MainContainer>
    );
  }

  if (!primarySourceId) {
    return (
      <MainContainer>
        <div className="text-sm text-slate-500">No sources yet.</div>
      </MainContainer>
    );
  }

  return null;
};

export default Sources;
