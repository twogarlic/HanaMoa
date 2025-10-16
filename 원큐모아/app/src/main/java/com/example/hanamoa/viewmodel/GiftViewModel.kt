package com.example.hanamoa.viewmodel

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.hanamoa.base.BaseViewModel
import com.example.hanamoa.data.Result as AppResult
import com.example.hanamoa.repository.GiftRepository
import com.example.hanamoa.network.models.Gift
import kotlinx.coroutines.launch

class GiftViewModel : BaseViewModel() {
    
    private lateinit var repository: GiftRepository
    private lateinit var sharedPreferences: SharedPreferences
    
    private val _gifts = MutableLiveData<List<Gift>>()
    val gifts: LiveData<List<Gift>> = _gifts
    
    private val _selectedGift = MutableLiveData<Gift>()
    val selectedGift: LiveData<Gift> = _selectedGift
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: MutableLiveData<String?> = _errorMessage
    
    fun init(context: Context) {
        repository = GiftRepository()
        sharedPreferences = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        loadGifts()
    }
    
    fun loadGifts() {
        launchSafe {
            _isLoading.value = true
            val result = repository.getGifts()
            
            when (result) {
                is AppResult.Success -> {
                    _gifts.value = result.data
                }
                is AppResult.Error -> {
                    _errorMessage.value = "선물 목록을 불러올 수 없습니다"
                }
                is AppResult.Loading -> {
                }
            }
            _isLoading.value = false
        }
    }
    
    fun selectGift(gift: Gift) {
        _selectedGift.value = gift
    }
    
    fun sendGift(gift: Gift, recipientId: String) {
        launchSafe {
            val result = repository.sendGift(gift.id, recipientId)
            
            when (result) {
                is AppResult.Success -> {
                }
                is AppResult.Error -> {
                    _errorMessage.value = "선물 전송에 실패했습니다"
                }
                is AppResult.Loading -> {
                }
            }
        }
    }
    
    fun clearErrorMessage() {
        _errorMessage.value = null
    }
}
