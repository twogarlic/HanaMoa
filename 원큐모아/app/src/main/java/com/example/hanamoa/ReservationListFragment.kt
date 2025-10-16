package com.example.hanamoa

import android.content.SharedPreferences
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
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

class ReservationListFragment : Fragment() {

    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var rvReservations: RecyclerView
    private lateinit var layoutEmpty: LinearLayout
    private lateinit var layoutLoading: LinearLayout
    private lateinit var ivBack: ImageView
    
    private var reservationsList = mutableListOf<Reservation>()
    private var reservationsAdapter: ReservationsAdapter? = null

    private val assetInfo = mapOf(
        "gold" to AssetInfo("GOLD", R.drawable.ic_market_gold),
        "silver" to AssetInfo("SILVER", R.drawable.ic_market_silver),
        "usd" to AssetInfo("USD", R.drawable.ic_market_money),
        "eur" to AssetInfo("EUR", R.drawable.ic_market_money),
        "jpy" to AssetInfo("JPY", R.drawable.ic_market_money),
        "cny" to AssetInfo("CNY", R.drawable.ic_market_money)
    )

    data class AssetInfo(
        val name: String,
        val imageRes: Int
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_reservation_list, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        sharedPreferences = requireContext().getSharedPreferences("user_prefs", android.content.Context.MODE_PRIVATE)
        
        initViews(view)
        setupRecyclerView()
        setupClickListeners()
        loadReservations()
    }

    private fun initViews(view: View) {
        rvReservations = view.findViewById(R.id.rv_reservations)
        layoutEmpty = view.findViewById(R.id.layout_empty)
        layoutLoading = view.findViewById(R.id.layout_loading)
        ivBack = view.findViewById(R.id.iv_back)
    }

    private fun setupRecyclerView() {
        rvReservations.layoutManager = LinearLayoutManager(requireContext())
        reservationsAdapter = ReservationsAdapter(reservationsList, assetInfo) { reservation ->
            showCancelDialog(reservation)
        }
        rvReservations.adapter = reservationsAdapter
    }

    private fun setupClickListeners() {
        ivBack.setOnClickListener {
            parentFragmentManager.popBackStack()
        }
    }

    private fun loadReservations() {
        val userId = sharedPreferences.getString("user_id", null) ?: return
        
        showLoading(true)
        
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().getReservations(userId)
                }

