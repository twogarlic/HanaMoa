package com.example.hanamoa

import android.graphics.Color
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SignupStep4Fragment : Fragment() {
    
    private lateinit var tvTitle: TextView
    private lateinit var tvAccountName: TextView
    private lateinit var tvAccountNumber: TextView
    private lateinit var etAccountPassword: EditText
    private lateinit var etAccountPasswordConfirm: EditText
    private lateinit var btnComplete: TextView
    private lateinit var tvAccountPasswordStatus: TextView
    private lateinit var tvAccountPasswordConfirmStatus: TextView
    
    private var userId: String? = null
    private var password: String? = null
    private var name: String? = null
    private var ssnFront: String? = null
    private var ssnBack: String? = null
    private var phone: String? = null
    private var selectedAccount: String? = null
    private var isNewAccount: Boolean = false
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_signup_step4, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        arguments?.let { bundle ->
            userId = bundle.getString("userId")
            password = bundle.getString("password")
            name = bundle.getString("name")
            ssnFront = bundle.getString("ssnFront")
            ssnBack = bundle.getString("ssnBack")
            phone = bundle.getString("phone")
            selectedAccount = bundle.getString("selectedAccount")
            isNewAccount = bundle.getBoolean("isNewAccount", false)
        }
        
        initViews(view)
        setupClickListeners(view)
        setupTextWatchers()
        updateUI()
        updateButtonStates()
    }
    
    private fun initViews(view: View) {
        tvTitle = view.findViewById(R.id.tv_title)
        tvAccountName = view.findViewById(R.id.tv_account_name)
        tvAccountNumber = view.findViewById(R.id.tv_account_number)
        etAccountPassword = view.findViewById(R.id.et_account_password)
        etAccountPasswordConfirm = view.findViewById(R.id.et_account_password_confirm)
        btnComplete = view.findViewById(R.id.btn_complete)
        tvAccountPasswordStatus = view.findViewById(R.id.tv_account_password_status)
        tvAccountPasswordConfirmStatus = view.findViewById(R.id.tv_account_password_confirm_status)
    }
    
    private fun setupClickListeners(view: View) {
        view.findViewById<View>(R.id.iv_back).setOnClickListener {
            parentFragmentManager.popBackStack()
        }
        
        btnComplete.setOnClickListener {
            completeSignup()
        }
    }
    
    private fun setupTextWatchers() {
        etAccountPassword.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                validateAccountPassword()
                updateButtonStates()
            }
        })
        
        etAccountPasswordConfirm.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                validateAccountPasswordConfirm()
                updateButtonStates()
            }
        })
    }
    
    private fun updateUI() {
        tvTitle.text = if (isNewAccount) "계좌 비밀번호를 설정해주세요" else "계좌 비밀번호를 입력해주세요"
        
        tvAccountNumber.text = selectedAccount ?: ""
        tvAccountName.text = if (selectedAccount == "123-456-789012") "하나은행 입출금통장" else "하나은행 적금통장"
        
        btnComplete.text = if (isNewAccount) "계좌 생성하기" else "계좌 연결하기"
    }
    
    private fun validateAccountPassword() {
        val password = etAccountPassword.text.toString()
        
        if (password.isEmpty()) {
            tvAccountPasswordStatus.text = ""
            return
        }
        
        if (password.length != 4) {
            tvAccountPasswordStatus.text = "4자리 숫자를 입력해주세요"
            tvAccountPasswordStatus.setTextColor(Color.parseColor("#EF4567"))
        } else {
            tvAccountPasswordStatus.text = "올바른 형식입니다"
            tvAccountPasswordStatus.setTextColor(Color.parseColor("#00B2A6"))
        }
        
        validateAccountPasswordConfirm()
    }
    
    private fun validateAccountPasswordConfirm() {
        val password = etAccountPassword.text.toString()
        val passwordConfirm = etAccountPasswordConfirm.text.toString()
        
        if (passwordConfirm.isEmpty()) {
            tvAccountPasswordConfirmStatus.text = ""
            return
        }
        
        if (password == passwordConfirm) {
            tvAccountPasswordConfirmStatus.text = "비밀번호가 일치합니다"
            tvAccountPasswordConfirmStatus.setTextColor(Color.parseColor("#00B2A6"))
        } else {
            tvAccountPasswordConfirmStatus.text = "비밀번호가 일치하지 않습니다"
            tvAccountPasswordConfirmStatus.setTextColor(Color.parseColor("#EF4567"))
        }
    }
    
    private fun updateButtonStates() {
        val accountPassword = etAccountPassword.text.toString()
        val accountPasswordConfirm = etAccountPasswordConfirm.text.toString()
        
        val isValid = accountPassword.length == 4 && 
                     accountPasswordConfirm.length == 4 && 
                     accountPassword == accountPasswordConfirm
        
        btnComplete.isEnabled = isValid
        
        if (isValid) {
            btnComplete.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
            btnComplete.setTextColor(resources.getColor(android.R.color.white, null))
        } else {
            btnComplete.setBackgroundResource(R.drawable.bg_button_disabled)
            btnComplete.setTextColor(resources.getColor(android.R.color.white, null))
        }
    }
    
    private fun completeSignup() {
        val accountPassword = etAccountPassword.text.toString()
        val accountPasswordConfirm = etAccountPasswordConfirm.text.toString()
        
        if (accountPassword.length != 4 || accountPasswordConfirm.length != 4) {
            Toast.makeText(requireContext(), "계좌 비밀번호 4자리를 입력해주세요", Toast.LENGTH_SHORT).show()
            return
        }
        
        if (accountPassword != accountPasswordConfirm) {
            Toast.makeText(requireContext(), "계좌 비밀번호가 일치하지 않습니다", Toast.LENGTH_SHORT).show()
            return
        }
        
        val bundle = Bundle().apply {
            putString("userId", userId)
            putString("password", password)
            putString("name", name)
            putString("ssnFront", ssnFront)
            putString("ssnBack", ssnBack)
            putString("phone", phone)
            putString("selectedAccount", selectedAccount)
            putBoolean("isNewAccount", isNewAccount)
            putString("accountPassword", accountPassword)
        }
        
        val signupStep5Fragment = SignupStep5Fragment().apply {
            arguments = bundle
        }
        
        parentFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, signupStep5Fragment)
            .addToBackStack(null)
            .commit()
    }
}
