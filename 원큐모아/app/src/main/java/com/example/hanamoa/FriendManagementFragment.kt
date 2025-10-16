package com.example.hanamoa

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class FriendManagementFragment : Fragment() {
    
    private lateinit var tvFriends: TextView
    private lateinit var tvRequests: TextView
    private lateinit var rvFriends: RecyclerView
    private lateinit var rvRequests: RecyclerView
    private lateinit var layoutEmptyFriends: View
    private lateinit var layoutFriends: View
    private lateinit var layoutRequests: View
    private lateinit var layoutEmptyRequests: View
    
    private var friendsAdapter: FriendsAdapter? = null
    private var requestsAdapter: FriendRequestsAdapter? = null
    
    private var currentTab = "friends" // "friends" or "requests"
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_friend_management, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        initViews(view)
        setupClickListeners(view)
        setupRecyclerViews()
        showFriendsTab()
    }
    
    private fun initViews(view: View) {
        tvFriends = view.findViewById(R.id.tv_friends)
        tvRequests = view.findViewById(R.id.tv_requests)
        rvFriends = view.findViewById(R.id.rv_friends)
        rvRequests = view.findViewById(R.id.rv_requests)
        layoutEmptyFriends = view.findViewById(R.id.layout_empty_friends)
        layoutFriends = view.findViewById(R.id.layout_friends)
        layoutRequests = view.findViewById(R.id.layout_requests)
        layoutEmptyRequests = view.findViewById(R.id.layout_empty_requests)
    }
    
    private fun setupClickListeners(view: View) {
        view.findViewById<View>(R.id.iv_back).setOnClickListener {
            parentFragmentManager.popBackStack()
        }
        
        tvFriends.setOnClickListener {
            showFriendsTab()
        }
        
        tvRequests.setOnClickListener {
            showRequestsTab()
        }
    }
    
    private fun setupRecyclerViews() {
        rvFriends.layoutManager = LinearLayoutManager(requireContext())
        
        rvRequests.layoutManager = LinearLayoutManager(requireContext())
    }
    
    private fun showFriendsTab() {
        currentTab = "friends"
        updateTabUI()
        loadFriends()
    }
    
    private fun showRequestsTab() {
        currentTab = "requests"
        updateTabUI()
        loadFriendRequests()
    }
    
    private fun updateTabUI() {
        if (currentTab == "friends") {
            tvFriends.setBackgroundResource(R.drawable.bg_tab_selected)
            tvFriends.setTextColor(resources.getColor(android.R.color.white, null))
            tvRequests.setBackgroundResource(R.drawable.bg_tab_unselected)
            tvRequests.setTextColor(resources.getColor(R.color.text_secondary, null))
            
            layoutFriends.visibility = View.VISIBLE
            layoutRequests.visibility = View.GONE
        } else {
            tvRequests.setBackgroundResource(R.drawable.bg_tab_selected)
            tvRequests.setTextColor(resources.getColor(android.R.color.white, null))
            tvFriends.setBackgroundResource(R.drawable.bg_tab_unselected)
            tvFriends.setTextColor(resources.getColor(R.color.text_secondary, null))
            
            layoutFriends.visibility = View.GONE
            layoutRequests.visibility = View.VISIBLE
        }
    }
    
    private fun loadFriends() {
        val userId = requireContext().getSharedPreferences("user_prefs", android.content.Context.MODE_PRIVATE)
            .getString("user_id", null)
            
        if (userId == null) {
            android.util.Log.e("FriendManagement", "userId is null")
            return
        }
        
        android.util.Log.d("FriendManagement", "Loading friends for userId: $userId")
            
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().getFriends(userId)
                }
                
                android.util.Log.d("FriendManagement", "API result: success=${result.success}, data size=${result.data?.size}")
                
                if (result.success && result.data != null) {
                    if (result.data.isEmpty()) {
                        android.util.Log.d("FriendManagement", "No friends found")
                        showEmptyFriendsState()
                    } else {
                        android.util.Log.d("FriendManagement", "Found ${result.data.size} friends")
                        showFriendsList(result.data)
                    }
                } else {
                    android.util.Log.e("FriendManagement", "API failed: ${result.message}")
                    showEmptyFriendsState()
                }
            } catch (e: Exception) {
                android.util.Log.e("FriendManagement", "Exception in loadFriends: ${e.message}", e)
            }
        }
    }
    
    private fun showFriendsList(friends: List<Friend>) {
        friendsAdapter = FriendsAdapter(friends) { friend ->
        }
        rvFriends.adapter = friendsAdapter
        rvFriends.visibility = View.VISIBLE
        layoutEmptyFriends.visibility = View.GONE
    }
    
    private fun showEmptyFriendsState() {
        rvFriends.visibility = View.GONE
        layoutEmptyFriends.visibility = View.VISIBLE
    }
    
    private fun loadFriendRequests() {
        val userId = requireContext().getSharedPreferences("user_prefs", android.content.Context.MODE_PRIVATE)
            .getString("user_id", null)
            
        if (userId == null) {
            android.util.Log.e("FriendManagement", "userId is null for friend requests")
            return
        }
        
        android.util.Log.d("FriendManagement", "Loading friend requests for userId: $userId")
            
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().getFriendRequests(userId)
                }
                
                android.util.Log.d("FriendManagement", "Friend requests API result: success=${result.success}, data size=${result.data?.size}")
                
                if (result.success && result.data != null) {
                    val pendingRequests = result.data.filter { it.status == "PENDING" }
                    
                    if (pendingRequests.isEmpty()) {
                        android.util.Log.d("FriendManagement", "No pending friend requests found")
                    } else {
                        android.util.Log.d("FriendManagement", "Found ${pendingRequests.size} pending friend requests (filtered from ${result.data.size} total)")
                        requestsAdapter = FriendRequestsAdapter(
                            pendingRequests,
                            userId,
                            onCancelRequest = { request -> cancelFriendRequest(request) },
                            onAcceptRequest = { request -> acceptFriendRequest(request) },
                            onDeclineRequest = { request -> declineFriendRequest(request) }
                        )
                        rvRequests.adapter = requestsAdapter
                    }
                } else {
                    android.util.Log.e("FriendManagement", "Friend requests API failed: ${result.message}")
                }
            } catch (e: Exception) {
                android.util.Log.e("FriendManagement", "Exception in loadFriendRequests: ${e.message}", e)
            }
        }
    }
    
    private fun cancelFriendRequest(request: FriendRequestItem) {
        val userId = requireContext().getSharedPreferences("user_prefs", android.content.Context.MODE_PRIVATE)
            .getString("user_id", null) ?: return
            
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().cancelFriendRequest(request.id, userId)
                }
                
                if (result.success) {
                    android.util.Log.d("FriendManagement", "Friend request cancelled successfully")
                    loadFriendRequests() // 목록 새로고침
                } else {
                    android.util.Log.e("FriendManagement", "Failed to cancel friend request: ${result.message}")
                }
            } catch (e: Exception) {
                android.util.Log.e("FriendManagement", "Exception in cancelFriendRequest: ${e.message}", e)
            }
        }
    }
    
    private fun acceptFriendRequest(request: FriendRequestItem) {
        val userId = requireContext().getSharedPreferences("user_prefs", android.content.Context.MODE_PRIVATE)
            .getString("user_id", null) ?: return
            
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().respondToFriendRequest(request.id, "accept", userId)
                }
                
                if (result.success) {
                    android.util.Log.d("FriendManagement", "Friend request accepted successfully")
                    loadFriendRequests() // 목록 새로고침
                    loadFriends() // 친구 목록도 새로고침
                } else {
                    android.util.Log.e("FriendManagement", "Failed to accept friend request: ${result.message}")
                }
            } catch (e: Exception) {
                android.util.Log.e("FriendManagement", "Exception in acceptFriendRequest: ${e.message}", e)
            }
        }
    }
    
    private fun declineFriendRequest(request: FriendRequestItem) {
        val userId = requireContext().getSharedPreferences("user_prefs", android.content.Context.MODE_PRIVATE)
            .getString("user_id", null) ?: return
            
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    ApiService.getInstance().respondToFriendRequest(request.id, "decline", userId)
                }
                
                if (result.success) {
                    android.util.Log.d("FriendManagement", "Friend request declined successfully")
                    loadFriendRequests() // 목록 새로고침
                } else {
                    android.util.Log.e("FriendManagement", "Failed to decline friend request: ${result.message}")
                }
            } catch (e: Exception) {
                android.util.Log.e("FriendManagement", "Exception in declineFriendRequest: ${e.message}", e)
            }
        }
    }
}
