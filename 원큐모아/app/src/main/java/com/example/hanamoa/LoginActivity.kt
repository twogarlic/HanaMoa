package com.example.hanamoa

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LoginActivity : AppCompatActivity() {

    private lateinit var etUserId: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var btnLogin: Button
    private lateinit var tvSignupLink: TextView

    private lateinit var userIdInputLayout: TextInputLayout
    private lateinit var passwordInputLayout: TextInputLayout

    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        hideStatusBar()
        
        setContentView(R.layout.activity_login)

        sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE)

        initViews()
        setupClickListeners()
        setupTextWatchers()
    }

    private fun initViews() {
        etUserId = findViewById(R.id.et_userid)
        etPassword = findViewById(R.id.et_password)
        btnLogin = findViewById(R.id.btn_login)
        tvSignupLink = findViewById(R.id.tv_signup_link)

        userIdInputLayout = etUserId.parent.parent as TextInputLayout
        passwordInputLayout = etPassword.parent.parent as TextInputLayout
        
        btnLogin.isEnabled = false
    }

    private fun setupClickListeners() {
        btnLogin.setOnClickListener {
            if (validateInputs()) {
                login()
            }
        }

        tvSignupLink.setOnClickListener {
            val signupStep1Fragment = SignupStep1Fragment()
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, signupStep1Fragment)
                .addToBackStack(null)
                .commit()
            
            findViewById<View>(R.id.login).visibility = View.GONE
            findViewById<View>(R.id.fragment_container).visibility = View.VISIBLE
        }
    }

    private fun setupTextWatchers() {
        val textWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                userIdInputLayout.error = null
                passwordInputLayout.error = null
                
                updateLoginButtonState()
            }
        }
        
        etUserId.addTextChangedListener(textWatcher)
        etPassword.addTextChangedListener(textWatcher)
    }
    
    private fun updateLoginButtonState() {
        val userId = etUserId.text.toString().trim()
        val password = etPassword.text.toString()
        
        btnLogin.isEnabled = userId.isNotEmpty() && password.isNotEmpty()
    }

    private fun validateInputs(): Boolean {
        var isValid = true

        val userId = etUserId.text.toString().trim()
        if (userId.isEmpty()) {
            userIdInputLayout.error = "아이디를 입력해주세요"
            isValid = false
        } else {
            userIdInputLayout.error = null
        }

        val password = etPassword.text.toString()
        if (password.isEmpty()) {
            passwordInputLayout.error = "비밀번호를 입력해주세요"
            isValid = false
        } else {
            passwordInputLayout.error = null
        }

        return isValid
    }

    private fun login() {
        btnLogin.isEnabled = false
        btnLogin.text = "로그인"

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    val apiService = ApiService.getInstance()
                    apiService.login(
                        id = etUserId.text.toString().trim(),
                        password = etPassword.text.toString()
                    )
                }

                if (result.success) {
                    saveLoginInfo(result.user)

                    startActivity(Intent(this@LoginActivity, HomeActivity::class.java))
                    finish()
                } else {
                    Toast.makeText(this@LoginActivity, result.message ?: "로그인에 실패했습니다", Toast.LENGTH_SHORT).show()
                }

            } catch (e: Exception) {
                Toast.makeText(this@LoginActivity, "네트워크 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            } finally {
                btnLogin.isEnabled = true
                btnLogin.text = "로그인"
            }
        }
    }

    private fun saveLoginInfo(userData: LoginResponse?) {
        userData?.let { user ->
            sharedPreferences.edit().apply {
                putString("user_id", user.id)
                putString("user_name", user.name)
                putString("user_userId", user.userId)
                putBoolean("is_logged_in", true)
                
                if (user.accounts.isNotEmpty()) {
                    val account = user.accounts[0]
                    putString("account_id", account.id)
                    putString("account_number", account.accountNumber)
                    putString("account_name", account.accountName)
                    putFloat("account_balance", account.balance.toFloat())
                }
                
                apply()
            }
            
            android.util.Log.d("LoginActivity", "로그인 정보 저장됨: ${user.id}, ${user.name}")
            android.util.Log.d("LoginActivity", "is_logged_in: ${sharedPreferences.getBoolean("is_logged_in", false)}")
        }
    }

    
    private fun hideStatusBar() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val windowInsetsController = WindowInsetsControllerCompat(window, window.decorView)
        windowInsetsController.hide(WindowInsetsCompat.Type.statusBars())
        windowInsetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
    
    override fun onBackPressed() {
        if (findViewById<View>(R.id.fragment_container).visibility == View.VISIBLE) {
            if (supportFragmentManager.backStackEntryCount > 0) {
                supportFragmentManager.popBackStack()
                
                if (supportFragmentManager.backStackEntryCount == 0) {
                    findViewById<View>(R.id.login).visibility = View.VISIBLE
                    findViewById<View>(R.id.fragment_container).visibility = View.GONE
                }
            } else {
                findViewById<View>(R.id.login).visibility = View.VISIBLE
                findViewById<View>(R.id.fragment_container).visibility = View.GONE
            }
        } else {
            super.onBackPressed()
        }
    }
}
