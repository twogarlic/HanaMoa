package com.example.hanamoa.utils

object ValidationUtils {
    fun isValidPhoneNumber(phone: String): Boolean {
        val cleanPhone = phone.replace("[^0-9]".toRegex(), "")
        return cleanPhone.length == 11 && (cleanPhone.startsWith("010") || cleanPhone.startsWith("011"))
    }
    
    fun isValidPassword(password: String): Boolean {
        return password.length >= 8
    }
}