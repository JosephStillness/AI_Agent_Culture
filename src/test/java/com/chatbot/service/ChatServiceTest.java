package com.chatbot.service;

import com.chatbot.repository.KnowledgeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class ChatServiceTest {

    @Test
    void blocksCodingQuestionsBeforeCallingDatabaseOrOpenAi() {
        KnowledgeRepository knowledgeRepository = mock(KnowledgeRepository.class);
        RestTemplate restTemplate = mock(RestTemplate.class);
        ChatService chatService = new ChatService(
                knowledgeRepository,
                restTemplate,
                new ObjectMapper(),
                "test-key",
                "https://example.com"
        );

        String reply = chatService.chat("How do I write Java code?");

        assertThat(reply).isEqualTo("I don't have information about that yet.");
        verifyNoInteractions(knowledgeRepository, restTemplate);
    }

    @Test
    void answersGreetingWithoutCallingDatabaseOrOpenAi() {
        KnowledgeRepository knowledgeRepository = mock(KnowledgeRepository.class);
        RestTemplate restTemplate = mock(RestTemplate.class);
        ChatService chatService = new ChatService(
                knowledgeRepository,
                restTemplate,
                new ObjectMapper(),
                "test-key",
                "https://example.com"
        );

        String reply = chatService.chat("hello");

        assertThat(reply).contains("MQ student culture");
        verifyNoInteractions(knowledgeRepository, restTemplate);
    }
}
