package com.example.hanamoa

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.example.hanamoa.utils.PhoneNumberFormatter
import com.example.hanamoa.utils.ValidationUtils
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.example.hanamoa.ApiService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SignUpActivity : AppCompatActivity() {

    private lateinit var etName: TextInputEditText
    private lateinit var etPhone: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var etPasswordConfirm: TextInputEditText
    private lateinit var btnSignup: Button
    private lateinit var tvLoginLink: TextView

    private lateinit var phoneInputLayout: TextInputLayout
    private lateinit var passwordInputLayout: TextInputLayout
    private lateinit var passwordConfirmInputLayout: TextInputLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        hideStatusBar()
        
        setContentView(R.layout.activity_signup)

        initViews()
        setupClickListeners()
        setupTextWatchers()
    }

    private fun initViews() {
        etName = findViewById(R.id.et_name)
        etPhone = findViewById(R.id.et_phone)
        etPassword = findViewById(R.id.et_password)
        etPasswordConfirm = findViewById(R.id.et_password_confirm)
        btnSignup = findViewById(R.id.btn_signup)
        tvLoginLink = findViewById(R.id.tv_login_link)

        phoneInputLayout = etPhone.parent.parent as TextInputLayout
        passwordInputLayout = etPassword.parent.parent as TextInputLayout
        passwordConfirmInputLayout = etPasswordConfirm.parent.parent as TextInputLayout
    }

    private fun setupClickListeners() {
        btnSignup.setOnClickListener {
            if (validateInputs()) {
                signup()
            }
        }

        tvLoginLink.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun setupTextWatchers() {
        etPhone.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val formatted = PhoneNumberFormatter.format(s.toString())
                if (formatted != s.toString()) {
                    etPhone.setText(formatted)
                    etPhone.setSelection(formatted.length)
                }
            }
        })

        etPasswordConfirm.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                if (s.toString().isNotEmpty() && s.toString() != etPassword.text.toString()) {
                    passwordConfirmInputLayout.error = "비밀번호가 일치하지 않습니다"
                } else {
                    passwordConfirmInputLayout.error = null
                }
            }
        })
    }

    private fun validateInputs(): Boolean {
        var isValid = true

        if (etName.text.toString().trim().isEmpty()) {
            etName.error = "이름을 입력해주세요"
            isValid = false
        }

        val phone = etPhone.text.toString().trim()
        if (phone.isEmpty()) {
            phoneInputLayout.error = "전화번호를 입력해주세요"
            isValid = false
        } else if (!ValidationUtils.isValidPhoneNumber(phone)) {
            phoneInputLayout.error = "올바른 전화번호 형식이 아닙니다"
            isValid = false
        } else {
            phoneInputLayout.error = null
        }

        val password = etPassword.text.toString()
        if (password.isEmpty()) {
            passwordInputLayout.error = "비밀번호를 입력해주세요"
            isValid = false
        } else if (!ValidationUtils.isValidPassword(password)) {
            passwordInputLayout.error = "비밀번호는 8자 이상이어야 합니다"
            isValid = false
        } else {
            passwordInputLayout.error = null
        }

        val passwordConfirm = etPasswordConfirm.text.toString()
        if (passwordConfirm.isEmpty()) {
            passwordConfirmInputLayout.error = "비밀번호 확인을 입력해주세요"
            isValid = false
        } else if (password != passwordConfirm) {
            passwordConfirmInputLayout.error = "비밀번호가 일치하지 않습니다"
            isValid = false
        } else {
            passwordConfirmInputLayout.error = null
        }

        return isValid
    }

    private fun signup() {
        btnSignup.isEnabled = false
        btnSignup.text = "가입 중..."

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    val apiService = ApiService.getInstance()
                    apiService.signup(
                        userId = etPhone.text.toString().trim(), // 전화번호를 userId로 사용
                        password = etPassword.text.toString(),
                        name = etName.text.toString().trim(),
                        ssn = "", // 주민등록번호는 빈 값으로 설정
                        phone = etPhone.text.toString().trim()
                    )
                }

                if (result.success) {
                    Toast.makeText(this@SignUpActivity, "회원가입이 완료되었습니다", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this@SignUpActivity, LoginActivity::class.java))
                    finish()
                } else {
                    Toast.makeText(this@SignUpActivity, result.message ?: "회원가입에 실패했습니다", Toast.LENGTH_SHORT).show()
                }

            } catch (e: Exception) {
                Toast.makeText(this@SignUpActivity, "네트워크 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            } finally {
                btnSignup.isEnabled = true
                btnSignup.text = "회원가입"
            }
        }
    }
    
    private fun hideStatusBar() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val windowInsetsController = WindowInsetsControllerCompat(window, window.decorView)
        windowInsetsController.hide(WindowInsetsCompat.Type.statusBars())
        windowInsetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
}