                if (result.success && result.data != null) {
                    reservationsList.clear()
                    reservationsList.addAll(result.data)
                    reservationsAdapter?.notifyDataSetChanged()
                    updateEmptyState()
                } else {
                    Toast.makeText(requireContext(), result.message ?: "예약 조회에 실패했습니다", Toast.LENGTH_SHORT).show()
                    updateEmptyState()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "예약 조회 중 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
                updateEmptyState()
            } finally {
                showLoading(false)
            }
        }
    }

    private fun showLoading(show: Boolean) {
        layoutLoading.visibility = if (show) View.VISIBLE else View.GONE
        rvReservations.visibility = if (show) View.GONE else View.VISIBLE
        layoutEmpty.visibility = View.GONE
    }

    private fun updateEmptyState() {
        if (reservationsList.isEmpty()) {
            layoutEmpty.visibility = View.VISIBLE
            rvReservations.visibility = View.GONE
        } else {
            layoutEmpty.visibility = View.GONE
            rvReservations.visibility = View.VISIBLE
        }
    }

    private fun showCancelDialog(reservation: Reservation) {
        if (!isAdded || context == null) return
        
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_cancel_reservation, null)
        val dialog = android.app.AlertDialog.Builder(context)
            .setView(dialogView)
            .create()

        val etCancelReason = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.et_cancel_reason)
        val btnDialogCancel = dialogView.findViewById<TextView>(R.id.btn_dialog_cancel)
        val btnDialogConfirm = dialogView.findViewById<TextView>(R.id.btn_dialog_confirm)

        btnDialogCancel.setOnClickListener {
            dialog.dismiss()
        }

        btnDialogConfirm.setOnClickListener {
            val cancelReason = etCancelReason.text.toString().trim()
            if (cancelReason.isEmpty()) {
                Toast.makeText(requireContext(), "취소 사유를 입력해주세요", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            dialog.dismiss()
            cancelReservation(reservation, cancelReason)
        }

        dialog.show()
    }

    private fun cancelReservation(reservation: Reservation, cancelReason: String) {
        val userId = sharedPreferences.getString("user_id", null) ?: return
        
        val cancelRequest = CancelRequest(
            reservationId = reservation.id,
            userId = userId,
            cancelReason = cancelReason
        )

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().cancelReservation(cancelRequest)
                }

                if (result.success) {
                    Toast.makeText(requireContext(), "예약이 취소되었습니다", Toast.LENGTH_SHORT).show()
                    loadReservations() // 목록 새로고침
                } else {
                    Toast.makeText(requireContext(), result.message ?: "예약 취소에 실패했습니다", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "예약 취소 중 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }

    class ReservationsAdapter(
        private val reservations: List<Reservation>,
        private val assetInfo: Map<String, AssetInfo>,
        private val onCancelClick: (Reservation) -> Unit
    ) : RecyclerView.Adapter<ReservationsAdapter.ReservationViewHolder>() {

        class ReservationViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val tvReservationNumber: TextView = view.findViewById(R.id.tv_reservation_number)
            val tvStatus: TextView = view.findViewById(R.id.tv_status)
            val ivAsset: ImageView = view.findViewById(R.id.iv_asset)
            val tvAssetInfo: TextView = view.findViewById(R.id.tv_asset_info)
            val tvAssetAmount: TextView = view.findViewById(R.id.tv_asset_amount)
            val tvBranchName: TextView = view.findViewById(R.id.tv_branch_name)
            val tvBranchAddress: TextView = view.findViewById(R.id.tv_branch_address)
            val tvReservationDatetime: TextView = view.findViewById(R.id.tv_reservation_datetime)
            val btnCancel: TextView = view.findViewById(R.id.btn_cancel)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReservationViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_reservation, parent, false)
            return ReservationViewHolder(view)
        }

        override fun onBindViewHolder(holder: ReservationViewHolder, position: Int) {
            val reservation = reservations[position]
            
            holder.tvReservationNumber.text = reservation.reservationNumber
            
            holder.tvStatus.text = when (reservation.status) {
                "PENDING" -> "예약중"
                "APPROVED" -> "승인됨"
                "COMPLETED" -> "완료"
                "CANCELLED" -> "취소됨"
                else -> reservation.status
            }
            
            val assetInfo = assetInfo[reservation.assetType]
            assetInfo?.let {
                Glide.with(holder.itemView.context)
                    .load(it.imageRes)
                    .transition(DrawableTransitionOptions.withCrossFade(200))
                    .into(holder.ivAsset)
                
                holder.tvAssetInfo.text = "${it.name} ${reservation.assetUnit}"
            }
            
            holder.tvAssetAmount.text = "수량: ${reservation.assetAmount}개"
            
            holder.tvBranchName.text = reservation.branchName
            holder.tvBranchAddress.text = reservation.branchAddress
            
            val formattedDateTime = formatReservationDateTime(reservation.reservationDate, reservation.reservationTime)
            holder.tvReservationDatetime.text = formattedDateTime
            
            holder.btnCancel.setOnClickListener {
                onCancelClick(reservation)
            }
        }

        override fun getItemCount(): Int = reservations.size
        
        private fun formatReservationDateTime(date: String, time: String): String {
            try {
                val dateTime = java.time.Instant.parse(date).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
                val year = dateTime.year
                val month = dateTime.monthValue
                val day = dateTime.dayOfMonth
                val dayOfWeek = dateTime.dayOfWeek.name.lowercase().replaceFirstChar { it.uppercase() }
                
                return "${year}년 ${month}월 ${day}일 (${dayOfWeek}) ${time}"
            } catch (e: Exception) {
                return "$date $time"
            }
        }
    }
}
