package com.chatbot.service;

import com.chatbot.model.MqEvent;
import com.chatbot.model.MqEventsResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MqEventService {

    private static final String MQ_EVENTS_URL = "https://www.mq.edu.au/about/about-the-university/events";
    private static final String MQ_BROWSE_EVENTS_URL = MQ_EVENTS_URL;

    public MqEventsResponse getEvents() {
        return new MqEventsResponse(
                "Macquarie University Events",
                MQ_EVENTS_URL,
                MQ_BROWSE_EVENTS_URL,
                "Official MQ source",
                List.of(
                        new MqEvent(
                                "2026 MND Gala Dinner",
                                "Friday 26 June 2026",
                                "6.30pm - 11pm",
                                "Macquarie University",
                                "Community",
                                "An MQ event supporting the Macquarie University Centre for Motor Neuron Disease Research.",
                                "https://event.mq.edu.au/2026-mnd-gala"
                        ),
                        new MqEvent(
                                "Discover Lecture Series",
                                "Thursday 25 June 2026",
                                "6.15pm - 7.30pm",
                                "Macquarie University",
                                "Public lecture",
                                "Upcoming MQ Discover Lecture Series session from the Faculty of Science and Engineering.",
                                "https://event.mq.edu.au/discover-lecture-series/"
                        ),
                        new MqEvent(
                                "Open Day 2026",
                                "Saturday 15 August 2026",
                                "10am - 4pm",
                                "Macquarie University",
                                "Future students",
                                "MQ Open Day for exploring campus, degrees, facilities, and student life.",
                                "https://event.mq.edu.au/open-day/"
                        )
                )
        );
    }
}
