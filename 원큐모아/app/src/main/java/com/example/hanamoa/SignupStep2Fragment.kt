package com.example.hanamoa

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
import java.util.regex.Pattern

class SignupStep2Fragment : Fragment() {
    
    private lateinit var etName: EditText
    private lateinit var etSsnFront: EditText
    private lateinit var etSsnBack: EditText
    private lateinit var etPhone: EditText
    private lateinit var etVerificationCode: EditText
    private lateinit var btnSendVerification: TextView
    private lateinit var btnVerifyCode: TextView
    private lateinit var btnNext: TextView
    private lateinit var tvVerificationStatus: TextView
    
    private var isPhoneVerified = false
    private var sentVerificationCode: String? = null
    private var userId: String? = null
    private var password: String? = null
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_signup_step2, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        arguments?.let { bundle ->
            userId = bundle.getString("userId")
            password = bundle.getString("password")
        }
        
        initViews(view)
        setupClickListeners(view)
        setupTextWatchers()
        updateButtonStates()
    }
    
    private fun initViews(view: View) {
        etName = view.findViewById(R.id.et_name)
        etSsnFront = view.findViewById(R.id.et_ssn_front)
        etSsnBack = view.findViewById(R.id.et_ssn_back)
        etPhone = view.findViewById(R.id.et_phone)
        etVerificationCode = view.findViewById(R.id.et_verification_code)
        btnSendVerification = view.findViewById(R.id.btn_send_verification)
        btnVerifyCode = view.findViewById(R.id.btn_verify_code)
        btnNext = view.findViewById(R.id.btn_next)
        tvVerificationStatus = view.findViewById(R.id.tv_verification_status)
    }
    
    private fun setupClickListeners(view: View) {
        view.findViewById<View>(R.id.iv_back).setOnClickListener {
            parentFragmentManager.popBackStack()
        }
        
        btnSendVerification.setOnClickListener {
            sendVerificationCode()
        }
        
        btnVerifyCode.setOnClickListener {
            verifyCode()
        }
        
        btnNext.setOnClickListener {
            goToNextStep()
        }
    }
    
    private fun setupTextWatchers() {
        etPhone.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                formatPhoneNumber()
                updateSendVerificationButtonState()
                updateButtonStates()
            }
        })
        
        etVerificationCode.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                updateVerifyCodeButtonState()
                updateButtonStates()
            }
        })
        
        val textWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                updateButtonStates()
            }
        }
        
        etName.addTextChangedListener(textWatcher)
        etSsnFront.addTextChangedListener(textWatcher)
        etSsnBack.addTextChangedListener(textWatcher)
    }
    
    private fun formatPhoneNumber() {
        val phone = etPhone.text.toString().replace("-", "")
        val formatted = when {
            phone.length <= 3 -> phone
            phone.length <= 7 -> "${phone.substring(0, 3)}-${phone.substring(3)}"
            phone.length <= 11 -> "${phone.substring(0, 3)}-${phone.substring(3, 7)}-${phone.substring(7)}"
            else -> "${phone.substring(0, 3)}-${phone.substring(3, 7)}-${phone.substring(7, 11)}"
        }
        
        if (etPhone.text.toString() != formatted) {
            etPhone.setText(formatted)
            etPhone.setSelection(formatted.length)
        }
    }
    
    private fun updateSendVerificationButtonState() {
        val phone = etPhone.text.toString().trim()
        val isValidPhone = isValidPhoneNumber(phone)
        
        btnSendVerification.isEnabled = isValidPhone
        
        if (isValidPhone) {
            btnSendVerification.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
            btnSendVerification.setTextColor(resources.getColor(android.R.color.white, null))
        } else {
            btnSendVerification.setBackgroundResource(R.drawable.bg_button_disabled)
            btnSendVerification.setTextColor(resources.getColor(android.R.color.black, null))
        }
    }
    
    private fun updateVerifyCodeButtonState() {
        val code = etVerificationCode.text.toString().trim()
        val isValidCode = code.length == 6
        
        btnVerifyCode.isEnabled = isValidCode && sentVerificationCode != null
        
        if (isValidCode && sentVerificationCode != null) {
            btnVerifyCode.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
            btnVerifyCode.setTextColor(resources.getColor(android.R.color.white, null))
        } else {
            btnVerifyCode.setBackgroundResource(R.drawable.bg_button_disabled)
            btnVerifyCode.setTextColor(resources.getColor(android.R.color.black, null))
        }
    }
    
    private fun updateButtonStates() {
        val name = etName.text.toString().trim()
        val ssnFront = etSsnFront.text.toString().trim()
        val ssnBack = etSsnBack.text.toString().trim()
        val phone = etPhone.text.toString().trim()
        val verificationCode = etVerificationCode.text.toString().trim()
        
        val isValid = name.isNotEmpty() && 
                     ssnFront.length == 6 && 
                     ssnBack.length == 7 && 
                     isValidPhoneNumber(phone) &&
                     isPhoneVerified
        
        btnNext.isEnabled = isValid
        
        if (isValid) {
            btnNext.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
            btnNext.setTextColor(resources.getColor(android.R.color.white, null))
        } else {
            btnNext.setBackgroundResource(R.drawable.bg_button_disabled)
            btnNext.setTextColor(resources.getColor(android.R.color.black, null))
        }
    }
    
    private fun isValidPhoneNumber(phone: String): Boolean {
        val phonePattern = Pattern.compile("^010-\\d{4}-\\d{4}$")
        return phonePattern.matcher(phone).matches()
    }
    
    private fun sendVerificationCode() {
        val phone = etPhone.text.toString().trim()
        
        if (!isValidPhoneNumber(phone)) {
            Toast.makeText(requireContext(), "올바른 전화번호를 입력해주세요", Toast.LENGTH_SHORT).show()
            return
        }
        
        android.util.Log.d("SMS_DEBUG", "SMS 발송 시도 - 전화번호: $phone")
        
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().sendSmsVerification(phone)
                }
                
                android.util.Log.d("SMS_DEBUG", "SMS 발송 결과 - success: ${result.success}, message: ${result.message}, code: ${result.data}")
                
                if (result.success) {
                    sentVerificationCode = result.data
                    tvVerificationStatus.text = "인증번호가 발송되었습니다"
                    tvVerificationStatus.setTextColor(resources.getColor(android.R.color.holo_green_dark, null))
                    Toast.makeText(requireContext(), result.message, Toast.LENGTH_SHORT).show()
                } else {
                    tvVerificationStatus.text = result.message
                    tvVerificationStatus.setTextColor(resources.getColor(android.R.color.holo_red_dark, null))
                    Toast.makeText(requireContext(), result.message, Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                android.util.Log.e("SMS_DEBUG", "SMS 발송 예외 발생: ${e.message}")
                Toast.makeText(requireContext(), "인증번호 발송에 실패했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun verifyCode() {
        val phone = etPhone.text.toString().trim()
        val code = etVerificationCode.text.toString().trim()
        
        if (code.length != 6) {
            Toast.makeText(requireContext(), "인증번호 6자리를 입력해주세요", Toast.LENGTH_SHORT).show()
            return
        }
        
        android.util.Log.d("SMS_DEBUG", "SMS 검증 시도 - 전화번호: $phone, 코드: $code")
        
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().verifySmsCode(phone, code)
                }
                
                android.util.Log.d("SMS_DEBUG", "SMS 검증 결과 - success: ${result.success}, message: ${result.message}")
                
                if (result.success) {
                    isPhoneVerified = true
                    tvVerificationStatus.text = "전화번호 인증이 완료되었습니다"
                    tvVerificationStatus.setTextColor(resources.getColor(android.R.color.holo_green_dark, null))
                    Toast.makeText(requireContext(), result.message, Toast.LENGTH_SHORT).show()
                    updateButtonStates()
                } else {
                    tvVerificationStatus.text = result.message
                    tvVerificationStatus.setTextColor(resources.getColor(android.R.color.holo_red_dark, null))
                    Toast.makeText(requireContext(), result.message, Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                android.util.Log.e("SMS_DEBUG", "SMS 검증 예외 발생: ${e.message}")
                Toast.makeText(requireContext(), "인증번호 확인에 실패했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun goToNextStep() {
        val name = etName.text.toString().trim()
        val ssnFront = etSsnFront.text.toString().trim()
        val ssnBack = etSsnBack.text.toString().trim()
        val phone = etPhone.text.toString().trim()
        
        if (name.isEmpty() || ssnFront.length != 6 || ssnBack.length != 7 || !isPhoneVerified) {
            Toast.makeText(requireContext(), "모든 정보를 올바르게 입력해주세요", Toast.LENGTH_SHORT).show()
            return
        }
        
        val bundle = Bundle().apply {
            putString("userId", userId)
            putString("password", password)
            putString("name", name)
            putString("ssnFront", ssnFront)
            putString("ssnBack", ssnBack)
            putString("phone", phone)
        }
        
        val signupStep3Fragment = SignupStep3Fragment().apply {
            arguments = bundle
        }
        
        parentFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, signupStep3Fragment)
            .addToBackStack(null)
            .commit()
    }
}