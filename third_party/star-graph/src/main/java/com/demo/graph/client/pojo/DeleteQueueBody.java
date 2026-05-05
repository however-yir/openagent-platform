package com.demo.graph.client.pojo;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DeleteQueueBody {
    List<String> delete;
}
