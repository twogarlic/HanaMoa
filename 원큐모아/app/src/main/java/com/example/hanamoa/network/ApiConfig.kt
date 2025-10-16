package com.example.hanamoa.network

import android.content.Context
import java.io.File
import java.util.Properties

object ApiConfig {
    private var baseUrl: String? = null
    
    fun init(context: Context) {
        try {
            val properties = Properties()
            val localPropertiesFile = File(context.filesDir.parent, "local.properties")
            if (localPropertiesFile.exists()) {
                properties.load(localPropertiesFile.inputStream())
                baseUrl = properties.getProperty("API_BASE_URL")
            }
        } catch (e: Exception) {

        }
    }
    
    fun getBaseUrl(): String? {
        return baseUrl
    }
}
