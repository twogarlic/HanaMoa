package com.example.hanamoa

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import com.example.hanamoa.base.BaseFragment
import com.example.hanamoa.databinding.FragmentHomeBinding
import com.example.hanamoa.viewmodel.HomeViewModel
import java.text.NumberFormat
import java.util.Locale

class HomeFragment : BaseFragment<FragmentHomeBinding, HomeViewModel>() {

    override fun getLayoutId(): Int = R.layout.fragment_home
    
    override fun getViewModelClass(): Class<HomeViewModel> = HomeViewModel::class.java
    
    override fun initViewModel() {
        viewModel = createViewModel()
        viewModel.init(requireContext())
    }
    
    override fun initView() {
    }
    
    override fun setupDataBinding() {
        binding.viewModel = viewModel
    }
    
    override fun setupObservers() {
        viewModel.accountInfo.observe(viewLifecycleOwner, Observer { accountInfo ->
            accountInfo?.let {
                updateAccountInfo(it)
            }
        })
        
        viewModel.userInfo.observe(viewLifecycleOwner, Observer { userInfo ->
            userInfo?.let {
                updateUserInfo(it)
            }
        })
        
        viewModel.notificationCount.observe(viewLifecycleOwner, Observer { count ->
            updateNotificationBadge(count ?: 0)
        })
        
        viewModel.isBalanceHidden.observe(viewLifecycleOwner, Observer { isHidden ->
            updateBalanceDisplay(isHidden ?: false)
        })
        
        viewModel.isLoading.observe(viewLifecycleOwner, Observer { isLoading ->
        })
        
        viewModel.errorMessage.observe(viewLifecycleOwner, Observer { errorMessage ->
            errorMessage?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                viewModel.clearErrorMessage()
            }
        })
        
        setupClickListeners()
    }

    private fun setupClickListeners() {
        binding.ivAlarm.setOnClickListener {
            val intent = Intent(requireContext(), NotificationActivity::class.java)
            startActivityForResult(intent, 1001)
        }

        binding.tvCopyAccount.setOnClickListener {
            copyAccountNumber()
        }

        binding.tvHideBalance.setOnClickListener {
            viewModel.toggleBalanceVisibility()
        }

        binding.tvSendButton.setOnClickListener {
            Toast.makeText(requireContext(), "보내기 기능", Toast.LENGTH_SHORT).show()
        }

        setupCardClickListeners()
    }

    private fun setupCardClickListeners() {
        binding.cardInvest.setOnClickListener {
            (activity as? HomeActivity)?.showFragment(InvestFragment())
            (activity as? HomeActivity)?.updateNavigationUI(1)
        }

        binding.cardGift.setOnClickListener {
            (activity as? HomeActivity)?.showFragment(GiftFragment())
            (activity as? HomeActivity)?.updateNavigationUI(2)
        }

        binding.cardExchange.setOnClickListener {
            (activity as? HomeActivity)?.showFragment(ExchangeFragment())
            (activity as? HomeActivity)?.updateNavigationUI(3)
        }
    }

    /**
     * 계좌 정보 업데이트
     */
    private fun updateAccountInfo(accountInfo: com.example.hanamoa.repository.AccountInfo) {
        binding.tvAccountName.text = "하나모아 계좌"
        binding.tvAccountNumber.text = accountInfo.accountNumber
        updateBalanceDisplay(viewModel.isBalanceHidden.value ?: false, accountInfo.balance)
    }

    /**
     * 사용자 정보 업데이트
     */
    private fun updateUserInfo(userInfo: com.example.hanamoa.repository.UserInfo) {
    }

    /**
     * 잔액 표시 업데이트
     */
    private fun updateBalanceDisplay(isHidden: Boolean, balance: Double = 0.0) {
        if (isHidden) {
            binding.tvBalance.text = "●●●●원"
            binding.tvHideBalance.text = "보이기"
        } else {
            val formatter = NumberFormat.getNumberInstance(Locale.KOREA)
            binding.tvBalance.text = "${formatter.format(balance.toLong())}원"
            binding.tvHideBalance.text = "숨김"
        }
    }

    /**
     * 계좌번호 복사
     */
    private fun copyAccountNumber() {
        val clipboard = requireContext().getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
        val clip = android.content.ClipData.newPlainText("계좌번호", binding.tvAccountNumber.text.toString())
        clipboard.setPrimaryClip(clip)
        Toast.makeText(requireContext(), "계좌번호가 복사되었습니다", Toast.LENGTH_SHORT).show()
    }

    /**
     * 알림 배지 업데이트
     */
    private fun updateNotificationBadge(count: Int) {
        if (count > 0) {
            binding.tvNotificationBadge.visibility = android.view.View.VISIBLE
            
            if (count > 99) {
                binding.tvNotificationBadge.text = "99+"
            } else {
                binding.tvNotificationBadge.text = count.toString()
            }
        } else {
            binding.tvNotificationBadge.visibility = android.view.View.GONE
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: android.content.Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 1001 && resultCode == android.app.Activity.RESULT_OK) {
            viewModel.loadNotificationCount()
        }
    }
}
