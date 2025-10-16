package com.example.hanamoa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class FriendsAdapter(
    private val friends: List<Friend>,
    private val onFriendClick: (Friend) -> Unit
) : RecyclerView.Adapter<FriendsAdapter.FriendViewHolder>() {

    class FriendViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivProfileImage: ImageView = view.findViewById(R.id.iv_profile_image)
        val tvFriendName: TextView = view.findViewById(R.id.tv_friend_name)
        val tvFriendPhone: TextView = view.findViewById(R.id.tv_friend_phone)
        val ivSelected: View = view.findViewById(R.id.iv_selected)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FriendViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_friend, parent, false)
        return FriendViewHolder(view)
    }

    override fun onBindViewHolder(holder: FriendViewHolder, position: Int) {
        val friend = friends[position]
        holder.tvFriendName.text = friend.friendName
        holder.tvFriendPhone.text = friend.friendPhone
        
        setProfileImageInAdapter(holder.ivProfileImage, friend.profileImage)

        holder.itemView.setOnClickListener {
            onFriendClick(friend)
        }
    }
    
    private fun setProfileImageInAdapter(imageView: ImageView, profileImage: String?) {
        if (!profileImage.isNullOrEmpty()) {
            val resourceName = "ic_${profileImage}"
            val resourceId = imageView.context.resources.getIdentifier(
                resourceName, 
                "drawable", 
                imageView.context.packageName
            )
            
            if (resourceId != 0) {
                imageView.setImageResource(resourceId)
            } else {
                imageView.setImageResource(R.drawable.ic_person)
            }
        } else {
            imageView.setImageResource(R.drawable.ic_person)
        }
    }

    override fun getItemCount(): Int = friends.size
}
