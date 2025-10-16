package com.example.hanamoa.network.models

data class Asset(
    val id: String,
    val name: String,
    val price: Double,
    val change: Double,
    val changePercent: Double,
    val imageUrl: String
)
