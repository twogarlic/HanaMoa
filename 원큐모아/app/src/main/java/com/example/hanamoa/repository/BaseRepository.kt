package com.example.hanamoa.repository

import com.example.hanamoa.data.Result as AppResult
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

abstract class BaseRepository {
    protected val ioScope = CoroutineScope(Dispatchers.IO)

    protected val mainScope = CoroutineScope(Dispatchers.Main)

    protected suspend fun <T> safeApiCall(apiCall: suspend () -> T): AppResult<T> {
        return try {
            withContext(Dispatchers.IO) {
                val result = apiCall()
                AppResult.Success(result)
            }
        } catch (e: Exception) {
            AppResult.Error(e)
        }
    }

    protected fun handleError(throwable: Throwable): String {
        return when (throwable) {
            is java.net.UnknownHostException -> "네트워크 연결을 확인해주세요."
            is java.net.SocketTimeoutException -> "요청 시간이 초과되었습니다."
            is java.net.ConnectException -> "서버에 연결할 수 없습니다."
            else -> throwable.message ?: "알 수 없는 오류가 발생했습니다."
        }
    }
}
