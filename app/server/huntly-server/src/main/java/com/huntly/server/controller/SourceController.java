package com.huntly.server.controller;


import com.huntly.server.domain.entity.Source;
import com.huntly.server.service.SourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/source")
public class SourceController {

    private final SourceService sourceService;

    public SourceController(SourceService sourceService) {
        this.sourceService = sourceService;
    }

    @GetMapping("/all")
    public List<Source> getSources() {
        return sourceService.getSourceWithTotal();
    }

    @PostMapping("/save")
    public Source saveSource(@RequestBody Source source) {
        return sourceService.save(source);
    }

    @DeleteMapping("/{id}")
    public boolean deleteSource(@PathVariable("id") Integer id) {
        return sourceService.delete(id);
    }
}
