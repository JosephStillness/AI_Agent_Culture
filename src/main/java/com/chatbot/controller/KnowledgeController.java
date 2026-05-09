package com.chatbot.controller;

import com.chatbot.model.KnowledgeBase;
import com.chatbot.model.KnowledgeRequest;
import com.chatbot.service.KnowledgeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @PostMapping
    public ResponseEntity<KnowledgeBase> addKnowledge(@RequestBody KnowledgeRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(knowledgeService.addKnowledge(request));
    }

    @GetMapping
    public List<KnowledgeBase> getAllKnowledge() {
        return knowledgeService.getAllKnowledge();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKnowledge(@PathVariable Long id) {
        knowledgeService.deleteKnowledge(id);
        return ResponseEntity.noContent().build();
    }
}
