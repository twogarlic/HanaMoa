package com.example.hanamoa.base

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.databinding.ViewDataBinding
import androidx.lifecycle.ViewModelProvider

abstract class BaseActivity<VB : ViewDataBinding, VM : BaseViewModel> : AppCompatActivity() {
    
    protected lateinit var binding: VB
    protected lateinit var viewModel: VM
    abstract fun getLayoutId(): Int

    abstract fun getViewModelClass(): Class<VM>

    abstract fun initViewModel()

    abstract fun initView()

    abstract fun setupDataBinding()

    abstract fun setupObservers()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = DataBindingUtil.setContentView(this, getLayoutId())
        binding.lifecycleOwner = this

        initViewModel()

        initView()

        setupDataBinding()

        setupObservers()
    }

    protected fun createViewModel(): VM {
        return ViewModelProvider(this)[getViewModelClass()]
    }
    
    override fun onDestroy() {
        super.onDestroy()
        if (::binding.isInitialized) {
            binding.unbind()
        }
    }
}
