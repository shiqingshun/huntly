package com.huntly.server.service;

import com.huntly.server.domain.entity.Source;
import com.huntly.server.repository.PageRepository;
import com.huntly.server.repository.SourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SourceService {

    private final SourceRepository sourceRepository;

    private final PageRepository pageRepository;

    public SourceService(SourceRepository sourceRepository, PageRepository pageRepository) {
        this.sourceRepository = sourceRepository;
        this.pageRepository = pageRepository;
    }

    public Optional<Source> findById(Integer id) {
        return sourceRepository.findById(id);
    }

    private Source requireOne(Integer id) {
        return sourceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Resource not found: " + id));
    }

    public List<Source> getSourceWithTotal() {
        List<Object[]> results = sourceRepository.getSourceWithTotal();
        List<Source> sources = results.stream().map(result -> {
                    Source source = (Source) result[0];
                    source.setTotal(((Long) result[1]).intValue());
                    return source;
                }).sorted((s1, s2) -> Integer.compare(s2.getTotal(), s1.getTotal()))
                .collect(Collectors.toList());
        return sources;
    }

    public List<Source> getSources() {
        return sourceRepository.findAll();
    }

    public Source save(Source source) {
        return sourceRepository.save(source);
    }

    public boolean delete(Integer id) {
        if (pageRepository.countBySourceId(id) == 0) {
            sourceRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
}
