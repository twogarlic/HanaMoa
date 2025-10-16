package com.example.hanamoa.viewmodel

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.hanamoa.base.BaseViewModel
import com.example.hanamoa.data.Result as AppResult
import com.example.hanamoa.repository.HomeActivityRepository
import kotlinx.coroutines.launch

class HomeActivityViewModel : BaseViewModel() {
    
    private lateinit var repository: HomeActivityRepository
    private lateinit var sharedPreferences: SharedPreferences

    private val _selectedNavigationIndex = MutableLiveData<Int>()
    val selectedNavigationIndex: LiveData<Int> = _selectedNavigationIndex
    
    private val _isLoggedIn = MutableLiveData<Boolean>()
    val isLoggedIn: LiveData<Boolean> = _isLoggedIn
    
    private val _fcmToken = MutableLiveData<String>()
    val fcmToken: LiveData<String> = _fcmToken
    
    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: MutableLiveData<String?> = _errorMessage

    fun init(context: Context) {
        repository = HomeActivityRepository()
        sharedPreferences = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        checkLoginStatus()
    }

    private fun checkLoginStatus() {
        val isLoggedIn = sharedPreferences.getBoolean("is_logged_in", false)
        _isLoggedIn.value = isLoggedIn
    }

    fun updateNavigationIndex(index: Int) {
        _selectedNavigationIndex.value = index
    }

    fun saveFCMToken(token: String) {
        _fcmToken.value = token
        val userId = getUserId()
        
        if (userId.isNotEmpty()) {
            launchSafe {
                val result = repository.saveFCMToken(userId, token)
                when (result) {
                    is AppResult.Success -> {
                    }
                    is AppResult.Error -> {
                        _errorMessage.value = "FCM 토큰 저장 실패: ${result.exception.message}"
                    }
                    is AppResult.Loading -> {
                    }
                }
            }
        }
    }

    private fun getUserId(): String {
        return sharedPreferences.getString("user_id", "") ?: ""
    }

    fun clearErrorMessage() {
        _errorMessage.value = null
    }
}
