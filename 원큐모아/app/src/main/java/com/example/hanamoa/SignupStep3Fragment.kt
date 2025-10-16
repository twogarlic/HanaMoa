package com.example.hanamoa

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment

class SignupStep3Fragment : Fragment() {
    
    private lateinit var accountCard1: LinearLayout
    private lateinit var accountCard2: LinearLayout
    private lateinit var btnNext: TextView
    private lateinit var tvNewBadge1: TextView
    private lateinit var tvNewBadge2: TextView
    
    private var selectedAccount: String? = null
    private var userId: String? = null
    private var password: String? = null
    private var name: String? = null
    private var ssnFront: String? = null
    private var ssnBack: String? = null
    private var phone: String? = null
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_signup_step3, container, false)
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
        }
        
        initViews(view)
        setupClickListeners(view)
        updateButtonStates()
    }
    
    private fun initViews(view: View) {
        accountCard1 = view.findViewById(R.id.account_card_1)
        accountCard2 = view.findViewById(R.id.account_card_2)
        btnNext = view.findViewById(R.id.btn_next)
        tvNewBadge1 = view.findViewById(R.id.tv_new_badge_1)
        tvNewBadge2 = view.findViewById(R.id.tv_new_badge_2)
    }
    
    private fun setupClickListeners(view: View) {
        view.findViewById<View>(R.id.iv_back).setOnClickListener {
            parentFragmentManager.popBackStack()
        }
        
        accountCard1.setOnClickListener {
            selectAccount("123-456-789012", true)
        }
        
        accountCard2.setOnClickListener {
            selectAccount("987-654-321098", false)
        }
        
        btnNext.setOnClickListener {
            goToNextStep()
        }
    }
    
    private fun selectAccount(accountNumber: String, isNewAccount: Boolean) {
        selectedAccount = accountNumber
        
        resetCardSelection()
        
        if (accountNumber == "123-456-789012") {
            accountCard1.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
            updateCardTextColors(accountCard1, Color.WHITE)
        } else {
            accountCard2.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
            updateCardTextColors(accountCard2, Color.WHITE)
        }
        
        updateButtonStates()
        
        Toast.makeText(requireContext(), 
            if (isNewAccount) "신규 계좌가 선택되었습니다" else "기존 계좌가 선택되었습니다", 
            Toast.LENGTH_SHORT).show()
    }
    
    private fun resetCardSelection() {
        accountCard1.setBackgroundResource(R.drawable.bg_friend_search)
        accountCard2.setBackgroundResource(R.drawable.bg_friend_search)
        
        updateCardTextColors(accountCard1, Color.parseColor("#333333"))
        updateCardTextColors(accountCard2, Color.parseColor("#333333"))
    }
    
    private fun updateCardTextColors(card: LinearLayout, textColor: Int) {
        for (i in 0 until card.childCount) {
            val child = card.getChildAt(i)
            if (child is TextView) {
                child.setTextColor(textColor)
            } else if (child is LinearLayout) {
                updateLinearLayoutTextColors(child, textColor)
            }
        }
    }
    
    private fun updateLinearLayoutTextColors(layout: LinearLayout, textColor: Int) {
        for (i in 0 until layout.childCount) {
            val child = layout.getChildAt(i)
            if (child is TextView) {
                child.setTextColor(textColor)
            } else if (child is LinearLayout) {
                updateLinearLayoutTextColors(child, textColor)
            }
        }
    }
    
    private fun updateButtonStates() {
        val isValid = selectedAccount != null
        
        btnNext.isEnabled = isValid
        
        if (isValid) {
            btnNext.setBackgroundResource(R.drawable.bg_confirm_dialog_button)
            btnNext.setTextColor(resources.getColor(android.R.color.white, null))
        } else {
            btnNext.setBackgroundResource(R.drawable.bg_button_disabled)
            btnNext.setTextColor(resources.getColor(android.R.color.white, null))
        }
    }
    
    private fun goToNextStep() {
        if (selectedAccount == null) {
            Toast.makeText(requireContext(), "계좌를 선택해주세요", Toast.LENGTH_SHORT).show()
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
            putBoolean("isNewAccount", selectedAccount == "123-456-789012")
        }
        
        val signupStep4Fragment = SignupStep4Fragment().apply {
            arguments = bundle
        }
        
        parentFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, signupStep4Fragment)
            .addToBackStack(null)
            .commit()
    }
}
