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

class SignupStep1Fragment : Fragment() {
    
    private lateinit var etUserId: EditText
    private lateinit var etPassword: EditText
    private lateinit var etPasswordConfirm: EditText
    private lateinit var btnCheckId: TextView
    private lateinit var btnNext: TextView
    private lateinit var tvIdStatus: TextView
    private lateinit var tvPasswordStatus: TextView
    private lateinit var tvPasswordConfirmStatus: TextView
    
    private var isIdAvailable = false
    private var isIdChecked = false
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_signup_step1, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        initViews(view)
        setupClickListeners(view)
        setupTextWatchers()
        updateCheckIdButtonState()
        updateNextButtonState()
    }
    
    private fun initViews(view: View) {
        etUserId = view.findViewById(R.id.et_user_id)
        etPassword = view.findViewById(R.id.et_password)
        etPasswordConfirm = view.findViewById(R.id.et_password_confirm)
        btnCheckId = view.findViewById(R.id.btn_check_id)
        btnNext = view.findViewById(R.id.btn_next)
        tvIdStatus = view.findViewById(R.id.tv_id_status)
        tvPasswordStatus = view.findViewById(R.id.tv_password_status)
        tvPasswordConfirmStatus = view.findViewById(R.id.tv_password_confirm_status)
    }
    
    private fun setupClickListeners(view: View) {
        view.findViewById<View>(R.id.iv_back).setOnClickListener {
            parentFragmentManager.popBackStack()
        }
        
        btnCheckId.setOnClickListener {
            checkIdAvailability()
        }
        
        btnNext.setOnClickListener {
            goToNextStep()
        }
    }
    
    private fun setupTextWatchers() {
        etUserId.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                isIdChecked = false
                isIdAvailable = false
                tvIdStatus.text = ""
                updateCheckIdButtonState()
                updateNextButtonState()
            }
        })
        
        etPassword.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                validatePassword()
                updateNextButtonState()
            }
        })
        
        etPasswordConfirm.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                validatePasswordConfirm()
                updateNextButtonState()
            }
        })
    }
    
    private fun checkIdAvailability() {
        val userId = etUserId.text.toString().trim()
        
        if (userId.isEmpty()) {
            Toast.makeText(requireContext(), "아이디를 입력해주세요", Toast.LENGTH_SHORT).show()
            return
        }
        
        if (userId.length < 4) {
            Toast.makeText(requireContext(), "아이디는 4자 이상 입력해주세요", Toast.LENGTH_SHORT).show()
            return
        }
        
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().checkIdAvailability(userId)
                }
                
                if (result.success && result.data != null) {
                    isIdChecked = true
                    isIdAvailable = result.data
                    
                    if (result.data) {
                        tvIdStatus.text = "사용 가능한 아이디입니다"
                        tvIdStatus.setTextColor(Color.parseColor("#00B2A6"))
                    } else {
                        tvIdStatus.text = "이미 사용 중인 아이디입니다"
                        tvIdStatus.setTextColor(Color.parseColor("#EF4567"))
                    }
                } else {
                    Toast.makeText(requireContext(), result.message ?: "아이디 중복확인에 실패했습니다", Toast.LENGTH_SHORT).show()
                }
                
                updateNextButtonState()
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "네트워크 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun validatePassword() {
        val password = etPassword.text.toString()
        
        if (password.isEmpty()) {
            tvPasswordStatus.text = ""
            return
        }
        
        if (password.length < 6) {
            tvPasswordStatus.text = "비밀번호는 6자 이상 입력해주세요"
            tvPasswordStatus.setTextColor(Color.parseColor("#EF4567"))
        } else {
            tvPasswordStatus.text = "사용 가능한 비밀번호입니다"
            tvPasswordStatus.setTextColor(Color.parseColor("#00B2A6"))
        }
        
        validatePasswordConfirm()
    }
    
    private fun validatePasswordConfirm() {
        val password = etPassword.text.toString()
        val passwordConfirm = etPasswordConfirm.text.toString()
        
        if (passwordConfirm.isEmpty()) {
            tvPasswordConfirmStatus.text = ""
            return
        }
        
        if (password == passwordConfirm) {
            tvPasswordConfirmStatus.text = "비밀번호가 일치합니다"
            tvPasswordConfirmStatus.setTextColor(Color.parseColor("#00B2A6"))
        } else {
            tvPasswordConfirmStatus.text = "비밀번호가 일치하지 않습니다"
            tvPasswordConfirmStatus.setTextColor(Color.parseColor("#EF4567"))
        }
    }
    
    private fun updateNextButtonState() {
        val userId = etUserId.text.toString().trim()
        val password = etPassword.text.toString()
        val passwordConfirm = etPasswordConfirm.text.toString()
        
        val isValid = userId.isNotEmpty() && 
                     password.isNotEmpty() && 
                     passwordConfirm.isNotEmpty() &&
                     isIdChecked && 
                     isIdAvailable &&
                     password.length >= 6 &&
                     password == passwordConfirm
        
        btnNext.isEnabled = isValid
        
        if (isValid) {
            btnNext.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
            btnNext.setTextColor(resources.getColor(android.R.color.white, null))
        } else {
            btnNext.setBackgroundResource(R.drawable.bg_button_disabled)
            btnNext.setTextColor(resources.getColor(android.R.color.white, null))
        }
    }
    
    private fun updateCheckIdButtonState() {
        val userId = etUserId.text.toString().trim()
        val isEnabled = userId.isNotEmpty()
        
        btnCheckId.isEnabled = isEnabled
        
        if (isEnabled) {
            btnCheckId.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
            btnCheckId.setTextColor(resources.getColor(android.R.color.white, null))
        } else {
            btnCheckId.setBackgroundResource(R.drawable.bg_button_disabled)
            btnCheckId.setTextColor(resources.getColor(android.R.color.white, null))
        }
    }
    
    private fun goToNextStep() {
        val userId = etUserId.text.toString().trim()
        val password = etPassword.text.toString()
        
        val bundle = Bundle().apply {
            putString("userId", userId)
            putString("password", password)
        }
        
        val signupStep2Fragment = SignupStep2Fragment().apply {
            arguments = bundle
        }
        
        parentFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, signupStep2Fragment)
            .addToBackStack(null)
            .commit()
    }
}
