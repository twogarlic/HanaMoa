package com.example.hanamoa.utils

import android.content.Context
import android.widget.Toast

fun Context.showToast(message: String, duration: Int = Toast.LENGTH_SHORT) {
    Toast.makeText(this, message, duration).show()
}

fun String.isValidEmail(): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
}

fun String.isValidPhoneNumber(): Boolean {
    val phonePattern = "^01[0-9]-?[0-9]{4}-?[0-9]{4}$"
    return this.matches(phonePattern.toRegex())
}

fun Double.formatAsCurrency(): String {
    val formatter = java.text.NumberFormat.getNumberInstance(java.util.Locale.KOREA)
    return "${formatter.format(this.toLong())}원"
}

fun Long.formatAsCurrency(): String {
    val formatter = java.text.NumberFormat.getNumberInstance(java.util.Locale.KOREA)
    return "${formatter.format(this)}원"
}
