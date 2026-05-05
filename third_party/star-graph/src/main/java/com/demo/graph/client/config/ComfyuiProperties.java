package com.demo.graph.client.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "comfyui")
public class ComfyuiProperties {

    private String baseUrl = "http://127.0.0.1:8188";
    private String wsUrl = "ws://127.0.0.1:8188/ws?clientId=star-graph";
    private int connectTimeoutSeconds = 30;
    private String httpLogLevel = "BODY";

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getWsUrl() {
        return wsUrl;
    }

    public void setWsUrl(String wsUrl) {
        this.wsUrl = wsUrl;
    }

    public int getConnectTimeoutSeconds() {
        return connectTimeoutSeconds;
    }

    public void setConnectTimeoutSeconds(int connectTimeoutSeconds) {
        this.connectTimeoutSeconds = connectTimeoutSeconds;
    }

    public String getHttpLogLevel() {
        return httpLogLevel;
    }

    public void setHttpLogLevel(String httpLogLevel) {
        this.httpLogLevel = httpLogLevel;
    }
}
