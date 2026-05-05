package com.demo.graph.client.pojo;

import lombok.Data;

import java.util.UUID;

@Data
public class ComfyuiTask {

    String id = UUID.randomUUID().toString();
    String wsClientId;
    ComfyuiRequestDto comfyuiRequestDto;
    String promptId;
    long index;

    public ComfyuiTask(String wsClientId, ComfyuiRequestDto comfyuiRequestDto) {
        this.wsClientId = wsClientId;
        this.comfyuiRequestDto = comfyuiRequestDto;
    }
}
