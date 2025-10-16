package com.example.hanamoa

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions

class MenuFragment : Fragment() {

    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var ivProfile: ImageView
    private lateinit var tvUserName: TextView
    private lateinit var tvUserId: TextView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_menu, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        sharedPreferences = requireContext().getSharedPreferences("user_prefs", android.content.Context.MODE_PRIVATE)
        
        initViews(view)
        setupClickListeners(view)
        loadUserInfo()
    }
    
    private fun initViews(view: View) {
        ivProfile = view.findViewById(R.id.iv_profile)
        tvUserName = view.findViewById(R.id.tv_user_name)
        tvUserId = view.findViewById(R.id.tv_user_id)
    }
    
    private fun setupClickListeners(view: View) {
        
        view.findViewById<TextView>(R.id.tv_reservation_list).setOnClickListener {
            showReservationList()
        }
        
        view.findViewById<TextView>(R.id.tv_friend).setOnClickListener {
            showFriendManagement()
        }
        
        view.findViewById<TextView>(R.id.tv_logout).setOnClickListener {
            logout()
        }
    }
    
    private fun loadUserInfo() {
        val userId = sharedPreferences.getString("user_userId", null) ?: return
        val userName = sharedPreferences.getString("user_name", "사용자")
        val profileImage = sharedPreferences.getString("profile_image", "")
        
        tvUserName.text = userName
        tvUserId.text = userId
        
        setProfileImage(profileImage)
    }
    
    private fun setProfileImage(profileImage: String?) {
        if (!profileImage.isNullOrEmpty()) {
            val resourceName = "ic_${profileImage}"
            val resourceId = requireContext().resources.getIdentifier(
                resourceName, 
                "drawable", 
                requireContext().packageName
            )
            
            if (resourceId != 0) {
                Glide.with(this)
                    .load(resourceId)
                    .transition(DrawableTransitionOptions.withCrossFade(300))
                    .into(ivProfile)
            } else {
                Glide.with(this)
                    .load(R.drawable.ic_person)
                    .transition(DrawableTransitionOptions.withCrossFade(300))
                    .into(ivProfile)
            }
        } else {
            Glide.with(this)
                .load(R.drawable.ic_person)
                .transition(DrawableTransitionOptions.withCrossFade(300))
                .into(ivProfile)
        }
    }
    
    private fun showReservationList() {
        val reservationListFragment = ReservationListFragment()
        parentFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, reservationListFragment)
            .addToBackStack(null)
            .commit()
    }
    
    private fun showFriendManagement() {
        val friendManagementFragment = FriendManagementFragment()
        parentFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, friendManagementFragment)
            .addToBackStack(null)
            .commit()
    }
    
    private fun logout() {
        sharedPreferences.edit().clear().apply()
        
        Toast.makeText(requireContext(), "로그아웃되었습니다", Toast.LENGTH_SHORT).show()
        
        val intent = Intent(requireContext(), LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        
        requireActivity().finish()
    }
}

