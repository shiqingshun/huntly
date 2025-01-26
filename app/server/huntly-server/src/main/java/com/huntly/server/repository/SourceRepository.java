package com.huntly.server.repository;

import com.huntly.server.domain.entity.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SourceRepository extends JpaRepository<Source, Integer>, JpaSpecificationExecutor<Source> {

    Optional<Source> findByDomain(String domain);

    @Query("SELECT s, COUNT(p) as total FROM Source s LEFT JOIN Page p ON s.id = p.sourceId GROUP BY s.id ORDER BY COUNT(p) DESC")
    List<Object[]> getSourceWithTotal();
}