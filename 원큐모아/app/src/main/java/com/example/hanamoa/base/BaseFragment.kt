package com.example.hanamoa.base

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.databinding.ViewDataBinding
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider

abstract class BaseFragment<VB : ViewDataBinding, VM : BaseViewModel> : Fragment() {
    
    protected lateinit var binding: VB
    protected lateinit var viewModel: VM

    abstract fun getLayoutId(): Int

    abstract fun getViewModelClass(): Class<VM>

    abstract fun initViewModel()

    abstract fun initView()

    abstract fun setupDataBinding()

    abstract fun setupObservers()
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = DataBindingUtil.inflate(inflater, getLayoutId(), container, false)
        binding.lifecycleOwner = viewLifecycleOwner
        
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        initViewModel()

        initView()

        setupDataBinding()

        setupObservers()
    }

    protected fun createViewModel(): VM {
        return ViewModelProvider(this)[getViewModelClass()]
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        if (::binding.isInitialized) {
            binding.unbind()
        }
    }
}
