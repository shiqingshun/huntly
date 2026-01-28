package com.huntly.interfaces.external.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SourceItem {

    private Integer id;

    private String siteName;

    private String faviconUrl;

    private int total;
}
