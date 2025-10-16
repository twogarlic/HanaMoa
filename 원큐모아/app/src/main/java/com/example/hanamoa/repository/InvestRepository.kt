package com.example.hanamoa.repository

import com.example.hanamoa.network.ApiServiceManager
import com.example.hanamoa.network.models.Asset
import com.example.hanamoa.network.models.ChartData
import com.example.hanamoa.data.Result as AppResult

class InvestRepository : BaseRepository() {
    
    suspend fun getAssets(): AppResult<List<Asset>> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getInvestApiService().getAssets()
            response.data ?: emptyList()
        }
    }
    
    suspend fun getChartData(assetId: String): AppResult<List<ChartData>> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getInvestApiService().getAssetChart(assetId)
            response.data ?: emptyList()
        }
    }
}
