package com.example.hanamoa.utils

object PhoneNumberFormatter {
    fun format(phone: String): String {
        val numbers = phone.replace("[^0-9]".toRegex(), "")
        return when {
            numbers.length <= 3 -> numbers
            numbers.length <= 7 -> "${numbers.substring(0, 3)}-${numbers.substring(3)}"
            numbers.length <= 11 -> "${numbers.substring(0, 3)}-${numbers.substring(3, 7)}-${numbers.substring(7)}"
            else -> numbers.substring(0, 11).let { 
                "${it.substring(0, 3)}-${it.substring(3, 7)}-${it.substring(7)}"
            }
        }
    }
}