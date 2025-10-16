package com.example.hanamoa.viewmodel

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.hanamoa.base.BaseViewModel
import com.example.hanamoa.data.Result as AppResult
import com.example.hanamoa.repository.HomeRepository
import com.example.hanamoa.repository.AccountInfo
import com.example.hanamoa.repository.UserInfo
import kotlinx.coroutines.launch

class HomeViewModel : BaseViewModel() {
    
    private lateinit var repository: HomeRepository
    private lateinit var sharedPreferences: SharedPreferences

    private val _accountInfo = MutableLiveData<AccountInfo>()
    val accountInfo: LiveData<AccountInfo> = _accountInfo
    
    private val _userInfo = MutableLiveData<UserInfo>()
    val userInfo: LiveData<UserInfo> = _userInfo
    
    private val _notificationCount = MutableLiveData<Int>()
    val notificationCount: LiveData<Int> = _notificationCount
    
    private val _isBalanceHidden = MutableLiveData<Boolean>()
    val isBalanceHidden: LiveData<Boolean> = _isBalanceHidden
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: MutableLiveData<String?> = _errorMessage

    fun init(context: Context) {
        repository = HomeRepository()
        sharedPreferences = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        _isBalanceHidden.value = false
        loadInitialData()
    }

    private fun loadInitialData() {
        loadAccountInfo()
        loadUserInfo()
        loadNotificationCount()
    }

    fun loadAccountInfo() {
        val userId = sharedPreferences.getString("user_id", null)
        
        if (userId == null) {
            _errorMessage.value = "로그인이 필요합니다"
            return
        }

        val savedAccountId = sharedPreferences.getString("account_id", null)
        if (savedAccountId != null) {
            val savedAccount = AccountInfo(
                id = savedAccountId,
                accountNumber = sharedPreferences.getString("account_number", "282-000000-00000") ?: "282-000000-00000",
                accountName = sharedPreferences.getString("account_name", "하나모아 계좌") ?: "하나모아 계좌",
                balance = sharedPreferences.getFloat("account_balance", 0f).toDouble()
            )
            _accountInfo.value = savedAccount
        }

        launchSafe {
            _isLoading.value = true
            val result = repository.getUserAccounts(userId)
            
            when (result) {
                is AppResult.Success -> {
                    if (result.data.accounts.isNotEmpty()) {
                        val account = result.data.accounts[0]
                                val accountInfo = AccountInfo(
                                    accountNumber = account.accountNumber,
                                    balance = account.balance
                                )
                        _accountInfo.value = accountInfo
                        saveAccountInfo(accountInfo)
                    } else {
                        if (savedAccountId == null) {
                            _accountInfo.value = getDefaultAccountInfo()
                        }
                    }
                }
                is AppResult.Error -> {
                    if (savedAccountId == null) {
                        _errorMessage.value = "계좌 정보를 불러올 수 없습니다"
                        _accountInfo.value = getDefaultAccountInfo()
                    }
                }
                is AppResult.Loading -> {
                }
            }
            _isLoading.value = false
        }
    }
    
    /**
     * 사용자 정보 로드
     */
    fun loadUserInfo() {
        val userId = sharedPreferences.getString("user_userId", null) ?: return
        
        launchSafe {
            val result = repository.checkAuth(userId)
            
            when (result) {
                is AppResult.Success -> {
                    if (result.data.data != null) {
                                val userInfo = UserInfo(
                                    name = result.data.data.name,
                                    email = result.data.data.email,
                                    profileImage = result.data.data.profileImage ?: ""
                                )
                        _userInfo.value = userInfo
                        saveUserInfo(userInfo)
                    }
                }
                is AppResult.Error -> {
                }
                is AppResult.Loading -> {
                }
            }
        }
    }
    
    /**
     * 알림 개수 로드
     */
    fun loadNotificationCount() {
        val userId = sharedPreferences.getString("user_id", null) ?: return
        
        launchSafe {
            val result = repository.getAllNotifications(userId)
            
            when (result) {
                is AppResult.Success -> {
                    if (result.data.data != null) {
                        val notifications = result.data.data
                        val unreadCount = notifications.count { notification -> !notification.isRead }
                        _notificationCount.value = unreadCount
                    }
                }
                is AppResult.Error -> {
                    _notificationCount.value = 0
                }
                is AppResult.Loading -> {
                }
            }
        }
    }
    
    /**
     * 잔액 표시/숨김 토글
     */
    fun toggleBalanceVisibility() {
        _isBalanceHidden.value = !(_isBalanceHidden.value ?: false)
    }
    
    /**
     * 계좌 정보 저장
     */
    private fun saveAccountInfo(accountInfo: AccountInfo) {
        sharedPreferences.edit().apply {
            putString("account_id", accountInfo.id)
            putString("account_number", accountInfo.accountNumber)
            putString("account_name", accountInfo.accountName)
            putFloat("account_balance", accountInfo.balance.toFloat())
            apply()
        }
    }
    
    /**
     * 사용자 정보 저장
     */
    private fun saveUserInfo(userInfo: UserInfo) {
        sharedPreferences.edit().apply {
            putString("user_name", userInfo.name)
            putString("profile_image", userInfo.profileImage)
            apply()
        }
    }
    
    /**
     * 기본 계좌 정보 반환
     */
    private fun getDefaultAccountInfo(): AccountInfo {
        return AccountInfo(
            accountNumber = "282-000000-00000",
            balance = 0.0
        )
    }
    
    /**
     * 에러 메시지 초기화
     */
    fun clearErrorMessage() {
        _errorMessage.value = null
    }
}
