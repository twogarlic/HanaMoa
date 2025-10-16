package com.example.hanamoa

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.example.hanamoa.utils.formatAsCurrency

class SignupStep5Fragment : Fragment() {
    
    private lateinit var tvTitle: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var hanaPointCard: LinearLayout
    private lateinit var tvNewBadge: TextView
    private lateinit var tvBalance: TextView
    private lateinit var tvMessage: TextView
    private lateinit var btnNext: TextView
    
    private var userId: String? = null
    private var password: String? = null
    private var name: String? = null
    private var ssnFront: String? = null
    private var ssnBack: String? = null
    private var phone: String? = null
    private var selectedAccount: String? = null
    private var isNewAccount: Boolean = false
    private var accountPassword: String? = null
    
    private var isLinkingPoint = false
    private var hanaPointInfo: HanaPointInfo? = null
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_signup_step5, container, false)
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
            accountPassword = bundle.getString("accountPassword")
        }
        
        initViews(view)
        setupClickListeners(view)
        checkHanaPoint()
    }
    
    private fun initViews(view: View) {
        tvTitle = view.findViewById(R.id.tv_title)
        progressBar = view.findViewById(R.id.progress_bar)
        hanaPointCard = view.findViewById(R.id.hana_point_card)
        tvNewBadge = view.findViewById(R.id.tv_new_badge)
        tvBalance = view.findViewById(R.id.tv_balance)
        tvMessage = view.findViewById(R.id.tv_message)
        btnNext = view.findViewById(R.id.btn_next)
    }
    
    private fun setupClickListeners(view: View) {
        view.findViewById<View>(R.id.iv_back).setOnClickListener {
            parentFragmentManager.popBackStack()
        }
        
        btnNext.setOnClickListener {
            goToNextStep()
        }
    }
    
    private fun checkHanaPoint() {
        isLinkingPoint = true
        updateUI()
        
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().checkHanaPoint(
                        name = name ?: "",
                        ssn = "${ssnFront}-${ssnBack}"
                    )
                }
                
                if (result.success && result.data != null) {
                    hanaPointInfo = result.data
                    updateHanaPointUI()
                } else {
                    hanaPointInfo = null
                    updateNoHanaPointUI()
                }
                
                isLinkingPoint = false
                updateUI()
                
            } catch (e: Exception) {
                isLinkingPoint = false
                hanaPointInfo = null
                updateNoHanaPointUI()
                updateUI()
                Toast.makeText(requireContext(), "하나머니 확인 중 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun updateUI() {
        if (isLinkingPoint) {
            tvTitle.text = "하나머니를 확인 중입니다..."
            progressBar.visibility = View.VISIBLE
            hanaPointCard.visibility = View.GONE
            tvMessage.text = ""
            btnNext.isEnabled = false
            btnNext.setBackgroundResource(R.drawable.bg_button_disabled)
        } else {
            progressBar.visibility = View.GONE
            btnNext.isEnabled = true
            btnNext.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
        }
    }
    
    private fun updateHanaPointUI() {
        hanaPointInfo?.let { info ->
            tvTitle.text = "하나머니 계정을 발견했습니다!"
            hanaPointCard.visibility = View.VISIBLE
            
            if (info.isNewAccount) {
                tvNewBadge.visibility = View.VISIBLE
                tvMessage.text = "새로운 하나머니 계정이 생성되었습니다."
            } else {
                tvNewBadge.visibility = View.GONE
                tvMessage.text = "기존 하나머니 계정과 연결되었습니다."
            }
            
            tvBalance.text = info.balance?.formatAsCurrency() ?: "0원"
        }
    }
    
    private fun updateNoHanaPointUI() {
        tvTitle.text = "앗! 하나머니 계정이 없으시네요"
        hanaPointCard.visibility = View.GONE
        tvMessage.text = "회원가입 완료 후 하나머니를 이용하실 수 있습니다."
    }
    
    private fun goToNextStep() {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().createAccount(
                        userId = userId ?: "",
                        password = password ?: "",
                        name = name ?: "",
                        ssn = "${ssnFront}-${ssnBack}",
                        phone = phone ?: "",
                        accountNumber = selectedAccount ?: "",
                        accountPassword = accountPassword ?: "",
                        isNewAccount = isNewAccount
                    )
                }
                
                if (result.success) {
                    Toast.makeText(requireContext(), "회원가입이 완료되었습니다!", Toast.LENGTH_SHORT).show()
                    
                    requireActivity().finish()
                } else {
                    Toast.makeText(requireContext(), result.message ?: "회원가입에 실패했습니다", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "네트워크 오류가 발생했습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
