package com.example.hanamoa

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        Log.d("FCM", "From: ${remoteMessage.from}")

        if (remoteMessage.notification != null) {
            val title = remoteMessage.notification?.title ?: ""
            val body = remoteMessage.notification?.body ?: ""

            Log.d("FCM", "Message Notification Title: $title")
            Log.d("FCM", "Message Notification Body: $body")

            showNotification(title, body, remoteMessage.data)
        }

        if (remoteMessage.data.isNotEmpty()) {
            Log.d("FCM", "Message data payload: ${remoteMessage.data}")

            val type = remoteMessage.data["type"]
            when (type) {
                "GIFT_REQUEST" -> {
                    handleGiftRequestNotification(remoteMessage.data)
                }
                "FRIEND_REQUEST" -> {
                    handleFriendRequestNotification(remoteMessage.data)
                }
                "ORDER_COMPLETED" -> {
                    handleOrderCompletedNotification(remoteMessage.data)
                }
            }
        }
    }

    private fun showNotification(title: String, body: String, data: Map<String, String>) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                return
            }
        }

        val channelId = "hana_moa_channel"
        val channelName = "하나모아 알림"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                channelName,
                NotificationManager.IMPORTANCE_HIGH
            )
            channel.enableLights(true)
            channel.enableVibration(true)
            channel.setShowBadge(true)
            channel.lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            notificationManager.createNotificationChannel(channel)
        }

        val intent = Intent(this, HomeActivity::class.java)
        intent.putExtra("notification_data", data.toString())
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.drawable.ic_gift_sms) // 알림 아이콘
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(pendingIntent, true) // 헤드업 알림 활성화
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun handleGiftRequestNotification(data: Map<String, String>) {
        val giftId = data["giftId"]
        val senderId = data["senderId"]

        Log.d("FCM", "선물 요청 알림: giftId=$giftId, senderId=$senderId")
    }

    private fun handleFriendRequestNotification(data: Map<String, String>) {
        val requestId = data["requestId"]
        val senderId = data["senderId"]

        Log.d("FCM", "친구 신청 알림: requestId=$requestId, senderId=$senderId")
    }

    private fun handleOrderCompletedNotification(data: Map<String, String>) {
        val orderId = data["orderId"]
        val asset = data["asset"]
        val orderType = data["orderType"]

        Log.d("FCM", "주문 체결 알림: orderId=$orderId, asset=$asset, orderType=$orderType")
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM", "Refreshed token: $token")

        saveFCMTokenToServer(token)
    }

    private fun saveFCMTokenToServer(token: String) {
        val userId = getUserId() // SharedPreferences에서 사용자 ID 가져오기

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apiService = ApiService.getInstance()
                val response = apiService.saveFCMToken(userId, token)

                if (response.success) {
                    Log.d("FCM", "새 FCM 토큰 저장 성공")
                } else {
                    Log.e("FCM", "새 FCM 토큰 저장 실패: ${response.message}")
                }
            } catch (e: Exception) {
                Log.e("FCM", "새 FCM 토큰 저장 오류", e)
            }
        }
    }
    
    private fun getUserId(): String {
        return getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
            .getString("user_id", "") ?: ""
    }
}