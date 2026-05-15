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
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final String MODEL = "gpt-4o-mini";
    private static final int MAX_TOKENS = 500;
    private static final String OUT_OF_SCOPE_REPLY = "I don't have information about that yet.";
    private static final String GREETING_REPLY = "Hi! I can help with MQ student culture, cultural background, belonging, cultural misunderstanding, group work communication, and responsible culture-chatbot behaviour.";
    private static final List<String> CULTURE_TOPIC_KEYWORDS = List.of(
            "culture",
            "cultural",
            "custom",
            "customs",
            "tradition",
            "traditions",
            "norm",
            "norms",
            "etiquette",
            "identity",
            "background",
            "heritage",
            "values",
            "belief",
            "beliefs",
            "intercultural",
            "cross-cultural",
            "multicultural",
            "diversity",
            "diverse",
            "stereotype",
            "stereotypes",
            "bias",
            "fairness",
            "respect",
            "respectful",
            "misunderstanding",
            "communication",
            "feedback",
            "language",
            "english",
            "accent",
            "culture shock",
            "adjust",
            "adjustment",
            "adapt",
            "adaptation",
            "belonging",
            "belong",
            "lonely",
            "loneliness",
            "isolated",
            "isolation",
            "homesick",
            "homesickness",
            "friend",
            "friends",
            "connection",
            "community",
            "support",
            "supportive",
            "activity",
            "activities",
            "check-in",
            "check in",
            "sharing",
            "share",
            "challenge",
            "challenges",
            "next step",
            "feel noticed",
            "noticed",
            "peer",
            "peers",
            "club",
            "clubs",
            "group work",
            "work together",
            "working together",
            "collaborate",
            "collaboration",
            "teammate",
            "teammates",
            "team",
            "teamwork",
            "included",
            "include",
            "inclusion",
            "deadline",
            "deadlines",
            "leadership",
            "meeting",
            "meetings",
            "roles",
            "decision-making",
            "class participation",
            "participation",
            "responsible",
            "safe"
    );
    private static final List<String> STUDENT_CONTEXT_KEYWORDS = List.of(
            "mq",
            "macquarie",
            "student",
            "students",
            "student life",
            "campus",
            "university",
            "sydney",
            "class",
            "classroom",
            "assignment",
            "lecturer",
            "tutor",
            "international",
            "domestic",
            "group work",
            "teamwork",
            "peer",
            "peers",
            "club",
            "clubs",
            "orientation",
            "study",
            "studying"
    );
    private static final List<String> CULTURAL_BACKGROUND_KEYWORDS = List.of(
            "bangladesh",
            "bangladeshi",
            "vietnam",
            "vietnamese",
            "china",
            "chinese",
            "india",
            "indian",
            "indonesia",
            "indonesian",
            "nepal",
            "nepali",
            "pakistan",
            "pakistani",
            "sri lanka",
            "sri lankan",
            "korea",
            "korean",
            "japan",
            "japanese",
            "malaysia",
            "malaysian",
            "singapore",
            "singaporean",
            "thailand",
            "thai",
            "philippines",
            "filipino",
            "australia",
            "australian",
            "first nations",
            "aboriginal",
            "arab",
            "middle eastern",
            "african",
            "european",
            "latin",
            "latino",
            "latina",
            "hispanic",
            "muslim",
            "islam",
            "hindu",
            "buddhist",
            "christian",
            "faith",
            "religion"
    );
    private static final List<String> OUT_OF_SCOPE_KEYWORDS = List.of(
            "code",
            "coding",
            "programming",
            "java",
            "spring",
            "spring boot",
            "python",
            "javascript",
            "react",
            "html",
            "css",
            "sql",
            "database",
            "api",
            "algorithm",
            "debug",
            "bug",
            "error",
            "deploy",
            "deployment",
            "github",
            "maven",
            "math",
            "calculate",
            "medical",
            "legal",
            "finance",
            "financial"
    );

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
        if (userMessage == null || userMessage.isBlank()) {
            return OUT_OF_SCOPE_REPLY;
        }

        if (isGreeting(userMessage)) {
            return GREETING_REPLY;
        }

        if (!isCultureScope(userMessage)) {
            return OUT_OF_SCOPE_REPLY;
        }

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
                You are a helpful culture-support assistant for students at Macquarie
                University (MQ) in Sydney, Australia. Answer questions ONLY based on
                the following knowledge base provided.

                Scope rules:
                - Answer culture-related student questions even when the wording is
                  broad or imperfect. This includes cultural background, country or
                  community culture, customs, communication norms, belonging,
                  adaptation, language confidence, respectful group work, cultural
                  misunderstanding, student isolation, community connection, and
                  responsible behaviour for a culture-support chatbot.
                - If a question mentions a country, nationality, faith, or cultural
                  group, do not give encyclopedia-style facts. Frame the answer as
                  careful student-support guidance, avoid stereotypes, and mention
                  that individuals vary.
                - Do not invent country-specific details such as traditions, food,
                  festivals, religion, language, history, or values unless those
                  details are in the knowledge base. For broad country/culture
                  questions, focus on the relevant culture-support guidance that is
                  available.
                - Do not answer questions about coding, programming, deployment,
                  general technology, maths, legal, medical, financial, or other
                  unrelated topics.
                - If the answer is outside culture/student scope or not supported by
                  the knowledge base, say exactly: 'I don't have information about that yet.'
                - Do not make up information. Be friendly and concise.

                Knowledge base:
                %s""".formatted(knowledgeContext);
    }

    private String parseAssistantReply(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        return root.path("choices")
                .path(0)
                .path("message")
                .path("content")
                .asText(OUT_OF_SCOPE_REPLY);
    }

    private boolean isCultureScope(String userMessage) {
        String normalizedMessage = normalize(userMessage);

        boolean asksOutOfScopeTopic = OUT_OF_SCOPE_KEYWORDS.stream()
                .anyMatch(normalizedMessage::contains);

        if (asksOutOfScopeTopic) {
            return false;
        }

        boolean asksCultureTopic = CULTURE_TOPIC_KEYWORDS.stream()
                .anyMatch(normalizedMessage::contains);
        boolean asksStudentContext = STUDENT_CONTEXT_KEYWORDS.stream()
                .anyMatch(normalizedMessage::contains);
        boolean mentionsCulturalBackground = CULTURAL_BACKGROUND_KEYWORDS.stream()
                .anyMatch(normalizedMessage::contains);

        return asksCultureTopic || (asksStudentContext && mentionsCulturalBackground);
    }

    private boolean isGreeting(String userMessage) {
        String normalizedMessage = normalize(userMessage);
        return normalizedMessage.equals("hi")
                || normalizedMessage.equals("hello")
                || normalizedMessage.equals("hey")
                || normalizedMessage.equals("xin chao")
                || normalizedMessage.equals("chao");
    }

    private String normalize(String value) {
        return value.toLowerCase(Locale.ROOT).trim();
    }
}
