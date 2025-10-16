package com.example.hanamoa

import android.content.Context
import com.example.hanamoa.network.ApiConfig
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

class ApiService private constructor() {

    companion object {
        private const val TIMEOUT_SECONDS = 30L

        @Volatile
        private var INSTANCE: ApiService? = null

        fun getInstance(): ApiService {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: ApiService().also { INSTANCE = it }
            }
        }
        
        private fun getBaseUrl(): String? {
            return ApiConfig.getBaseUrl()
        }

        suspend fun createOrder(
            userId: String,
            accountId: String,
            asset: String,
            orderType: String,
            priceType: String,
            limitPrice: Double?,
            quantity: Double
        ): ApiResponse<OrderApiData> {
            return withContext(Dispatchers.IO) {
                try {
                    val requestBody = getInstance().gson.toJson(mapOf(
                        "userId" to userId,
                        "accountId" to accountId,
                        "asset" to asset,
                        "orderType" to orderType,
                        "priceType" to priceType,
                        "limitPrice" to limitPrice,
                        "quantity" to quantity
                    )).toRequestBody("application/json".toMediaType())

                    val request = Request.Builder()
                        .url("${getBaseUrl()}/orders/create")
                        .post(requestBody)
                        .build()

                    val response = getInstance().client.newCall(request).execute()
                    val responseBody = response.body?.string() ?: ""

                    if (response.isSuccessful) {
                        val createResponse = getInstance().gson.fromJson(responseBody, CreateOrderApiResponse::class.java)
                        ApiResponse(
                            success = createResponse.success,
                            message = createResponse.message,
                            data = createResponse.order
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "주문 생성 실패: ${response.code}",
                            data = null
                        )
                    }
                } catch (e: Exception) {
                    ApiResponse(
                        success = false,
                        message = "주문 생성 중 오류 발생: ${e.message}",
                        data = null
                    )
                }
            }
        }

        suspend fun cancelOrder(orderId: String, userId: String): ApiResponse<String> {
            return withContext(Dispatchers.IO) {
                try {
                    val requestBody = getInstance().gson.toJson(mapOf(
                        "orderId" to orderId,
                        "userId" to userId
                    )).toRequestBody("application/json".toMediaType())

                    val request = Request.Builder()
                        .url("${getBaseUrl()}/orders/cancel")
                        .post(requestBody)
                        .build()

                    val response = getInstance().client.newCall(request).execute()
                    val responseBody = response.body?.string() ?: ""

                    if (response.isSuccessful) {
                        val cancelResponse = getInstance().gson.fromJson(responseBody, CancelOrderResponse::class.java)
                        ApiResponse(
                            success = cancelResponse.success,
                            message = cancelResponse.message,
                            data = cancelResponse.message
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "주문 취소 실패: ${response.code}",
                            data = null
                        )
                    }
                } catch (e: Exception) {
                    ApiResponse(
                        success = false,
                        message = "주문 취소 중 오류 발생: ${e.message}",
                        data = null
                    )
                }
            }
        }

        suspend fun getUserHoldings(userId: String): ApiResponse<List<Holding>> {
            return withContext(Dispatchers.IO) {
                try {
                    val request = Request.Builder()
                        .url("${getBaseUrl()}/holdings?userId=$userId")
                        .get()
                        .build()

                    val response = getInstance().client.newCall(request).execute()
                    val responseBody = response.body?.string() ?: ""

                    if (response.isSuccessful) {
                        val holdingsResponse = getInstance().gson.fromJson(responseBody, HoldingsResponse::class.java)
                        ApiResponse(
                            success = holdingsResponse.success,
                            message = if (holdingsResponse.success) "보유 자산 조회 성공" else "보유 자산 조회 실패",
                            data = holdingsResponse.holdings
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "보유 자산 조회 실패: ${response.code}",
                            data = null
                        )
                    }
                } catch (e: Exception) {
                    ApiResponse(
                        success = false,
                        message = "보유 자산 조회 중 오류 발생: ${e.message}",
                        data = null
                    )
                }
            }
        }

