package com.huntly.interfaces.external.model;

import lombok.Data;

@Data
public class UpdatePageDetailRequest {
    private String title;
    private String description;
    private String url;
    private String content;
}
