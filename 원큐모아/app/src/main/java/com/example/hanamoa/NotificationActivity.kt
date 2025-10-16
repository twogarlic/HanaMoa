package com.example.hanamoa

import android.content.SharedPreferences
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class NotificationActivity : AppCompatActivity() {

    private lateinit var rvNotifications: RecyclerView
    private lateinit var ivBack: ImageView
    private lateinit var tvMarkAllRead: TextView
    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var notificationAdapter: NotificationAdapter
    private var notifications = mutableListOf<UnifiedNotification>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        supportActionBar?.hide()
        actionBar?.hide()
        
        setContentView(R.layout.activity_notification)
        
        hideStatusBar()

        sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE)

        initViews()
        setupClickListeners()
        loadNotifications()
    }

    private fun initViews() {
        rvNotifications = findViewById(R.id.rv_notifications)
        ivBack = findViewById(R.id.iv_back)
        tvMarkAllRead = findViewById(R.id.tv_mark_all_read)

        notificationAdapter = NotificationAdapter(notifications) { notification ->
            onNotificationClick(notification)
        }
        rvNotifications.layoutManager = LinearLayoutManager(this)
        rvNotifications.adapter = notificationAdapter
    }

    private fun setupClickListeners() {
        ivBack.setOnClickListener {
            setResult(RESULT_OK)
            finish()
        }

        tvMarkAllRead.setOnClickListener {
            markAllAsRead()
        }
    }

    private fun loadNotifications() {
        val userId = sharedPreferences.getString("user_id", null) ?: return

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    val apiService = ApiService.getInstance()
                    apiService.getAllNotifications(userId) // 통합 알림 조회 사용
                }

                if (result.success && result.data != null) {
                    notifications.clear()
                    notifications.addAll(result.data)
                    notificationAdapter.notifyDataSetChanged()
                    updateEmptyState()
                } else {
                    updateEmptyState()
                }

            } catch (e: Exception) {
                Toast.makeText(this@NotificationActivity, "알림을 불러올 수 없습니다", Toast.LENGTH_SHORT).show()
                updateEmptyState()
            }
        }
    }

    private fun onNotificationClick(notification: UnifiedNotification) {
        if (!notification.isRead) {
            markNotificationAsRead(notification.id)
        }

        when (notification.type) {
            "FRIEND_REQUEST" -> {
                Toast.makeText(this, "친구 요청 알림", Toast.LENGTH_SHORT).show()
            }
            "GIFT_REQUEST" -> {
                Toast.makeText(this, "선물 요청 알림", Toast.LENGTH_SHORT).show()
            }
            else -> {
                Toast.makeText(this, "알림: ${notification.title}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun markNotificationAsRead(notificationId: String) {
        val userId = sharedPreferences.getString("user_id", null) ?: return

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    val apiService = ApiService.getInstance()
                    apiService.markNotificationAsRead(notificationId, userId)
                }

                if (result.success) {
                    val notification = notifications.find { it.id == notificationId }
                    notification?.let {
                        val index = notifications.indexOf(it)
                        notifications[index] = it.copy(isRead = true)
                        notificationAdapter.notifyItemChanged(index)
                    }
                }

            } catch (e: Exception) {
            }
        }
    }

    private fun markAllAsRead() {
        val userId = sharedPreferences.getString("user_id", null) ?: return

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    val apiService = ApiService.getInstance()
                    apiService.markAllNotificationsAsRead(userId)
                }

                if (result.success) {
                    notifications.forEachIndexed { index, notification ->
                        if (!notification.isRead) {
                            notifications[index] = notification.copy(isRead = true)
                        }
                    }
                    notificationAdapter.notifyDataSetChanged()
                }

            } catch (e: Exception) {
                Toast.makeText(this@NotificationActivity, "알림 읽음 처리에 실패했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun updateEmptyState() {
        val isEmpty = notifications.isEmpty()
        findViewById<LinearLayout>(R.id.layout_empty).visibility =
            if (isEmpty) View.VISIBLE else View.GONE
        rvNotifications.visibility =
            if (isEmpty) View.GONE else View.VISIBLE
    }

    private fun hideStatusBar() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val windowInsetsController = WindowInsetsControllerCompat(window, window.decorView)
        windowInsetsController.hide(WindowInsetsCompat.Type.statusBars())
        windowInsetsController.hide(WindowInsetsCompat.Type.navigationBars())
        windowInsetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
}