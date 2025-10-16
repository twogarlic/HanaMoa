package com.example.hanamoa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class OrderAdapter(
    private val orders: List<OrderApiData>,
    private val onOrderClick: (OrderApiData) -> Unit,
    private val onCancelOrder: (OrderApiData) -> Unit
) : RecyclerView.Adapter<OrderAdapter.OrderViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_order, parent, false)
        return OrderViewHolder(view)
    }

    override fun onBindViewHolder(holder: OrderViewHolder, position: Int) {
        holder.bind(orders[position], onOrderClick, onCancelOrder)
    }

    override fun getItemCount(): Int = orders.size

    inner class OrderViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvAsset: TextView = itemView.findViewById(R.id.tv_order_asset)
        private val tvType: TextView = itemView.findViewById(R.id.tv_order_type)
        private val tvQuantity: TextView = itemView.findViewById(R.id.tv_order_quantity)
        private val tvPrice: TextView = itemView.findViewById(R.id.tv_order_price)
        private val tvStatus: TextView = itemView.findViewById(R.id.tv_order_status)
        private val tvCreatedAt: TextView = itemView.findViewById(R.id.tv_order_created_at)
        private val btnCancel: TextView = itemView.findViewById(R.id.btn_cancel_order)

        fun bind(order: OrderApiData, onOrderClick: (OrderApiData) -> Unit, onCancelOrder: (OrderApiData) -> Unit) {
            val assetName = when (order.asset) {
                "gold" -> "GOLD"
                "silver" -> "SILVER"
                "usd" -> "USD"
                "eur" -> "EUR"
                "jpy" -> "JPY"
                "cny" -> "CNY"
                else -> order.asset.uppercase()
            }
            tvAsset.text = assetName

            tvType.text = if (order.orderType == "buy") "구매" else "판매"
            tvType.setTextColor(0xFFFFFFFF.toInt()) // 글씨 색 흰색 고정
            
            val backgroundColor = if (order.orderType == "buy") {
                0xFFEF4567.toInt() // 구매 - 빨간색
            } else {
                0xFF1B8FF0.toInt() // 판매 - 초록색
            }
            
            val drawable = android.graphics.drawable.GradientDrawable().apply {
                setColor(backgroundColor)
                cornerRadius = 20f
            }
            tvType.background = drawable

            val formatter = NumberFormat.getNumberInstance(Locale.KOREA)
            tvQuantity.text = "${formatter.format(order.quantity)}${getUnit(order.asset)}"

            val priceFormatter = NumberFormat.getNumberInstance(Locale.KOREA)
            priceFormatter.maximumFractionDigits = 0
            priceFormatter.minimumFractionDigits = 0
            tvPrice.text = "${priceFormatter.format(order.limitPrice)}원"

            val statusText = when (order.status) {
                "PENDING" -> "대기"
                "COMPLETED" -> "완료"
                "CANCELLED" -> "취소"
                else -> order.status
            }
            tvStatus.text = statusText

            val statusColor = when (order.status) {
                "PENDING" -> 0xFF666666.toInt()
                "COMPLETED" -> 0xFFFFFFFF.toInt()
                "CANCELLED" -> 0xFFFFFFFF.toInt()
                else -> 0xFF333333.toInt()
            }
            tvStatus.setTextColor(statusColor)

            if (order.status == "PENDING") {
                btnCancel.visibility = View.VISIBLE
                btnCancel.setOnClickListener {
                    onCancelOrder(order)
                }
            } else {
                btnCancel.visibility = View.GONE
            }

            try {
                val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.KOREA)
                val date = dateFormat.parse(order.createdAt)
                val displayFormat = SimpleDateFormat("MM/dd HH:mm", Locale.KOREA)
                tvCreatedAt.text = displayFormat.format(date ?: Date())
            } catch (e: Exception) {
                tvCreatedAt.text = order.createdAt
            }

            itemView.setOnClickListener {
                onOrderClick(order)
            }
        }

        private fun getUnit(asset: String): String {
            return when (asset) {
                "gold", "silver" -> "g"
                "usd", "eur", "jpy", "cny" -> "개"
                else -> ""
            }
        }
    }
}