        suspend fun getUserHolding(userId: String, asset: String): ApiResponse<Holding> {
            return withContext(Dispatchers.IO) {
                try {
                    val request = Request.Builder()
                        .url("${getBaseUrl()}/holdings/user?userId=$userId&asset=$asset")
                        .get()
                        .build()

                    val response = getInstance().client.newCall(request).execute()
                    val responseBody = response.body?.string() ?: ""

                    if (response.isSuccessful) {
                        val holdingsResponse = getInstance().gson.fromJson(responseBody, HoldingsResponse::class.java)
                        ApiResponse(
                            success = holdingsResponse.success,
                            message = if (holdingsResponse.success) "보유 자산 조회 성공" else "보유 자산 조회 실패",
                            data = holdingsResponse.holding
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "보유 자산 조회 실패: ${response.code}",
                            data = null
                        )
                    }
                } catch (e: Exception) {
                    ApiResponse(
                        success = false,
                        message = "보유 자산 조회 중 오류 발생: ${e.message}",
                        data = null
                    )
                }
            }
        }
    }

    private val client = OkHttpClient.Builder()
        .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    private val gson = GsonBuilder()
        .setLenient()
        .create()

    suspend fun signup(
        userId: String,
        password: String,
        name: String,
        ssn: String,
        phone: String,
        selectedAccount: String? = null,
        accountPassword: String? = null
    ): ApiResponse<SignupResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val cleanPhone = phone.replace("-", "")
                val requestBody = gson.toJson(
                    SignupRequest(
                        userId = userId,
                        password = password,
                        name = name,
                        ssn = ssn,
                        phone = cleanPhone,
                        selectedAccount = selectedAccount,
                        accountPassword = accountPassword
                    )
                ).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/auth/signup")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<ApiResponse<SignupResponse>>() {}.type
                    val apiResponse = gson.fromJson<ApiResponse<SignupResponse>>(responseBody, type)
                    apiResponse
                } else {
                    ApiResponse(
                        success = false,
                        message = "서버 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun createAccount(
        userId: String,
        password: String,
        name: String,
        ssn: String,
        phone: String,
        accountNumber: String,
        accountPassword: String,
        isNewAccount: Boolean
    ): ApiResponse<CreateAccountData> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(
                    CreateAccountRequest(
                        userId = userId,
                        password = password,
                        name = name,
                        ssn = ssn,
                        phone = phone.replace("-", ""),
                        accountNumber = accountNumber,
                        accountPassword = accountPassword,
                        isNewAccount = isNewAccount
                    )
                ).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/auth/create-account")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val createResponse = gson.fromJson(responseBody, CreateAccountResponse::class.java)
                    ApiResponse(
                        success = createResponse.success,
                        message = createResponse.message,
                        data = createResponse.data
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "계정 생성 실패: ${response.code}",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "계정 생성 중 오류 발생: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun checkHanaPoint(
        name: String,
        ssn: String
    ): ApiResponse<HanaPointInfo> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(
                    mapOf(
                        "name" to name,
                        "ssn" to ssn
                    )
                ).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/points/check")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val checkResponse = gson.fromJson(responseBody, CheckHanaPointResponse::class.java)
                    ApiResponse(
                        success = checkResponse.success,
                        message = checkResponse.message,
                        data = checkResponse.data
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "하나머니 확인 실패: ${response.code}",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "하나머니 확인 중 오류 발생: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun login(id: String, password: String): ApiResponse<LoginResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(LoginRequest(id = id, password = password))
                    .toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/auth/login")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<ApiResponse<LoginResponse>>() {}.type
                    val apiResponse = gson.fromJson<ApiResponse<LoginResponse>>(responseBody, type)
                    apiResponse
                } else {
                    ApiResponse(
                        success = false,
                        message = "로그인에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun checkUserId(userId: String): ApiResponse<CheckIdResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(CheckIdRequest(userId = userId))
                    .toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/auth/check-id")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<ApiResponse<CheckIdResponse>>() {}.type
                    val apiResponse = gson.fromJson<ApiResponse<CheckIdResponse>>(responseBody, type)
                    apiResponse
                } else {
                    ApiResponse(
                        success = false,
                        message = "아이디 확인 중 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getUserAccounts(userId: String): ApiResponse<List<Account>> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("${getBaseUrl()}/accounts?userId=$userId")
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val accountsResponse = gson.fromJson(responseBody, AccountsApiResponse::class.java)
                    ApiResponse(
                        success = accountsResponse.success,
                        message = "계좌 정보 조회 성공",
                        data = accountsResponse.accounts
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "계좌 정보를 불러올 수 없습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getAllNotifications(userId: String): ApiResponse<List<UnifiedNotification>> {
        return withContext(Dispatchers.IO) {
            try {
                val notificationRequest = Request.Builder()
                    .url("${getBaseUrl()}/notifications?userId=$userId")
                    .get()
                    .build()

                val notificationResponse = client.newCall(notificationRequest).execute()
                val notificationBody = notificationResponse.body?.string() ?: ""

                val giftRequest = Request.Builder()
                    .url("${getBaseUrl()}/gifts?userId=$userId&type=received")
                    .get()
                    .build()

                val giftResponse = client.newCall(giftRequest).execute()
                val giftBody = giftResponse.body?.string() ?: ""

                val friendRequest = Request.Builder()
                    .url("${getBaseUrl()}/friends/request?userId=$userId&type=received")
                    .get()
                    .build()

                val friendResponse = client.newCall(friendRequest).execute()
                val friendBody = friendResponse.body?.string() ?: ""

                val allNotifications = mutableListOf<UnifiedNotification>()

                if (notificationResponse.isSuccessful) {
                    val notificationJson = gson.fromJson(notificationBody, Map::class.java)
                    if (notificationJson["success"] == true) {
                        val notifications = notificationJson["data"] as? List<*>
                        notifications?.forEach { notificationMap ->
                            val map = notificationMap as Map<*, *>
                            allNotifications.add(UnifiedNotification(
                                id = map["id"] as? String ?: "",
                                type = "NOTIFICATION",
                                title = map["title"] as? String ?: "",
                                message = map["message"] as? String ?: "",
                                isRead = map["isRead"] as? Boolean ?: false,
                                createdAt = map["createdAt"] as? String ?: "",
                                data = map["data"] as? Map<String, Any>
                            ))
                        }
                    }
                }

                if (giftResponse.isSuccessful) {
                    val giftJson = gson.fromJson(giftBody, Map::class.java)
                    if (giftJson["success"] == true) {
                        val gifts = giftJson["data"] as? List<*>
                        gifts?.forEach { giftMap ->
                            val map = giftMap as Map<*, *>
                            val sender = map["sender"] as? Map<*, *>
                            allNotifications.add(UnifiedNotification(
                                id = "gift_${map["id"]}",
                                type = "GIFT_REQUEST",
                                title = "선물 요청",
                                message = "${sender?.get("name")}님이 선물을 보내셨어요!",
                                isRead = false,
                                createdAt = map["createdAt"] as? String ?: "",
                                data = mapOf(
                                    "giftId" to (map["id"] as? String ?: ""),
                                    "senderName" to (sender?.get("name") as? String ?: ""),
                                    "asset" to (map["asset"] as? String ?: ""),
                                    "quantity" to (map["quantity"] as? Number ?: 0)
                                )
                            ))
                        }
                    }
                }

                if (friendResponse.isSuccessful) {
                    val friendJson = gson.fromJson(friendBody, Map::class.java)
                    if (friendJson["success"] == true) {
                        val requests = friendJson["data"] as? List<*>
                        requests?.forEach { requestMap ->
                            val map = requestMap as Map<*, *>
                            val sender = map["sender"] as? Map<*, *>
                            allNotifications.add(UnifiedNotification(
                                id = "friend_${map["id"]}",
                                type = "FRIEND_REQUEST",
                                title = "친구 요청",
                                message = "${sender?.get("name")}님이 친구 요청을 보내셨어요!",
                                isRead = false,
                                createdAt = map["createdAt"] as? String ?: "",
                                data = mapOf(
                                    "requestId" to (map["id"] as? String ?: ""),
                                    "senderName" to (sender?.get("name") as? String ?: ""),
                                    "message" to (map["message"] as? String ?: "")
                                )
                            ))
                        }
                    }
                }

                allNotifications.sortByDescending { it.createdAt }

                ApiResponse(
                    success = true,
                    message = null,
                    data = allNotifications
                )

            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun markNotificationAsRead(notificationId: String, userId: String): ApiResponse<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(
                    MarkNotificationReadRequest(
                        notificationId = notificationId,
                        userId = userId
                    )
                ).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/notifications/read")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<ApiResponse<Boolean>>() {}.type
                    val apiResponse = gson.fromJson<ApiResponse<Boolean>>(responseBody, type)
                    apiResponse
                } else {
                    ApiResponse(
                        success = false,
                        message = "알림 읽음 처리에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun markAllNotificationsAsRead(userId: String): ApiResponse<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(
                    MarkAllNotificationsReadRequest(userId = userId)
                ).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/notifications/read-all")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<ApiResponse<Boolean>>() {}.type
                    val apiResponse = gson.fromJson<ApiResponse<Boolean>>(responseBody, type)
                    apiResponse
                } else {
                    ApiResponse(
                        success = false,
                        message = "알림 읽음 처리에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getMarketData(asset: String): ApiResponse<MarketData> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("${getBaseUrl()}/market/$asset")
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val responseJson = gson.fromJson(responseBody, Map::class.java)

                    if (responseJson.containsKey("currentPrice") || responseJson.containsKey("depositPrice")) {
                        val currentPrice = if (responseJson.containsKey("currentPrice")) {
                            (responseJson["currentPrice"] as? Number)?.toDouble() ?: 0.0
                        } else {
                            (responseJson["depositPrice"] as? Number)?.toDouble() ?: 0.0
                        }
                        
                        val marketData = MarketData(
                            currentPrice = currentPrice,
                            changeValue = (responseJson["changeValue"] as? Number)?.toDouble() ?: 0.0,
                            changeRatio = (responseJson["changeRatio"] as? Number)?.toDouble() ?: 0.0,
                            isUp = (responseJson["isUp"] as? Number)?.toInt() ?: 0,
                            depositPrice = (responseJson["depositPrice"] as? Number)?.toDouble(),
                            withdrawalPrice = (responseJson["withdrawalPrice"] as? Number)?.toDouble()
                        )

                        ApiResponse(
                            success = true,
                            message = null,
                            data = marketData
                        )
                    } else if (responseJson["success"] == true) {
                        val data = responseJson["data"] as Map<*, *>
                        val marketData = MarketData(
                            currentPrice = (data["currentPrice"] as? Number)?.toDouble() ?: 0.0,
                            changeValue = (data["changeValue"] as? Number)?.toDouble() ?: 0.0,
                            changeRatio = (data["changeRatio"] as? Number)?.toDouble() ?: 0.0,
                            isUp = (data["isUp"] as? Number)?.toInt() ?: 0,
                            depositPrice = (data["depositPrice"] as? Number)?.toDouble(),
                            withdrawalPrice = (data["withdrawalPrice"] as? Number)?.toDouble()
                        )

                        ApiResponse(
                            success = true,
                            message = null,
                            data = marketData
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = responseJson["error"] as? String ?: "시세 정보를 불러올 수 없습니다",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "서버 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getUserHoldings(userId: String): ApiResponse<List<Holding>> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("${getBaseUrl()}/holdings/user?userId=$userId")
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val responseJson = gson.fromJson(responseBody, Map::class.java)

                    if (responseJson["success"] == true) {
                        val holdings = responseJson["holdings"] as? List<*>
                        val holdingList = holdings?.map { holdingMap ->
                            val map = holdingMap as Map<*, *>
                            Holding(
                                id = map["id"] as? String ?: "",
                                userId = map["userId"] as? String ?: "",
                                asset = map["asset"] as? String ?: "",
                                quantity = (map["quantity"] as? Number)?.toDouble() ?: 0.0,
                                averagePrice = (map["averagePrice"] as? Number)?.toDouble() ?: 0.0,
                                totalAmount = (map["totalAmount"] as? Number)?.toDouble() ?: 0.0,
                                createdAt = map["createdAt"] as? String ?: "",
                                updatedAt = map["updatedAt"] as? String ?: ""
                            )
                        } ?: emptyList()

                        ApiResponse(
                            success = true,
                            message = null,
                            data = holdingList
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = responseJson["error"] as? String ?: "보유 자산을 불러올 수 없습니다",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "서버 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getUserOrders(userId: String): ApiResponse<List<Order>> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("${getBaseUrl()}/orders?userId=$userId")
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val responseJson = gson.fromJson(responseBody, Map::class.java)

                    if (responseJson["success"] == true) {
                        val orders = responseJson["data"] as? List<*>
                        val orderList = orders?.map { orderMap ->
                            val map = orderMap as Map<*, *>
                            Order(
                                id = map["id"] as? String,
                                userId = map["userId"] as? String ?: "",
                                asset = map["asset"] as? String ?: "",
                                type = map["type"] as? String ?: "",
                                quantity = (map["quantity"] as? Number)?.toDouble() ?: 0.0,
                                price = (map["price"] as? Number)?.toDouble() ?: 0.0,
                                status = map["status"] as? String ?: "PENDING",
                                createdAt = map["createdAt"] as? String
                            )
                        } ?: emptyList()

                        ApiResponse(
                            success = true,
                            message = null,
                            data = orderList
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = responseJson["error"] as? String ?: "주문 내역을 불러올 수 없습니다",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "서버 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getOrders(
        userId: String,
        limit: Int = 50,
        offset: Int = 0,
        asset: String? = null,
        status: String? = null
    ): ApiResponse<List<OrderApiData>> {
        return withContext(Dispatchers.IO) {
            try {
                val urlBuilder = StringBuilder("${getBaseUrl()}/orders?userId=$userId&limit=$limit&offset=$offset")
                
                if (asset != null) {
                    urlBuilder.append("&asset=$asset")
                }
                if (status != null) {
                    urlBuilder.append("&status=$status")
                }
                
                val request = Request.Builder()
                    .url(urlBuilder.toString())
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val orderResponse = gson.fromJson(responseBody, OrderListApiResponse::class.java)
                    
                    if (orderResponse.success) {
                        ApiResponse(
                            success = true,
                            message = "주문 내역 조회 성공",
                            data = orderResponse.orders
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "주문 내역 조회 실패",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "서버 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }


    suspend fun getDailyPriceTable(asset: String, page: Int): ApiResponse<List<DailyPriceTableData>> {
        return withContext(Dispatchers.IO) {
            try {
                val url = "${getBaseUrl()}/market/$asset?page=$page"
                val request = Request.Builder()
                    .url(url)
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val tableResponse = gson.fromJson(responseBody, DailyPriceTableApiResponse::class.java)
                    
                    if (tableResponse.success) {
                        val processedData = if (asset == "gold") {
                            tableResponse.data.map { data ->
                                DailyPriceTableData(
                                    date = data.date,
                                    close = data.close / 100.0,
                                    diff = data.diff / 100.0,
                                    ratio = data.ratio
                                )
                            }
                        } else {
                            tableResponse.data
                        }
                        
                        ApiResponse(
                            success = true,
                            message = "일별 시세표 조회 성공",
                            data = processedData
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "일별 시세표 조회 실패",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "서버 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getDailyChartData(asset: String, timeframe: String): ApiResponse<List<DailyPriceData>> {
        return withContext(Dispatchers.IO) {
            try {
                val url = "${getBaseUrl()}/chart/daily-prices?asset=$asset&timeframe=$timeframe"
                val request = Request.Builder()
                    .url(url)
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                android.util.Log.d("ChartAPI", "URL: $url")
                android.util.Log.d("ChartAPI", "Response Code: ${response.code}")
                android.util.Log.d("ChartAPI", "Response Body: $responseBody")

                if (response.isSuccessful) {
                    try {
                        val chartResponse = gson.fromJson(responseBody, DailyChartApiResponse::class.java)
                        
                        if (chartResponse.success) {
                            ApiResponse(
                                success = true,
                                message = "차트 데이터 조회 성공",
                                data = chartResponse.data
                            )
                        } else {
                            ApiResponse(
                                success = false,
                                message = "차트 데이터 조회 실패",
                                data = null
                            )
                        }
                    } catch (parseException: Exception) {
                        android.util.Log.e("ChartAPI", "JSON 파싱 오류: ${parseException.message}")
                        try {
                            val responseJson = gson.fromJson(responseBody, Map::class.java)
                            if (responseJson["success"] == true) {
                                val data = responseJson["data"] as? List<*>
                                val priceDataList = data?.map { item ->
                                    val map = item as Map<*, *>
                                    DailyPriceData(
                                        date = map["date"] as? String ?: "",
                                        price = (map["price"] as? Number)?.toDouble() ?: 0.0,
                                        change = (map["change"] as? Number)?.toDouble() ?: 0.0,
                                        ratio = (map["ratio"] as? Number)?.toDouble() ?: 0.0
                                    )
                                } ?: emptyList()
                                
                                ApiResponse(
                                    success = true,
                                    message = "차트 데이터 조회 성공",
                                    data = priceDataList
                                )
                            } else {
                                ApiResponse(
                                    success = false,
                                    message = "차트 데이터 조회 실패: ${responseJson["message"]}",
                                    data = null
                                )
                            }
                        } catch (fallbackException: Exception) {
                            android.util.Log.e("ChartAPI", "Fallback 파싱 오류: ${fallbackException.message}")
                            ApiResponse(
                                success = false,
                                message = "차트 데이터 파싱 오류: ${fallbackException.message}",
                                data = null
                            )
                        }
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "서버 오류가 발생했습니다: ${response.code}",
                        data = null
                    )
                }
            } catch (e: Exception) {
                android.util.Log.e("ChartAPI", "네트워크 오류: ${e.message}")
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getChartData(asset: String, period: String): ApiResponse<ChartResult> {
        return withContext(Dispatchers.IO) {
            try {
                val url = "${getBaseUrl()}/chart/$asset-$period"
                val request = Request.Builder()
                    .url(url)
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                android.util.Log.d("ChartAPI", "URL: $url")
                android.util.Log.d("ChartAPI", "Response Code: ${response.code}")
                android.util.Log.d("ChartAPI", "Response Body: $responseBody")

                if (response.isSuccessful) {
                    try {
                        val chartResponse = gson.fromJson(responseBody, ChartApiResponse::class.java)
                        
                        if (chartResponse.isSuccess) {
                            ApiResponse(
                                success = true,
                                message = chartResponse.message,
                                data = chartResponse.result
                            )
                        } else {
                            ApiResponse(
                                success = false,
                                message = chartResponse.message,
                                data = null
                            )
                        }
                    } catch (parseException: Exception) {
                        android.util.Log.e("ChartAPI", "JSON 파싱 오류: ${parseException.message}")
                        ApiResponse(
                            success = false,
                            message = "차트 데이터 파싱 오류: ${parseException.message}",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "서버 오류가 발생했습니다: ${response.code}",
                        data = null
                    )
                }
            } catch (e: Exception) {
                android.util.Log.e("ChartAPI", "네트워크 오류: ${e.message}")
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun createOrder(userId: String, order: Order): ApiResponse<Order> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(
                    CreateOrderRequest(
                        userId = userId,
                        asset = order.asset,
                        type = order.type,
                        quantity = order.quantity,
                        price = order.price
                    )
                ).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/orders")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val responseJson = gson.fromJson(responseBody, Map::class.java)

                    if (responseJson["success"] == true) {
                        val data = responseJson["data"] as Map<*, *>
                        val createdOrder = Order(
                            id = data["id"] as? String,
                            userId = data["userId"] as? String ?: "",
                            asset = data["asset"] as? String ?: "",
                            type = data["type"] as? String ?: "",
                            quantity = (data["quantity"] as? Number)?.toDouble() ?: 0.0,
                            price = (data["price"] as? Number)?.toDouble() ?: 0.0,
                            status = data["status"] as? String ?: "PENDING",
                            createdAt = data["createdAt"] as? String
                        )

                        ApiResponse(
                            success = true,
                            message = null,
                            data = createdOrder
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = responseJson["error"] as? String ?: "주문 생성에 실패했습니다",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "서버 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getFriends(userId: String): ApiResponse<List<Friend>> {
        return withContext(Dispatchers.IO) {
            try {
                val url = "${getBaseUrl()}/friends?userId=$userId"
                val request = Request.Builder()
                    .url(url)
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()

                if (response.isSuccessful && responseBody != null) {
                    val friendsResponse = gson.fromJson(responseBody, FriendsResponse::class.java)
                    if (friendsResponse.success) {
                        ApiResponse(
                            success = true,
                            message = null,
                            data = friendsResponse.data
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "친구 목록 조회에 실패했습니다",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "네트워크 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "친구 목록 조회 중 오류가 발생했습니다: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun searchFriend(phone: String, userId: String): ApiResponse<FriendSearchData> {
        return withContext(Dispatchers.IO) {
            try {
                val cleanPhone = phone.replace("-", "")
                val url = "${getBaseUrl()}/friends/search?phone=$cleanPhone&userId=$userId"
                val request = Request.Builder()
                    .url(url)
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()

                if (response.isSuccessful && responseBody != null) {
                    val searchResponse = gson.fromJson(responseBody, FriendSearchResponse::class.java)
                    if (searchResponse.success) {
                        ApiResponse(
                            success = true,
                            message = null,
                            data = searchResponse.data
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "친구 검색에 실패했습니다",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "네트워크 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "친구 검색 중 오류가 발생했습니다: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun sendFriendRequest(friendRequest: FriendRequest): ApiResponse<FriendRequestData> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(friendRequest).toRequestBody("application/json".toMediaType())
                val request = Request.Builder()
                    .url("${getBaseUrl()}/friends/request")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()

                if (response.isSuccessful && responseBody != null) {
                    val friendRequestResponse = gson.fromJson(responseBody, FriendRequestResponse::class.java)
                    if (friendRequestResponse.success) {
                        ApiResponse(
                            success = true,
                            message = null,
                            data = friendRequestResponse.data
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "친구 신청 전송에 실패했습니다",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "네트워크 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "친구 신청 전송 중 오류가 발생했습니다: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun sendGift(giftRequest: GiftRequest): ApiResponse<GiftData> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(giftRequest).toRequestBody("application/json".toMediaType())
                val request = Request.Builder()
                    .url("${getBaseUrl()}/gifts")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()

                if (response.isSuccessful && responseBody != null) {
                    val giftResponse = gson.fromJson(responseBody, GiftResponse::class.java)
                    if (giftResponse.success) {
                        ApiResponse(
                            success = true,
                            message = null,
                            data = giftResponse.data
                        )
                    } else {
                        ApiResponse(
                            success = false,
                            message = "선물 전송에 실패했습니다",
                            data = null
                        )
                    }
                } else {
                    ApiResponse(
                        success = false,
                        message = "네트워크 오류가 발생했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "선물 전송 중 오류가 발생했습니다: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun saveFCMToken(userId: String, fcmToken: String): ApiResponse<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(
                    mapOf(
                        "userId" to userId,
                        "fcmToken" to fcmToken
                    )
                ).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/fcm/token")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<ApiResponse<Boolean>>() {}.type
                    val apiResponse = gson.fromJson<ApiResponse<Boolean>>(responseBody, type)
                    apiResponse
                } else {
                    ApiResponse(
                        success = false,
                        message = "FCM 토큰 저장에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getReservations(userId: String): ApiResponse<List<Reservation>> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("${getBaseUrl()}/service/request?userId=$userId")
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<ReservationsResponse>() {}.type
                    val reservationsResponse = gson.fromJson<ReservationsResponse>(responseBody, type)

                    val pendingReservations = reservationsResponse.data.filter { it.status == "PENDING" }
                    
                    ApiResponse(
                        success = true,
                        data = pendingReservations,
                        message = null
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "예약 조회에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun checkIdAvailability(userId: String): ApiResponse<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(mapOf("userId" to userId)).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/auth/check-id")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<CheckIdResponse>() {}.type
                    val checkResponse = gson.fromJson<CheckIdResponse>(responseBody, type)
                    
                    ApiResponse(
                        success = checkResponse.success,
                        data = checkResponse.isAvailable,
                        message = checkResponse.message
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "아이디 중복확인에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }
    
    suspend fun sendSmsVerification(phone: String): ApiResponse<String?> {
        return withContext(Dispatchers.IO) {
            try {
                val cleanPhone = phone.replace("-", "")
                val requestBody = gson.toJson(mapOf("phone" to cleanPhone)).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/sms/send")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<SendSmsResponse>() {}.type
                    val smsResponse = gson.fromJson<SendSmsResponse>(responseBody, type)
                    
                    ApiResponse(
                        success = smsResponse.success,
                        data = smsResponse.verificationCode,
                        message = smsResponse.message
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "인증번호 발송에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }
    
    suspend fun verifySmsCode(phone: String, code: String): ApiResponse<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                val cleanPhone = phone.replace("-", "")
                val requestBody = gson.toJson(mapOf("phone" to cleanPhone, "code" to code)).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/sms/verify")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                android.util.Log.d("SMS_VERIFY_API", "응답 코드: ${response.code}")
                android.util.Log.d("SMS_VERIFY_API", "응답 본문: $responseBody")

                if (response.isSuccessful) {
                    val type = object : TypeToken<VerifySmsResponse>() {}.type
                    val verifyResponse = gson.fromJson<VerifySmsResponse>(responseBody, type)
                    
                    android.util.Log.d("SMS_VERIFY_API", "파싱된 응답: success=${verifyResponse.success}, message=${verifyResponse.message}")
                    
                    ApiResponse(
                        success = verifyResponse.success,
                        data = verifyResponse.success,
                        message = verifyResponse.message
                    )
                } else {
                    android.util.Log.e("SMS_VERIFY_API", "HTTP 오류: ${response.code}, 응답: $responseBody")
                    ApiResponse(
                        success = false,
                        message = "인증번호 확인에 실패했습니다 (HTTP ${response.code})",
                        data = false
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = false
                )
            }
        }
    }

    suspend fun checkAuth(userId: String): ApiResponse<UserInfo> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(mapOf("userId" to userId)).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/auth/check")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<AuthCheckResponse>() {}.type
                    val authResponse = gson.fromJson<AuthCheckResponse>(responseBody, type)
                    
                    ApiResponse(
                        success = authResponse.success,
                        data = authResponse.user,
                        message = authResponse.message
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "인증 확인에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun getFriendRequests(userId: String): ApiResponse<List<FriendRequestItem>> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("${getBaseUrl()}/friends/request?userId=$userId")
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<FriendRequestsResponse>() {}.type
                    val requestsResponse = gson.fromJson<FriendRequestsResponse>(responseBody, type)
                    
                    ApiResponse(
                        success = requestsResponse.success,
                        data = requestsResponse.data,
                        message = null
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "친구 신청 목록 조회에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun cancelFriendRequest(requestId: String, userId: String): ApiResponse<String> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("${getBaseUrl()}/friends/request/$requestId?userId=$userId")
                    .delete()
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<CancelFriendRequestResponse>() {}.type
                    val cancelResponse = gson.fromJson<CancelFriendRequestResponse>(responseBody, type)
                    
                    ApiResponse(
                        success = cancelResponse.success,
                        data = cancelResponse.message,
                        message = cancelResponse.message
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "친구 신청 취소에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun respondToFriendRequest(requestId: String, action: String, userId: String): ApiResponse<String> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(mapOf(
                    "action" to action,
                    "userId" to userId
                )).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/friends/request/$requestId")
                    .patch(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<RespondToFriendRequestResponse>() {}.type
                    val respondResponse = gson.fromJson<RespondToFriendRequestResponse>(responseBody, type)
                    
                    ApiResponse(
                        success = respondResponse.success,
                        data = respondResponse.message,
                        message = respondResponse.message
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "친구 신청 응답에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

    suspend fun cancelReservation(cancelRequest: CancelRequest): ApiResponse<CancelData> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = gson.toJson(cancelRequest).toRequestBody("application/json".toMediaType())

                val request = Request.Builder()
                    .url("${getBaseUrl()}/service/cancel")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    val type = object : TypeToken<CancelResponse>() {}.type
                    val cancelResponse = gson.fromJson<CancelResponse>(responseBody, type)
                    
                    ApiResponse(
                        success = cancelResponse.success,
                        data = cancelResponse.data,
                        message = cancelResponse.message
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "예약 취소에 실패했습니다",
                        data = null
                    )
                }
            } catch (e: Exception) {
                ApiResponse(
                    success = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
                )
            }
        }
    }

}

data class SignupRequest(
    val userId: String,
    val password: String,
    val name: String,
    val ssn: String,
    val phone: String,
    val provider: String? = null,
    val providerId: String? = null,
    val email: String? = null,
    val selectedAccount: String? = null,
    val accountPassword: String? = null
)

data class LoginRequest(
    val id: String,
    val password: String
)

data class CheckIdRequest(
    val userId: String
)

data class ApiResponse<T>(
    val success: Boolean,
    val message: String?,
    val data: T? = null,
    val user: T? = null,
    val accounts: List<Account>? = null
)

data class SignupResponse(
    val id: String,
    val userId: String,
    val name: String,
    val provider: String?
)

data class LoginResponse(
    val id: String,
    val userId: String,
    val name: String,
    val email: String?,
    val accounts: List<Account>
)

data class CheckIdResponse(
    val success: Boolean,
    val message: String,
    val isAvailable: Boolean
)

data class SendSmsRequest(
    val phone: String
)

data class SendSmsResponse(
    val success: Boolean,
    val message: String,
    val verificationCode: String?
)

data class VerifySmsRequest(
    val phone: String,
    val code: String
)

data class VerifySmsResponse(
    val success: Boolean,
    val message: String
)

data class Account(
    val id: String,
    val accountNumber: String,
    val accountName: String,
    val balance: Double
)

data class UnifiedNotification(
    val id: String,
    val type: String,
    val title: String,
    val message: String,
    val isRead: Boolean,
    val createdAt: String,
    val data: Map<String, Any>? = null
)

data class MarkNotificationReadRequest(
    val notificationId: String,
    val userId: String
)

data class MarkAllNotificationsReadRequest(
    val userId: String
)

data class CreateOrderRequest(
    val userId: String,
    val asset: String,
    val type: String,
    val quantity: Double,
    val price: Double
)

data class AccountsApiResponse(
    val success: Boolean,
    val accounts: List<Account>
)

data class CreateOrderApiResponse(
    val success: Boolean,
    val message: String,
    val order: OrderApiData
)

data class CancelOrderResponse(
    val success: Boolean,
    val message: String
)

data class Holding(
    val id: String,
    val userId: String,
    val asset: String,
    val quantity: Double,
    val averagePrice: Double,
    val totalAmount: Double,
    val currentPrice: Double? = null,
    val currentValue: Double? = null,
    val profitLoss: Double? = null,
    val profitLossRatio: Double? = null,
    val isUp: Int? = null,
    val createdAt: String,
    val updatedAt: String
)

data class HoldingsResponse(
    val success: Boolean,
    val holdings: List<Holding>? = null,
    val holding: Holding? = null
)

data class Friend(
    val id: String,
    val friendId: String,
    val friendName: String,
    val friendPhone: String,
    val profileImage: String?,
    val createdAt: String
)

data class FriendsResponse(
    val success: Boolean,
    val data: List<Friend>
)

data class FriendSearchUser(
    val id: String,
    val name: String,
    val phone: String,
    val profileImage: String?
)

data class FriendSearchResponse(
    val success: Boolean,
    val data: FriendSearchData
)

data class FriendSearchData(
    val user: FriendSearchUser,
    val isAlreadyFriend: Boolean,
    val hasPendingRequest: Boolean,
    val requestStatus: String?
)

data class FriendRequest(
    val senderId: String,
    val receiverId: String,
    val message: String
)

data class FriendRequestItem(
    val id: String,
    val senderId: String,
    val receiverId: String,
    val message: String,
    val status: String,
    val createdAt: String,
    val sender: FriendUser,
    val receiver: FriendUser
)

data class FriendUser(
    val id: String,
    val name: String,
    val phone: String,
    val profileImage: String
)

data class FriendRequestResponse(
    val success: Boolean,
    val data: FriendRequestData,
    val message: String
)

data class FriendRequestData(
    val id: String,
    val senderId: String,
    val receiverId: String,
    val message: String,
    val status: String,
    val createdAt: String,
    val sender: FriendSearchUser,
    val receiver: FriendSearchUser
)

data class GiftRequest(
    val senderId: String,
    val receiverId: String,
    val asset: String,
    val quantity: Double,
    val messageCard: String,
    val message: String
)

data class GiftResponse(
    val success: Boolean,
    val data: GiftData,
    val message: String
)

data class GiftData(
    val id: String,
    val senderId: String,
    val receiverId: String,
    val asset: String,
    val quantity: Double,
    val messageCard: String,
    val message: String,
    val status: String,
    val createdAt: String,
    val receivedAt: String?,
    val sender: FriendSearchUser,
    val receiver: FriendSearchUser
)

data class Reservation(
    val id: String,
    val reservationNumber: String,
    val userId: String,
    val branchId: String,
    val branchName: String,
    val branchAddress: String,
    val branchPhone: String,
    val assetType: String,
    val assetUnit: String,
    val assetAmount: Int,
    val requestDate: String,
    val reservationDate: String,
    val reservationTime: String,
    val status: String,
    val completedAt: String?,
    val cancelledAt: String?,
    val cancelReason: String?,
    val createdAt: String,
    val updatedAt: String
)

data class ReservationsResponse(
    val success: Boolean,
    val data: List<Reservation>
)

data class CancelRequest(
    val reservationId: String,
    val userId: String,
    val cancelReason: String
)

data class CancelResponse(
    val success: Boolean,
    val data: CancelData,
    val message: String
)

data class CancelData(
    val id: String,
    val status: String,
    val cancelledAt: String,
    val cancelReason: String
)

data class AuthCheckResponse(
    val success: Boolean,
    val message: String,
    val isAuthenticated: Boolean,
    val user: UserInfo
)

data class UserInfo(
    val id: String,
    val userId: String,
    val name: String,
    val email: String?,
    val profileImage: String?,
    val accounts: List<Account>
)

data class FriendRequestsResponse(
    val success: Boolean,
    val data: List<FriendRequestItem>
)

data class CancelFriendRequestResponse(
    val success: Boolean,
    val message: String
)

data class RespondToFriendRequestResponse(
    val success: Boolean,
    val message: String
)

data class CreateAccountResponse(
    val success: Boolean,
    val message: String,
    val data: CreateAccountData?
)

data class CreateAccountData(
    val userId: String,
    val accountId: String,
    val accountNumber: String
)

data class CreateAccountRequest(
    val userId: String,
    val password: String,
    val name: String,
    val ssn: String,
    val phone: String,
    val accountNumber: String,
    val accountPassword: String,
    val isNewAccount: Boolean
)

data class CheckHanaPointResponse(
    val success: Boolean,
    val message: String,
    val data: HanaPointInfo?
)

data class HanaPointInfo(
    val isNewAccount: Boolean,
    val balance: Long?,
    val message: String
)
