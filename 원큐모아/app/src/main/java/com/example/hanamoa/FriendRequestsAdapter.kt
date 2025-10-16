package com.example.hanamoa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class FriendRequestsAdapter(
    private val requests: List<FriendRequestItem>,
    private val currentUserId: String,
    private val onCancelRequest: (FriendRequestItem) -> Unit,
    private val onAcceptRequest: (FriendRequestItem) -> Unit,
    private val onDeclineRequest: (FriendRequestItem) -> Unit
) : RecyclerView.Adapter<FriendRequestsAdapter.RequestViewHolder>() {

    class RequestViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivProfileImage: ImageView = view.findViewById(R.id.iv_profile_image)
        val tvFriendName: TextView = view.findViewById(R.id.tv_friend_name)
        val tvFriendPhone: TextView = view.findViewById(R.id.tv_friend_phone)
        val tvMessage: TextView = view.findViewById(R.id.tv_message)
        val tvStatus: TextView = view.findViewById(R.id.tv_status)
        val btnCancel: TextView = view.findViewById(R.id.btn_cancel)
        val btnAccept: TextView = view.findViewById(R.id.btn_accept)
        val btnDecline: TextView = view.findViewById(R.id.btn_decline)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RequestViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_friend_request, parent, false)
        return RequestViewHolder(view)
    }

    override fun onBindViewHolder(holder: RequestViewHolder, position: Int) {
        val request = requests[position]
        val isSentByMe = request.senderId == currentUserId
        
        if (isSentByMe) {
            holder.tvFriendName.text = request.receiver.name
            holder.tvFriendPhone.text = request.receiver.phone
            setProfileImageInAdapter(holder.ivProfileImage, request.receiver.profileImage)
            holder.tvStatus.text = "보낸 신청"
            holder.tvStatus.setTextColor(holder.itemView.context.getColor(android.R.color.white))
            
            holder.btnCancel.visibility = View.VISIBLE
            holder.btnAccept.visibility = View.GONE
            holder.btnDecline.visibility = View.GONE
            
            holder.btnCancel.setOnClickListener {
                onCancelRequest(request)
            }
        } else {
            holder.tvFriendName.text = request.sender.name
            holder.tvFriendPhone.text = request.sender.phone
            setProfileImageInAdapter(holder.ivProfileImage, request.sender.profileImage)
            holder.tvStatus.text = "받은 신청"
            holder.tvStatus.setTextColor(holder.itemView.context.getColor(android.R.color.holo_blue_dark))
            
            holder.btnCancel.visibility = View.GONE
            holder.btnAccept.visibility = View.VISIBLE
            holder.btnDecline.visibility = View.VISIBLE
            
            holder.btnAccept.setOnClickListener {
                onAcceptRequest(request)
            }
            
            holder.btnDecline.setOnClickListener {
                onDeclineRequest(request)
            }
        }
        
        holder.tvMessage.text = request.message
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

    override fun getItemCount(): Int = requests.size
}
