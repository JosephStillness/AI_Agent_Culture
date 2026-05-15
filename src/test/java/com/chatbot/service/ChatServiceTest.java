package com.chatbot.service;

import com.chatbot.model.KnowledgeBase;
import com.chatbot.repository.KnowledgeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

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

    @Test
    void allowsBroadCultureQuestionsToUseKnowledgeBaseAndOpenAi() {
        KnowledgeRepository knowledgeRepository = mock(KnowledgeRepository.class);
        RestTemplate restTemplate = mock(RestTemplate.class);
        ChatService chatService = new ChatService(
                knowledgeRepository,
                restTemplate,
                new ObjectMapper(),
                "test-key",
                "https://example.com"
        );

        when(knowledgeRepository.findAll()).thenReturn(List.of(
                new KnowledgeBase(
                        "Bangladeshi students and MQ group work",
                        "When discussing Bangladeshi students, avoid stereotypes and focus on respectful communication.",
                        "Cultural background"
                )
        ));
        when(restTemplate.postForEntity(eq("https://example.com"), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("""
                        {"choices":[{"message":{"content":"Culture varies by person, so ask respectfully and avoid stereotypes."}}]}
                        """));

        String reply = chatService.chat("how about culture of bangladesh?");

        assertThat(reply).isEqualTo("Culture varies by person, so ask respectfully and avoid stereotypes.");
        verify(knowledgeRepository).findAll();
        verify(restTemplate).postForEntity(eq("https://example.com"), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void blocksCountryFactQuestionsWithoutCultureOrStudentContext() {
        KnowledgeRepository knowledgeRepository = mock(KnowledgeRepository.class);
        RestTemplate restTemplate = mock(RestTemplate.class);
        ChatService chatService = new ChatService(
                knowledgeRepository,
                restTemplate,
                new ObjectMapper(),
                "test-key",
                "https://example.com"
        );

        String reply = chatService.chat("What is the capital of Bangladesh?");

        assertThat(reply).isEqualTo("I don't have information about that yet.");
        verifyNoInteractions(knowledgeRepository, restTemplate);
    }
}
