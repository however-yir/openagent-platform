package com.demo.graph.client.config;

import com.demo.graph.client.api.ComfyuiApi;
import com.demo.graph.client.handler.ComfyuiMessageHandler;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.WebSocketConnectionManager;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import retrofit2.Retrofit;
import retrofit2.converter.jackson.JacksonConverterFactory;

import java.util.concurrent.TimeUnit;

@Configuration
public class ComfyuiConfig {

    private final ComfyuiProperties properties;

    public ComfyuiConfig(ComfyuiProperties properties) {
        this.properties = properties;
    }

    @Bean
    public ComfyuiApi comfyuiApi(){
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        try {
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.valueOf(properties.getHttpLogLevel()));
        } catch (IllegalArgumentException ex) {
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
        }

        OkHttpClient okHttpClient = new OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .retryOnConnectionFailure(true)
                .connectTimeout(properties.getConnectTimeoutSeconds(), TimeUnit.SECONDS)
                .build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(properties.getBaseUrl())
                .client(okHttpClient)
                .addConverterFactory(JacksonConverterFactory.create())
                .build();
        ComfyuiApi comfyuiApi = retrofit.create(ComfyuiApi.class);
        return comfyuiApi;
    }

    @Bean
    public WebSocketConnectionManager webSocketConnectionManager(ComfyuiMessageHandler comfyuiMessageHandler) {
        WebSocketClient client = new StandardWebSocketClient();
        String url = properties.getWsUrl();
        WebSocketConnectionManager manager = new WebSocketConnectionManager(client,comfyuiMessageHandler,url);
        manager.start();
        return manager;
    }
}
