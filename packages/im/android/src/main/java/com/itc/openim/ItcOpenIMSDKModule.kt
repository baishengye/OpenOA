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
import java.io.File
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
    fun initSDK(config: String, operationID: String, promise: Promise) {
        val jsonConfig = JSON.parseObject(config)
        jsonConfig["platformID"] = 2

        // 处理 dataDir 路径（如果是相对路径，转换为沙盒绝对路径）
        var dataDir = jsonConfig.getString("dataDir")
        if(dataDir.isEmpty()){
            dataDir = "default_openim_data"
        }
        if (dataDir != null && !dataDir.startsWith("/")) {
            // 相对路径，转换为应用私有目录下的绝对路径
            val filesDir = reactContext.filesDir.absolutePath
            dataDir = "$filesDir/$dataDir"
            jsonConfig["dataDir"] = dataDir
        }

        // 确保 dataDir 目录存在
        if (dataDir != null) {
            val dir = File(dataDir)
            if (!dir.exists()) {
                val created = dir.mkdirs()
                android.util.Log.i(TAG, "创建数据目录: $dataDir, 结果: $created")
            } else {
                android.util.Log.i(TAG, "数据目录已存在: $dataDir")
            }
        }

        // 打印实际传给 SDK 的配置
        android.util.Log.i(TAG, "initSDK config: ${jsonConfig.toString()}")

        val initialized = Open_im_sdk.initSDK(
            InitSDKListener(reactContext),
            operationID,
            jsonConfig.toString()
        )
        setUserListener()
        setConversationListener()
        setFriendListener()
        setGroupListener()
        setAdvancedMsgListener()
        setBatchMsgListener()
        setSignalingListener()

        if (initialized) {
            promise.resolve("init success")
        } else {
            promise.reject("-1", "please check params and dir")
        }
    }

    @ReactMethod
    fun login(optionsJson: String, operationID: String, promise: Promise) {
        android.util.Log.i(TAG, "login called: optionsJson=$optionsJson, operationID=$operationID")
        val options = JSON.parseObject(optionsJson)
        val userID = options.getString("userID")
        val token = options.getString("token")
        android.util.Log.i(TAG, "login: userID=$userID, token length=${token?.length ?: 0}")
        Open_im_sdk.login(
            BaseImpl(promise),
            operationID,
            userID,
            token
        )
        android.util.Log.i(TAG, "login: Open_im_sdk.login() returned")
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

    @ReactMethod
    fun uploadFile(reqData: String, operationID: String, promise: Promise) {
        Open_im_sdk.uploadFile(BaseImpl(promise), operationID, reqData, UploadFileCallbackListener(reactContext, operationID))
    }

    // ========== User ==========

    @ReactMethod
    fun setUserListener() {
        Open_im_sdk.setUserListener(UserListener(reactContext))
    }

    @ReactMethod
    fun getUsersInfo(userIDList: String, operationID: String, promise: Promise) {
        Open_im_sdk.getUsersInfo(BaseImpl(promise), operationID, userIDList)
    }

    @ReactMethod
    fun getSelfUserInfo(operationID: String, promise: Promise) {
        Open_im_sdk.getSelfUserInfo(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun setSelfInfo(userInfo: String, operationID: String, promise: Promise) {
        Open_im_sdk.setSelfInfo(BaseImpl(promise), operationID, userInfo)
    }

    @ReactMethod
    fun getUserStatus(userIDList: String, operationID: String, promise: Promise) {
        Open_im_sdk.getUserStatus(BaseImpl(promise), operationID, userIDList)
    }

    @ReactMethod
    fun subscribeUsersStatus(userIDList: String, operationID: String, promise: Promise) {
        Open_im_sdk.subscribeUsersStatus(BaseImpl(promise), operationID, userIDList)
    }

    @ReactMethod
    fun unsubscribeUsersStatus(userIDList: String, operationID: String, promise: Promise) {
        Open_im_sdk.unsubscribeUsersStatus(BaseImpl(promise), operationID, userIDList)
    }

    @ReactMethod
    fun getSubscribeUsersStatus(operationID: String, promise: Promise) {
        Open_im_sdk.getSubscribeUsersStatus(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun setAppBackgroundStatus(isBackground: Boolean, operationID: String, promise: Promise) {
        Open_im_sdk.setAppBackgroundStatus(BaseImpl(promise), operationID, isBackground)
    }

    @ReactMethod
    fun networkStatusChanged(operationID: String, promise: Promise) {
        Open_im_sdk.networkStatusChanged(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun setGlobalRecvMessageOpt(recvOpt: Double, operationID: String, promise: Promise) {
        val params = JSONObject()
        params["globalRecvMsgOpt"] = recvOpt.toInt()
        Open_im_sdk.setSelfInfo(BaseImpl(promise), operationID, params.toString())
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
    fun getConversationListSplit(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.getConversationListSplit(
            BaseImpl(promise),
            operationID,
            jsonParams.getLongValue("offset"),
            jsonParams.getLongValue("count")
        )
    }

    @ReactMethod
    fun getOneConversation(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.getOneConversation(
            BaseImpl(promise),
            operationID,
            jsonParams.getIntValue("sessionType"),
            jsonParams.getString("sourceID")
        )
    }

    @ReactMethod
    fun getMultipleConversation(conversationIDList: String, operationID: String, promise: Promise) {
        Open_im_sdk.getMultipleConversation(BaseImpl(promise), operationID, conversationIDList)
    }

    @ReactMethod
    fun getConversationIDBySessionType(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val result = Open_im_sdk.getConversationIDBySessionType(
            operationID,
            jsonParams.getString("sourceID"),
            jsonParams.getLongValue("sessionType")
        )
        promise.resolve(result)
    }

    @ReactMethod
    fun getTotalUnreadMsgCount(operationID: String, promise: Promise) {
        Open_im_sdk.getTotalUnreadMsgCount(BaseImpl(promise, Number::class.java), operationID)
    }

    @ReactMethod
    fun markConversationMessageAsRead(conversationID: String, operationID: String, promise: Promise) {
        Open_im_sdk.markConversationMessageAsRead(BaseImpl(promise), operationID, conversationID)
    }

    @ReactMethod
    fun setConversation(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val conversationID = jsonParams.getString("conversationID")
        Open_im_sdk.setConversation(BaseImpl(promise), operationID, conversationID, params)
    }

    @ReactMethod
    fun setConversationDraft(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val conversationID = jsonParams.getString("conversationID")
        val draftText = if (jsonParams.containsKey("draftText")) jsonParams.getString("draftText") else ""
        Open_im_sdk.setConversationDraft(BaseImpl(promise), operationID, conversationID, draftText)
    }

    @ReactMethod
    fun pinConversation(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val conversationID = jsonParams.getString("conversationID")
        val updateParams = JSONObject()
        updateParams["isPinned"] = jsonParams.getBoolean("isPinned")
        Open_im_sdk.setConversation(BaseImpl(promise), operationID, conversationID, updateParams.toString())
    }

    @ReactMethod
    fun setConversationRecvMessageOpt(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val conversationID = jsonParams.getString("conversationID")
        val updateParams = JSONObject()
        updateParams["recvMsgOpt"] = jsonParams.getIntValue("opt")
        Open_im_sdk.setConversation(BaseImpl(promise), operationID, conversationID, updateParams.toString())
    }

    @ReactMethod
    fun setConversationPrivateChat(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val conversationID = jsonParams.getString("conversationID")
        val updateParams = JSONObject()
        updateParams["isPrivateChat"] = jsonParams.getBoolean("isPrivate")
        Open_im_sdk.setConversation(BaseImpl(promise), operationID, conversationID, updateParams.toString())
    }

    @ReactMethod
    fun setConversationBurnDuration(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val conversationID = jsonParams.getString("conversationID")
        val updateParams = JSONObject()
        updateParams["burnDuration"] = jsonParams.getIntValue("burnDuration")
        Open_im_sdk.setConversation(BaseImpl(promise), operationID, conversationID, updateParams.toString())
    }

    @ReactMethod
    fun resetConversationGroupAtType(conversationID: String, operationID: String, promise: Promise) {
        val params = JSONObject()
        params["groupAtType"] = 0
        Open_im_sdk.setConversation(BaseImpl(promise), operationID, conversationID, params.toString())
    }

    @ReactMethod
    fun hideConversation(conversationID: String, operationID: String, promise: Promise) {
        Open_im_sdk.hideConversation(BaseImpl(promise), operationID, conversationID)
    }

    @ReactMethod
    fun hideAllConversations(operationID: String, promise: Promise) {
        Open_im_sdk.hideAllConversations(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun clearConversationAndDeleteAllMsg(conversationID: String, operationID: String, promise: Promise) {
        Open_im_sdk.clearConversationAndDeleteAllMsg(BaseImpl(promise), operationID, conversationID)
    }

    @ReactMethod
    fun deleteConversationAndDeleteAllMsg(conversationID: String, operationID: String, promise: Promise) {
        Open_im_sdk.deleteConversationAndDeleteAllMsg(BaseImpl(promise), operationID, conversationID)
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
    fun setSignalingListener() {
        Open_im_sdk.setSignalingListener(OnSignalingListener(reactContext))
    }

    @ReactMethod
    fun createTextMessage(text: String, operationID: String, promise: Promise) {
        val message = Open_im_sdk.createTextMessage(operationID, text)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createTextAtMessage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val text = jsonParams.getString("text")
        val atUserIDList = jsonParams.getJSONArray("atUserIDList")?.toString() ?: "[]"
        val atUsersInfo = if (jsonParams.containsKey("atUsersInfo")) jsonParams.getJSONArray("atUsersInfo")?.toString() else null
        val quoteMessage = if (jsonParams.containsKey("message")) jsonParams.getJSONObject("message").toString() else null

        val message = Open_im_sdk.createTextAtMessage(operationID, text, atUserIDList, atUsersInfo, quoteMessage)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createQuoteMessage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val text = jsonParams.getString("text")
        val quoteMessage = jsonParams.getJSONObject("message").toString()

        val message = Open_im_sdk.createQuoteMessage(operationID, text, quoteMessage)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createCardMessage(params: String, operationID: String, promise: Promise) {
        val message = Open_im_sdk.createCardMessage(operationID, params)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createImageMessageFromFullPath(imagePath: String, operationID: String, promise: Promise) {
        val message = Open_im_sdk.createImageMessageFromFullPath(operationID, imagePath)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createImageMessageByURL(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val sourcePicture = jsonParams.getJSONObject("sourcePicture").toString()
        val bigPicture = jsonParams.getJSONObject("bigPicture").toString()
        val snapshotPicture = jsonParams.getJSONObject("snapshotPicture").toString()
        val sourcePath = jsonParams.getString("sourcePath")

        val message = Open_im_sdk.createImageMessageByURL(operationID, sourcePath, sourcePicture, bigPicture, snapshotPicture)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createSoundMessageFromFullPath(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val soundPath = jsonParams.getString("soundPath") ?: ""
        val duration = jsonParams.getLongValue("duration")
        val message = Open_im_sdk.createSoundMessageFromFullPath(operationID, soundPath, duration)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createSoundMessageByURL(params: String, operationID: String, promise: Promise) {
        val message = Open_im_sdk.createSoundMessageByURL(operationID, params)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createVideoMessageFromFullPath(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val videoPath = jsonParams.getString("videoPath") ?: ""
        val videoType = jsonParams.getString("videoType") ?: ""
        val duration = jsonParams.getLongValue("duration")
        val snapshotPath = jsonParams.getString("snapshotPath") ?: ""
        val message = Open_im_sdk.createVideoMessageFromFullPath(operationID, videoPath, videoType, duration, snapshotPath)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createVideoMessageByURL(params: String, operationID: String, promise: Promise) {
        val message = Open_im_sdk.createVideoMessageByURL(operationID, params)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createFileMessageFromFullPath(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val filePath = jsonParams.getString("filePath")
        val fileName = jsonParams.getString("fileName")
        val message = Open_im_sdk.createFileMessageFromFullPath(operationID, filePath, fileName)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createFileMessageByURL(params: String, operationID: String, promise: Promise) {
        val message = Open_im_sdk.createFileMessageByURL(operationID, params)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createMergerMessage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val messageList = jsonParams.getJSONArray("messageList").toString()
        val title = jsonParams.getString("title")
        val summaryList = jsonParams.getJSONArray("summaryList").toString()
        val message = Open_im_sdk.createMergerMessage(operationID, messageList, title, summaryList)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createForwardMessage(params: String, operationID: String, promise: Promise) {
        val message = Open_im_sdk.createForwardMessage(operationID, params)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createLocationMessage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val description = jsonParams.getString("description")
        val longitude = jsonParams.getDouble("longitude")
        val latitude = jsonParams.getDouble("latitude")
        val message = Open_im_sdk.createLocationMessage(operationID, description, longitude, latitude)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createCustomMessage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val data = jsonParams.getString("data")
        val extension = jsonParams.getString("extension")
        val description = jsonParams.getString("description")
        val message = Open_im_sdk.createCustomMessage(operationID, data, extension, description)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun createFaceMessage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val index = jsonParams.getLongValue("index")
        val data = jsonParams.getString("data")
        val message = Open_im_sdk.createFaceMessage(operationID, index, data)
        try {
            val obj = JSON.parseObject(message)
            promise.resolve(emitter.convertJsonToMap(obj))
        } catch (e: Exception) {
            promise.resolve(message)
        }
    }

    @ReactMethod
    fun sendMessage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val message = jsonParams.getJSONObject("message").toString()
        val conversationID = jsonParams.getString("conversationID") ?: ""
        val offlinePushInfo = if (jsonParams.containsKey("offlinePushInfo")) jsonParams.getString("offlinePushInfo") ?: "" else ""
        val chatExp = if (jsonParams.containsKey("expireTime")) jsonParams.getIntValue("expireTime") else 0
        Open_im_sdk.sendMessage(
            SendMsgCallBack(reactContext, promise, jsonParams.getJSONObject("message")),
            operationID,
            message,
            conversationID,
            offlinePushInfo,
            chatExp.toString(),
            false
        )
    }

    @ReactMethod
    fun sendMessageNotOss(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val message = jsonParams.getJSONObject("message").toString()
        val receiver = jsonParams.getString("recvID") ?: ""
        val groupID = jsonParams.getString("groupID") ?: ""
        val offlinePushInfo = if (jsonParams.containsKey("offlinePushInfo")) jsonParams.getString("offlinePushInfo") ?: "" else ""
        val isOnlineOnly = if (jsonParams.containsKey("isOnlineOnly")) jsonParams.getBoolean("isOnlineOnly") else false
        Open_im_sdk.sendMessageNotOss(
            SendMsgCallBack(reactContext, promise, jsonParams.getJSONObject("message")),
            operationID,
            message,
            receiver,
            groupID,
            offlinePushInfo,
            isOnlineOnly
        )
    }

    @ReactMethod
    fun typingStatusUpdate(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.typingStatusUpdate(
            BaseImpl(promise),
            operationID,
            jsonParams.getString("recvID"),
            jsonParams.getString("msgTip")
        )
    }

    @ReactMethod
    fun changeInputStates(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val conversationID = jsonParams.getString("conversationID")
        val focus = jsonParams.getBoolean("focus")
        Open_im_sdk.changeInputStates(BaseImpl(promise), operationID, conversationID, focus)
    }

    @ReactMethod
    fun getInputStates(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val conversationID = jsonParams.getString("conversationID")
        val userID = jsonParams.getString("userID")
        Open_im_sdk.getInputStates(BaseImpl(promise), operationID, conversationID, userID)
    }

    @ReactMethod
    fun revokeMessage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.revokeMessage(
            BaseImpl(promise),
            operationID,
            jsonParams.getString("conversationID"),
            jsonParams.getString("clientMsgID")
        )
    }

    @ReactMethod
    fun deleteMessage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.deleteMessage(
            BaseImpl(promise),
            operationID,
            jsonParams.getString("conversationID"),
            jsonParams.getString("clientMsgID")
        )
    }

    @ReactMethod
    fun deleteMessageFromLocalStorage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val conversationID = jsonParams.getString("conversationID")
        val clientMsgID = jsonParams.getString("clientMsgID")
        Open_im_sdk.deleteMessageFromLocalStorage(BaseImpl(promise), operationID, conversationID, clientMsgID)
    }

    @ReactMethod
    fun deleteAllMsgFromLocal(operationID: String, promise: Promise) {
        Open_im_sdk.deleteAllMsgFromLocal(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun deleteAllMsgFromLocalAndSvr(operationID: String, promise: Promise) {
        Open_im_sdk.deleteAllMsgFromLocalAndSvr(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun searchLocalMessages(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.searchLocalMessages(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun getAdvancedHistoryMessageList(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getAdvancedHistoryMessageList(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun getAdvancedHistoryMessageListReverse(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getAdvancedHistoryMessageListReverse(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun findMessageList(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.findMessageList(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun insertSingleMessageToLocalStorage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.insertSingleMessageToLocalStorage(
            BaseImpl(promise),
            operationID,
            jsonParams.getJSONObject("message").toString(),
            jsonParams.getString("recvID"),
            jsonParams.getString("sendID")
        )
    }

    @ReactMethod
    fun insertGroupMessageToLocalStorage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.insertGroupMessageToLocalStorage(
            BaseImpl(promise),
            operationID,
            jsonParams.getJSONObject("message").toString(),
            jsonParams.getString("groupID"),
            jsonParams.getString("sendID")
        )
    }

    @ReactMethod
    fun setMessageLocalEx(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.setMessageLocalEx(
            BaseImpl(promise),
            operationID,
            jsonParams.getString("conversationID"),
            jsonParams.getString("clientMsgID"),
            jsonParams.getString("localEx")
        )
    }

    // ========== Friend ==========

    @ReactMethod
    fun setFriendListener() {
        Open_im_sdk.setFriendListener(OnFriendshipListener(reactContext))
    }

    @ReactMethod
    fun getFriendList(filterBlack: Boolean, operationID: String, promise: Promise) {
        Open_im_sdk.getFriendList(BaseImpl(promise), operationID, filterBlack)
    }

    @ReactMethod
    fun getFriendListPage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.getFriendListPage(
            BaseImpl(promise),
            operationID,
            jsonParams.getIntValue("offset"),
            jsonParams.getIntValue("count"),
            jsonParams.getBooleanValue("filterBlack")
        )
    }

    @ReactMethod
    fun getSpecifiedFriendsInfo(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getSpecifiedFriendsInfo(BaseImpl(promise), operationID, params, false)
    }

    @ReactMethod
    fun searchFriends(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.searchFriends(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun addFriend(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.addFriend(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun checkFriend(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.checkFriend(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun updateFriends(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.updateFriends(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun getFriendApplicationUnhandledCount(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getFriendApplicationUnhandledCount(BaseImpl(promise, Number::class.java), operationID, params)
    }

    @ReactMethod
    fun deleteFriend(friendUserID: String, operationID: String, promise: Promise) {
        Open_im_sdk.deleteFriend(BaseImpl(promise), operationID, friendUserID)
    }

    @ReactMethod
    fun setFriendRemark(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val toUserIDList = java.util.ArrayList<String>()
        toUserIDList.add(jsonParams.getString("toUserID") ?: "")
        val updateParams = JSONObject()
        updateParams["friendUserIDs"] = toUserIDList
        updateParams["remark"] = jsonParams.getString("remark") ?: ""
        Open_im_sdk.updateFriends(BaseImpl(promise), operationID, updateParams.toString())
    }

    @ReactMethod
    fun getFriendApplicationListAsApplicant(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getFriendApplicationListAsApplicant(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun getFriendApplicationListAsRecipient(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getFriendApplicationListAsRecipient(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun acceptFriendApplication(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.acceptFriendApplication(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun refuseFriendApplication(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.refuseFriendApplication(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun addBlack(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val ex = if (jsonParams.containsKey("ex")) jsonParams.getString("ex") else ""
        Open_im_sdk.addBlack(BaseImpl(promise), operationID, jsonParams.getString("toUserID"), ex)
    }

    @ReactMethod
    fun getBlackList(operationID: String, promise: Promise) {
        Open_im_sdk.getBlackList(BaseImpl(promise), operationID)
    }

    @ReactMethod
    fun removeBlack(userID: String, operationID: String, promise: Promise) {
        Open_im_sdk.removeBlack(BaseImpl(promise), operationID, userID)
    }

    // ========== Group ==========

    @ReactMethod
    fun setGroupListener() {
        Open_im_sdk.setGroupListener(OnGroupListener(reactContext))
    }

    @ReactMethod
    fun createGroup(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.createGroup(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun joinGroup(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val reqMsg = if (jsonParams.containsKey("reqMsg")) jsonParams.getString("reqMsg") else ""
        val joinSource = if (jsonParams.containsKey("joinSource")) jsonParams.getIntValue("joinSource") else 0
        val ex = if (jsonParams.containsKey("ex")) jsonParams.getString("ex") else ""
        Open_im_sdk.joinGroup(
            BaseImpl(promise),
            operationID,
            jsonParams.getString("groupID"),
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
    fun getJoinedGroupListPage(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val offset = jsonParams.getIntValue("offset")
        val count = jsonParams.getIntValue("count")
        Open_im_sdk.getJoinedGroupListPage(BaseImpl(promise), operationID, offset, count)
    }

    @ReactMethod
    fun getSpecifiedGroupsInfo(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getSpecifiedGroupsInfo(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun getGroupMemberList(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val filter = jsonParams.getIntValue("filter")
        val offset = jsonParams.getIntValue("offset")
        val count = jsonParams.getIntValue("count")
        Open_im_sdk.getGroupMemberList(
            BaseImpl(promise),
            operationID,
            jsonParams.getString("groupID"),
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
    fun getSpecifiedGroupMembersInfo(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val groupID = jsonParams.getString("groupID")
        val userIDList = jsonParams.getJSONArray("userIDList").toString()
        Open_im_sdk.getSpecifiedGroupMembersInfo(BaseImpl(promise), operationID, groupID, userIDList)
    }

    @ReactMethod
    fun getUsersInGroup(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val groupID = jsonParams.getString("groupID")
        val userIDList = jsonParams.getJSONArray("userIDList").toString()
        Open_im_sdk.getUsersInGroup(BaseImpl(promise), operationID, groupID, userIDList)
    }

    @ReactMethod
    fun searchGroupMembers(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.searchGroupMembers(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun setGroupInfo(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.setGroupInfo(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun changeGroupMute(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.changeGroupMute(
            BaseImpl(promise),
            operationID,
            jsonParams.getString("groupID"),
            jsonParams.getBoolean("isMute")
        )
    }

    @ReactMethod
    fun changeGroupMemberMute(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.changeGroupMemberMute(
            BaseImpl(promise),
            operationID,
            jsonParams.getString("groupID"),
            jsonParams.getString("userID"),
            jsonParams.getLongValue("mutedSeconds")
        )
    }

    @ReactMethod
    fun setGroupMemberInfo(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.setGroupMemberInfo(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun inviteUserToGroup(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val groupID = jsonParams.getString("groupID")
        val userIDList = jsonParams.getJSONArray("userIDList")?.toString() ?: "[]"
        val reason = if (jsonParams.containsKey("reason")) jsonParams.getString("reason") ?: "" else ""
        Open_im_sdk.inviteUserToGroup(BaseImpl(promise), operationID, groupID, userIDList, reason)
    }

    @ReactMethod
    fun kickGroupMember(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val groupID = jsonParams.getString("groupID")
        val userIDList = jsonParams.getJSONArray("userIDList")?.toString() ?: "[]"
        val reason = if (jsonParams.containsKey("reason")) jsonParams.getString("reason") ?: "" else ""
        Open_im_sdk.kickGroupMember(BaseImpl(promise), operationID, groupID, userIDList, reason)
    }

    @ReactMethod
    fun transferGroupOwner(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        Open_im_sdk.transferGroupOwner(
            BaseImpl(promise),
            operationID,
            jsonParams.getString("groupID"),
            jsonParams.getString("newOwnerUserID")
        )
    }

    @ReactMethod
    fun getGroupApplicationListAsApplicant(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getGroupApplicationListAsApplicant(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun getGroupApplicationListAsRecipient(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getGroupApplicationListAsRecipient(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun getGroupApplicationUnhandledCount(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.getGroupApplicationUnhandledCount(BaseImpl(promise, Number::class.java), operationID, params)
    }

    @ReactMethod
    fun acceptGroupApplication(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val groupID = jsonParams.getString("groupID") ?: ""
        val userID = jsonParams.getString("userID") ?: ""
        val handleMsg = if (jsonParams.containsKey("handleMsg")) jsonParams.getString("handleMsg") ?: "" else ""
        Open_im_sdk.acceptGroupApplication(BaseImpl(promise), operationID, groupID, userID, handleMsg)
    }

    @ReactMethod
    fun refuseGroupApplication(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val groupID = jsonParams.getString("groupID") ?: ""
        val userID = jsonParams.getString("userID") ?: ""
        val handleMsg = if (jsonParams.containsKey("handleMsg")) jsonParams.getString("handleMsg") ?: "" else ""
        Open_im_sdk.refuseGroupApplication(BaseImpl(promise), operationID, groupID, userID, handleMsg)
    }

    @ReactMethod
    fun searchGroups(params: String, operationID: String, promise: Promise) {
        Open_im_sdk.searchGroups(BaseImpl(promise), operationID, params)
    }

    @ReactMethod
    fun getGroupMemberListByJoinTimeFilter(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val groupID = jsonParams.getString("groupID") ?: ""
        val offset = jsonParams.getIntValue("offset")
        val count = jsonParams.getIntValue("count")
        val joinTimeBegin = jsonParams.getLongValue("joinTimeBegin")
        val joinTimeEnd = jsonParams.getLongValue("joinTimeEnd")
        val filterUserIDList = jsonParams.getJSONArray("filterUserIDList")?.toString() ?: "[]"
        Open_im_sdk.getGroupMemberListByJoinTimeFilter(
            BaseImpl(promise),
            operationID,
            groupID,
            offset,
            count,
            joinTimeBegin,
            joinTimeEnd,
            filterUserIDList
        )
    }

    @ReactMethod
    fun isJoinGroup(groupID: String, operationID: String, promise: Promise) {
        Open_im_sdk.isJoinGroup(BaseImpl(promise, Boolean::class.java), operationID, groupID)
    }

    // ========== Utility ==========

    @ReactMethod
    fun updateFcmToken(fcmToken: String, expireTime: Double, operationID: String, promise: Promise) {
        Open_im_sdk.updateFcmToken(BaseImpl(promise), operationID, fcmToken, expireTime.toLong())
    }

    @ReactMethod
    fun setAppBadge(appUnreadCount: Double, operationID: String, promise: Promise) {
        Open_im_sdk.setAppBadge(BaseImpl(promise), operationID, appUnreadCount.toInt())
    }

    @ReactMethod
    fun uploadLogs(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val line = jsonParams.getLongValue("line")
        val ex = if (jsonParams.containsKey("ex")) jsonParams.getString("ex") ?: "" else ""
        Open_im_sdk.uploadLogs(BaseImpl(promise), operationID, line, ex, UploadLogProgressListener(reactContext, operationID))
    }

    @ReactMethod
    fun logs(params: String, operationID: String, promise: Promise) {
        val jsonParams = JSON.parseObject(params)
        val logLevel = jsonParams.getLongValue("logLevel")
        val file = if (jsonParams.containsKey("file")) jsonParams.getString("file") ?: "" else ""
        val line = jsonParams.getLongValue("line")
        val msgs = if (jsonParams.containsKey("msgs")) jsonParams.getString("msgs") ?: "" else ""
        val err = if (jsonParams.containsKey("err")) jsonParams.getString("err") ?: "" else ""
        val keyAndValue = if (jsonParams.containsKey("keyAndValue")) jsonParams.getJSONArray("keyAndValue")?.toString() ?: "[]" else "[]"
        Open_im_sdk.logs(BaseImpl(promise), operationID, logLevel, file, line, msgs, err, keyAndValue)
    }

    @ReactMethod
    fun getSdkVersion(operationID: String, promise: Promise) {
        promise.resolve(Open_im_sdk.getSdkVersion())
    }

    @ReactMethod
    fun unInitSDK(operationID: String, promise: Promise) {
        Open_im_sdk.unInitSDK(operationID)
        promise.resolve(null)
    }

    @ReactMethod
    fun getAtAllTag(operationID: String, promise: Promise) {
        promise.resolve(Open_im_sdk.getAtAllTag(operationID))
    }
}
