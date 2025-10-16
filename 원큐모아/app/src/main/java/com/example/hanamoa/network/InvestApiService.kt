package com.example.hanamoa.network

import com.example.hanamoa.network.models.*
import retrofit2.http.GET
import retrofit2.http.Path

interface InvestApiService {
    
    @GET("assets")
    suspend fun getAssets(): ApiResponse<List<Asset>>
    
    @GET("assets/{assetId}/chart")
    suspend fun getAssetChart(@Path("assetId") assetId: String): ApiResponse<List<ChartData>>
}

