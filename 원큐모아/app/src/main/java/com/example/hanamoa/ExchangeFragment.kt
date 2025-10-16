package com.example.hanamoa

import android.Manifest
import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ExchangeFragment : Fragment() {

    private lateinit var sharedPreferences: SharedPreferences
    
    companion object {
        private const val LOCATION_PERMISSION_REQUEST_CODE = 1001
    }

    private lateinit var layoutAssetSelector: LinearLayout
    private lateinit var ivSelectedAsset: ImageView
    private lateinit var tvSelectedAssetName: TextView
    private lateinit var ivAssetDropdownArrow: ImageView
    private lateinit var layoutAssetsDropdown: LinearLayout
    private lateinit var rvAssets: RecyclerView
    private lateinit var layoutHoldingInfo: LinearLayout
    private lateinit var tvHoldingAmount: TextView
    private lateinit var tvUnitSelectionTitle: TextView
    private lateinit var rvUnits: RecyclerView
    private lateinit var layoutQuantityInput: LinearLayout
    private lateinit var etCurrencyQuantity: com.google.android.material.textfield.TextInputEditText
    private lateinit var btnNextStep: Button
    
    private lateinit var layoutStep1: LinearLayout
    private lateinit var layoutStep2: LinearLayout
    private lateinit var mapContainer: FrameLayout
    private lateinit var layoutMapLoading: LinearLayout
    private lateinit var layoutSelectedBranch: LinearLayout
    private lateinit var tvSelectedBranchName: TextView
    private lateinit var tvSelectedBranchAddress: TextView
    private lateinit var btnNextStep2: Button
    
    private lateinit var layoutStep3: LinearLayout
    private lateinit var layoutDateSelector: LinearLayout
    private lateinit var tvSelectedDate: TextView
    private lateinit var rvTimeSlots: RecyclerView
    private lateinit var layoutSelectedDatetime: LinearLayout
    private lateinit var tvSelectedDatetime: TextView
    private lateinit var btnNextStep3: Button
    
    private lateinit var layoutStep4: LinearLayout
    private lateinit var ivSummaryAsset: ImageView
    private lateinit var tvSummaryAssetName: TextView
    private lateinit var tvSummaryAssetUnit: TextView
    private lateinit var tvSummaryBranchName: TextView
    private lateinit var tvSummaryBranchAddress: TextView
    private lateinit var tvSummaryDatetime: TextView
    private lateinit var btnConfirmExchange: Button
    
    private lateinit var progressBar1: View
    private lateinit var progressBar2: View
    private lateinit var progressBar3: View
    private lateinit var progressBar4: View

    private var selectedAsset: String = ""
    private var selectedUnit: String = ""
    private var currencyQuantity: String = ""
    private var assetsList = mutableListOf<String>()
    private var unitsList = mutableListOf<String>()
    private var assetsAdapter: AssetsAdapter? = null
    private var unitsAdapter: UnitsAdapter? = null
    
    private var userHoldings = mutableMapOf<String, Double>() // 자산별 보유량
    private var currentStep: Int = 1 // 현재 단계
    
    private var googleMap: GoogleMap? = null
    private var selectedBranch: BranchInfo? = null
    private var branchMarkers = mutableMapOf<String, Marker?>() // 지점별 마커
    private var isSearchingBranches = false // 지점 검색 중인지 확인
    private var lastSearchBounds: com.google.android.gms.maps.model.LatLngBounds? = null // 마지막 검색 범위
    private var allDiscoveredBranches = mutableListOf<BranchInfo>() // 발견된 모든 지점들
    private var searchHandler: android.os.Handler? = null // 검색 디바운싱용 핸들러
    
    private var selectedDate: String = ""
    private var selectedTime: String = ""
    private var timeSlots = mutableListOf<String>()
    private var timeSlotsAdapter: TimeSlotsAdapter? = null

    private val assetInfo = mapOf(
        "gold" to AssetInfo("GOLD", R.drawable.ic_market_gold),
        "silver" to AssetInfo("SILVER", R.drawable.ic_market_silver),
        "usd" to AssetInfo("USD", R.drawable.ic_market_money),
        "eur" to AssetInfo("EUR", R.drawable.ic_market_money),
        "jpy" to AssetInfo("JPY", R.drawable.ic_market_money),
        "cny" to AssetInfo("CNY", R.drawable.ic_market_money)
    )

    private val assetUnits = mapOf(
        "gold" to listOf("1g", "3.75g", "5g", "37.5g", "100g", "1kg"),
        "silver" to listOf("100g", "1kg")
    )
    
    private fun convertToGrams(unit: String): Double {
        return when {
            unit.endsWith("kg") -> unit.replace("kg", "").toDoubleOrNull()?.times(1000) ?: 0.0
            unit.endsWith("g") -> unit.replace("g", "").toDoubleOrNull() ?: 0.0
            else -> 0.0
        }
    }
    
    private val currencyAssets = listOf("usd", "eur", "jpy", "cny")
    
    private val hanaBranches = listOf(
        BranchInfo("1", "하나은행 강남지점", "서울특별시 강남구 테헤란로 123", 37.5665, 126.9780),
        BranchInfo("2", "하나은행 종로지점", "서울특별시 종로구 종로 456", 37.5735, 126.9788),
        BranchInfo("3", "하나은행 명동지점", "서울특별시 중구 명동 789", 37.5636, 126.9826),
        BranchInfo("4", "하나은행 홍대지점", "서울특별시 마포구 홍익로 101", 37.5563, 126.9226),
        BranchInfo("5", "하나은행 신촌지점", "서울특별시 서대문구 신촌로 202", 37.5551, 126.9368),
        BranchInfo("6", "하나은행 이태원지점", "서울특별시 용산구 이태원로 303", 37.5347, 126.9947),
        BranchInfo("7", "하나은행 압구정지점", "서울특별시 강남구 압구정로 404", 37.5275, 127.0286),
        BranchInfo("8", "하나은행 청담지점", "서울특별시 강남구 도산대로 505", 37.5193, 127.0473)
    )


    data class AssetInfo(
        val name: String,
        val imageRes: Int
    )
    
    data class BranchInfo(
        val id: String,
        val name: String,
        val address: String,
        val latitude: Double,
        val longitude: Double
    )
    
    private fun vectorToBitmap(context: Context, drawableId: Int): BitmapDescriptor? {
        return try {
            val drawable = ContextCompat.getDrawable(context, drawableId)
            drawable?.let { drawable ->
                val bitmap = Bitmap.createBitmap(
                    drawable.intrinsicWidth,
                    drawable.intrinsicHeight,
                    Bitmap.Config.ARGB_8888
                )
                val canvas = Canvas(bitmap)
                drawable.setBounds(0, 0, canvas.width, canvas.height)
                drawable.draw(canvas)
                BitmapDescriptorFactory.fromBitmap(bitmap)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_exchange, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        sharedPreferences = requireContext().getSharedPreferences("user_prefs", android.content.Context.MODE_PRIVATE)
        
        initViews(view)
        setupRecyclerViews()
        setupClickListeners()
        updateAssetsList()
        loadUserHoldings()
        updateProgressBar()
    }

    private fun initViews(view: View) {
        layoutAssetSelector = view.findViewById(R.id.layout_asset_selector)
        ivSelectedAsset = view.findViewById(R.id.iv_selected_asset)
        tvSelectedAssetName = view.findViewById(R.id.tv_selected_asset_name)
        ivAssetDropdownArrow = view.findViewById(R.id.iv_asset_dropdown_arrow)
        layoutAssetsDropdown = view.findViewById(R.id.layout_assets_dropdown)
        rvAssets = view.findViewById(R.id.rv_assets)
        layoutHoldingInfo = view.findViewById(R.id.layout_holding_info)
        tvHoldingAmount = view.findViewById(R.id.tv_holding_amount)
        tvUnitSelectionTitle = view.findViewById(R.id.tv_unit_selection_title)
        rvUnits = view.findViewById(R.id.rv_units)
        layoutQuantityInput = view.findViewById(R.id.layout_quantity_input)
        etCurrencyQuantity = view.findViewById(R.id.et_currency_quantity)
        btnNextStep = view.findViewById(R.id.btn_next_step)
        
        layoutStep1 = view.findViewById(R.id.layout_step1)
        layoutStep2 = view.findViewById(R.id.layout_step2)
        mapContainer = view.findViewById(R.id.map_container)
        layoutMapLoading = view.findViewById(R.id.layout_map_loading)
        layoutSelectedBranch = view.findViewById(R.id.layout_selected_branch)
        tvSelectedBranchName = view.findViewById(R.id.tv_selected_branch_name)
        tvSelectedBranchAddress = view.findViewById(R.id.tv_selected_branch_address)
        btnNextStep2 = view.findViewById(R.id.btn_next_step2)
        
        layoutStep3 = view.findViewById(R.id.layout_step3)
        layoutDateSelector = view.findViewById(R.id.layout_date_selector)
        tvSelectedDate = view.findViewById(R.id.tv_selected_date)
        rvTimeSlots = view.findViewById(R.id.rv_time_slots)
        layoutSelectedDatetime = view.findViewById(R.id.layout_selected_datetime)
        tvSelectedDatetime = view.findViewById(R.id.tv_selected_datetime)
        btnNextStep3 = view.findViewById(R.id.btn_next_step3)
        
        layoutStep4 = view.findViewById(R.id.layout_step4)
        ivSummaryAsset = view.findViewById(R.id.iv_summary_asset)
        tvSummaryAssetName = view.findViewById(R.id.tv_summary_asset_name)
        tvSummaryAssetUnit = view.findViewById(R.id.tv_summary_asset_unit)
        tvSummaryBranchName = view.findViewById(R.id.tv_summary_branch_name)
        tvSummaryBranchAddress = view.findViewById(R.id.tv_summary_branch_address)
        tvSummaryDatetime = view.findViewById(R.id.tv_summary_datetime)
        btnConfirmExchange = view.findViewById(R.id.btn_confirm_exchange)
        
        progressBar1 = view.findViewById(R.id.progress_bar_1)
        progressBar2 = view.findViewById(R.id.progress_bar_2)
        progressBar3 = view.findViewById(R.id.progress_bar_3)
        progressBar4 = view.findViewById(R.id.progress_bar_4)
    }

    private fun setupRecyclerViews() {
        rvAssets.layoutManager = LinearLayoutManager(requireContext())
        
        rvUnits.layoutManager = GridLayoutManager(requireContext(), 3)
        
        rvTimeSlots.layoutManager = LinearLayoutManager(requireContext())
    }

    private fun setupClickListeners() {
        layoutAssetSelector.setOnClickListener {
            toggleAssetsDropdown()
        }

        btnNextStep.setOnClickListener {
            goToNextStep()
        }
        
        btnNextStep2.setOnClickListener {
            goToNextStep()
        }
        
        btnNextStep3.setOnClickListener {
            goToNextStep()
        }
        
        layoutDateSelector.setOnClickListener {
            showDatePicker()
        }
        
        btnConfirmExchange.setOnClickListener {
            confirmExchange()
        }
        
        etCurrencyQuantity.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                currencyQuantity = s.toString()
                updateNextButtonState()
                validateCurrencyQuantity()
            }
        })
    }

    private fun updateAssetsList() {
        assetsList = assetInfo.keys.toMutableList()
        assetsAdapter = AssetsAdapter(assetsList, selectedAsset, assetInfo) { asset ->
            selectAsset(asset)
        }
        rvAssets.adapter = assetsAdapter
    }

    private fun toggleAssetsDropdown() {
        if (layoutAssetsDropdown.visibility == View.VISIBLE) {
            hideAssetsDropdown()
        } else {
            showAssetsDropdown()
        }
    }

    private fun showAssetsDropdown() {
        layoutAssetsDropdown.visibility = View.VISIBLE
        ivAssetDropdownArrow.rotation = 180f
    }

    private fun hideAssetsDropdown() {
        layoutAssetsDropdown.visibility = View.GONE
        ivAssetDropdownArrow.rotation = 0f
    }

    private fun selectAsset(asset: String) {
        selectedAsset = asset
        updateSelectedAssetDisplay(asset)
        hideAssetsDropdown()
        
        showHoldingInfo()
        
        showUnitSelection()
        
        updateAssetsList()
    }

    private fun updateSelectedAssetDisplay(asset: String) {
        val info = assetInfo[asset] ?: return
        
        tvSelectedAssetName.text = info.name
        
        Glide.with(this)
            .load(info.imageRes)
            .transition(DrawableTransitionOptions.withCrossFade(300))
            .into(ivSelectedAsset)
    }

    private fun loadUserHoldings() {
        val userId = sharedPreferences.getString("user_id", null) ?: return

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().getUserHoldings(userId)
                }

                if (result.success && result.data != null) {
                    userHoldings.clear()
                    result.data.forEach { holding ->
                        userHoldings[holding.asset] = holding.quantity
                    }
                    if (selectedAsset.isNotEmpty()) {
                        updateHoldingDisplay()
                    }
                } else {
                    userHoldings.clear()
                    if (selectedAsset.isNotEmpty()) {
                        updateHoldingDisplay()
                    }
                }
            } catch (e: Exception) {
                userHoldings.clear()
                if (selectedAsset.isNotEmpty()) {
                    updateHoldingDisplay()
                }
            }
        }
    }

    private fun showHoldingInfo() {
        updateHoldingDisplay()
        layoutHoldingInfo.visibility = View.VISIBLE
    }

    private fun updateHoldingDisplay() {
        val holding = userHoldings[selectedAsset] ?: 0.0
        tvHoldingAmount.text = String.format("%.2f", holding)
    }

    private fun showUnitSelection() {
        if (currencyAssets.contains(selectedAsset)) {
            showCurrencyQuantityInput()
        } else {
            showUnitGrid()
        }
    }
    
    private fun showUnitGrid() {
        val units = assetUnits[selectedAsset] ?: return
        val holding = userHoldings[selectedAsset] ?: 0.0
        
        unitsList = units.toMutableList()
        unitsAdapter = UnitsAdapter(unitsList, selectedUnit, holding, this::convertToGrams) { unit ->
            selectUnit(unit)
        }
        rvUnits.adapter = unitsAdapter
        
        tvUnitSelectionTitle.visibility = View.VISIBLE
        rvUnits.visibility = View.VISIBLE
        layoutQuantityInput.visibility = View.GONE
    }
    
    private fun showCurrencyQuantityInput() {
        val holding = userHoldings[selectedAsset] ?: 0.0
        
        tvUnitSelectionTitle.visibility = View.VISIBLE
        layoutQuantityInput.visibility = View.VISIBLE
        rvUnits.visibility = View.GONE
        
        etCurrencyQuantity.setText("")
        etCurrencyQuantity.error = null
        currencyQuantity = ""
        updateNextButtonState()
    }

    private fun selectUnit(unit: String) {
        selectedUnit = unit
        
        val holding = userHoldings[selectedAsset] ?: 0.0
        unitsAdapter = UnitsAdapter(unitsList, selectedUnit, holding, this::convertToGrams) { selectedUnit ->
            selectUnit(selectedUnit)
        }
        rvUnits.adapter = unitsAdapter
        
        updateNextButtonState()
    }
    
    private fun updateNextButtonState() {
        val isReady = if (currencyAssets.contains(selectedAsset)) {
            if (currencyQuantity.isNotEmpty()) {
                val inputQuantity = currencyQuantity.toDoubleOrNull()
                val holding = userHoldings[selectedAsset] ?: 0.0
                inputQuantity != null && inputQuantity > 0 && inputQuantity <= holding
            } else {
                false
            }
        } else {
            selectedUnit.isNotEmpty()
        }
        
        btnNextStep.isEnabled = isReady
        btnNextStep.visibility = if (isReady) View.VISIBLE else View.GONE
    }
    
    private fun validateCurrencyQuantity() {
        if (currencyAssets.contains(selectedAsset) && currencyQuantity.isNotEmpty()) {
            val inputQuantity = currencyQuantity.toDoubleOrNull()
            val holding = userHoldings[selectedAsset] ?: 0.0
            
            if (inputQuantity != null && inputQuantity > holding) {
                etCurrencyQuantity.error = "보유량(${String.format("%.2f", holding)})을 초과할 수 없습니다"
            } else {
                etCurrencyQuantity.error = null
            }
        } else {
            etCurrencyQuantity.error = null
        }
    }
    
    private fun updateProgressBar() {
        progressBar1.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
        progressBar2.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
        progressBar3.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
        progressBar4.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
        
        when (currentStep) {
            1 -> progressBar1.setBackgroundResource(R.drawable.bg_progress_bar_active)
            2 -> {
                progressBar1.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
                progressBar2.setBackgroundResource(R.drawable.bg_progress_bar_active)
            }
            3 -> {
                progressBar1.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
                progressBar2.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
                progressBar3.setBackgroundResource(R.drawable.bg_progress_bar_active)
            }
            4 -> {
                progressBar1.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
                progressBar2.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
                progressBar3.setBackgroundResource(R.drawable.bg_progress_bar_inactive)
                progressBar4.setBackgroundResource(R.drawable.bg_progress_bar_active)
            }
        }
    }
    
    private fun goToNextStep() {
        if (currentStep < 4) {
            currentStep++
            updateProgressBar()
            showCurrentStep()
        }
    }
    
    private fun showCurrentStep() {
        when (currentStep) {
            1 -> {
                layoutStep1.visibility = View.VISIBLE
                layoutStep2.visibility = View.GONE
                layoutStep3.visibility = View.GONE
                layoutStep4.visibility = View.GONE
            }
            2 -> {
                layoutStep1.visibility = View.GONE
                layoutStep2.visibility = View.VISIBLE
                layoutStep3.visibility = View.GONE
                layoutStep4.visibility = View.GONE
                checkLocationPermission()
            }
            3 -> {
                layoutStep1.visibility = View.GONE
                layoutStep2.visibility = View.GONE
                layoutStep3.visibility = View.VISIBLE
                layoutStep4.visibility = View.GONE
                setupStep3()
            }
            4 -> {
                layoutStep1.visibility = View.GONE
                layoutStep2.visibility = View.GONE
                layoutStep3.visibility = View.GONE
                layoutStep4.visibility = View.VISIBLE
                setupStep4()
            }
        }
    }
    
    private fun checkLocationPermission() {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION) 
            == PackageManager.PERMISSION_GRANTED) {
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                setupMap()
            }, 500)
        } else {
            requestPermissions(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ),
                LOCATION_PERMISSION_REQUEST_CODE
            )
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        when (requestCode) {
            LOCATION_PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                        setupMap()
                    }, 500)
                } else {
                    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                        setupMap()
                    }, 500)
                }
            }
        }
    }
    
    private fun setupMap() {
        try {
            android.util.Log.d("ExchangeFragment", "Setting up map dynamically...")
            
            android.util.Log.d("ExchangeFragment", "Map container visibility: ${mapContainer.visibility}")
            android.util.Log.d("ExchangeFragment", "Map container width: ${mapContainer.width}, height: ${mapContainer.height}")
            
            val mapFragment = SupportMapFragment.newInstance()
            
            childFragmentManager.beginTransaction()
                .replace(R.id.map_container, mapFragment)
                .commitAllowingStateLoss()
            
            mapFragment.getMapAsync(object : OnMapReadyCallback {
                override fun onMapReady(map: GoogleMap) {
                    try {
                        googleMap = map
                        android.util.Log.d("ExchangeFragment", "Map is ready!")
                        
                        map.uiSettings.isZoomControlsEnabled = true
                        map.uiSettings.isMyLocationButtonEnabled = false
                        map.uiSettings.isCompassEnabled = false
                        map.uiSettings.isMapToolbarEnabled = false
                        map.uiSettings.isZoomGesturesEnabled = true
                        map.uiSettings.isScrollGesturesEnabled = true
                        map.uiSettings.isTiltGesturesEnabled = true
                        map.uiSettings.isRotateGesturesEnabled = true
                        
                        map.mapType = GoogleMap.MAP_TYPE_NORMAL
                        
                        try {
                            map.setMapStyle(null)
                        } catch (e: Exception) {
                            android.util.Log.e("ExchangeFragment", "Error setting map style: ${e.message}")
                        }
                        
                        val seoul = LatLng(37.5665, 126.9780)
                        map.animateCamera(CameraUpdateFactory.newLatLngZoom(seoul, 11f))
                        
                        setupBranchMarkers()
                        
                        setupCameraMoveListener()
                        
                        layoutMapLoading.visibility = View.GONE
                        
                        mapContainer.visibility = View.VISIBLE
                        mapContainer.requestLayout()
                        
                        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                            mapContainer.invalidate()
                            mapContainer.requestLayout()
                            android.util.Log.d("ExchangeFragment", "Map container refreshed")
                        }, 100)
                        
                        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                            mapContainer.invalidate()
                            mapContainer.requestLayout()
                            android.util.Log.d("ExchangeFragment", "Map container final refresh")
                        }, 500)
                        
                        android.util.Log.d("ExchangeFragment", "Map setup completed successfully")
                        android.util.Log.d("ExchangeFragment", "Map container final visibility: ${mapContainer.visibility}")
                    } catch (e: Exception) {
                        android.util.Log.e("ExchangeFragment", "Error in onMapReady: ${e.message}")
                        e.printStackTrace()
                        layoutMapLoading.visibility = View.GONE
                    }
                }
            })
        } catch (e: Exception) {
            android.util.Log.e("ExchangeFragment", "Error setting up map: ${e.message}")
            e.printStackTrace()
            layoutMapLoading.visibility = View.GONE
        }
    }
    
    private fun setupCameraMoveListener() {
        searchHandler = android.os.Handler(android.os.Looper.getMainLooper())
        
        googleMap?.setOnCameraMoveListener {
            searchHandler?.removeCallbacksAndMessages(null)
            searchHandler?.postDelayed({
                searchBranchesInVisibleArea()
            }, 1000)
        }
    }
    
    private fun searchBranchesInVisibleArea() {
        if (isSearchingBranches) return // 이미 검색 중이면 무시
        
        googleMap?.let { map ->
            val bounds = map.projection.visibleRegion.latLngBounds
            
            if (lastSearchBounds != null && bounds.contains(lastSearchBounds!!.center)) {
                return
            }
            
            isSearchingBranches = true
            lastSearchBounds = bounds
            
            android.util.Log.d("ExchangeFragment", "Searching branches in area: ${bounds.northeast}, ${bounds.southwest}")
            
            searchBranchesMock(bounds)
        }
    }
    
    private fun searchBranchesMock(bounds: com.google.android.gms.maps.model.LatLngBounds) {
        val newBranches = generateMockBranchesInBounds(bounds)
        
        allDiscoveredBranches.addAll(newBranches)
        
        val uniqueBranches = allDiscoveredBranches.distinctBy { it.id }
        allDiscoveredBranches.clear()
        allDiscoveredBranches.addAll(uniqueBranches)
        
        updateBranchMarkers(uniqueBranches)
        
        android.util.Log.d("ExchangeFragment", "Added ${newBranches.size} new branches. Total: ${uniqueBranches.size}")
        
        isSearchingBranches = false
    }
    
    private fun generateMockBranchesInBounds(bounds: com.google.android.gms.maps.model.LatLngBounds): List<BranchInfo> {
        val newBranches = mutableListOf<BranchInfo>()
        
        val latDiff = bounds.northeast.latitude - bounds.southwest.latitude
        val lngDiff = bounds.northeast.longitude - bounds.southwest.longitude
        
        repeat(2) { index ->
            val randomLat = bounds.southwest.latitude + (Math.random() * latDiff)
            val randomLng = bounds.southwest.longitude + (Math.random() * lngDiff)
            
            val newBranch = BranchInfo(
                id = "new_${System.currentTimeMillis()}_$index",
                name = "하나은행 ${getRandomDistrictName()}지점",
                address = "서울특별시 ${getRandomDistrictName()} ${getRandomStreetName()}",
                latitude = randomLat,
                longitude = randomLng
            )
            newBranches.add(newBranch)
        }
        
        return newBranches
    }
    
    private fun getRandomDistrictName(): String {
        val districts = listOf("강남구", "강동구", "강북구", "강서구", "관악구", "광진구", 
                             "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", 
                             "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", 
                             "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구")
        return districts.random()
    }
    
    private fun getRandomStreetName(): String {
        val streets = listOf("테헤란로", "강남대로", "논현로", "도산대로", "압구정로", "신사동", 
                           "청담동", "역삼동", "삼성동", "대치동", "개포동", "일원동")
        return streets.random()
    }
    
    private fun updateBranchMarkers(branches: List<BranchInfo>) {
        googleMap?.let { map ->
            branchMarkers.values.forEach { marker ->
                marker?.remove()
            }
            branchMarkers.clear()
            
            branches.forEach { branch ->
                val position = LatLng(branch.latitude, branch.longitude)
                val unclickedIcon = vectorToBitmap(requireContext(), R.drawable.ic_hana_mark_unclicked)
                val marker = map.addMarker(
                    MarkerOptions()
                        .position(position)
                        .title(branch.name)
                        .snippet(branch.address)
                        .icon(unclickedIcon)
                )
                
                marker?.tag = branch.id
                branchMarkers[branch.id] = marker
            }
            
            android.util.Log.d("ExchangeFragment", "Updated markers: ${branches.size} branches")
        }
    }
    
    private fun setupBranchMarkers() {
        allDiscoveredBranches.clear()
        allDiscoveredBranches.addAll(hanaBranches)
        
        updateBranchMarkers(hanaBranches)
        
        googleMap?.setOnMarkerClickListener { marker ->
            val branchId = marker.tag as? String
            branchId?.let { id ->
                selectBranch(id)
            }
            true
        }
    }
    
    private fun getAllBranches(): List<BranchInfo> {
        return allDiscoveredBranches
    }
    
    private fun selectBranch(branchId: String) {
        val allBranches = getAllBranches()
        val branch = allBranches.find { it.id == branchId }
        branch?.let {
            selectedBranch = it
            
            val unclickedIcon = vectorToBitmap(requireContext(), R.drawable.ic_hana_mark_unclicked)
            branchMarkers.values.forEach { marker ->
                marker?.setIcon(unclickedIcon)
            }
            
            val clickedIcon = vectorToBitmap(requireContext(), R.drawable.ic_hana_mark_clicked)
            branchMarkers[branchId]?.setIcon(clickedIcon)
            
            tvSelectedBranchName.text = it.name
            tvSelectedBranchAddress.text = it.address
            layoutSelectedBranch.visibility = View.VISIBLE
            
            btnNextStep2.isEnabled = true
            btnNextStep2.visibility = View.VISIBLE
            
            val position = LatLng(it.latitude, it.longitude)
            googleMap?.animateCamera(CameraUpdateFactory.newLatLngZoom(position, 15f))
        }
    }
    
    private fun setupStep3() {
        timeSlots.clear()
        for (hour in 9..16) {
            timeSlots.add(String.format("%02d:00", hour))
        }
        
        timeSlotsAdapter = TimeSlotsAdapter(timeSlots, selectedTime) { time ->
            selectTime(time)
        }
        rvTimeSlots.adapter = timeSlotsAdapter
        
        selectedDate = ""
        selectedTime = ""
        updateStep3UI()
    }
    
    private fun showDatePicker() {
        val calendar = java.util.Calendar.getInstance()
        val year = calendar.get(java.util.Calendar.YEAR)
        val month = calendar.get(java.util.Calendar.MONTH)
        val day = calendar.get(java.util.Calendar.DAY_OF_MONTH)
        
        val datePickerDialog = android.app.DatePickerDialog(
            requireContext(),
            { _, selectedYear, selectedMonth, selectedDay ->
                val selectedDate = java.util.Calendar.getInstance().apply {
                    set(selectedYear, selectedMonth, selectedDay)
                }
                onDateSelected(selectedDate)
            },
            year, month, day
        )
        
        datePickerDialog.datePicker.minDate = System.currentTimeMillis()
        
        datePickerDialog.show()
    }
    
    private fun onDateSelected(calendar: java.util.Calendar) {
        val year = calendar.get(java.util.Calendar.YEAR)
        val month = calendar.get(java.util.Calendar.MONTH) + 1
        val day = calendar.get(java.util.Calendar.DAY_OF_MONTH)
        val dayOfWeek = calendar.get(java.util.Calendar.DAY_OF_WEEK)
        
        val dayNames = arrayOf("", "일", "월", "화", "수", "목", "금", "토")
        val dayName = dayNames[dayOfWeek]
        
        selectedDate = String.format("%d년 %d월 %d일 (%s)", year, month, day, dayName)
        tvSelectedDate.text = selectedDate
        tvSelectedDate.setTextColor(requireContext().getColor(android.R.color.black))
        
        updateStep3UI()
    }
    
    private fun selectTime(time: String) {
        selectedTime = time
        
        timeSlotsAdapter = TimeSlotsAdapter(timeSlots, selectedTime) { selectedTime ->
            selectTime(selectedTime)
        }
        rvTimeSlots.adapter = timeSlotsAdapter
        
        updateStep3UI()
    }
    
    private fun updateStep3UI() {
        val isDateSelected = selectedDate.isNotEmpty()
        val isTimeSelected = selectedTime.isNotEmpty()
        val isReady = isDateSelected && isTimeSelected
        
        btnNextStep3.isEnabled = isReady
        btnNextStep3.visibility = if (isReady) View.VISIBLE else View.GONE
        
        if (isReady) {
            val datetimeText = "$selectedDate $selectedTime"
            tvSelectedDatetime.text = datetimeText
            layoutSelectedDatetime.visibility = View.VISIBLE
        } else {
            layoutSelectedDatetime.visibility = View.GONE
        }
    }
    
    private fun setupStep4() {
        updateSummaryInfo()
    }
    
    private fun updateSummaryInfo() {
        val assetInfo = assetInfo[selectedAsset]
        assetInfo?.let {
            Glide.with(this)
                .load(it.imageRes)
                .transition(DrawableTransitionOptions.withCrossFade(300))
                .into(ivSummaryAsset)
            
            tvSummaryAssetName.text = it.name
            
            val unitText = if (currencyAssets.contains(selectedAsset)) {
                "${currencyQuantity} ${it.name}"
            } else {
                selectedUnit
            }
            tvSummaryAssetUnit.text = unitText
        }
        
        selectedBranch?.let { branch ->
            tvSummaryBranchName.text = branch.name
            tvSummaryBranchAddress.text = branch.address
        }
        
        val datetimeText = "$selectedDate $selectedTime"
        tvSummaryDatetime.text = datetimeText
    }
    
    private fun confirmExchange() {
        if (!isAdded || context == null) return
        
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_exchange_confirm, null)
        val dialog = android.app.AlertDialog.Builder(context)
            .setView(dialogView)
            .create()

        val btnCancel = dialogView.findViewById<TextView>(R.id.btn_cancel)
        val btnConfirm = dialogView.findViewById<TextView>(R.id.btn_confirm)

        btnCancel.setOnClickListener {
            dialog.dismiss()
        }

        btnConfirm.setOnClickListener {
            dialog.dismiss()
            processExchangeRequest()
        }

        dialog.show()
    }
    
    private fun processExchangeRequest() {
        btnConfirmExchange.isEnabled = false
        btnConfirmExchange.text = "신청 중..."
        
        
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            showExchangeResult()
        }, 2000)
    }
    
    private fun showExchangeResult() {
        if (!isAdded || context == null) return
        
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_exchange_success, null)
        val dialog = android.app.AlertDialog.Builder(context)
            .setView(dialogView)
            .setCancelable(false)
            .create()

        val ivSuccessIcon = dialogView.findViewById<ImageView>(R.id.iv_success_icon)
        val btnConfirm = dialogView.findViewById<TextView>(R.id.btn_confirm)

        Glide.with(this)
            .load(R.drawable.ic_check)
            .transition(DrawableTransitionOptions.withCrossFade(500))
            .into(ivSuccessIcon)

        btnConfirm.setOnClickListener {
            dialog.dismiss()
            (activity as? HomeActivity)?.showFragment(HomeFragment())
            (activity as? HomeActivity)?.updateNavigationUI(0)
        }

        dialog.show()
    }
    
    class AssetsAdapter(
        private val assets: List<String>,
        private val selectedAsset: String,
        private val assetInfo: Map<String, AssetInfo>,
        private val onAssetClick: (String) -> Unit
    ) : RecyclerView.Adapter<AssetsAdapter.AssetViewHolder>() {

        class AssetViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val ivAssetImage: ImageView = view.findViewById(R.id.iv_asset_image)
            val tvAssetName: TextView = view.findViewById(R.id.tv_asset_name)
            val ivSelected: View = view.findViewById(R.id.iv_selected)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AssetViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_asset, parent, false)
            return AssetViewHolder(view)
        }

        override fun onBindViewHolder(holder: AssetViewHolder, position: Int) {
            val asset = assets[position]
            val info = assetInfo[asset] ?: return

            holder.tvAssetName.text = info.name
            
            Glide.with(holder.itemView.context)
                .load(info.imageRes)
                .transition(DrawableTransitionOptions.withCrossFade(200))
                .into(holder.ivAssetImage)
            
            holder.ivSelected.visibility = if (asset == selectedAsset) View.VISIBLE else View.GONE

            holder.itemView.setOnClickListener {
                onAssetClick(asset)
            }
        }

        override fun getItemCount(): Int = assets.size
    }

    class UnitsAdapter(
        private val units: List<String>,
        private val selectedUnit: String,
        private val holding: Double,
        private val convertToGrams: (String) -> Double,
        private val onUnitClick: (String) -> Unit
    ) : RecyclerView.Adapter<UnitsAdapter.UnitViewHolder>() {

        class UnitViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val tvUnitValue: TextView = view.findViewById(R.id.tv_unit_value)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UnitViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_unit, parent, false)
            return UnitViewHolder(view)
        }

        override fun onBindViewHolder(holder: UnitViewHolder, position: Int) {
            val unit = units[position]
            val unitInGrams = convertToGrams(unit)
            val isAvailable = holding >= unitInGrams
            val isSelected = unit == selectedUnit
            
            holder.tvUnitValue.text = unit
            holder.tvUnitValue.isSelected = isSelected
            
            if (isSelected) {
                holder.tvUnitValue.setBackgroundResource(R.drawable.bg_unit_selector)
                holder.tvUnitValue.setTextColor(holder.itemView.context.getColor(android.R.color.black))
            } else if (isAvailable) {
                holder.tvUnitValue.setBackgroundResource(R.drawable.bg_unit_selector)
                holder.tvUnitValue.setTextColor(holder.itemView.context.getColor(android.R.color.black))
            } else {
                holder.tvUnitValue.setBackgroundResource(R.drawable.bg_unit_selector_disabled)
                holder.tvUnitValue.setTextColor(holder.itemView.context.getColor(android.R.color.darker_gray))
            }

            holder.itemView.isEnabled = isAvailable
            holder.itemView.alpha = if (isAvailable) 1.0f else 0.5f
            
            holder.itemView.setOnClickListener {
                if (isAvailable) {
                    onUnitClick(unit)
                }
            }
        }

        override fun getItemCount(): Int = units.size
    }
    
    class TimeSlotsAdapter(
        private val timeSlots: List<String>,
        private val selectedTime: String,
        private val onTimeClick: (String) -> Unit
    ) : RecyclerView.Adapter<TimeSlotsAdapter.TimeSlotViewHolder>() {

        class TimeSlotViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val tvTimeSlot: TextView = view.findViewById(R.id.tv_time_slot)
            val ivSelected: View = view.findViewById(R.id.iv_selected)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TimeSlotViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_time_slot, parent, false)
            return TimeSlotViewHolder(view)
        }

        override fun onBindViewHolder(holder: TimeSlotViewHolder, position: Int) {
            val timeSlot = timeSlots[position]
            val isSelected = timeSlot == selectedTime
            
            holder.tvTimeSlot.text = timeSlot
            holder.ivSelected.visibility = if (isSelected) View.VISIBLE else View.GONE
            
            if (isSelected) {
                holder.tvTimeSlot.setTextColor(holder.itemView.context.getColor(android.R.color.black))
            } else {
                holder.tvTimeSlot.setTextColor(holder.itemView.context.getColor(android.R.color.darker_gray))
            }

            holder.itemView.setOnClickListener {
                onTimeClick(timeSlot)
            }
        }

        override fun getItemCount(): Int = timeSlots.size
    }
}

