package com.example.hanamoa

import android.content.SharedPreferences
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.graphics.Color
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions
import com.example.hanamoa.base.BaseFragment
import com.example.hanamoa.databinding.FragmentInvestBinding
import com.example.hanamoa.viewmodel.InvestViewModel
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.formatter.ValueFormatter
import com.github.mikephil.charting.highlight.Highlight
import com.github.mikephil.charting.utils.MPPointF
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

class InvestFragment : BaseFragment<FragmentInvestBinding, InvestViewModel>() {

    override fun getLayoutId(): Int = R.layout.fragment_invest

    override fun getViewModelClass(): Class<InvestViewModel> = InvestViewModel::class.java

    override fun initViewModel() {
        viewModel = createViewModel()
        viewModel.init(requireContext())
    }

    override fun initView() {
        setupSpinner()
        setupChart()
        setupClickListeners()
        setupInfiniteScroll()
        startLiveIndicatorAnimation()
    }

    override fun setupDataBinding() {
        binding.viewModel = viewModel
    }

    override fun setupObservers() {
        viewModel.assets.observe(viewLifecycleOwner, Observer { assets ->
            assets?.let {
                updateAssetsList(it)
            }
        })
        
        viewModel.chartData.observe(viewLifecycleOwner, Observer { chartData ->
            chartData?.let {
                updateChart(it)
            }
        })
        
        viewModel.isLoading.observe(viewLifecycleOwner, Observer { isLoading ->
        })
        
        viewModel.errorMessage.observe(viewLifecycleOwner, Observer { errorMessage ->
            errorMessage?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                viewModel.clearErrorMessage()
            }
        })
    }

    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var orderAdapter: OrderAdapter
    private lateinit var dailyPriceAdapter: DailyPriceAdapter

    private var currentAsset = "gold"
    private var currentChartPeriod = "round" // round, day, week, month, year
    private var marketData = mutableMapOf<String, MarketData>()
    private var orders = mutableListOf<OrderApiData>()
    private var userHoldings = mutableListOf<Holding>()
    
    private var dailyPrices = mutableListOf<DailyPriceTableData>()
    private var currentPage = 1
    private var isLoading = false
    private var hasMoreData = true
    
    private val assetInfo = mapOf(
        "gold" to AssetInfo("GOLD", R.drawable.ic_market_gold),
        "silver" to AssetInfo("SILVER", R.drawable.ic_market_silver),
        "usd" to AssetInfo("USD", R.drawable.ic_market_money),
        "eur" to AssetInfo("EUR", R.drawable.ic_market_money),
        "jpy" to AssetInfo("JPY", R.drawable.ic_market_money),
        "cny" to AssetInfo("CNY", R.drawable.ic_market_money)
    )
    
    private val chartPeriods = mapOf(
        "round" to "회차별",
        "day" to "일",
        "week" to "주", 
        "month" to "월",
        "year" to "년"
    )

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sharedPreferences = requireContext().getSharedPreferences("user_prefs", 0)
        initViews()
        viewModel.loadAssets()
    }

    private fun cancelOrder(order: OrderApiData) {
        android.app.AlertDialog.Builder(requireContext())
            .setTitle("주문 취소")
            .setMessage("이 주문을 취소하시겠습니까?")
            .setPositiveButton("취소") { _, _ ->
                viewModel.cancelOrder(order.id, order.userId)
            }
            .setNegativeButton("아니오", null)
            .show()
    }

    private fun initViews() {
        orderAdapter = OrderAdapter(orders, { order ->
        }, { order ->
            cancelOrder(order)
        })
        binding.rvOrders.layoutManager = LinearLayoutManager(requireContext())
        binding.rvOrders.adapter = orderAdapter
        
        dailyPriceAdapter = DailyPriceAdapter(dailyPrices, currentAsset)
        binding.rvDailyPrices.layoutManager = LinearLayoutManager(requireContext())
        binding.rvDailyPrices.adapter = dailyPriceAdapter
    }

    private fun setupSpinner() {
        val assetNames = assetInfo.values.map { it.name }
        val adapter = ArrayAdapter(requireContext(), R.layout.spinner_item, assetNames)
        adapter.setDropDownViewResource(R.layout.spinner_dropdown_item)
        binding.spinnerAsset.adapter = adapter
        
        binding.spinnerAsset.setSelection(0)
        
        binding.spinnerAsset.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val selectedAsset = assetInfo.keys.elementAt(position)
                currentAsset = selectedAsset
                updateSelectedAssetDisplay()
                loadChartData()
                dailyPriceAdapter.updateAsset(currentAsset)
                loadDailyPrices()
            }
            
            override fun onNothingSelected(parent: AdapterView<*>?) {
            }
        }
    }
    
    private fun setupChart() {
        binding.chartPrice.description.isEnabled = false
        binding.chartPrice.setTouchEnabled(true)
        binding.chartPrice.isDragEnabled = true
        binding.chartPrice.setScaleEnabled(true)
        binding.chartPrice.setPinchZoom(true)
        binding.chartPrice.setBackgroundColor(Color.WHITE)
        
        binding.chartPrice.setMarker(ChartMarker(requireContext()))
        
        val xAxis = binding.chartPrice.xAxis
        xAxis.position = XAxis.XAxisPosition.BOTTOM
        xAxis.setDrawGridLines(false)
        xAxis.setDrawAxisLine(true)
        xAxis.textColor = Color.parseColor("#666666")
        xAxis.textSize = 10f
        
        val leftAxis = binding.chartPrice.axisLeft
        leftAxis.setDrawGridLines(false)
        leftAxis.textColor = Color.parseColor("#666666")
        leftAxis.textSize = 10f
        
        val rightAxis = binding.chartPrice.axisRight
        rightAxis.isEnabled = false
        
        binding.chartPrice.legend.isEnabled = false
        
        setupChartTabs()
        loadChartData()
    }
    
    private fun setupChartTabs() {
        val tabs = listOf(
            binding.tabRound, 
            binding.tabDay, 
            binding.tabWeek, 
            binding.tabMonth, 
            binding.tabYear
        )
        val periods = listOf("round", "day", "week", "month", "year")
        
        tabs.forEachIndexed { index, tab ->
            tab.setOnClickListener {
                currentChartPeriod = periods[index]
                updateChartTabs()
                loadChartData()
            }
        }
        
        updateChartTabs()
    }
    
    private fun updateChartTabs() {
        val tabs = listOf(
            binding.tabRound, 
            binding.tabDay, 
            binding.tabWeek, 
            binding.tabMonth, 
            binding.tabYear
        )
        val periods = listOf("round", "day", "week", "month", "year")
        
        tabs.forEachIndexed { index, tab ->
            if (periods[index] == currentChartPeriod) {
                tab.setBackgroundResource(R.drawable.bg_chart_tab_selected)
                tab.setTextColor(Color.parseColor("#666666"))
            } else {
                tab.setBackgroundResource(R.drawable.bg_chart_tab_unselected)
                tab.setTextColor(Color.parseColor("#666666"))
            }
        }
    }
    
    private fun loadChartData() {
        viewModel.loadChartData(currentAsset, currentChartPeriod)
    }
    
    private fun updateChart(chartData: List<com.example.hanamoa.network.models.ChartData>) {
        val entries = mutableListOf<Entry>()
        val labels = mutableListOf<String>()
        
        chartData.forEachIndexed { index, data ->
            entries.add(Entry(index.toFloat(), data.price.toFloat()))
            labels.add("${index + 1}")
        }
        
        val dataSet = LineDataSet(entries, "가격")
        dataSet.color = Color.parseColor("#00B2A6")
        dataSet.lineWidth = 2f
        dataSet.setCircleColor(Color.parseColor("#00B2A6"))
        dataSet.circleRadius = 3f
        dataSet.setDrawCircleHole(false)
        dataSet.setDrawValues(false)
        dataSet.setDrawFilled(true)
        dataSet.fillColor = Color.parseColor("#1AFFFFFF")
        
        val lineData = LineData(dataSet)
        binding.chartPrice.data = lineData
        
        binding.chartPrice.xAxis.valueFormatter = object : ValueFormatter() {
            override fun getFormattedValue(value: Float): String {
                val index = value.toInt()
                return if (index >= 0 && index < labels.size) labels[index] else ""
            }
        }
        
        binding.chartPrice.invalidate()
    }
    
    private fun updateAssetsList(assets: List<com.example.hanamoa.network.models.Asset>) {
        val assetNames = assets.map { it.name }
        val adapter = ArrayAdapter(requireContext(), R.layout.spinner_item, assetNames)
        adapter.setDropDownViewResource(R.layout.spinner_dropdown_item)
        binding.spinnerAsset.adapter = adapter
    }
    
    
    
    private fun setupInfiniteScroll() {
    }
    
    private fun startLiveIndicatorAnimation() {
        val drawable = binding.ivLiveIndicator.background as? android.graphics.drawable.AnimationDrawable
        drawable?.start()
    }
    
    private fun updateSelectedAssetDisplay() {
        val info = assetInfo[currentAsset] ?: return
        val data = marketData[currentAsset]
        
        binding.tvSelectedAssetName.text = info.name
        
        Glide.with(this)
            .asGif()
            .load(info.imageRes)
            .transition(DrawableTransitionOptions.withCrossFade())
            .into(binding.ivSelectedAsset)
        
        if (data != null) {
            val formatter = NumberFormat.getNumberInstance(Locale.KOREA)
            val currentPrice = if (currentAsset == "silver") {
                data.depositPrice ?: data.currentPrice
            } else {
                data.currentPrice
            }
            
            val displayPrice = if (currentAsset == "gold") currentPrice / 100.0 else currentPrice
            val priceFormatter = NumberFormat.getNumberInstance()
            priceFormatter.maximumFractionDigits = 2
            priceFormatter.minimumFractionDigits = 2
            binding.tvSelectedAssetPrice.text = "${priceFormatter.format(displayPrice)}원"
            
            val displayChangeValue = if (currentAsset == "gold") data.changeValue / 100.0 else data.changeValue
            val changeValueText = "${if (data.isUp == 1) "+" else ""}${priceFormatter.format(displayChangeValue)}원"
            val changeRatioText = "${if (data.isUp == 1) "+" else ""}${String.format("%.2f", data.changeRatio)}%"
            binding.tvSelectedAssetChange.text = "$changeValueText($changeRatioText)"
            
            val color = if (data.isUp == 1) 0xFFED1551.toInt() else 0xFF1B8FF0.toInt()
            binding.tvSelectedAssetChange.setTextColor(color)
        } else {
            binding.tvSelectedAssetPrice.text = "0원"
            binding.tvSelectedAssetChange.text = "+0원(0.00%)"
        }
    }
    
    private fun loadDailyPrices() {
    }

    private fun setupClickListeners() {
        binding.btnBuy.setOnClickListener {
            openOrderDialog("buy")
        }

        binding.btnSell.setOnClickListener {
            openOrderDialog("sell")
        }
    }

    private fun openOrderDialog(orderType: String) {
        if (!isAdded || context == null) return
        
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_order, null)
        val dialog = android.app.AlertDialog.Builder(context)
            .setView(dialogView)
            .create()

        val tvTitle = dialogView.findViewById<TextView>(R.id.tv_dialog_title)
        val ivAsset = dialogView.findViewById<ImageView>(R.id.iv_dialog_asset)
        val tvAssetName = dialogView.findViewById<TextView>(R.id.tv_dialog_asset_name)
        val tvCurrentPrice = dialogView.findViewById<TextView>(R.id.tv_dialog_current_price)
        val tvHoldingQuantity = dialogView.findViewById<TextView>(R.id.tv_holding_quantity)
        val etQuantity = dialogView.findViewById<EditText>(R.id.et_quantity)
        val etPrice = dialogView.findViewById<EditText>(R.id.et_price)
        val tvTotalAmount = dialogView.findViewById<TextView>(R.id.tv_total_amount)
        val btnCancel = dialogView.findViewById<TextView>(R.id.btn_cancel)
        val btnConfirm = dialogView.findViewById<TextView>(R.id.btn_confirm)

        tvTitle.text = if (orderType == "buy") "구매" else "판매"

        if (orderType == "sell") {
            btnConfirm.setBackgroundResource(R.drawable.bg_confirm_dialog_button3)
        } else {
            btnConfirm.setBackgroundResource(R.drawable.bg_confirm_dialog_button2)
        }

        val assetName = when (currentAsset) {
            "gold" -> "GOLD"
            "silver" -> "SILVER"
            "usd" -> "USD"
            "eur" -> "EUR"
            "jpy" -> "JPY"
            "cny" -> "CNY"
            else -> currentAsset.uppercase()
        }
        tvAssetName.text = assetName

        val assetImage = when (currentAsset) {
            "gold" -> R.drawable.ic_market_gold
            "silver" -> R.drawable.ic_market_silver
            "usd", "eur", "jpy", "cny" -> R.drawable.ic_market_money
            else -> R.drawable.ic_market_gold
        }
        ivAsset.setImageResource(assetImage)

        val priceFormatter = NumberFormat.getNumberInstance()
        priceFormatter.maximumFractionDigits = 2
        priceFormatter.minimumFractionDigits = 2
        
        if (orderType == "sell") {
            val userId = sharedPreferences.getString("user_id", null)
            if (userId != null) {
                CoroutineScope(Dispatchers.Main).launch {
                    try {
                        val holdingResult = withContext(Dispatchers.IO) {
                            ApiService.getUserHolding(userId, currentAsset)
                        }
                        
                        if (holdingResult.success && holdingResult.data != null) {
                            val holding = holdingResult.data
                            val unit = if (currentAsset == "gold" || currentAsset == "silver") "g" else "개"
                            val displayQuantity = if (currentAsset == "gold") holding.quantity else holding.quantity
                            
                            if (isAdded && context != null) {
                                tvHoldingQuantity.visibility = View.VISIBLE
                                tvHoldingQuantity.text = "보유: ${priceFormatter.format(displayQuantity)}$unit"
                            }
                        } else {
                            if (isAdded && context != null) {
                                tvHoldingQuantity.visibility = View.VISIBLE
                                tvHoldingQuantity.text = "보유: 0${if (currentAsset == "gold" || currentAsset == "silver") "g" else "개"}"
                            }
                        }
                    } catch (e: Exception) {
                        android.util.Log.e("OrderDialog", "Failed to load holding quantity: ${e.message}")
                        if (isAdded && context != null) {
                            tvHoldingQuantity.visibility = View.VISIBLE
                            tvHoldingQuantity.text = "보유: 0${if (currentAsset == "gold" || currentAsset == "silver") "g" else "개"}"
                        }
                    }
                }
            }
        }
        
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    val apiService = ApiService.getInstance()
                    apiService.getMarketData(currentAsset)
                }
                
                if (result.success && result.data != null) {
                    val currentPrice = result.data.currentPrice
                    val displayPrice = if (currentAsset == "gold") currentPrice / 100.0 else currentPrice
                    
                    android.util.Log.d("OrderDialog", "Real-time price - currentAsset: $currentAsset, currentPrice: $currentPrice, displayPrice: $displayPrice")
                    
                    if (isAdded && context != null) {
                        tvCurrentPrice.text = "${priceFormatter.format(displayPrice)}원"
                        etPrice.setText(priceFormatter.format(displayPrice))
                    }
                } else {
                    val defaultPrice = when (currentAsset) {
                        "gold" -> 1234.56
                        "silver" -> 19.75
                        "usd" -> 943.87
                        "eur" -> 1646.43
                        "jpy" -> 943.87
                        "cny" -> 6.85
                        else -> 100.0
                    }
                    
                    if (isAdded && context != null) {
                        tvCurrentPrice.text = "${priceFormatter.format(defaultPrice)}원"
                        etPrice.setText(priceFormatter.format(defaultPrice))
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e("OrderDialog", "Failed to load real-time price: ${e.message}")
                val defaultPrice = when (currentAsset) {
                    "gold" -> 1234.56
                    "silver" -> 19.75
                    "usd" -> 943.87
                    "eur" -> 1646.43
                    "jpy" -> 943.87
                    "cny" -> 6.85
                    else -> 100.0
                }
                
                if (isAdded && context != null) {
                    tvCurrentPrice.text = "${priceFormatter.format(defaultPrice)}원"
                    etPrice.setText(priceFormatter.format(defaultPrice))
                }
            }
        }

        fun updateTotalAmount() {
            try {
                val quantityText = etQuantity.text.toString()
                val priceText = etPrice.text.toString()
                
                val quantity = quantityText.replace(",", "").toDoubleOrNull() ?: 0.0
                val price = priceText.replace(",", "").toDoubleOrNull() ?: 0.0
                
                android.util.Log.d("OrderDialog", "updateTotalAmount - quantityText: '$quantityText', priceText: '$priceText', quantity: $quantity, price: $price")
                
                if (quantity > 0 && price > 0) {
                    val total = if (currentAsset == "gold") {
                        quantity * price * 100
                    } else {
                        quantity * price
                    }
                    
                    android.util.Log.d("OrderDialog", "updateTotalAmount - quantity: $quantity, price: $price, total: $total")

                    val displayTotal = if (currentAsset == "gold") total  else total
                    tvTotalAmount.text = "${priceFormatter.format(displayTotal)}원"
                } else {
                    android.util.Log.d("OrderDialog", "updateTotalAmount - quantity or price is 0, setting to 0원")
                    tvTotalAmount.text = "0원"
                }
            } catch (e: Exception) {
                android.util.Log.e("OrderDialog", "updateTotalAmount error: ${e.message}")
                tvTotalAmount.text = "0원"
            }
        }

        etQuantity.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                updateTotalAmount()
            }
        })

        etPrice.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                updateTotalAmount()
            }
        })

        btnCancel.setOnClickListener {
            dialog.dismiss()
        }

        btnConfirm.setOnClickListener {
            val quantity = etQuantity.text.toString().replace(",", "").toDoubleOrNull()
            val price = etPrice.text.toString().replace(",", "").toDoubleOrNull()

            android.util.Log.d("OrderDialog", "Confirm button - quantityText: '${etQuantity.text}', priceText: '${etPrice.text}', quantity: $quantity, price: $price")

            if (quantity == null || quantity <= 0) {
                if (isAdded && context != null) {
                    android.widget.Toast.makeText(context, "올바른 수량을 입력해주세요.", android.widget.Toast.LENGTH_SHORT).show()
                }
                return@setOnClickListener
            }

            if (price == null || price <= 0) {
                if (isAdded && context != null) {
                    android.widget.Toast.makeText(context, "올바른 가격을 입력해주세요.", android.widget.Toast.LENGTH_SHORT).show()
                }
                return@setOnClickListener
            }

            val minQuantity = if (currentAsset == "gold" || currentAsset == "silver") 0.01 else 1.0
            if (quantity < minQuantity) {
                if (isAdded && context != null) {
                    android.widget.Toast.makeText(context, "최소 수량은 ${minQuantity}${if (currentAsset == "gold" || currentAsset == "silver") "g" else "개"}입니다.", android.widget.Toast.LENGTH_SHORT).show()
                }
                return@setOnClickListener
            }

            if (orderType == "sell") {
                val userId = sharedPreferences.getString("user_id", null)
                if (userId != null) {
                    CoroutineScope(Dispatchers.Main).launch {
                        try {
                            val holdingResult = withContext(Dispatchers.IO) {
                                ApiService.getUserHolding(userId, currentAsset)
                            }
                            
                            if (holdingResult.success && holdingResult.data != null) {
                                val holding = holdingResult.data
                                val holdingQuantity = if (currentAsset == "gold") holding.quantity else holding.quantity
                                
                                if (quantity > holdingQuantity) {
                                    if (isAdded && context != null) {
                                        val unit = if (currentAsset == "gold" || currentAsset == "silver") "g" else "개"
                                        android.widget.Toast.makeText(context, "보유 수량(${priceFormatter.format(holdingQuantity)}$unit)보다 많이 판매할 수 없습니다.", android.widget.Toast.LENGTH_SHORT).show()
                                    }
                                    return@launch
                                }
                            } else {
                                if (isAdded && context != null) {
                                    android.widget.Toast.makeText(context, "판매할 수 있는 자산이 없습니다.", android.widget.Toast.LENGTH_SHORT).show()
                                }
                                return@launch
                            }
                            
                            createOrder(orderType, quantity, price)
                            dialog.dismiss()
                            
                        } catch (e: Exception) {
                            android.util.Log.e("OrderDialog", "Failed to validate holding quantity: ${e.message}")
                            if (isAdded && context != null) {
                                android.widget.Toast.makeText(context, "보유 수량 확인 중 오류가 발생했습니다.", android.widget.Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                } else {
                    if (isAdded && context != null) {
                        android.widget.Toast.makeText(context, "로그인이 필요합니다.", android.widget.Toast.LENGTH_SHORT).show()
                    }
                }
            } else {
                createOrder(orderType, quantity, price)
                dialog.dismiss()
            }
        }

        dialog.show()
    }

    private fun createOrder(orderType: String, quantity: Double, price: Double) {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val userId = sharedPreferences.getString("user_id", null)
                if (userId == null) {
                    if (isAdded && context != null) {
                        android.widget.Toast.makeText(context, "로그인이 필요합니다.", android.widget.Toast.LENGTH_SHORT).show()
                    }
                    return@launch
                }

                val apiService = ApiService.getInstance()
                val accountsResponse = apiService.getUserAccounts(userId)
                if (!accountsResponse.success || accountsResponse.data.isNullOrEmpty()) {
                    if (isAdded && context != null) {
                        android.widget.Toast.makeText(context, "계좌 정보를 찾을 수 없습니다.", android.widget.Toast.LENGTH_SHORT).show()
                    }
                    return@launch
                }

                val account = accountsResponse.data!!.first()
                
                val limitPrice = price

                val response = ApiService.createOrder(
                    userId = userId,
                    accountId = account.id,
                    asset = currentAsset,
                    orderType = orderType,
                    priceType = "limit",
                    limitPrice = limitPrice,
                    quantity = quantity
                )

                if (response.success) {
                    val order = response.data
                    if (order?.status == "COMPLETED") {
                        showOrderSuccessDialog(order, isCompleted = true)
                    } else {
                        showOrderSuccessDialog(order!!, isCompleted = false)
                    }
                    loadOrders()
                } else {
                    if (isAdded && context != null) {
                        android.widget.Toast.makeText(context, response.message ?: "주문 생성에 실패했습니다.", android.widget.Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                if (isAdded && context != null) {
                    android.widget.Toast.makeText(context, "주문 생성 중 오류가 발생했습니다.", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun showOrderSuccessDialog(order: OrderApiData, isCompleted: Boolean) {
        if (!isAdded || context == null) return
        
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_order_success, null)
        val dialog = android.app.AlertDialog.Builder(context)
            .setView(dialogView)
            .setCancelable(false)
            .create()

        val ivSuccessGif = dialogView.findViewById<ImageView>(R.id.iv_success_gif)
        val tvSuccessTitle = dialogView.findViewById<TextView>(R.id.tv_success_title)
        val tvOrderInfo = dialogView.findViewById<TextView>(R.id.tv_order_info)
        val btnConfirm = dialogView.findViewById<TextView>(R.id.btn_confirm)

        val assetName = when (order.asset) {
            "gold" -> "GOLD"
            "silver" -> "SILVER"
            "usd" -> "USD"
            "eur" -> "EUR"
            "jpy" -> "JPY"
            "cny" -> "CNY"
            else -> order.asset.uppercase()
        }

        val orderTypeText = if (order.orderType == "buy") "구매" else "판매"

        val unit = if (order.asset == "gold" || order.asset == "silver") "g" else "개"
        val quantityText = if (order.asset == "gold" || order.asset == "silver") {
            "${order.quantity}$unit"
        } else {
            "${order.quantity.toInt()}$unit"
        }

        if (isCompleted) {
            tvSuccessTitle.text = "주문이 체결되었습니다!"
            tvOrderInfo.text = "$assetName $quantityText $orderTypeText 완료"
        } else {
            tvSuccessTitle.text = "주문이 대기되었습니다!"
            tvOrderInfo.text = "지정된 가격에 도달하면 체결됩니다."
        }

        Glide.with(requireContext())
            .load(R.drawable.ic_check)
            .into(ivSuccessGif)

        btnConfirm.setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun loadMarketData() {
        val assets = listOf("gold", "silver", "usd", "eur", "jpy", "cny")

        CoroutineScope(Dispatchers.Main).launch {
            try {
                assets.forEach { asset ->
                    val result = withContext(Dispatchers.IO) {
                        val apiService = ApiService.getInstance()
                        apiService.getMarketData(asset)
                    }

                    if (result.success && result.data != null) {
                        marketData[asset] = result.data
                        if (asset == currentAsset) {
                            updateSelectedAssetDisplay()
                        }
                    }
                }
            } catch (e: Exception) {
                if (isAdded && context != null) {
                    Toast.makeText(context, "시세 정보를 불러올 수 없습니다", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun loadUserHoldings() {
        val userId = sharedPreferences.getString("user_id", null) ?: return

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    val apiService = ApiService.getInstance()
                    apiService.getUserHoldings(userId)
                }

                if (result.success && result.data != null) {
                    userHoldings.clear()
                    userHoldings.addAll(result.data)
                }
            } catch (e: Exception) {
                if (isAdded && context != null) {
                    Toast.makeText(context, "보유 자산을 불러올 수 없습니다", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun loadOrders() {
        val userId = sharedPreferences.getString("user_id", null) ?: return

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    val apiService = ApiService.getInstance()
                    apiService.getOrders(userId, limit = 50, offset = 0)
                }

                if (result.success && result.data != null) {
                    orders.clear()
                    orders.addAll(result.data)
                    orderAdapter.notifyDataSetChanged()
                } else {
                    if (isAdded && context != null) {
                        Toast.makeText(context, "주문 내역을 불러올 수 없습니다: ${result.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                if (isAdded && context != null) {
                    Toast.makeText(context, "주문 내역 로드 중 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }




    private fun showPendingOrders() {
        val pendingOrders = orders.filter { it.status == "PENDING" }
    }
}

data class MarketData(
    val currentPrice: Double,
    val changeValue: Double,
    val changeRatio: Double,
    val isUp: Int,
    val depositPrice: Double? = null,
    val withdrawalPrice: Double? = null
)


data class Order(
    val id: String? = null,
    val userId: String,
    val asset: String,
    val type: String, // "BUY" or "SELL"
    val quantity: Double,
    val price: Double,
    val status: String = "PENDING", // "PENDING", "COMPLETED", "CANCELLED"
    val createdAt: String? = null
)

data class OrderListApiResponse(
    val success: Boolean,
    val orders: List<OrderApiData>,
    val total: Int,
    val limit: Int,
    val offset: Int
)

data class OrderApiData(
    val id: String,
    val userId: String,
    val accountId: String,
    val asset: String,
    val orderType: String,
    val priceType: String,
    val limitPrice: Double,
    val quantity: Double,
    val status: String,
    val createdAt: String,
    val updatedAt: String,
    val executions: List<Any>,
    val account: AccountInfo
)

data class AccountInfo(
    val accountName: String
)

data class AssetInfo(
    val name: String,
    val imageRes: Int
)

data class ChartApiResponse(
    val isSuccess: Boolean,
    val detailCode: String,
    val message: String,
    val result: ChartResult
)

data class ChartResult(
    val code: String,
    val infoType: String,
    val periodType: String,
    val openPrice: Double,
    val lastClosePrice: Double,
    val tradeBaseAt: String,
    val lastTradeBaseAt: String,
    val localDateTimeNow: String,
    val priceInfos: List<PriceInfo>
)

data class PriceInfo(
    val localDateTime: String,
    val currentPrice: Double,
    val degreeCount: String
)

data class DailyChartApiResponse(
    val success: Boolean,
    val data: List<DailyPriceData>,
    val asset: String,
    val timeframe: String,
    val count: Int
)

data class DailyPriceData(
    val date: String,
    val price: Double,
    val change: Double,
    val ratio: Double
)

data class DailyPriceTableApiResponse(
    val success: Boolean,
    val data: List<DailyPriceTableData>
)

data class DailyPriceTableData(
    val date: String,
    val close: Double,
    val diff: Double,
    val ratio: Double
)

class ChartMarker(context: android.content.Context) : com.github.mikephil.charting.components.MarkerView(context, R.layout.chart_marker) {
    private val tvContent: TextView = findViewById(R.id.tv_marker_content)
    
    override fun refreshContent(e: Entry?, highlight: Highlight?) {
        if (e != null) {
            val formatter = NumberFormat.getNumberInstance()
            formatter.maximumFractionDigits = 2
            formatter.minimumFractionDigits = 2
            tvContent.text = "${formatter.format(e.y)}원"
        }
        super.refreshContent(e, highlight)
    }
    
    override fun getOffset(): MPPointF {
        return MPPointF(-(width / 2).toFloat(), -height.toFloat())
    }
}

class DailyPriceAdapter(
    private val dailyPrices: MutableList<DailyPriceTableData>,
    private val currentAsset: String
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    
    companion object {
        private const val TYPE_HEADER = 0
        private const val TYPE_ITEM = 1
    }
    
    override fun getItemViewType(position: Int): Int {
        return if (position == 0) TYPE_HEADER else TYPE_ITEM
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            TYPE_HEADER -> {
                val view = LayoutInflater.from(parent.context).inflate(R.layout.item_daily_price_header, parent, false)
                HeaderViewHolder(view)
            }
            else -> {
                val view = LayoutInflater.from(parent.context).inflate(R.layout.item_daily_price, parent, false)
                ItemViewHolder(view)
            }
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (holder) {
            is ItemViewHolder -> {
                val data = dailyPrices[position - 1] // 헤더 때문에 -1
                holder.bind(data, currentAsset)
            }
        }
    }
    
    override fun getItemCount(): Int = dailyPrices.size + 1 // 헤더 포함
    
    fun updateAsset(asset: String) {
        notifyDataSetChanged()
    }
    
    class HeaderViewHolder(view: View) : RecyclerView.ViewHolder(view)
    
    class ItemViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val tvDate: TextView = view.findViewById(R.id.tv_date)
        private val tvClose: TextView = view.findViewById(R.id.tv_close)
        private val tvDiff: TextView = view.findViewById(R.id.tv_diff)
        private val tvRatio: TextView = view.findViewById(R.id.tv_ratio)
        
        fun bind(data: DailyPriceTableData, currentAsset: String) {
            tvDate.text = formatDateToMonthDay(data.date)
            
            val formatter = NumberFormat.getNumberInstance()
            formatter.maximumFractionDigits = 2
            formatter.minimumFractionDigits = 2
            
            tvClose.text = formatter.format(data.close)
            
            val diffText = "${if (data.diff >= 0) "+" else ""}${formatter.format(data.diff)}"
            val ratioText = "${if (data.ratio >= 0) "+" else ""}${String.format("%.2f", data.ratio)}%"
            
            tvDiff.text = diffText
            tvRatio.text = ratioText
            
            val color = if (data.diff >= 0) 0xFFED1551.toInt() else 0xFF1B8FF0.toInt()
            tvDiff.setTextColor(color)
            tvRatio.setTextColor(color)
        }
        
        private fun formatDateToMonthDay(dateString: String): String {
            return try {
                val cleanDateString = if (dateString.contains("T")) {
                    dateString.substringBefore("T")
                } else {
                    dateString
                }
                
                val parts = cleanDateString.split("-")
                if (parts.size >= 3) {
                    val month = parts[1].toInt()
                    val day = parts[2].toInt()
                    "${month}월 ${day}일"
                } else {
                    dateString
                }
            } catch (e: Exception) {
                dateString
            }
        }
    }
}


