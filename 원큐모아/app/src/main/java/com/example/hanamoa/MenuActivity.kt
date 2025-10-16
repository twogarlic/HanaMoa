package com.example.hanamoa

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MenuActivity : AppCompatActivity() {

    private lateinit var ivBack: ImageView
    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        supportActionBar?.hide()
        actionBar?.hide()
        
        setContentView(R.layout.activity_menu)
        
        hideStatusBar()

        sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE)

        initViews()
        setupClickListeners()
    }

    private fun initViews() {
        ivBack = findViewById(R.id.iv_back)
    }

    private fun setupClickListeners() {
        ivBack.setOnClickListener {
            finish()
        }

        setupNavigationListeners()
    }

    private fun setupNavigationListeners() {
        findViewById<LinearLayout>(R.id.nav_home).setOnClickListener {
            startActivity(Intent(this, HomeActivity::class.java))
            finish()
        }

        findViewById<LinearLayout>(R.id.nav_invest).setOnClickListener {
            startActivity(Intent(this, InvestActivity::class.java))
            finish()
        }

        findViewById<LinearLayout>(R.id.nav_gift).setOnClickListener {
            startActivity(Intent(this, GiftActivity::class.java))
            finish()
        }

        findViewById<LinearLayout>(R.id.nav_exchange).setOnClickListener {
            startActivity(Intent(this, ExchangeActivity::class.java))
            finish()
        }

        findViewById<LinearLayout>(R.id.nav_menu).setOnClickListener {
        }
    }

    private fun hideStatusBar() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val windowInsetsController = WindowInsetsControllerCompat(window, window.decorView)
        windowInsetsController.hide(WindowInsetsCompat.Type.statusBars())
        windowInsetsController.hide(WindowInsetsCompat.Type.navigationBars())
        windowInsetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
}
