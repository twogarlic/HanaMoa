package com.example.hanamoa.network.models

data class SignUpRequest(
    val name: String,
    val email: String,
    val phoneNumber: String,
    val password: String,
    val profileImage: String
)
