package com.example.hanamoa.network

import android.content.Context

class ApiServiceManager private constructor() {
    
    companion object {
        @Volatile
        private var INSTANCE: ApiServiceManager? = null
        
        fun getInstance(): ApiServiceManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: ApiServiceManager().also { INSTANCE = it }
            }
        }
    }
    
    private var authApiService: AuthApiService? = null
    private var userApiService: UserApiService? = null
    private var investApiService: InvestApiService? = null
    private var giftApiService: GiftApiService? = null
    private var exchangeApiService: ExchangeApiService? = null
    
    fun init(context: Context) {
        ApiConfig.init(context)
        val retrofit = ApiConfig.getBaseUrl()?.let { NetworkModule.createRetrofit(it) }

        authApiService = retrofit?.create(AuthApiService::class.java)
        userApiService = retrofit?.create(UserApiService::class.java)
        investApiService = retrofit?.create(InvestApiService::class.java)
        giftApiService = retrofit?.create(GiftApiService::class.java)
        exchangeApiService = retrofit?.create(ExchangeApiService::class.java)
    }
    
    fun getAuthApiService(): AuthApiService {
        return authApiService ?: throw IllegalStateException("ApiServiceManager not initialized")
    }
    
    fun getUserApiService(): UserApiService {
        return userApiService ?: throw IllegalStateException("ApiServiceManager not initialized")
    }
    
    fun getInvestApiService(): InvestApiService {
        return investApiService ?: throw IllegalStateException("ApiServiceManager not initialized")
    }
    
    fun getGiftApiService(): GiftApiService {
        return giftApiService ?: throw IllegalStateException("ApiServiceManager not initialized")
    }
    
    fun getExchangeApiService(): ExchangeApiService {
        return exchangeApiService ?: throw IllegalStateException("ApiServiceManager not initialized")
    }
}
