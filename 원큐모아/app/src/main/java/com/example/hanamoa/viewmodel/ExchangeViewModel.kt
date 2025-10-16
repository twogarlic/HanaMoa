package com.example.hanamoa.viewmodel

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.hanamoa.base.BaseViewModel
import com.example.hanamoa.data.Result as AppResult
import com.example.hanamoa.repository.ExchangeRepository
import com.example.hanamoa.network.models.ExchangeRate
import kotlinx.coroutines.launch

class ExchangeViewModel : BaseViewModel() {
    
    private lateinit var repository: ExchangeRepository
    private lateinit var sharedPreferences: SharedPreferences
    
    private val _exchangeRates = MutableLiveData<List<ExchangeRate>>()
    val exchangeRates: LiveData<List<ExchangeRate>> = _exchangeRates
    
    private val _selectedFromCurrency = MutableLiveData<String>()
    val selectedFromCurrency: LiveData<String> = _selectedFromCurrency
    
    private val _selectedToCurrency = MutableLiveData<String>()
    val selectedToCurrency: LiveData<String> = _selectedToCurrency
    
    private val _amount = MutableLiveData<String>()
    val amount: LiveData<String> = _amount
    
    private val _convertedAmount = MutableLiveData<Double>()
    val convertedAmount: LiveData<Double> = _convertedAmount
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: MutableLiveData<String?> = _errorMessage
    
    fun init(context: Context) {
        repository = ExchangeRepository()
        sharedPreferences = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        loadExchangeRates()
    }
    
    fun loadExchangeRates() {
        launchSafe {
            _isLoading.value = true
            val result = repository.getExchangeRates()
            
            when (result) {
                is AppResult.Success -> {
                    _exchangeRates.value = result.data
                }
                is AppResult.Error -> {
                    _errorMessage.value = "환율 정보를 불러올 수 없습니다"
                }
                is AppResult.Loading -> {
                }
            }
            _isLoading.value = false
        }
    }
    
    fun setFromCurrency(currency: String) {
        _selectedFromCurrency.value = currency
        convertAmount()
    }
    
    fun setToCurrency(currency: String) {
        _selectedToCurrency.value = currency
        convertAmount()
    }
    
    fun setAmount(amount: String) {
        _amount.value = amount
        convertAmount()
    }
    
    private fun convertAmount() {
        val fromCurrency = _selectedFromCurrency.value
        val toCurrency = _selectedToCurrency.value
        val amountStr = _amount.value
        
        if (fromCurrency != null && toCurrency != null && amountStr != null && amountStr.isNotEmpty()) {
            launchSafe {
                val result = repository.convertCurrency(fromCurrency, toCurrency, amountStr.toDouble())
                
                when (result) {
                    is AppResult.Success -> {
                        _convertedAmount.value = result.data
                    }
                    is AppResult.Error -> {
                        _errorMessage.value = "환전 계산에 실패했습니다"
                    }
                    is AppResult.Loading -> {
                    }
                }
            }
        }
    }
    
    fun clearErrorMessage() {
        _errorMessage.value = null
    }
}
