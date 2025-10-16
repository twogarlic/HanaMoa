package com.example.hanamoa.viewmodel

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.example.hanamoa.base.BaseViewModel
import com.example.hanamoa.data.Result as AppResult
import com.example.hanamoa.repository.InvestRepository
import com.example.hanamoa.network.models.Asset
import com.example.hanamoa.network.models.ChartData
import kotlinx.coroutines.launch

class InvestViewModel : BaseViewModel() {
    
    private lateinit var repository: InvestRepository
    private lateinit var sharedPreferences: SharedPreferences
    
    private val _assets = MutableLiveData<List<Asset>>()
    val assets: LiveData<List<Asset>> = _assets
    
    private val _selectedAsset = MutableLiveData<Asset>()
    val selectedAsset: LiveData<Asset> = _selectedAsset
    
    private val _chartData = MutableLiveData<List<ChartData>>()
    val chartData: LiveData<List<ChartData>> = _chartData
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: MutableLiveData<String?> = _errorMessage
    
    fun init(context: Context) {
        repository = InvestRepository()
        sharedPreferences = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        loadAssets()
    }
    
    fun loadAssets() {
        launchSafe {
            _isLoading.value = true
            val result = repository.getAssets()
            
            when (result) {
                is AppResult.Success -> {
                    _assets.value = result.data
                    if (result.data.isNotEmpty()) {
                        _selectedAsset.value = result.data[0]
                        loadChartData(result.data[0].id)
                    }
                }
                is AppResult.Error -> {
                    _errorMessage.value = "자산 정보를 불러올 수 없습니다"
                }
                is AppResult.Loading -> {
                }
            }
            _isLoading.value = false
        }
    }
    
    fun selectAsset(asset: Asset) {
        _selectedAsset.value = asset
        loadChartData(asset.id)
    }
    
    fun loadChartData(assetId: String) {
        launchSafe {
            val result = repository.getChartData(assetId)
            
            when (result) {
                is AppResult.Success -> {
                    _chartData.value = result.data
                }
                is AppResult.Error -> {
                    _errorMessage.value = "차트 데이터를 불러올 수 없습니다"
                }
                is AppResult.Loading -> {
                }
            }
        }
    }
    
    fun loadChartData(asset: String, period: String) {
        launchSafe {
            val result = repository.getChartData(asset)
            
            when (result) {
                is AppResult.Success -> {
                    _chartData.value = result.data
                }
                is AppResult.Error -> {
                    _errorMessage.value = "차트 데이터를 불러올 수 없습니다"
                }
                is AppResult.Loading -> {
                }
            }
        }
    }
    
    fun cancelOrder(orderId: String, userId: String) {
        launchSafe {
            _isLoading.value = true
            _errorMessage.value = "주문이 취소되었습니다"
            _isLoading.value = false
        }
    }
    
    fun clearErrorMessage() {
        _errorMessage.value = null
    }
}
