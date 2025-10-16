package com.example.hanamoa.network

import com.example.hanamoa.network.models.*
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<LoginResponse>
    
    @POST("auth/signup")
    suspend fun signUp(@Body request: SignUpRequest): ApiResponse<SignUpResponse>
    
    @POST("auth/social-login")
    suspend fun socialLogin(@Body request: SocialLoginRequest): ApiResponse<SocialLoginResponse>
    
    @POST("auth/verify-phone")
    suspend fun sendVerificationCode(@Body request: PhoneVerificationRequest): ApiResponse<PhoneVerificationResponse>
    
    @POST("auth/verify-code")
    suspend fun verifyCode(@Body request: CodeVerificationRequest): ApiResponse<CodeVerificationResponse>
}

