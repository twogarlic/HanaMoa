package com.example.hanamoa.repository

import com.example.hanamoa.network.ApiServiceManager
import com.example.hanamoa.network.models.FCMTokenRequest
import com.example.hanamoa.data.Result as AppResult

class HomeActivityRepository : BaseRepository() {
    
    suspend fun saveFCMToken(userId: String, token: String): AppResult<FCMTokenResponse> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getUserApiService().saveFCMToken(userId, FCMTokenRequest(token))
            FCMTokenResponse(
                success = response.success,
                message = response.message
            )
        }
    }
}

data class FCMTokenResponse(
    val success: Boolean,
    val message: String?
)
