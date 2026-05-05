package com.demo.graph.client.api;

import com.demo.graph.client.pojo.ComfyuiRequestDto;
import com.demo.graph.client.pojo.DeleteQueueBody;
import com.demo.graph.client.pojo.QueueTaskCount;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.*;

import java.util.HashMap;

public interface ComfyuiApi {

    /**
     * 获取历史任务
     * @param maxItems  获取的条数
     * @return
     */
    @GET("/history")
    Call<HashMap> getHistoryTasks(@Query("max_items") int maxItems);

    /**
     * 获取预览的图片信息
     * @param filename  文件名
     * @param type      文件类型，input/output
     * @param subfolder 字文件夹名
     * @return
     */
    @GET("/view")
    Call<ResponseBody> getView(@Query("filename") String filename, @Query("type") String type, @Query("subfolder") String subfolder);

    /**
     * 获取系统信息
     * @return
     */
    @GET("/system_stats")
    Call<HashMap> getSystemStats();

    /**
     * 获取某个节点配置
     * @return
     */
    @GET("/object_info/{nodeName}")
    Call<HashMap> getNodeInfo(@Path("nodeName") String nodeName);

    /**
     * 取消当前的任务
     * @return
     */
    @GET("/interrupt")
    Call<HashMap> interruptTask();

    /**
     * 获取队列中的任务信息
     * @return
     */
    @GET("/queue")
    Call<HashMap> getQueueTasks();

    /**
     * 获取队列中的任务信息
     * @return
     */
    @POST("/queue")
    Call<HashMap> deleteQueueTasks(@Body DeleteQueueBody body);

    /**
     * 获取队列中任务数量
     * @return
     */
    @GET("/prompt")
    Call<QueueTaskCount> getQueueTaskCount();

    /**
     * 添加流程任务
     * @return
     */
    @POST("/prompt")
    Call<HashMap> addQueueTask(@Body ComfyuiRequestDto body);

    /**
     * 上传图片
     * @return
     */
    @Multipart
    @POST("/upload/image")
    Call<HashMap> uploadImage(@Part MultipartBody.Part image);

    /**
     * 上传图片
     * @return
     */
    @Multipart
    @POST("/upload/mask")
    Call<HashMap> uploadMask(@Part MultipartBody.Part image,@Part("type") RequestBody type,@Part("subfolder") RequestBody subfolder,@Part("original_ref") RequestBody originalRef);

    /**
     * 获取某个历史任务
     * @param promptId  任务ID
     * @return
     */
    @GET("/history/{promptId}")
    Call<HashMap> getHistoryTask(@Path("promptId") String promptId);

}
