package com.example.hanamoa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class NotificationAdapter(
    private val notifications: List<UnifiedNotification>,
    private val onNotificationClick: (UnifiedNotification) -> Unit
) : RecyclerView.Adapter<NotificationAdapter.NotificationViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotificationViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notification, parent, false)
        return NotificationViewHolder(view)
    }

    override fun onBindViewHolder(holder: NotificationViewHolder, position: Int) {
        holder.bind(notifications[position])
    }

    override fun getItemCount(): Int = notifications.size

    inner class NotificationViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val ivIcon: ImageView = itemView.findViewById(R.id.iv_notification_icon)
        private val tvTitle: TextView = itemView.findViewById(R.id.tv_notification_title)
        private val tvMessage: TextView = itemView.findViewById(R.id.tv_notification_message)
        private val tvTime: TextView = itemView.findViewById(R.id.tv_notification_time)
        private val vUnreadDot: View = itemView.findViewById(R.id.v_unread_dot)

        fun bind(notification: UnifiedNotification) {
            tvTitle.text = notification.title
            tvMessage.text = notification.message

            when (notification.type) {
                "FRIEND_REQUEST" -> {
                    ivIcon.setImageResource(R.drawable.ic_nav_gift) // 임시로 선물 아이콘 사용
                }
                "GIFT_REQUEST" -> {
                    ivIcon.setImageResource(R.drawable.ic_gift_blue)
                }
                else -> {
                    ivIcon.setImageResource(R.drawable.ic_notification_default)
                }
            }

            try {
                val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.KOREA)
                val date = dateFormat.parse(notification.createdAt) ?: Date()
                val displayFormat = SimpleDateFormat("MM/dd HH:mm", Locale.KOREA)
                tvTime.text = displayFormat.format(date)
            } catch (e: Exception) {
                val displayFormat = SimpleDateFormat("MM/dd HH:mm", Locale.KOREA)
                tvTime.text = displayFormat.format(Date())
            }

            vUnreadDot.visibility = if (notification.isRead) View.GONE else View.VISIBLE

            itemView.setOnClickListener {
                onNotificationClick(notification)
            }
        }
    }
}