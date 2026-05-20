package com.chatbot.model;

public class MqEvent {

    private String title;
    private String date;
    private String time;
    private String location;
    private String audience;
    private String description;
    private String url;

    public MqEvent() {
    }

    public MqEvent(
            String title,
            String date,
            String time,
            String location,
            String audience,
            String description,
            String url
    ) {
        this.title = title;
        this.date = date;
        this.time = time;
        this.location = location;
        this.audience = audience;
        this.description = description;
        this.url = url;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
