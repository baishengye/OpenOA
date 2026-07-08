#import "ItcOpenIMSDK.h"
#import "RNCallbackProxy.h"
#import "listener/RNConnListener.h"
#import "listener/RNAdvancedMsgListener.h"
#import "listener/RNConversationListener.h"
#import "listener/RNFriendshipListener.h"
#import "listener/RNGroupListener.h"
#import <React/RCTLog.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// OpenIM SDK C API 头文件
#ifdef __cplusplus
extern "C" {
#endif

// SDK 初始化与登录
extern BOOL Open_im_sdkInitSDK(void *listener, char *operationID, char *config);
extern void Open_im_sdkUnInitSDK(char *operationID);
extern void Open_im_sdkLogin(void *callback, char *operationID, char *userID, char *token);
extern void Open_im_sdkLogout(void *callback, char *operationID);
extern int Open_im_sdkGetLoginStatus(char *operationID);
extern char* Open_im_sdkGetLoginUserID();

// 用户
extern void Open_im_sdkGetUsersInfo(void *callback, char *operationID, char *userIDList);
extern void Open_im_sdkGetSelfUserInfo(void *callback, char *operationID);
extern void Open_im_sdkSetSelfInfo(void *callback, char *operationID, char *userInfo);

// 好友
extern void Open_im_sdkGetFriendList(void *callback, char *operationID, BOOL filterBlack);
extern void Open_im_sdkAddFriend(void *callback, char *operationID, char *userID, char *reqMsg);
extern void Open_im_sdkDeleteFriend(void *callback, char *operationID, char *userID);
extern void Open_im_sdkGetBlackList(void *callback, char *operationID);
extern void Open_im_sdkAddBlack(void *callback, char *operationID, char *userID, char *ex);
extern void Open_im_sdkRemoveBlack(void *callback, char *operationID, char *userID);

// 群组
extern void Open_im_sdkCreateGroup(void *callback, char *operationID, char *groupBaseInfo, char *memberList);
extern void Open_im_sdkJoinGroup(void *callback, char *operationID, char *groupID, char *message, int joinSource, char *ex);
extern void Open_im_sdkQuitGroup(void *callback, char *operationID, char *groupID);
extern void Open_im_sdkDismissGroup(void *callback, char *operationID, char *groupID);
extern void Open_im_sdkGetJoinedGroupList(void *callback, char *operationID);
extern void Open_im_sdkGetGroupsInfo(void *callback, char *operationID, char *groupIDList);
extern void Open_im_sdkSetGroupInfo(void *callback, char *operationID, char *groupInfo);
extern void Open_im_sdkGetGroupMemberList(void *callback, char *operationID, char *groupID, int filter, int offset, int count);

// 会话
extern void Open_im_sdkGetAllConversationList(void *callback, char *operationID);
extern void Open_im_sdkGetConversationListByType(void *callback, char *operationID, int type, int offset, int count);
extern void Open_im_sdkGetOneConversation(void *callback, char *operationID, int sessionType, char *sessionID);
extern void Open_im_sdkSetConversationDraft(void *callback, char *operationID, char *conversationID, char *draftText);
extern void Open_im_sdkPinConversation(void *callback, char *operationID, char *conversationID, BOOL isPinned);
extern void Open_im_sdkSetConversationRecvMessageOpt(void *callback, char *operationID, char *conversationIDList, int opt);

// 消息
extern void Open_im_sdkSendMessage(void *callback, char *operationID, char *message, char *conversationID, char *receiver, char *groupID);
extern void Open_im_sdkGetAdvancedHistoryMessageList(void *callback, char *operationID, char *config);
extern void Open_im_sdkGetHistoryMessageListReverse(void *callback, char *operationID, char *config);
extern void Open_im_sdkRevokeMessage(void *callback, char *operationID, char *conversationID, char *clientMsgID);
extern void Open_im_sdkDeleteMessageFromLocalStorage(void *callback, char *operationID, char *conversationID, char *clientMsgID);
extern void Open_im_sdkDeleteMessages(void *callback, char *operationID, char *conversationID, char *clientMsgIDList);
extern void Open_im_sdkMarkConversationMessageAsRead(void *callback, char *operationID, char *conversationID);
extern int Open_im_sdkGetTotalUnreadMsgCount();

// 消息接收选项
extern void Open_im_sdkSetAppBackgroundStatus(void *callback, char *operationID, BOOL isBackground);
extern void Open_im_sdkSetAllReceiveMessageOpt(void *callback, char *operationID, int opt);

#ifdef __cplusplus
}
#endif

