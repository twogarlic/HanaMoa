package com.example.hanamoa.repository

import com.example.hanamoa.network.ApiServiceManager
import com.example.hanamoa.network.models.ExchangeRate
import com.example.hanamoa.network.models.ConvertCurrencyRequest
import com.example.hanamoa.data.Result as AppResult

class ExchangeRepository : BaseRepository() {
    
    suspend fun getExchangeRates(): AppResult<List<ExchangeRate>> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getExchangeApiService().getExchangeRates()
            response.data ?: emptyList()
        }
    }
    
    suspend fun convertCurrency(fromCurrency: String, toCurrency: String, amount: Double): AppResult<Double> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getExchangeApiService().convertCurrency(ConvertCurrencyRequest(fromCurrency, toCurrency, amount))
            response.data?.convertedAmount ?: 0.0
        }
    }
}
