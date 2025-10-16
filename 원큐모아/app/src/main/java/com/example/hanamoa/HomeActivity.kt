package com.example.hanamoa

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.hanamoa.databinding.ActivityHomeBinding
import com.example.hanamoa.viewmodel.HomeActivityViewModel
import com.google.firebase.messaging.FirebaseMessaging

class HomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding
    private lateinit var viewModel: HomeActivityViewModel
    private var currentFragment: Fragment? = null
    private val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        viewModel = ViewModelProvider(this)[HomeActivityViewModel::class.java]
        viewModel.init(this)
        
        setupObservers()
        
        viewModel.isLoggedIn.observe(this, Observer { isLoggedIn ->
            if (!isLoggedIn) {
                android.util.Log.d("HomeActivity", "로그인되지 않음 - LoginActivity로 이동")
                startActivity(Intent(this, LoginActivity::class.java))
                finish()
                return@Observer
            }
            
            setupNavigationListeners()
            hideStatusBar()
            
            requestNotificationPermission()
            
            getFCMToken()
            
            showFragment(HomeFragment())
        })
    }

    /**
     * 옵저버 설정
     */
    private fun setupObservers() {
        viewModel.selectedNavigationIndex.observe(this, Observer { index ->
            index?.let { updateNavigationUI(it) }
        })
        
        viewModel.errorMessage.observe(this, Observer { errorMessage ->
            errorMessage?.let {
                Log.e("HomeActivity", it)
                viewModel.clearErrorMessage()
            }
        })
    }

    fun showFragment(fragment: Fragment) {
        val transaction = supportFragmentManager.beginTransaction()
        transaction.replace(R.id.fragment_container, fragment)
        transaction.commit()
        currentFragment = fragment
    }

    private fun setupNavigationListeners() {
        binding.navHome.setOnClickListener {
            showFragment(HomeFragment())
            viewModel.updateNavigationIndex(0)
        }

        binding.navInvest.setOnClickListener {
            showFragment(InvestFragment())
            viewModel.updateNavigationIndex(1)
        }

        binding.navGift.setOnClickListener {
            showFragment(GiftFragment())
            viewModel.updateNavigationIndex(2)
        }

        binding.navExchange.setOnClickListener {
            showFragment(ExchangeFragment())
            viewModel.updateNavigationIndex(3)
        }

        binding.navMenu.setOnClickListener {
            showFragment(MenuFragment())
            viewModel.updateNavigationIndex(4)
        }
    }

    fun updateNavigationUI(selectedIndex: Int) {
        val navItems = listOf(
            binding.navHome to (R.drawable.ic_nav_home to R.drawable.ic_nav_home_selected),
            binding.navInvest to (R.drawable.ic_nav_invest to R.drawable.ic_nav_invest_selected),
            binding.navGift to (R.drawable.ic_nav_gift to R.drawable.ic_nav_gift_selected),
            binding.navExchange to (R.drawable.ic_nav_exchange to R.drawable.ic_nav_exchange_selected),
            binding.navMenu to (R.drawable.ic_nav_menu to R.drawable.ic_nav_menu_selected)
        )

        navItems.forEachIndexed { index, (navLayout, icons) ->
            for (i in 0 until navLayout.childCount) {
                val child = navLayout.getChildAt(i)
                if (child is android.widget.ImageView) {
                    if (index == selectedIndex) {
                        child.setImageResource(icons.second)
                    } else {
                        child.setImageResource(icons.first)
                    }
                } else if (child is android.widget.TextView) {
                    if (index == selectedIndex) {
                        child.setTextColor(resources.getColor(android.R.color.holo_green_dark, null))
                    } else {
                        child.setTextColor(resources.getColor(android.R.color.darker_gray, null))
                    }
                }
            }
        }
    }

    private fun hideStatusBar() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val windowInsetsController = WindowInsetsControllerCompat(window, window.decorView)
        windowInsetsController.hide(WindowInsetsCompat.Type.statusBars())
        windowInsetsController.hide(WindowInsetsCompat.Type.navigationBars())
        windowInsetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }

    private fun getFCMToken() {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                Log.d("FCM", "FCM Token: $token")
                
                viewModel.saveFCMToken(token)
            } else {
                Log.e("FCM", "FCM 토큰 획득 실패", task.exception)
            }
        }
    }
    
    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) 
                != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                )
            }
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d("FCM", "알림 권한 허용됨")
            } else {
                Log.d("FCM", "알림 권한 거부됨")
            }
        }
    }

}