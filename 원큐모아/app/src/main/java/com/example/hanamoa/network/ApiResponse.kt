package com.example.hanamoa.network

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?
)
