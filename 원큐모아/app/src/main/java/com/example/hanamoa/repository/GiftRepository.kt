package com.example.hanamoa.repository

import com.example.hanamoa.network.ApiServiceManager
import com.example.hanamoa.network.models.Gift
import com.example.hanamoa.network.models.SendGiftRequest
import com.example.hanamoa.data.Result as AppResult

class GiftRepository : BaseRepository() {
    
    suspend fun getGifts(): AppResult<List<Gift>> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getGiftApiService().getGifts()
            response.data ?: emptyList()
        }
    }
    
    suspend fun sendGift(giftId: String, recipientId: String): AppResult<GiftResponse> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getGiftApiService().sendGift(SendGiftRequest(giftId, recipientId))
            GiftResponse(
                success = response.success,
                message = response.message
            )
        }
    }
}

data class GiftResponse(
    val success: Boolean,
    val message: String?
)
