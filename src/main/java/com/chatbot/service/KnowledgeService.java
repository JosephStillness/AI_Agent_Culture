package com.chatbot.service;

import com.chatbot.model.KnowledgeBase;
import com.chatbot.model.KnowledgeRequest;
import com.chatbot.repository.KnowledgeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KnowledgeService {

    private final KnowledgeRepository knowledgeRepository;

    public KnowledgeService(KnowledgeRepository knowledgeRepository) {
        this.knowledgeRepository = knowledgeRepository;
    }

    public KnowledgeBase addKnowledge(KnowledgeRequest request) {
        KnowledgeBase knowledgeBase = new KnowledgeBase(
                request.getTitle(),
                request.getContent(),
                request.getCategory()
        );

        return knowledgeRepository.save(knowledgeBase);
    }

    public List<KnowledgeBase> getAllKnowledge() {
        return knowledgeRepository.findAll();
    }

    public void deleteKnowledge(Long id) {
        knowledgeRepository.deleteById(id);
    }
}
