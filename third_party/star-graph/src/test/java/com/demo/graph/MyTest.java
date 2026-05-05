package com.demo.graph;

import cn.hutool.json.JSONUtil;
import com.demo.graph.client.api.ComfyuiApi;
import com.demo.graph.client.pojo.ComfyuiRequestDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.lang.reflect.Field;

@SpringBootTest
@EnabledIfEnvironmentVariable(named = "RUN_COMFYUI_INTEGRATION_TESTS", matches = "true")
public class MyTest {
    @Autowired
    private ComfyuiApi comfyuiApi;

    @Test
    public void test1() throws Exception {
        HashMap body = comfyuiApi.getHistoryTasks(2).execute().body();
        System.out.println("body = " + body);
    }


    @Test
    public void test2() throws Exception {
        ComfyuiRequestDto dto = new ComfyuiRequestDto();
        setField(dto, "clientId", "star-graph");
        String json = """
                {
                  "1": {
                    "inputs": {
                      "image": "oldphoto2.png"
                    },
                    "class_type": "LoadImage",
                    "_meta": {
                      "title": "加载图像"
                    }
                  },
                  "2": {
                    "inputs": {
                      "upscale_model": [
                        "3",
                        0
                      ],
                      "image": [
                        "1",
                        0
                      ]
                    },
                    "class_type": "ImageUpscaleWithModel",
                    "_meta": {
                      "title": "使用模型放大图像"
                    }
                  },
                  "3": {
                    "inputs": {
                      "model_name": "通用BSRGANx4.pth"
                    },
                    "class_type": "UpscaleModelLoader",
                    "_meta": {
                      "title": "加载放大模型"
                    }
                  },
                  "4": {
                    "inputs": {
                      "images": [
                        "2",
                        0
                      ]
                    },
                    "class_type": "PreviewImage",
                    "_meta": {
                      "title": "预览图像"
                    }
                  }
                }
                """;
        setField(dto, "prompt", JSONUtil.parseObj(json));
        HashMap body = comfyuiApi.addQueueTask(dto).execute().body();
        System.out.println("body = " + body);
    }

    private void setField(Object target, String fieldName, Object value) throws ReflectiveOperationException {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
