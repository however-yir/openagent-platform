package com.demo.graph.client.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ComfyuiRequestDto {

    @JsonProperty("client_id")
    String clientId;
    Object prompt;

}
