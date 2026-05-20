package com.chatbot.controller;

import com.chatbot.model.MqEventsResponse;
import com.chatbot.service.MqEventService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mq-events")
public class MqEventController {

    private final MqEventService mqEventService;

    public MqEventController(MqEventService mqEventService) {
        this.mqEventService = mqEventService;
    }

    @GetMapping
    public MqEventsResponse getMqEvents() {
        return mqEventService.getEvents();
    }
}
