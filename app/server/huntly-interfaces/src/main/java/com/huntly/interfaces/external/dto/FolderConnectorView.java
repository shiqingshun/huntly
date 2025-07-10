package com.huntly.interfaces.external.dto;

import lombok.Data;

import java.util.List;

@Data
public class FolderConnectorView {
    private List<FolderConnectors> folderConnectors;

    private List<FolderConnectors> folderFeedConnectors;

    private List<SourceItem> folderSources;
}
