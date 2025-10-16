package com.example.hanamoa.network

import com.example.hanamoa.network.models.*
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Body

interface ExchangeApiService {
    
    @GET("exchange/rates")
    suspend fun getExchangeRates(): ApiResponse<List<ExchangeRate>>
    
    @POST("exchange/convert")
    suspend fun convertCurrency(@Body request: ConvertCurrencyRequest): ApiResponse<ConvertCurrencyResponse>
}

