package com.example.hanamoa.network.models

data class ConvertCurrencyRequest(
    val fromCurrency: String,
    val toCurrency: String,
    val amount: Double
)
