package com.example.hanamoa.viewmodel

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.hanamoa.base.BaseViewModel
import com.example.hanamoa.data.Result as AppResult
import com.example.hanamoa.repository.MenuRepository
import com.example.hanamoa.repository.UserInfo
import com.example.hanamoa.repository.AccountInfo
import kotlinx.coroutines.launch

class MenuViewModel : BaseViewModel() {
    
    private lateinit var repository: MenuRepository
    private lateinit var sharedPreferences: SharedPreferences
    
    private val _userInfo = MutableLiveData<UserInfo>()
    val userInfo: LiveData<UserInfo> = _userInfo
    
    private val _accountInfo = MutableLiveData<AccountInfo>()
    val accountInfo: LiveData<AccountInfo> = _accountInfo
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: MutableLiveData<String?> = _errorMessage
    
    fun init(context: Context) {
        repository = MenuRepository()
        sharedPreferences = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        loadUserData()
    }
    
    fun loadUserData() {
        launchSafe {
            _isLoading.value = true
            
            val userId = sharedPreferences.getString("user_id", null)
            if (userId != null) {
                val userResult = repository.getUserInfo(userId)
                val accountResult = repository.getAccountInfo(userId)
                
                when (userResult) {
                    is AppResult.Success -> {
                        _userInfo.value = userResult.data
                    }
                    is AppResult.Error -> {
                        _errorMessage.value = "사용자 정보를 불러올 수 없습니다"
                    }
                    is AppResult.Loading -> {
                    }
                }
                
                when (accountResult) {
                    is AppResult.Success -> {
                        _accountInfo.value = accountResult.data
                    }
                    is AppResult.Error -> {
                        _errorMessage.value = "계좌 정보를 불러올 수 없습니다"
                    }
                    is AppResult.Loading -> {
                    }
                }
            }
            
            _isLoading.value = false
        }
    }
    
    fun logout() {
        sharedPreferences.edit().clear().apply()
    }
    
    fun clearErrorMessage() {
        _errorMessage.value = null
    }
}
