package com.example.hanamoa

import android.content.SharedPreferences
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class GiftFragment : Fragment() {

    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var layoutFriendSelector: LinearLayout
    private lateinit var ivFriendProfile: ImageView
    private lateinit var tvFriendSelectorText: TextView
    private lateinit var tvSelectedFriendName: TextView
    private lateinit var ivDropdownArrow: ImageView
    private lateinit var layoutFriendsDropdown: LinearLayout
    private lateinit var rvFriends: RecyclerView
    private lateinit var layoutAddFriend: LinearLayout
    private lateinit var layoutFriendSearch: LinearLayout
    private lateinit var etSearchFriend: EditText
    private lateinit var btnSearchFriend: Button
    private lateinit var layoutAssetSelector: LinearLayout
    private lateinit var ivSelectedAsset: ImageView
    private lateinit var tvSelectedAssetName: TextView
    private lateinit var ivAssetDropdownArrow: ImageView
    private lateinit var layoutAssetsDropdown: LinearLayout
    private lateinit var rvAssets: RecyclerView
    private lateinit var tvHoldingInfo: TextView
    private lateinit var etQuantity: EditText
    private lateinit var rvMessageCards: RecyclerView
    private lateinit var etMessage: EditText
    private lateinit var btnSendGift: Button

    private var friendsList = mutableListOf<Friend>()
    private var selectedFriend: Friend? = null
    private var searchedUser: FriendSearchUser? = null
    private var friendsAdapter: FriendsAdapter? = null
    
    private var assetsList = mutableListOf<String>()
    private var selectedAsset: String = "gold"
    private var assetsAdapter: AssetsAdapter? = null
    
    private var messageCardsList = mutableListOf<String>()
    private var selectedMessageCard: String = ""
    private var messageCardsAdapter: MessageCardsAdapter? = null
    
    private var userHoldings = mutableMapOf<String, Double>() // 자산별 보유량
    private var currentHolding: Double = 0.0 // 현재 선택된 자산의 보유량
    
    private val assetInfo = mapOf(
        "gold" to AssetInfo("GOLD", R.drawable.ic_market_gold),
        "silver" to AssetInfo("SILVER", R.drawable.ic_market_silver),
        "usd" to AssetInfo("USD", R.drawable.ic_market_money),
        "eur" to AssetInfo("EUR", R.drawable.ic_market_money),
        "jpy" to AssetInfo("JPY", R.drawable.ic_market_money),
        "cny" to AssetInfo("CNY", R.drawable.ic_market_money)
    )
    
    private val assetMinUnits = mapOf(
        "gold" to 0.01,
        "silver" to 1.0,
        "usd" to 1.0,
        "eur" to 1.0,
        "jpy" to 1.0,
        "cny" to 1.0
    )
    
    data class AssetInfo(
        val name: String,
        val imageRes: Int
    )
    
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
            holder.ivAssetImage.setImageResource(info.imageRes)
            
            holder.ivSelected.visibility = View.GONE

            holder.itemView.setOnClickListener {
                onAssetClick(asset)
            }
        }

        override fun getItemCount() = assets.size
    }
    
    class MessageCardsAdapter(
        private val messageCards: List<String>,
        private val selectedMessageCard: String,
        private val onMessageCardClick: (String) -> Unit
    ) : RecyclerView.Adapter<MessageCardsAdapter.MessageCardViewHolder>() {

        class MessageCardViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val ivMessageCard: ImageView = view.findViewById(R.id.iv_message_card)
            val tvMessageCardName: TextView = view.findViewById(R.id.tv_message_card_name)
            val itemLayout: LinearLayout = view as LinearLayout
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageCardViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_message_card, parent, false)
            return MessageCardViewHolder(view)
        }

        override fun onBindViewHolder(holder: MessageCardViewHolder, position: Int) {
            val messageCard = messageCards[position]
            
            holder.tvMessageCardName.text = messageCard
            
            val resourceName = "ic_${messageCard}"
            val resourceId = holder.itemView.context.resources.getIdentifier(
                resourceName, 
                "drawable", 
                holder.itemView.context.packageName
            )
            
            if (resourceId != 0) {
                holder.ivMessageCard.setImageResource(resourceId)
            } else {
                holder.ivMessageCard.setImageResource(R.drawable.ic_happy)
            }
            
            if (messageCard == selectedMessageCard) {
                holder.itemLayout.setBackgroundResource(R.drawable.bg_message_card_selected)
            } else {
                holder.itemLayout.setBackgroundResource(R.drawable.bg_message_card_unselected)
            }

            holder.itemView.setOnClickListener {
                onMessageCardClick(messageCard)
            }
        }

        override fun getItemCount() = messageCards.size
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_gift, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        sharedPreferences = requireContext().getSharedPreferences("user_prefs", android.content.Context.MODE_PRIVATE)
        
        initViews(view)
        setupSpinners()
        setupClickListeners()
        setupTextWatchers()
        loadFriends()
        loadUserHoldings()
    }

    private fun initViews(view: View) {
        layoutFriendSelector = view.findViewById(R.id.layout_friend_selector)
        ivFriendProfile = view.findViewById(R.id.iv_friend_profile)
        tvFriendSelectorText = view.findViewById(R.id.tv_friend_selector_text)
        tvSelectedFriendName = view.findViewById(R.id.tv_selected_friend_name)
        ivDropdownArrow = view.findViewById(R.id.iv_dropdown_arrow)
        layoutFriendsDropdown = view.findViewById(R.id.layout_friends_dropdown)
        rvFriends = view.findViewById(R.id.rv_friends)
        layoutAddFriend = view.findViewById(R.id.layout_add_friend)
        layoutFriendSearch = view.findViewById(R.id.layout_friend_search)
        etSearchFriend = view.findViewById(R.id.et_search_friend)
        btnSearchFriend = view.findViewById(R.id.btn_search_friend)
        layoutAssetSelector = view.findViewById(R.id.layout_asset_selector)
        ivSelectedAsset = view.findViewById(R.id.iv_selected_asset)
        tvSelectedAssetName = view.findViewById(R.id.tv_selected_asset_name)
        ivAssetDropdownArrow = view.findViewById(R.id.iv_asset_dropdown_arrow)
        layoutAssetsDropdown = view.findViewById(R.id.layout_assets_dropdown)
        rvAssets = view.findViewById(R.id.rv_assets)
        tvHoldingInfo = view.findViewById(R.id.tv_holding_info)
        etQuantity = view.findViewById(R.id.et_quantity)
        rvMessageCards = view.findViewById(R.id.rv_message_cards)
        etMessage = view.findViewById(R.id.et_message)
        btnSendGift = view.findViewById(R.id.btn_send_gift)

        rvFriends.layoutManager = LinearLayoutManager(requireContext())
        friendsAdapter = FriendsAdapter(friendsList) { friend ->
            selectFriend(friend)
        }
        rvFriends.adapter = friendsAdapter
        
        rvAssets.layoutManager = LinearLayoutManager(requireContext())
        updateAssetsList()
        
        rvMessageCards.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        messageCardsList = mutableListOf("happy", "clap", "cold", "devil", "diamond", "good", "heart", "sad", "sunglass")
        messageCardsAdapter = MessageCardsAdapter(messageCardsList, selectedMessageCard) { messageCard ->
            selectMessageCard(messageCard)
        }
        rvMessageCards.adapter = messageCardsAdapter
    }

    private fun setupSpinners() {
        updateSelectedAssetDisplay("gold")
        updateCurrentHolding()
    }

    private fun setupClickListeners() {
        layoutFriendSelector.setOnClickListener {
            toggleFriendsDropdown()
        }

        layoutAddFriend.setOnClickListener {
            showFriendSearch()
        }

        btnSearchFriend.setOnClickListener {
            searchFriend()
        }

        layoutAssetSelector.setOnClickListener {
            toggleAssetsDropdown()
        }

        btnSendGift.setOnClickListener {
            sendGift()
        }
    }

    private fun setupTextWatchers() {
        val textWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                updateSendButtonState()
            }
        }

        val quantityWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                validateQuantityInput()
                updateSendButtonState()
            }
        }

        etQuantity.addTextChangedListener(quantityWatcher)
        etMessage.addTextChangedListener(textWatcher)
        
        etQuantity.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                etQuantity.clearFocus()
            }
        }
        
        etMessage.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                etMessage.clearFocus()
            }
        }
        
        etSearchFriend.addTextChangedListener(PhoneNumberTextWatcher(etSearchFriend))
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
                    updateCurrentHolding()
                } else {
                    userHoldings.clear()
                    updateCurrentHolding()
                }
            } catch (e: Exception) {
                userHoldings.clear()
                updateCurrentHolding()
            }
        }
    }

    private fun loadFriends() {
        val userId = sharedPreferences.getString("user_id", null) ?: return

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().getFriends(userId)
                }

                if (result.success && result.data != null) {
                    friendsList.clear()
                    friendsList.addAll(result.data)
                    friendsAdapter?.notifyDataSetChanged()
                } else {
                    Toast.makeText(requireContext(), result.message ?: "친구 목록 조회에 실패했습니다", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "친구 목록 로드 중 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun searchFriend() {
        val phone = etSearchFriend.text.toString().trim().replace("-", "")
        if (phone.isEmpty()) {
            Toast.makeText(requireContext(), "전화번호를 입력해주세요", Toast.LENGTH_SHORT).show()
            return
        }

        val userId = sharedPreferences.getString("user_id", null) ?: return

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().searchFriend(phone, userId)
                }

                if (result.success && result.data != null) {
                    searchedUser = result.data.user
                    if (result.data.isAlreadyFriend) {
                        Toast.makeText(requireContext(), "이미 친구입니다", Toast.LENGTH_SHORT).show()
                    } else if (result.data.hasPendingRequest) {
                        Toast.makeText(requireContext(), "친구 신청이 대기 중입니다", Toast.LENGTH_SHORT).show()
                    } else {
                        sendFriendRequest(result.data.user)
                    }
                } else {
                    Toast.makeText(requireContext(), result.message ?: "친구 검색에 실패했습니다", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "친구 검색 중 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun sendFriendRequest(user: FriendSearchUser) {
        val userId = sharedPreferences.getString("user_id", null) ?: return
        val friendRequest = FriendRequest(
            senderId = userId,
            receiverId = user.id,
            message = "안녕하세요! 친구가 되고 싶어요."
        )

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().sendFriendRequest(friendRequest)
                }

                if (result.success) {
                    Toast.makeText(requireContext(), "친구 신청이 전송되었습니다", Toast.LENGTH_SHORT).show()
                    loadFriends() // 친구 목록 새로고침
                    hideFriendSearch() // 친구 검색 창 숨기기
                } else {
                    Toast.makeText(requireContext(), result.message ?: "친구 신청 전송에 실패했습니다", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "친구 신청 전송 중 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun toggleFriendsDropdown() {
        if (layoutFriendsDropdown.visibility == View.VISIBLE) {
            hideFriendsDropdown()
        } else {
            showFriendsDropdown()
        }
    }

    private fun showFriendsDropdown() {
        layoutFriendsDropdown.visibility = View.VISIBLE
        ivDropdownArrow.rotation = 180f
    }

    private fun hideFriendsDropdown() {
        layoutFriendsDropdown.visibility = View.GONE
        ivDropdownArrow.rotation = 0f
    }

    private fun showFriendSearch() {
        layoutFriendSearch.visibility = View.VISIBLE
        hideFriendsDropdown()
    }

    private fun hideFriendSearch() {
        layoutFriendSearch.visibility = View.GONE
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

    private fun updateSelectedAssetDisplay(assetCode: String) {
        val info = assetInfo[assetCode] ?: return
        
        tvSelectedAssetName.text = info.name
        
        ivSelectedAsset.setImageResource(info.imageRes)
    }
    
    private fun updateAssetsList() {
        val allAssets = listOf("gold", "silver", "usd", "eur", "jpy", "cny")
        assetsList = allAssets.filter { it != selectedAsset }.toMutableList()
        
        assetsAdapter = AssetsAdapter(assetsList, selectedAsset, assetInfo) { asset ->
            selectAsset(asset)
        }
        rvAssets.adapter = assetsAdapter
    }
    
    private fun selectAsset(asset: String) {
        selectedAsset = asset
        updateSelectedAssetDisplay(asset)
        hideAssetsDropdown()
        
        updateAssetsList()
        
        updateCurrentHolding()
    }
    
    private fun selectMessageCard(messageCard: String) {
        selectedMessageCard = messageCard
        
        messageCardsAdapter = MessageCardsAdapter(messageCardsList, selectedMessageCard) { selectedMessageCard ->
            selectMessageCard(selectedMessageCard)
        }
        rvMessageCards.adapter = messageCardsAdapter
    }
    
    private fun updateCurrentHolding() {
        currentHolding = userHoldings[selectedAsset] ?: 0.0
        updateQuantityInputHint()
    }
    
    private fun updateQuantityInputHint() {
        val minUnit = assetMinUnits[selectedAsset] ?: 1.0
        val unit = if (selectedAsset == "gold" || selectedAsset == "silver") "g" else "개"
        
        val holdingText = if (currentHolding % 1.0 == 0.0) {
            "보유량: ${currentHolding.toInt()}$unit"
        } else {
            "보유량: ${String.format("%.2f", currentHolding)}$unit"
        }
        tvHoldingInfo.text = holdingText
        
        val minUnitText = if (minUnit % 1.0 == 0.0) {
            minUnit.toInt().toString()
        } else {
            String.format("%.2f", minUnit)
        }
        etQuantity.hint = "수량을 입력하세요 (최소 단위: $minUnitText)"
    }
    
    private fun validateQuantityInput() {
        val input = etQuantity.text.toString().trim()
        if (input.isEmpty()) {
            etQuantity.error = null
            return
        }
        
        val quantity = input.toDoubleOrNull()
        if (quantity == null) {
            etQuantity.error = "올바른 숫자를 입력해주세요"
            return
        }
        
        val minUnit = assetMinUnits[selectedAsset] ?: 1.0
        
        val remainder = quantity % minUnit
        val tolerance = 1e-10 // 매우 작은 허용 오차
        if (remainder > tolerance && remainder < (minUnit - tolerance)) {
            val minUnitText = if (minUnit % 1.0 == 0.0) {
                minUnit.toInt().toString()
            } else {
                String.format("%.2f", minUnit)
            }
            etQuantity.error = "최소 단위($minUnitText)로 입력해주세요"
            return
        }
        
        if (quantity > currentHolding) {
            val unit = if (selectedAsset == "gold" || selectedAsset == "silver") "g" else "개"
            etQuantity.error = "보유량(${String.format("%.2f", currentHolding)}$unit)을 초과할 수 없습니다"
            return
        }
        
        if (quantity <= 0) {
            etQuantity.error = "0보다 큰 값을 입력해주세요"
            return
        }
        
        etQuantity.error = null
    }

    private fun selectFriend(friend: Friend) {
        selectedFriend = friend
        
        setProfileImage(ivFriendProfile, friend.profileImage)
        
        tvFriendSelectorText.visibility = View.GONE
        tvSelectedFriendName.text = friend.friendName
        tvSelectedFriendName.visibility = View.VISIBLE
        
        hideFriendsDropdown()
        
        updateSendButtonState()
    }
    
    private fun setProfileImage(imageView: ImageView, profileImage: String?) {
        if (!profileImage.isNullOrEmpty()) {
            val resourceName = "ic_${profileImage}"
            val resourceId = imageView.context.resources.getIdentifier(
                resourceName, 
                "drawable", 
                imageView.context.packageName
            )
            
            if (resourceId != 0) {
                imageView.setImageResource(resourceId)
            } else {
                imageView.setImageResource(R.drawable.ic_person)
            }
        } else {
            imageView.setImageResource(R.drawable.ic_person)
        }
    }

    private fun updateSendButtonState() {
        val hasSelectedFriend = selectedFriend != null
        val quantityText = etQuantity.text.toString().trim()
        val hasQuantity = quantityText.isNotEmpty()
        
        val isValidQuantity = if (hasQuantity) {
            val quantity = quantityText.toDoubleOrNull()
            if (quantity != null && quantity > 0 && quantity <= currentHolding) {
                val minUnit = assetMinUnits[selectedAsset] ?: 1.0
                val remainder = quantity % minUnit
                val tolerance = 1e-10
                remainder <= tolerance || remainder >= (minUnit - tolerance)
            } else {
                false
            }
        } else {
            false
        }

        btnSendGift.isEnabled = hasSelectedFriend && hasQuantity && isValidQuantity
    }

    private fun sendGift() {
        val friend = selectedFriend ?: return
        val quantity = etQuantity.text.toString().trim().toDoubleOrNull() ?: return
        val message = etMessage.text.toString().trim()
        val asset = selectedAsset
        val messageCard = if (selectedMessageCard.isEmpty()) "happy" else selectedMessageCard
        
        val finalMessage = if (message.isEmpty()) "선물을 보냅니다!" else message

        val userId = sharedPreferences.getString("user_id", null) ?: return

        val giftRequest = GiftRequest(
            senderId = userId,
            receiverId = friend.friendId,
            asset = asset,
            quantity = quantity,
            messageCard = messageCard,
            message = finalMessage
        )

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().sendGift(giftRequest)
                }

                if (result.success) {
                    showGiftSuccessDialog(friend, asset, quantity, finalMessage)
                    resetForm()
                } else {
                    Toast.makeText(requireContext(), result.message ?: "선물 전송에 실패했습니다", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "선물 전송 중 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showGiftSuccessDialog(friend: Friend, asset: String, quantity: Double, message: String) {
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

        val assetName = when (asset) {
            "gold" -> "GOLD"
            "silver" -> "SILVER"
            "usd" -> "USD"
            "eur" -> "EUR"
            "jpy" -> "JPY"
            "cny" -> "CNY"
            else -> asset.uppercase()
        }

        val unit = if (asset == "gold" || asset == "silver") "g" else "개"
        val quantityText = if (asset == "gold" || asset == "silver") {
            "${quantity}$unit"
        } else {
            "${quantity.toInt()}$unit"
        }

        tvSuccessTitle.text = "선물이 전송되었습니다!"
        tvOrderInfo.text = "${friend.friendName}님에게 $assetName $quantityText 선물 완료"

        Glide.with(this)
            .asGif()
            .load(R.drawable.ic_check)
            .transition(DrawableTransitionOptions.withCrossFade())
            .into(ivSuccessGif)

        btnConfirm.setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun resetForm() {
        selectedFriend = null
        
        ivFriendProfile.setImageResource(R.drawable.ic_person)
        tvFriendSelectorText.visibility = View.VISIBLE
        tvSelectedFriendName.visibility = View.GONE
        hideFriendsDropdown()
        hideFriendSearch()
        
        selectedMessageCard = ""
        messageCardsAdapter = MessageCardsAdapter(messageCardsList, selectedMessageCard) { selectedMessageCard ->
            selectMessageCard(selectedMessageCard)
        }
        rvMessageCards.adapter = messageCardsAdapter
        
        etQuantity.text?.clear()
        etMessage.text?.clear()
        updateSendButtonState()
    }
}

class PhoneNumberTextWatcher(private val editText: EditText) : TextWatcher {
    
    private var isFormatting = false
    
    override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
    
    override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
    
    override fun afterTextChanged(s: Editable?) {
        if (isFormatting) return
        
        isFormatting = true
        
        val text = s.toString()
        val formattedText = formatPhoneNumber(text)
        
        if (text != formattedText) {
            editText.setText(formattedText)
            editText.setSelection(formattedText.length)
        }
        
        isFormatting = false
    }
    
    private fun formatPhoneNumber(text: String): String {
        val digitsOnly = text.replace(Regex("[^0-9]"), "")
        
        return when {
            digitsOnly.length <= 3 -> digitsOnly
            digitsOnly.length <= 7 -> "${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3)}"
            digitsOnly.length <= 11 -> "${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3, 7)}-${digitsOnly.substring(7)}"
            else -> "${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3, 7)}-${digitsOnly.substring(7, 11)}"
        }
    }
}

