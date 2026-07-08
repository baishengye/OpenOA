package com.itc.openim

import com.alibaba.fastjson.JSON
import com.alibaba.fastjson.JSONObject
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import open_im_sdk.Open_im_sdk
import com.itc.openim.listener.*
import com.itc.openim.utils.BaseImpl
import com.itc.openim.utils.Emitter
import com.itc.openim.utils.SendMsgCallBack
import java.util.Objects

class ItcOpenIMSDKModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val TAG = "[itc:im]"
        const val MODULE_NAME = "ItcOpenIM"
    }

    override fun getName(): String = MODULE_NAME

    private var listenerCount = 0
    private val emitter = Emitter()

    private fun map2string(map: ReadableMap): String = map.toString()

    @ReactMethod
    fun addListener(eventName: String) {
        listenerCount++
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        listenerCount -= count
    }

    // ========== Initialization & Login ==========

    @ReactMethod
    fun initSDK(options: ReadableMap, operationID: String, promise: Promise) {
        val config = Arguments.createMap()
        config.merge(options)
        config.putInt("platformID", 2)

        val initialized = Open_im_sdk.initSDK(
            InitSDKListener(reactContext),
            operationID,
            config.toString()
        )
        setUserListener()
        setConversationListener()
        setFriendListener()
        setGroupListener()
        setAdvancedMsgListener()
        setBatchMsgListener()

        if (initialized) {
            promise.resolve("init success")
        } else {
            promise.reject("-1", "please check params and dir")
        }
    }

    @ReactMethod
    fun login(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.login(
            BaseImpl(promise),
            operationID,
            options.getString("userID"),
            options.getString("token")
        )
    }

    @ReactMethod
    fun logout(operationID: String, promise: Promise) {
        Open_im_sdk.logout(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun getLoginStatus(operationID: String, promise: Promise) {
        val status = Open_im_sdk.getLoginStatus(operationID)
        promise.resolve(status.toInt())
    }

    @ReactMethod
    fun getLoginUserID(operationID: String, promise: Promise) {
        val userID = Open_im_sdk.getLoginUserID()
        promise.resolve(userID)
    }

    // ========== User ==========

    @ReactMethod
    fun setUserListener() {
        Open_im_sdk.setUserListener(UserListener(reactContext))
    }

    @ReactMethod
    fun getUsersInfo(userIDList: ReadableArray, operationID: String, promise: Promise) {
        Open_im_sdk.getUsersInfo(BaseImpl(promise), operationID, userIDList.toString())
    }

    @ReactMethod
    fun getSelfUserInfo(operationID: String, promise: Promise) {
        Open_im_sdk.getSelfUserInfo(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun setSelfInfo(userInfo: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.setSelfInfo(BaseImpl(promise), operationID, map2string(userInfo))
    }

    // ========== Conversation ==========

    @ReactMethod
    fun setConversationListener() {
        Open_im_sdk.setConversationListener(OnConversationListener(reactContext))
    }

    @ReactMethod
    fun getAllConversationList(operationID: String, promise: Promise) {
        Open_im_sdk.getAllConversationList(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun getConversationListSplit(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.getConversationListSplit(
            BaseImpl(promise),
            operationID,
            options.getInt("offset").toLong(),
            options.getInt("count").toLong()
        )
    }

    @ReactMethod
    fun getOneConversation(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.getOneConversation(
            BaseImpl(promise),
            operationID,
            options.getInt("sessionType"),
            options.getString("sourceID")
        )
    }

    @ReactMethod
    fun getMultipleConversation(conversationIDList: ReadableArray, operationID: String, promise: Promise) {
        Open_im_sdk.getMultipleConversation(BaseImpl(promise), operationID, conversationIDList.toString())
    }

    @ReactMethod
    fun hideConversation(conversationID: String, operationID: String, promise: Promise) {
        Open_im_sdk.hideConversation(BaseImpl(promise), operationID, conversationID)
    }

    @ReactMethod
    fun setConversation(options: ReadableMap, operationID: String, promise: Promise) {
        val conversationID = options.getString("conversationID")
        val conversation = map2string(options)
        Open_im_sdk.setConversation(BaseImpl(promise), operationID, conversationID, conversation)
    }

    @ReactMethod
    fun pinConversation(options: ReadableMap, operationID: String, promise: Promise) {
        val conversationID = options.getString("conversationID")
        val params = JSONObject()
        params["isPinned"] = options.getBoolean("isPinned")
        Open_im_sdk.setConversation(BaseImpl(promise), operationID, conversationID, params.toString())
    }

    @ReactMethod
    fun markConversationMessageAsRead(conversationID: String, operationID: String, promise: Promise) {
        Open_im_sdk.markConversationMessageAsRead(BaseImpl(promise), operationID, conversationID)
    }

    @ReactMethod
    fun getTotalUnreadMsgCount(operationID: String, promise: Promise) {
        Open_im_sdk.getTotalUnreadMsgCount(BaseImpl(promise, Number::class.java), operationID)
    }

    // ========== Message ==========

    @ReactMethod
    fun setAdvancedMsgListener() {
        Open_im_sdk.setAdvancedMsgListener(AdvancedMsgListener(reactContext))
    }

    @ReactMethod
    fun setBatchMsgListener() {
        Open_im_sdk.setBatchMsgListener(BatchMsgListener(reactContext))
    }

    @ReactMethod
    fun createTextMessage(textMsg: String, operationID: String, promise: Promise) {
        val message = Open_im_sdk.createTextMessage(operationID, textMsg)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createTextAtMessage(options: ReadableMap, operationID: String, promise: Promise) {
        val text = options.getString("text")
        val atUserIDList = Objects.requireNonNull(options.getArray("atUserIDList")).toString()
        val message = Open_im_sdk.createTextAtMessage(operationID, text, atUserIDList, null, null)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createImageMessage(imagePath: String, operationID: String, promise: Promise) {
        val message = Open_im_sdk.createImageMessage(operationID, imagePath)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createSoundMessage(options: ReadableMap, operationID: String, promise: Promise) {
        val soundPath = options.getString("soundPath") ?: ""
        val duration = options.getInt("duration").toLong()
        val message = Open_im_sdk.createSoundMessage(operationID, soundPath, duration)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createVideoMessage(options: ReadableMap, operationID: String, promise: Promise) {
        val videoPath = options.getString("videoPath") ?: ""
        val videoType = options.getString("videoType") ?: ""
        val duration = options.getInt("duration").toLong()
        val snapshotPath = options.getString("snapshotPath") ?: ""
        val message = Open_im_sdk.createVideoMessage(operationID, videoPath, videoType, duration, snapshotPath)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createFileMessage(options: ReadableMap, operationID: String, promise: Promise) {
        val filePath = options.getString("filePath")
        val fileName = options.getString("fileName")
        val message = Open_im_sdk.createFileMessage(operationID, filePath, fileName)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createLocationMessage(options: ReadableMap, operationID: String, promise: Promise) {
        val description = options.getString("description")
        val longitude = options.getDouble("longitude")
        val latitude = options.getDouble("latitude")
        val message = Open_im_sdk.createLocationMessage(operationID, description, longitude, latitude)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createCustomMessage(options: ReadableMap, operationID: String, promise: Promise) {
        val data = options.getString("data")
        val extension = options.getString("extension")
        val description = options.getString("description")
        val message = Open_im_sdk.createCustomMessage(operationID, data, extension, description)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun sendMessage(options: ReadableMap, operationID: String, promise: Promise) {
        val message: ReadableMap = options.getMap("message")!!
        val messageStr = map2string(message)
        val conversationID = options.getString("conversationID") ?: ""
        val offlinePushInfo = if (options.hasKey("offlinePushInfo")) options.getString("offlinePushInfo") ?: "" else ""
        val chatExp = if (options.hasKey("expireTime")) options.getInt("expireTime") else 0
        Open_im_sdk.sendMessage(
            SendMsgCallBack(reactContext, promise, message),
            operationID,
            messageStr,
            conversationID,
            offlinePushInfo,
            chatExp.toString(),
            false
        )
    }

    @ReactMethod
    fun getHistoryMessageList(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.getAdvancedHistoryMessageList(BaseImpl(promise), operationID, map2string(options))
    }

    @ReactMethod
    fun revokeMessage(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.revokeMessage(
            BaseImpl(promise),
            operationID,
            options.getString("conversationID"),
            options.getString("clientMsgID")
        )
    }

    @ReactMethod
    fun deleteMessage(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.deleteMessage(
            BaseImpl(promise),
            operationID,
            options.getString("conversationID"),
            options.getString("clientMsgID")
        )
    }

    @ReactMethod
    fun deleteAllMsgFromLocalAndSvr(operationID: String, promise: Promise) {
        Open_im_sdk.deleteAllMsgFromLocalAndSvr(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun searchLocalMessages(searchParam: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.searchLocalMessages(BaseImpl(promise), operationID, map2string(searchParam))
    }

    // ========== Friend ==========

    @ReactMethod
    fun setFriendListener() {
        Open_im_sdk.setFriendListener(OnFriendshipListener(reactContext))
    }

    @ReactMethod
    fun getFriendList(operationID: String, promise: Promise) {
        Open_im_sdk.getFriendList(BaseImpl(promise), operationID, false)
    }

    @ReactMethod
    fun getFriendListPage(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.getFriendListPage(
            BaseImpl(promise),
            operationID,
            options.getInt("offset"),
            options.getInt("count"),
            false
        )
    }

    @ReactMethod
    fun getSpecifiedFriendsInfo(userIDList: ReadableArray, operationID: String, promise: Promise) {
        Open_im_sdk.getSpecifiedFriendsInfo(BaseImpl(promise), operationID, userIDList.toString(), false)
    }

    @ReactMethod
    fun searchFriends(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.searchFriends(BaseImpl(promise), operationID, map2string(options))
    }

    @ReactMethod
    fun addFriend(params: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.addFriend(BaseImpl(promise), operationID, map2string(params) ?: "[]")
    }

    @ReactMethod
    fun deleteFriend(friendUserID: String, operationID: String, promise: Promise) {
        Open_im_sdk.deleteFriend(BaseImpl(promise), operationID, friendUserID)
    }

    @ReactMethod
    fun setFriendRemark(options: ReadableMap, operationID: String, promise: Promise) {
        val toUserIDList = java.util.ArrayList<String>()
        toUserIDList.add(options.getString("toUserID") ?: "")
        val params = JSONObject()
        params["friendUserIDs"] = toUserIDList
        params["remark"] = options.getString("remark") ?: ""
        Open_im_sdk.updateFriends(BaseImpl(promise), operationID, params.toString())
    }

    @ReactMethod
    fun getFriendApplicationListAsApplicant(operationID: String, promise: Promise) {
        Open_im_sdk.getFriendApplicationListAsApplicant(BaseImpl(promise), operationID, "{}")
    }

    @ReactMethod
    fun getFriendApplicationListAsRecipient(operationID: String, promise: Promise) {
        Open_im_sdk.getFriendApplicationListAsRecipient(BaseImpl(promise), operationID, "{}")
    }

    @ReactMethod
    fun acceptFriendApplication(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.acceptFriendApplication(BaseImpl(promise), operationID, map2string(options))
    }

    @ReactMethod
    fun refuseFriendApplication(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.refuseFriendApplication(BaseImpl(promise), operationID, map2string(options))
    }

    @ReactMethod
    fun addBlack(options: ReadableMap, operationID: String, promise: Promise) {
        val ex = if (options.hasKey("ex")) options.getString("ex") else ""
        Open_im_sdk.addBlack(BaseImpl(promise), operationID, options.getString("toUserID"), ex)
    }

    @ReactMethod
    fun getBlackList(operationID: String, promise: Promise) {
        Open_im_sdk.getBlackList(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun removeBlack(removeUserID: String, operationID: String, promise: Promise) {
        Open_im_sdk.removeBlack(BaseImpl(promise), operationID, removeUserID)
    }

    // ========== Group ==========

    @ReactMethod
    fun setGroupListener() {
        Open_im_sdk.setGroupListener(OnGroupListener(reactContext))
    }

    @ReactMethod
    fun createGroup(gInfo: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.createGroup(BaseImpl(promise), operationID, map2string(gInfo))
    }

    @ReactMethod
    fun joinGroup(options: ReadableMap, operationID: String, promise: Promise) {
        val reqMsg = if (options.hasKey("reqMsg")) options.getString("reqMsg") else ""
        val joinSource = if (options.hasKey("joinSource")) options.getInt("joinSource") else 0
        val ex = if (options.hasKey("ex")) options.getString("ex") else ""
        Open_im_sdk.joinGroup(
            BaseImpl(promise),
            operationID,
            options.getString("groupID"),
            reqMsg,
            joinSource,
            ex
        )
    }

    @ReactMethod
    fun quitGroup(groupID: String, operationID: String, promise: Promise) {
        Open_im_sdk.quitGroup(BaseImpl(promise), operationID, groupID)
    }

    @ReactMethod
    fun dismissGroup(groupID: String, operationID: String, promise: Promise) {
        Open_im_sdk.dismissGroup(BaseImpl(promise), operationID, groupID)
    }

    @ReactMethod
    fun getJoinedGroupList(operationID: String, promise: Promise) {
        Open_im_sdk.getJoinedGroupList(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun getSpecifiedGroupsInfo(groupIDList: ReadableArray, operationID: String, promise: Promise) {
        Open_im_sdk.getSpecifiedGroupsInfo(BaseImpl(promise), operationID, groupIDList.toString())
    }

    @ReactMethod
    fun getGroupMemberList(options: ReadableMap, operationID: String, promise: Promise) {
        val filter = if (options.hasKey("filter")) options.getInt("filter") else 0
        val offset = if (options.hasKey("offset")) options.getInt("offset") else 0
        val count = if (options.hasKey("count")) options.getInt("count") else 20
        Open_im_sdk.getGroupMemberList(
            BaseImpl(promise),
            operationID,
            options.getString("groupID"),
            filter,
            offset,
            count
        )
    }

    @ReactMethod
    fun getGroupMemberOwnerAndAdmin(groupID: String, operationID: String, promise: Promise) {
        Open_im_sdk.getGroupMemberOwnerAndAdmin(BaseImpl(promise), operationID, groupID)
    }

    @ReactMethod
    fun getSpecifiedGroupMembersInfo(userIDList: ReadableArray, groupID: String, operationID: String, promise: Promise) {
        Open_im_sdk.getSpecifiedGroupMembersInfo(BaseImpl(promise), operationID, groupID, userIDList.toString())
    }

    @ReactMethod
    fun searchGroups(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.searchGroups(BaseImpl(promise), operationID, map2string(options))
    }

    @ReactMethod
    fun setGroupInfo(jsonGroupInfo: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.setGroupInfo(BaseImpl(promise), operationID, map2string(jsonGroupInfo))
    }

    @ReactMethod
    fun changeGroupMute(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.changeGroupMute(
            BaseImpl(promise),
            operationID,
            options.getString("groupID"),
            options.getBoolean("isMute")
        )
    }

    @ReactMethod
    fun changeGroupMemberMute(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.changeGroupMemberMute(
            BaseImpl(promise),
            operationID,
            options.getString("groupID"),
            options.getString("userID"),
            options.getDouble("mutedSeconds").toLong()
        )
    }

    @ReactMethod
    fun setGroupMemberInfo(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.setGroupMemberInfo(BaseImpl(promise), operationID, map2string(options))
    }

    @ReactMethod
    fun inviteUserToGroup(options: ReadableMap, operationID: String, promise: Promise) {
        val groupID = options.getString("groupID")
        val userIDList = options.getArray("userIDList")?.toString() ?: "[]"
        val reason = if (options.hasKey("reason")) options.getString("reason") ?: "" else ""
        Open_im_sdk.inviteUserToGroup(BaseImpl(promise), operationID, groupID, userIDList, reason)
    }

    @ReactMethod
    fun kickGroupMember(options: ReadableMap, operationID: String, promise: Promise) {
        val groupID = options.getString("groupID")
        val userIDList = options.getArray("userIDList")?.toString() ?: "[]"
        val reason = if (options.hasKey("reason")) options.getString("reason") ?: "" else ""
        Open_im_sdk.kickGroupMember(BaseImpl(promise), operationID, groupID, userIDList, reason)
    }

    @ReactMethod
    fun transferGroupOwner(options: ReadableMap, operationID: String, promise: Promise) {
        Open_im_sdk.transferGroupOwner(
            BaseImpl(promise),
            operationID,
            options.getString("groupID"),
            options.getString("newOwnerUserID")
        )
    }

    @ReactMethod
    fun getGroupApplicationListAsApplicant(operationID: String, promise: Promise) {
        Open_im_sdk.getGroupApplicationListAsApplicant(BaseImpl(promise), operationID, "{}")
    }

    @ReactMethod
    fun getGroupApplicationListAsRecipient(operationID: String, promise: Promise) {
        Open_im_sdk.getGroupApplicationListAsRecipient(BaseImpl(promise), operationID, "{}")
    }

    @ReactMethod
    fun acceptGroupApplication(options: ReadableMap, operationID: String, promise: Promise) {
        val groupID = options.getString("groupID") ?: ""
        val userID = options.getString("userID") ?: ""
        val handleMsg = if (options.hasKey("handleMsg")) options.getString("handleMsg") ?: "" else ""
        Open_im_sdk.acceptGroupApplication(BaseImpl(promise), operationID, groupID, userID, handleMsg)
    }

    @ReactMethod
    fun refuseGroupApplication(options: ReadableMap, operationID: String, promise: Promise) {
        val groupID = options.getString("groupID") ?: ""
        val userID = options.getString("userID") ?: ""
        val handleMsg = if (options.hasKey("handleMsg")) options.getString("handleMsg") ?: "" else ""
        Open_im_sdk.refuseGroupApplication(BaseImpl(promise), operationID, groupID, userID, handleMsg)
    }
}
