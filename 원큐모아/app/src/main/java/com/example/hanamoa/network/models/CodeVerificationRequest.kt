package com.example.hanamoa.network.models

data class CodeVerificationRequest(
    val phoneNumber: String,
    val code: String
)
