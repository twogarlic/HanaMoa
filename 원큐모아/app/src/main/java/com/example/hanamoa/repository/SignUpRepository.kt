package com.example.hanamoa.repository

import com.example.hanamoa.network.ApiServiceManager
import com.example.hanamoa.network.models.SignUpRequest
import com.example.hanamoa.network.models.PhoneVerificationRequest
import com.example.hanamoa.network.models.CodeVerificationRequest
import com.example.hanamoa.viewmodel.SignUpData
import com.example.hanamoa.data.Result as AppResult

class SignUpRepository : BaseRepository() {
    
    suspend fun signUp(userData: SignUpData): AppResult<UserInfo> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getAuthApiService().signUp(
                SignUpRequest(
                    userData.name,
                    userData.email,
                    userData.phoneNumber,
                    userData.password,
                    userData.profileImage
                )
            )
            UserInfo(
                name = response.data?.name ?: "",
                email = response.data?.email ?: "",
                profileImage = response.data?.profileImage ?: ""
            )
        }
    }
    
    suspend fun sendVerificationCode(phoneNumber: String): AppResult<VerificationResponse> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getAuthApiService().sendVerificationCode(PhoneVerificationRequest(phoneNumber))
            VerificationResponse(
                success = response.success,
                message = response.message
            )
        }
    }
    
    suspend fun verifyCode(phoneNumber: String, code: String): AppResult<VerificationResponse> {
        return safeApiCall {
            val response = ApiServiceManager.getInstance().getAuthApiService().verifyCode(CodeVerificationRequest(phoneNumber, code))
            VerificationResponse(
                success = response.success,
                message = response.message
            )
        }
    }
}

data class UserInfo(
    val name: String,
    val email: String,
    val profileImage: String
)

data class VerificationResponse(
    val success: Boolean,
    val message: String?
)
