package com.example.hanamoa.repository

import com.example.hanamoa.network.ApiServiceManager
import com.example.hanamoa.network.models.LoginRequest
import com.example.hanamoa.network.models.SocialLoginRequest
import com.example.hanamoa.data.Result as AppResult

class LoginRepository : BaseRepository() {
    
    suspend fun login(userId: String, password: String): AppResult<UserInfo> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getAuthApiService().login(LoginRequest(userId, password))
            UserInfo(
                name = response.data?.name ?: "",
                email = response.data?.email ?: "",
                profileImage = response.data?.profileImage ?: ""
            )
        }
    }
    
    suspend fun socialLogin(provider: String, token: String): AppResult<UserInfo> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getAuthApiService().socialLogin(SocialLoginRequest(provider, token))
            UserInfo(
                name = response.data?.name ?: "",
                email = response.data?.email ?: "",
                profileImage = response.data?.profileImage ?: ""
            )
        }
    }
}
