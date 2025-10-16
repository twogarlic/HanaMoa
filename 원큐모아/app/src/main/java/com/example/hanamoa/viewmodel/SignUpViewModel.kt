package com.example.hanamoa.viewmodel

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.hanamoa.base.BaseViewModel
import com.example.hanamoa.data.Result as AppResult
import com.example.hanamoa.repository.SignUpRepository
import com.example.hanamoa.repository.UserInfo
import kotlinx.coroutines.launch

class SignUpViewModel : BaseViewModel() {
    
    private lateinit var repository: SignUpRepository
    private lateinit var sharedPreferences: SharedPreferences
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _signUpSuccess = MutableLiveData<Boolean>()
    val signUpSuccess: LiveData<Boolean> = _signUpSuccess

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: MutableLiveData<String?> = _errorMessage
    
    private val _currentStep = MutableLiveData<Int>()
    val currentStep: LiveData<Int> = _currentStep
    
    fun init(context: Context) {
        repository = SignUpRepository()
        sharedPreferences = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        _currentStep.value = 1
    }
    
    fun nextStep() {
        val current = _currentStep.value ?: 1
        if (current < 5) {
            _currentStep.value = current + 1
        }
    }
    
    fun previousStep() {
        val current = _currentStep.value ?: 1
        if (current > 1) {
            _currentStep.value = current - 1
        }
    }
    
    fun signUp(userData: SignUpData) {
        launchSafe {
            _isLoading.value = true
            
            val result = repository.signUp(userData)
            
            when (result) {
                is AppResult.Success -> {
                    saveSignUpInfo(result.data)
                    _signUpSuccess.value = true
                }
                is AppResult.Error -> {
                    _errorMessage.value = "회원가입에 실패했습니다"
                }
                is AppResult.Loading -> {
                }
            }
            
            _isLoading.value = false
        }
    }
    
    fun verifyPhoneNumber(phoneNumber: String) {
        launchSafe {
            val result = repository.sendVerificationCode(phoneNumber)
            
            when (result) {
                is AppResult.Success -> {
                }
                is AppResult.Error -> {
                    _errorMessage.value = "인증번호 전송에 실패했습니다"
                }
                is AppResult.Loading -> {
                }
            }
        }
    }
    
    fun verifyCode(phoneNumber: String, code: String) {
        launchSafe {
            val result = repository.verifyCode(phoneNumber, code)
            
            when (result) {
                is AppResult.Success -> {
                }
                is AppResult.Error -> {
                    _errorMessage.value = "인증번호가 올바르지 않습니다"
                }
                is AppResult.Loading -> {
                }
            }
        }
    }
    
    private fun saveSignUpInfo(userInfo: UserInfo) {
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
    
    fun clearSignUpSuccess() {
        _signUpSuccess.value = false
    }
}

data class SignUpData(
    val name: String,
    val email: String,
    val phoneNumber: String,
    val password: String,
    val profileImage: String
)
