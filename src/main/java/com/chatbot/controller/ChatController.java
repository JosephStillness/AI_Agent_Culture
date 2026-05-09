package com.chatbot.controller;

import com.chatbot.model.ChatRequest;
import com.chatbot.model.ChatResponse;
import com.chatbot.service.AiServiceException;
import com.chatbot.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        try {
            String message = request.getMessage() == null ? "" : request.getMessage();
            return ResponseEntity.ok(new ChatResponse(chatService.chat(message)));
        } catch (AiServiceException exception) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "AI service unavailable"));
        }
    }
}
