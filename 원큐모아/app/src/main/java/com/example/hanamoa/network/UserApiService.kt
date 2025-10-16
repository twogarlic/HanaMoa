package com.example.hanamoa.network

import com.example.hanamoa.network.models.*
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Body

interface UserApiService {
    
    @GET("users/{userId}")
    suspend fun getUserInfo(@Path("userId") userId: String): ApiResponse<UserInfo>
    
    @GET("users/{userId}/accounts")
    suspend fun getUserAccounts(@Path("userId") userId: String): ApiResponse<List<Account>>
    
    @GET("users/{userId}/notifications")
    suspend fun getAllNotifications(@Path("userId") userId: String): ApiResponse<List<Notification>>
    
    @POST("users/{userId}/fcm-token")
    suspend fun saveFCMToken(@Path("userId") userId: String, @Body request: FCMTokenRequest): ApiResponse<FCMTokenResponse>
}

