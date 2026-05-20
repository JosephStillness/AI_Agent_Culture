package com.chatbot.model;

import java.util.List;

public class MqEventsResponse {

    private String sourceName;
    private String sourceUrl;
    private String browseUrl;
    private String status;
    private List<MqEvent> events;

    public MqEventsResponse() {
    }

    public MqEventsResponse(String sourceName, String sourceUrl, String browseUrl, String status, List<MqEvent> events) {
        this.sourceName = sourceName;
        this.sourceUrl = sourceUrl;
        this.browseUrl = browseUrl;
        this.status = status;
        this.events = events;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public String getBrowseUrl() {
        return browseUrl;
    }

    public void setBrowseUrl(String browseUrl) {
        this.browseUrl = browseUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<MqEvent> getEvents() {
        return events;
    }

    public void setEvents(List<MqEvent> events) {
        this.events = events;
    }
}
