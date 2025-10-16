package com.example.hanamoa.repository

import com.example.hanamoa.network.ApiServiceManager
import com.example.hanamoa.network.models.AccountInfo
import com.example.hanamoa.data.Result as AppResult

class MenuRepository : BaseRepository() {
    
    suspend fun getUserInfo(userId: String): AppResult<UserInfo> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getUserApiService().getUserInfo(userId)
            UserInfo(
                name = response.data?.name ?: "",
                email = response.data?.email ?: "",
                profileImage = response.data?.profileImage ?: ""
            )
        }
    }
    
    suspend fun getAccountInfo(userId: String): AppResult<AccountInfo> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getUserApiService().getUserAccounts(userId)
            val account = response.data?.firstOrNull()
            AccountInfo(
                accountNumber = account?.accountNumber ?: "",
                balance = account?.balance ?: 0.0
            )
        }
    }
}