@interface ItcOpenIMSDK () <RCTBridgeModule>

@property (nonatomic, strong) RNConnListener *connListener;
@property (nonatomic, strong) RNAdvancedMsgListener *msgListener;
@property (nonatomic, strong) RNConversationListener *convListener;
@property (nonatomic, strong) RNFriendshipListener *friendListener;
@property (nonatomic, strong) RNGroupListener *groupListener;
@property (nonatomic, assign) BOOL hasListeners;

@end

@implementation ItcOpenIMSDK

RCT_EXPORT_MODULE(ItcOpenIM)

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (instancetype)init {
    self = [super init];
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"onConnectFailed",
        @"onConnectSuccess",
        @"onConnecting",
        @"onKickedOffline",
        @"onUserTokenExpired",
        @"onRecvNewMessage",
        @"onRecvC2CReadReceipt",
        @"onRecvGroupReadReceipt",
        @"onRecvMessageRevoked",
        @"onConversationChanged",
        @"onNewConversation",
        @"onSyncServerProgress",
        @"onConversationTotalUnreadMessageCountChanged",
        @"onFriendApplicationAdded",
        @"onFriendApplicationDeleted",
        @"onFriendApplicationAccepted",
        @"onFriendApplicationRejected",
        @"onFriendAdded",
        @"onFriendDeleted",
        @"onFriendInfoChanged",
        @"onBlackAdded",
        @"onBlackDeleted",
        @"onJoinedGroupAdded",
        @"onJoinedGroupDeleted",
        @"onGroupDismissed",
        @"onGroupInfoChanged",
        @"onGroupMemberAdded",
        @"onGroupMemberDeleted",
        @"onGroupMemberInfoChanged",
        @"onGroupApplicationAdded",
        @"onGroupApplicationDeleted",
        @"onGroupApplicationAccepted",
        @"onGroupApplicationRejected"
    ];
}

- (void)startObserving {
    _hasListeners = YES;
}

- (void)stopObserving {
    _hasListeners = NO;
}

- (void)pushEvent:(NSString *)eventName data:(id)data {
    if (_hasListeners) {
        [self sendEventWithName:eventName body:data];
    }
}

#pragma mark - SDK 方法

// ============ 登录相关 ============

