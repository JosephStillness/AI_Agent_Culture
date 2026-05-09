package com.chatbot.service;

import com.chatbot.model.KnowledgeBase;
import com.chatbot.repository.KnowledgeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final String MODEL = "gpt-4o-mini";
    private static final int MAX_TOKENS = 500;

    private final KnowledgeRepository knowledgeRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String openAiApiKey;
    private final String openAiApiUrl;

    public ChatService(
            KnowledgeRepository knowledgeRepository,
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            @Value("${openai.api.key}") String openAiApiKey,
            @Value("${openai.api.url}") String openAiApiUrl
    ) {
        this.knowledgeRepository = knowledgeRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.openAiApiKey = openAiApiKey;
        this.openAiApiUrl = openAiApiUrl;
    }

    public String chat(String userMessage) {
        String knowledgeContext = buildKnowledgeContext();
        String systemPrompt = buildSystemPrompt(knowledgeContext);

        Map<String, Object> requestBody = Map.of(
                "model", MODEL,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "max_tokens", MAX_TOKENS
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    openAiApiUrl,
                    new HttpEntity<>(requestBody, headers),
                    String.class
            );

            return parseAssistantReply(response.getBody());
        } catch (Exception exception) {
            throw new AiServiceException("AI service unavailable", exception);
        }
    }

    private String buildKnowledgeContext() {
        List<KnowledgeBase> entries = knowledgeRepository.findAll();

        if (entries.isEmpty()) {
            return "No knowledge is available yet.";
        }

        return entries.stream()
                .map(KnowledgeBase::getContent)
                .collect(Collectors.joining("\n\n"));
    }

    private String buildSystemPrompt(String knowledgeContext) {
        return """
                You are a helpful assistant with knowledge about student life and culture
                at Macquarie University (MQ) in Sydney, Australia. Answer questions ONLY
                based on the following knowledge base provided. If the answer is not found
                in the knowledge base, say: 'I don't have information about that yet.'
                Do not make up information. Be friendly and concise.

                Knowledge base:
                %s""".formatted(knowledgeContext);
    }

    private String parseAssistantReply(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        return root.path("choices")
                .path(0)
                .path("message")
                .path("content")
                .asText("I don't have information about that yet.");
    }
}
