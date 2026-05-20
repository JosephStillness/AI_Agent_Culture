package com.chatbot.service;

import com.chatbot.model.MqEventsResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MqEventServiceTest {

    @Test
    void returnsOfficialMqEventLinks() {
        MqEventService service = new MqEventService();

        MqEventsResponse response = service.getEvents();

        assertThat(response.getSourceUrl()).isEqualTo("https://www.mq.edu.au/about/about-the-university/events");
        assertThat(response.getBrowseUrl()).isEqualTo("https://www.mq.edu.au/about/about-the-university/events");
        assertThat(response.getEvents()).isNotEmpty();
        assertThat(response.getEvents())
                .allSatisfy(event -> assertThat(event.getUrl()).contains("event.mq.edu.au"));
    }
}