RCT_EXPORT_METHOD(initSDK:(NSString *)config
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        // 初始化监听器
        _connListener = [[RNConnListener alloc] initWithModule:self];
        _msgListener = [[RNAdvancedMsgListener alloc] initWithModule:self];
        _convListener = [[RNConversationListener alloc] initWithModule:self];
        _friendListener = [[RNFriendshipListener alloc] initWithModule:self];
        _groupListener = [[RNGroupListener alloc] initWithModule:self];

        NSMutableDictionary *configDict = [self parseJSONObject:config];
        configDict[@"platformID"] = @1;
        NSString *updatedConfig = [self toJSONString:configDict];

        char *configStr = (char *)[updatedConfig UTF8String];
        char *opID = (char *)[operationID UTF8String];

        BOOL flag = Open_im_sdkInitSDK((__bridge void *)self.connListener, opID, configStr);

        if (flag) {
            resolve(@"init success");
        } else {
            reject(@"-1", @"please check params and dir", nil);
        }
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(unInitSDK:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        char *opID = (char *)[operationID UTF8String];
        Open_im_sdkUnInitSDK(opID);
        resolve(@"uninit success");
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(login:(NSString *)userID
                  token:(NSString *)token
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *uid = (char *)[userID UTF8String];
        char *tk = (char *)[token UTF8String];
        Open_im_sdkLogin((__bridge void *)cb, opID, uid, tk);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(logout:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        Open_im_sdkLogout((__bridge void *)cb, opID);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(getLoginStatus:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        int status = Open_im_sdkGetLoginStatus((char *)[operationID UTF8String]);
        resolve(@(status));
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(getLoginUserID:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        char *userID = Open_im_sdkGetLoginUserID();
        if (userID) {
            resolve([NSString stringWithUTF8String:userID]);
        } else {
            resolve([NSNull null]);
        }
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

// ============ 用户信息 ============

RCT_EXPORT_METHOD(getUsersInfo:(NSString *)userIDList
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *list = (char *)[userIDList UTF8String];
        Open_im_sdkGetUsersInfo((__bridge void *)cb, opID, list);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(getSelfUserInfo:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        Open_im_sdkGetSelfUserInfo((__bridge void *)cb, opID);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

// ============ 会话 ============

RCT_EXPORT_METHOD(getAllConversationList:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        Open_im_sdkGetAllConversationList((__bridge void *)cb, opID);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(getOneConversation:(NSInteger)sessionType
                  sessionID:(NSString *)sessionID
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *sid = (char *)[sessionID UTF8String];
        Open_im_sdkGetOneConversation((__bridge void *)cb, opID, (int)sessionType, sid);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

// ============ 消息 ============

RCT_EXPORT_METHOD(sendMessage:(NSString *)conversationID
                  message:(NSString *)message
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *msg = (char *)[message UTF8String];
        char *convID = (char *)[conversationID UTF8String];

        // 解析 conversationID 获取 receiver 和 groupID
        NSString *receiver = @"";
        NSString *groupID = @"";

        if ([conversationID hasPrefix:@"si_"]) {
            receiver = [[conversationID substringFromIndex:3] componentsSeparatedByString:@"_"].firstObject;
        } else if ([conversationID hasPrefix:@"sg_"]) {
            groupID = [[conversationID substringFromIndex:3] componentsSeparatedByString:@"_"].firstObject;
        }

        char *recv = (char *)[receiver UTF8String];
        char *gid = (char *)[groupID UTF8String];
        Open_im_sdkSendMessage((__bridge void *)cb, opID, msg, convID, recv, gid);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(getHistoryMessageList:(NSString *)config
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *cfg = (char *)[config UTF8String];
        Open_im_sdkGetAdvancedHistoryMessageList((__bridge void *)cb, opID, cfg);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(getTotalUnreadMsgCount:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        int count = Open_im_sdkGetTotalUnreadMsgCount();
        resolve(@(count));
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(markConversationMessageAsRead:(NSString *)conversationID
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *convID = (char *)[conversationID UTF8String];
        Open_im_sdkMarkConversationMessageAsRead((__bridge void *)cb, opID, convID);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

// ============ 群组 ============

RCT_EXPORT_METHOD(getJoinedGroupList:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        Open_im_sdkGetJoinedGroupList((__bridge void *)cb, opID);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(createGroup:(NSString *)groupBaseInfo
                  memberList:(NSString *)memberList
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *info = (char *)[groupBaseInfo UTF8String];
        char *members = (char *)[memberList UTF8String];
        Open_im_sdkCreateGroup((__bridge void *)cb, opID, info, members);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(joinGroup:(NSString *)groupID
                  message:(NSString *)message
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *gid = (char *)[groupID UTF8String];
        char *msg = (char *)[message UTF8String];
        Open_im_sdkJoinGroup((__bridge void *)cb, opID, gid, msg, 2, "");
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(quitGroup:(NSString *)groupID
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *gid = (char *)[groupID UTF8String];
        Open_im_sdkQuitGroup((__bridge void *)cb, opID, gid);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(dismissGroup:(NSString *)groupID
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *gid = (char *)[groupID UTF8String];
        Open_im_sdkDismissGroup((__bridge void *)cb, opID, gid);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

// ============ 好友 ============

RCT_EXPORT_METHOD(getFriendList:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        Open_im_sdkGetFriendList((__bridge void *)cb, opID, NO);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(addFriend:(NSString *)userID
                  reqMsg:(NSString *)reqMsg
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *uid = (char *)[userID UTF8String];
        char *msg = (char *)[reqMsg UTF8String];
        Open_im_sdkAddFriend((__bridge void *)cb, opID, uid, msg);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(deleteFriend:(NSString *)userID
                  operationID:(NSString *)operationID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    @try {
        RNCallbackProxy *cb = [[RNCallbackProxy alloc] initWithResolve:resolve reject:reject];
        char *opID = (char *)[operationID UTF8String];
        char *uid = (char *)[userID UTF8String];
        Open_im_sdkDeleteFriend((__bridge void *)cb, opID, uid);
    } @catch (NSException *exception) {
        reject(@"-1", exception.reason, nil);
    }
}

#pragma mark - Helpers

- (NSMutableDictionary *)parseJSONObject:(NSString *)json {
    if (!json || json.length == 0) return [NSMutableDictionary dictionary];
    NSData *data = [json dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error;
    NSMutableDictionary *dict = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:&error];
    return error ? [NSMutableDictionary dictionary] : dict;
}

- (NSString *)toJSONString:(id)object {
    NSData *data = [NSJSONSerialization dataWithJSONObject:object options:0 error:nil];
    return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

@end
