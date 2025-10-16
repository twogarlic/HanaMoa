package com.example.hanamoa.viewmodel

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.hanamoa.base.BaseViewModel
import com.example.hanamoa.data.Result as AppResult
import com.example.hanamoa.repository.LoginRepository
import com.example.hanamoa.repository.UserInfo
import kotlinx.coroutines.launch

class LoginViewModel : BaseViewModel() {
    
    private lateinit var repository: LoginRepository
    private lateinit var sharedPreferences: SharedPreferences
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _loginSuccess = MutableLiveData<Boolean>()
    val loginSuccess: LiveData<Boolean> = _loginSuccess

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: MutableLiveData<String?> = _errorMessage
    
    fun init(context: Context) {
        repository = LoginRepository()
        sharedPreferences = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
    }
    
    fun login(userId: String, password: String) {
        launchSafe {
            _isLoading.value = true
            
            val result = repository.login(userId, password)
            
            when (result) {
                is AppResult.Success -> {
                    saveLoginInfo(result.data)
                    _loginSuccess.value = true
                }
                is AppResult.Error -> {
                    _errorMessage.value = "로그인에 실패했습니다"
                }
                is AppResult.Loading -> {
                }
            }
            
            _isLoading.value = false
        }
    }
    
    fun socialLogin(provider: String, token: String) {
        launchSafe {
            _isLoading.value = true
            
            val result = repository.socialLogin(provider, token)
            
            when (result) {
                is AppResult.Success -> {
                    saveLoginInfo(result.data)
                    _loginSuccess.value = true
                }
                is AppResult.Error -> {
                    _errorMessage.value = "소셜 로그인에 실패했습니다"
                }
                is AppResult.Loading -> {
                }
            }
            
            _isLoading.value = false
        }
    }
    
    private fun saveLoginInfo(userInfo: UserInfo) {
        sharedPreferences.edit().apply {
            putBoolean("is_logged_in", true)
            putString("user_id", "default_user_id")
            putString("user_name", userInfo.name)
            putString("user_email", userInfo.email)
            putString("profile_image", userInfo.profileImage)
            apply()
        }
    }
    
    fun clearErrorMessage() {
        _errorMessage.value = null
    }
    
    fun clearLoginSuccess() {
        _loginSuccess.value = false
    }
}
