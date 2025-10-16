package com.example.hanamoa.network.models

data class Notification(
    val id: String,
    val title: String,
    val message: String,
    val isRead: Boolean,
    val createdAt: String
)
