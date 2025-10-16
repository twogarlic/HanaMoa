package com.example.hanamoa.repository

import com.example.hanamoa.network.ApiServiceManager
import com.example.hanamoa.network.models.UserInfo
import com.example.hanamoa.network.models.Account
import com.example.hanamoa.network.models.Notification
import com.example.hanamoa.data.Result as AppResult

class HomeRepository : BaseRepository() {

    suspend fun getUserAccounts(userId: String): AppResult<AccountsResponse> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getUserApiService().getUserAccounts(userId)
            AccountsResponse(
                success = response.success,
                accounts = response.data ?: emptyList(),
                message = response.message
            )
        }
    }

    suspend fun checkAuth(userId: String): AppResult<AuthResponse> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getUserApiService().getUserInfo(userId)
            AuthResponse(
                success = response.success,
                data = response.data,
                message = response.message
            )
        }
    }

    suspend fun getAllNotifications(userId: String): AppResult<NotificationsResponse> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getUserApiService().getAllNotifications(userId)
            NotificationsResponse(
                success = response.success,
                data = response.data,
                message = response.message
            )
        }
    }
}

data class AccountsResponse(
    val success: Boolean,
    val accounts: List<Account>,
    val message: String?
)

data class AuthResponse(
    val success: Boolean,
    val data: UserInfo?,
    val message: String?
)

data class NotificationsResponse(
    val success: Boolean,
    val data: List<Notification>?,
    val message: String?
)
