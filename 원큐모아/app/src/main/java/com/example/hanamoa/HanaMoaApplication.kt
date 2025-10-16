package com.example.hanamoa

import android.app.Application
import com.example.hanamoa.network.ApiServiceManager

class HanaMoaApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        ApiServiceManager.getInstance().init(this)
    }
}
