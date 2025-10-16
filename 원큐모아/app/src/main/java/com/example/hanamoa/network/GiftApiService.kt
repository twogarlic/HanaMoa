package com.example.hanamoa.network

import com.example.hanamoa.network.models.*
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Body

interface GiftApiService {
    
    @GET("gifts")
    suspend fun getGifts(): ApiResponse<List<Gift>>
    
    @POST("gifts/send")
    suspend fun sendGift(@Body request: SendGiftRequest): ApiResponse<SendGiftResponse>
}

