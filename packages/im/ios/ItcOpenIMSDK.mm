#import "ItcOpenIMSDK.h"
#import "ItcSendMessageCallbackProxy.h"
#import "ItcUploadFileCallbackProxy.h"
#import "ItcUploadLogCallbackProxy.h"

@implementation NSDictionary (Extensions)

- (NSString *)json {
    NSError *error = nil;
    NSData *data = [NSJSONSerialization dataWithJSONObject:self options:0 error:&error];
    if (error) return nil;
    return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

@end

@implementation NSArray (Extensions)

- (NSString *)json {
    NSError *error = nil;
    NSData *data = [NSJSONSerialization dataWithJSONObject:self options:0 error:&error];
    if (error) return nil;
    return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

@end

@implementation ItcOpenIMSDK

bool hasListeners;

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE(ItcOpenIM)

// ============== 辅助方法 ==============

- (NSDictionary *)parseJsonStr2Dict:(NSString *)jsonStr {
    if (!jsonStr || jsonStr.length == 0) return nil;
    NSData *jsonData = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;
    id jsonObject = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];
    if (error || ![jsonObject isKindOfClass:[NSDictionary class]]) {
        NSLog(@"[ItcOpenIM] parseJsonStr2Dict error: %@", error.localizedDescription);
        return nil;
    }
    return (NSDictionary *)jsonObject;
}

- (NSArray *)parseJsonStr2Array:(NSString *)jsonStr {
    if (!jsonStr || jsonStr.length == 0) return nil;
    NSData *jsonData = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;
    id jsonObject = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];
    if (error || ![jsonObject isKindOfClass:[NSArray class]]) {
        NSLog(@"[ItcOpenIM] parseJsonStr2Array error: %@", error.localizedDescription);
        return nil;
    }
    return (NSArray *)jsonObject;
}

// ============== 登录相关 (TurboModule: 基本类型) ==============

RCT_EXPORT_METHOD(initSDK:(NSString *)configJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSDictionary *config = [self parseJsonStr2Dict:configJson];
    if (!config) {
        reject(@"-1", @"Invalid config JSON", nil);
        return;
    }

    NSMutableDictionary *newConfig = [config mutableCopy];
    newConfig[@"platformID"] = @1;

    BOOL flag = Open_im_sdkInitSDK(self, operationID, [newConfig json]);
    Open_im_sdkSetUserListener(self);
    Open_im_sdkSetConversationListener(self);
    Open_im_sdkSetFriendListener(self);
    Open_im_sdkSetGroupListener(self);
    Open_im_sdkSetAdvancedMsgListener(self);
    Open_im_sdkSetBatchMsgListener(self);

    if (flag) {
        resolve(@"init success");
    } else {
        reject(@"-1", @"please check params and dir", nil);
    }
}

RCT_EXPORT_METHOD(login:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }

    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSString *userID = options[@"userID"];
    NSString *token = options[@"token"];
    Open_im_sdkLogin(proxy, operationID, userID, token);
}

RCT_EXPORT_METHOD(logout:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkLogout(proxy, operationID);
}

RCT_EXPORT_METHOD(getLoginStatus:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    long status = Open_im_sdkGetLoginStatus(operationID);
    resolver(@(status));
}

RCT_EXPORT_METHOD(getLoginUserID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSString *uid = Open_im_sdkGetLoginUserID();
    resolver(uid);
}

// ============== 用户相关 (TurboModule: 基本类型) ==============

RCT_EXPORT_METHOD(getUsersInfo:(NSString *)uidListJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetUsersInfo(proxy, operationID, uidListJson);
}

RCT_EXPORT_METHOD(setSelfInfo:(NSString *)infoJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSetSelfInfo(proxy, operationID, infoJson);
}

RCT_EXPORT_METHOD(getSelfUserInfo:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetSelfUserInfo(proxy, operationID);
}

RCT_EXPORT_METHOD(subscribeUsersStatus:(NSString *)userIDListJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSubscribeUsersStatus(proxy, operationID, userIDListJson);
}

RCT_EXPORT_METHOD(unsubscribeUsersStatus:(NSString *)userIDListJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkUnsubscribeUsersStatus(proxy, operationID, userIDListJson);
}

RCT_EXPORT_METHOD(getSubscribeUsersStatus:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetSubscribeUsersStatus(proxy, operationID);
}

RCT_EXPORT_METHOD(setAppBackgroundStatus:(BOOL)isBackground operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSetAppBackgroundStatus(proxy, operationID, isBackground);
}

RCT_EXPORT_METHOD(networkStatusChanged:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkNetworkStatusChanged(proxy, operationID);
}

RCT_EXPORT_METHOD(setGlobalRecvMessageOpt:(NSInteger)opt operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *param = @{@"globalRecvMsgOpt": @(opt)};
    Open_im_sdkSetSelfInfo(proxy, operationID, [param json]);
}

// ============== 会话相关 (TurboModule: 基本类型) ==============

RCT_EXPORT_METHOD(getAllConversationList:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetAllConversationList(proxy, operationID);
}

RCT_EXPORT_METHOD(getConversationListSplit:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkGetConversationListSplit(proxy, operationID, [options[@"offset"] longValue], [options[@"count"] longValue]);
}

RCT_EXPORT_METHOD(getOneConversation:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkGetOneConversation(proxy, operationID, [options[@"sessionType"] intValue], options[@"sourceID"]);
}

RCT_EXPORT_METHOD(getMultipleConversation:(NSString *)conversationIDListJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetMultipleConversation(proxy, operationID, conversationIDListJson);
}

RCT_EXPORT_METHOD(getConversationIDBySessionType:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        resolver(nil);
        return;
    }
    NSString *result = Open_im_sdkGetConversationIDBySessionType(operationID, options[@"sourceID"], [options[@"sessionType"] longValue]);
    resolver(result);
}

RCT_EXPORT_METHOD(getTotalUnreadMsgCount:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter onSuccess:^id _Nullable(NSString * _Nullable data) {
        return data ? @([data intValue]) : nil;
    }];
    Open_im_sdkGetTotalUnreadMsgCount(proxy, operationID);
}

RCT_EXPORT_METHOD(markConversationMessageAsRead:(NSString *)conversationID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkMarkConversationMessageAsRead(proxy, operationID, conversationID);
}

RCT_EXPORT_METHOD(setConversation:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkSetConversation(proxy, operationID, options[@"conversationID"], optionsJson);
}

RCT_EXPORT_METHOD(setConversationDraft:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkSetConversationDraft(proxy, operationID, options[@"conversationID"], options[@"draftText"]);
}

RCT_EXPORT_METHOD(pinConversation:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSDictionary *param = @{@"isPinned": options[@"isPinned"] ?: @NO};
    Open_im_sdkSetConversation(proxy, operationID, options[@"conversationID"], [param json]);
}

RCT_EXPORT_METHOD(setConversationRecvMessageOpt:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSDictionary *param = @{@"recvMsgOpt": options[@"opt"] ?: @0};
    Open_im_sdkSetConversation(proxy, operationID, options[@"conversationID"], [param json]);
}

RCT_EXPORT_METHOD(setConversationPrivateChat:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSDictionary *param = @{@"isPrivateChat": options[@"isPrivate"] ?: @NO};
    Open_im_sdkSetConversation(proxy, operationID, options[@"conversationID"], [param json]);
}

RCT_EXPORT_METHOD(setConversationBurnDuration:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSDictionary *param = @{@"burnDuration": options[@"burnDuration"] ?: @0};
    Open_im_sdkSetConversation(proxy, operationID, options[@"conversationID"], [param json]);
}

RCT_EXPORT_METHOD(resetConversationGroupAtType:(NSString *)conversationID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *param = @{@"groupAtType": @0};
    Open_im_sdkSetConversation(proxy, operationID, conversationID, [param json]);
}

RCT_EXPORT_METHOD(hideConversation:(NSString *)conversationID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkHideConversation(proxy, operationID, conversationID);
}

RCT_EXPORT_METHOD(hideAllConversations:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkHideAllConversations(proxy, operationID);
}

RCT_EXPORT_METHOD(clearConversationAndDeleteAllMsg:(NSString *)conversationID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkClearConversationAndDeleteAllMsg(proxy, operationID, conversationID);
}

RCT_EXPORT_METHOD(deleteConversationAndDeleteAllMsg:(NSString *)conversationID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkDeleteConversationAndDeleteAllMsg(proxy, operationID, conversationID);
}

// ============== 消息相关 (TurboModule: 基本类型) ==============

RCT_EXPORT_METHOD(createImageMessageFromFullPath:(NSString *)imagePath operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSString *result = Open_im_sdkCreateImageMessageFromFullPath(operationID, imagePath);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createVideoMessageFromFullPath:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateVideoMessageFromFullPath(operationID, options[@"videoPath"], options[@"videoType"], [options[@"duration"] longValue], options[@"snapshotPath"]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createSoundMessageFromFullPath:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateSoundMessageFromFullPath(operationID, options[@"soundPath"], [options[@"duration"] longValue]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createFileMessageFromFullPath:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateFileMessageFromFullPath(operationID, options[@"filePath"], options[@"fileName"]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createTextMessage:(NSString *)textMsg operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSString *result = Open_im_sdkCreateTextMessage(operationID, textMsg);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createTextAtMessage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *messageJson = @"";
    if (options[@"message"]) {
        messageJson = [options[@"message"] isKindOfClass:[NSDictionary class]] ? [options[@"message"] json] : options[@"message"];
    }
    NSString *atUserIDListJson = [options[@"atUserIDList"] isKindOfClass:[NSArray class]] ? [options[@"atUserIDList"] json] : options[@"atUserIDList"] ?: @"[]";
    NSString *atUsersInfoJson = [options[@"atUsersInfo"] isKindOfClass:[NSArray class]] ? [options[@"atUsersInfo"] json] : options[@"atUsersInfo"] ?: @"[]";

    NSString *result = Open_im_sdkCreateTextAtMessage(operationID, options[@"text"], atUserIDListJson, atUsersInfoJson, messageJson);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createImageMessageByURL:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSDictionary *sourcePicture = options[@"sourcePicture"];
    NSDictionary *bigPicture = options[@"bigPicture"];
    NSDictionary *snapshotPicture = options[@"snapshotPicture"];

    NSString *result = Open_im_sdkCreateImageMessageByURL(operationID, options[@"sourcePath"],
        [sourcePicture json], [bigPicture json], [snapshotPicture json]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createSoundMessageByURL:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateSoundMessageByURL(operationID, [options json]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createVideoMessageByURL:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateVideoMessageByURL(operationID, [options json]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createFileMessageByURL:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateFileMessageByURL(operationID, [options json]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createMergerMessage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSDictionary *messageList = options[@"messageList"];
    NSDictionary *summaryList = options[@"summaryList"];

    NSString *result = Open_im_sdkCreateMergerMessage(operationID, [messageList json], options[@"title"], [summaryList json]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createForwardMessage:(NSString *)messageJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *message = [self parseJsonStr2Dict:messageJson];
    if (!message) {
        rejecter(@"-1", @"Invalid message JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateForwardMessage(operationID, [message json]);
    NSDictionary *messageObj = [self parseJsonStr2Dict:result];
    resolver(messageObj ?: result);
}

RCT_EXPORT_METHOD(createLocationMessage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateLocationMessage(operationID, options[@"description"], [options[@"longitude"] doubleValue], [options[@"latitude"] doubleValue]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createQuoteMessage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *messageJson = @"";
    if (options[@"message"]) {
        messageJson = [options[@"message"] isKindOfClass:[NSDictionary class]] ? [options[@"message"] json] : options[@"message"];
    }
    NSString *result = Open_im_sdkCreateQuoteMessage(operationID, options[@"text"], messageJson);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createCardMessage:(NSString *)cardJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *cardElem = [self parseJsonStr2Dict:cardJson];
    if (!cardElem) {
        rejecter(@"-1", @"Invalid card JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateCardMessage(operationID, [cardElem json]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createCustomMessage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateCustomMessage(operationID, options[@"data"], options[@"extension"], options[@"description"]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(createFaceMessage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *result = Open_im_sdkCreateFaceMessage(operationID, [options[@"index"] longValue], options[@"data"]);
    NSDictionary *message = [self parseJsonStr2Dict:result];
    resolver(message ?: result);
}

RCT_EXPORT_METHOD(sendMessage:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *params = [self parseJsonStr2Dict:paramsJson];
    if (!params) {
        rejecter(@"-1", @"Invalid params JSON", nil);
        return;
    }

    NSDictionary *message = params[@"message"];
    NSString *recvID = params[@"recvID"];
    NSString *groupID = params[@"groupID"];
    NSDictionary *offlinePushInfo = params[@"offlinePushInfo"];
    BOOL isOnlineOnly = [params[@"isOnlineOnly"] boolValue];

    if (!offlinePushInfo) {
        offlinePushInfo = @{
            @"title": @"you have a new message",
            @"desc": @"new message",
            @"ex": @"",
            @"iOSPushSound": @"+1",
            @"iOSBadgeCount": @YES
        };
    }

    ItcSendMessageCallbackProxy *proxy = [[ItcSendMessageCallbackProxy alloc] initWithMessage:[message json] module:self resolver:resolver rejecter:rejecter];
    Open_im_sdkSendMessage(proxy, operationID, [message json], recvID, groupID, [offlinePushInfo json], isOnlineOnly);
}

RCT_EXPORT_METHOD(sendMessageNotOss:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    NSDictionary *params = [self parseJsonStr2Dict:paramsJson];
    if (!params) {
        rejecter(@"-1", @"Invalid params JSON", nil);
        return;
    }

    NSDictionary *message = params[@"message"];
    NSString *recvID = params[@"recvID"];
    NSString *groupID = params[@"groupID"];
    NSDictionary *offlinePushInfo = params[@"offlinePushInfo"];
    BOOL isOnlineOnly = [params[@"isOnlineOnly"] boolValue];

    if (!offlinePushInfo) {
        offlinePushInfo = @{
            @"title": @"you have a new message",
            @"desc": @"new message",
            @"ex": @"",
            @"iOSPushSound": @"+1",
            @"iOSBadgeCount": @YES
        };
    }

    ItcSendMessageCallbackProxy *proxy = [[ItcSendMessageCallbackProxy alloc] initWithMessage:[message json] module:self resolver:resolver rejecter:rejecter];
    Open_im_sdkSendMessageNotOss(proxy, operationID, [message json], recvID, groupID, [offlinePushInfo json], isOnlineOnly);
}

RCT_EXPORT_METHOD(typingStatusUpdate:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkTypingStatusUpdate(proxy, operationID, options[@"recvID"], options[@"msgTip"]);
}

RCT_EXPORT_METHOD(changeInputStates:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkChangeInputStates(proxy, operationID, options[@"conversationID"], [options[@"focus"] boolValue]);
}

RCT_EXPORT_METHOD(getInputStates:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkGetInputStates(proxy, operationID, options[@"conversationID"], options[@"userID"]);
}

RCT_EXPORT_METHOD(revokeMessage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkRevokeMessage(proxy, operationID, options[@"conversationID"], options[@"clientMsgID"]);
}

RCT_EXPORT_METHOD(deleteMessage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkDeleteMessage(proxy, operationID, options[@"conversationID"], options[@"clientMsgID"]);
}

RCT_EXPORT_METHOD(deleteMessageFromLocalStorage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkDeleteMessageFromLocalStorage(proxy, operationID, options[@"conversationID"], options[@"clientMsgID"]);
}

RCT_EXPORT_METHOD(deleteAllMsgFromLocal:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkDeleteAllMsgFromLocal(proxy, operationID);
}

RCT_EXPORT_METHOD(deleteAllMsgFromLocalAndSvr:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkDeleteAllMsgFromLocalAndSvr(proxy, operationID);
}

RCT_EXPORT_METHOD(searchLocalMessages:(NSString *)searchParamJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSearchLocalMessages(proxy, operationID, searchParamJson);
}

RCT_EXPORT_METHOD(getAdvancedHistoryMessageList:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetAdvancedHistoryMessageList(proxy, operationID, paramsJson);
}

RCT_EXPORT_METHOD(getAdvancedHistoryMessageListReverse:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetAdvancedHistoryMessageListReverse(proxy, operationID, paramsJson);
}

RCT_EXPORT_METHOD(findMessageList:(NSString *)findOptionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkFindMessageList(proxy, operationID, findOptionsJson);
}

RCT_EXPORT_METHOD(insertGroupMessageToLocalStorage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSDictionary *message = options[@"message"];
    Open_im_sdkInsertGroupMessageToLocalStorage(proxy, operationID, [message json], options[@"groupID"], options[@"sendID"]);
}

RCT_EXPORT_METHOD(insertSingleMessageToLocalStorage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSDictionary *message = options[@"message"];
    Open_im_sdkInsertSingleMessageToLocalStorage(proxy, operationID, [message json], options[@"recvID"], options[@"sendID"]);
}

RCT_EXPORT_METHOD(setMessageLocalEx:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkSetMessageLocalEx(proxy, operationID, options[@"conversationID"], options[@"clientMsgID"], options[@"localEx"]);
}

// ============== 好友相关 (TurboModule: 基本类型) ==============

RCT_EXPORT_METHOD(getSpecifiedFriendsInfo:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSArray *userIDList = options[@"userIDList"];
    NSString *userIDListJson = [userIDList isKindOfClass:[NSArray class]] ? [userIDList json] : options[@"userIDList"];
    Open_im_sdkGetSpecifiedFriendsInfo(proxy, operationID, userIDListJson, [options[@"filterBlack"] boolValue]);
}

RCT_EXPORT_METHOD(getFriendList:(BOOL)filterBlack operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetFriendList(proxy, operationID, filterBlack);
}

RCT_EXPORT_METHOD(getFriendListPage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkGetFriendListPage(proxy, operationID, (int32_t)[options[@"offset"] integerValue], (int32_t)[options[@"count"] integerValue], [options[@"filterBlack"] boolValue]);
}

RCT_EXPORT_METHOD(searchFriends:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSearchFriends(proxy, operationID, optionsJson);
}

RCT_EXPORT_METHOD(checkFriend:(NSString *)userIDListJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkCheckFriend(proxy, operationID, userIDListJson);
}

RCT_EXPORT_METHOD(addFriend:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkAddFriend(proxy, operationID, paramsJson);
}

RCT_EXPORT_METHOD(updateFriends:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkUpdateFriends(proxy, operationID, paramsJson);
}

RCT_EXPORT_METHOD(setFriendRemark:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:paramsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid params JSON", nil);
        return;
    }
    NSDictionary *param = @{
        @"friendUserIDs": @[options[@"toUserID"]],
        @"remark": options[@"remark"] ?: @""
    };
    Open_im_sdkUpdateFriends(proxy, operationID, [param json]);
}

RCT_EXPORT_METHOD(deleteFriend:(NSString *)friendUserID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkDeleteFriend(proxy, operationID, friendUserID);
}

RCT_EXPORT_METHOD(getFriendApplicationListAsApplicant:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetFriendApplicationListAsApplicant(proxy, operationID);
}

RCT_EXPORT_METHOD(getFriendApplicationListAsRecipient:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetFriendApplicationListAsRecipient(proxy, operationID);
}

RCT_EXPORT_METHOD(getFriendApplicationUnhandledCount:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    resolver(@0);
}

RCT_EXPORT_METHOD(acceptFriendApplication:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkAcceptFriendApplication(proxy, operationID, paramsJson);
}

RCT_EXPORT_METHOD(refuseFriendApplication:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkRefuseFriendApplication(proxy, operationID, paramsJson);
}

RCT_EXPORT_METHOD(addBlack:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *ex = options[@"ex"] ?: @"";
    Open_im_sdkAddBlack(proxy, operationID, options[@"toUserID"], ex);
}

RCT_EXPORT_METHOD(getBlackList:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetBlackList(proxy, operationID);
}

RCT_EXPORT_METHOD(removeBlack:(NSString *)removeUserID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkRemoveBlack(proxy, operationID, removeUserID);
}

// ============== 群组相关 (TurboModule: 基本类型) ==============

RCT_EXPORT_METHOD(createGroup:(NSString *)ginfoJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkCreateGroup(proxy, operationID, ginfoJson);
}

RCT_EXPORT_METHOD(joinGroup:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *ex = options[@"ex"] ?: @"";
    Open_im_sdkJoinGroup(proxy, operationID, options[@"groupID"], options[@"reqMsg"], (int32_t)[options[@"joinSource"] integerValue], ex);
}

RCT_EXPORT_METHOD(quitGroup:(NSString *)gid operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkQuitGroup(proxy, operationID, gid);
}

RCT_EXPORT_METHOD(dismissGroup:(NSString *)groupID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkDismissGroup(proxy, operationID, groupID);
}

RCT_EXPORT_METHOD(changeGroupMute:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkChangeGroupMute(proxy, operationID, options[@"groupID"], [options[@"isMute"] boolValue]);
}

RCT_EXPORT_METHOD(changeGroupMemberMute:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkChangeGroupMemberMute(proxy, operationID, options[@"groupID"], options[@"userID"], [options[@"mutedSeconds"] longValue]);
}

RCT_EXPORT_METHOD(setGroupMemberInfo:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSetGroupMemberInfo(proxy, operationID, optionsJson);
}

RCT_EXPORT_METHOD(setGroupInfo:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSetGroupInfo(proxy, operationID, optionsJson);
}

RCT_EXPORT_METHOD(getJoinedGroupList:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetJoinedGroupList(proxy, operationID);
}

RCT_EXPORT_METHOD(getJoinedGroupListPage:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkGetJoinedGroupListPage(proxy, operationID, (int32_t)[options[@"offset"] integerValue], (int32_t)[options[@"count"] integerValue]);
}

RCT_EXPORT_METHOD(searchGroups:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSearchGroups(proxy, operationID, optionsJson);
}

RCT_EXPORT_METHOD(getSpecifiedGroupsInfo:(NSString *)groupIDListJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetSpecifiedGroupsInfo(proxy, operationID, groupIDListJson);
}

RCT_EXPORT_METHOD(getGroupApplicationListAsApplicant:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetGroupApplicationListAsApplicant(proxy, operationID);
}

RCT_EXPORT_METHOD(getGroupApplicationListAsRecipient:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetGroupApplicationListAsRecipient(proxy, operationID);
}

RCT_EXPORT_METHOD(getGroupApplicationUnhandledCount:(NSString *)paramsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    resolver(@0);
}

RCT_EXPORT_METHOD(acceptGroupApplication:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkAcceptGroupApplication(proxy, operationID, options[@"groupID"], options[@"fromUserID"], options[@"handleMsg"]);
}

RCT_EXPORT_METHOD(refuseGroupApplication:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkRefuseGroupApplication(proxy, operationID, options[@"groupID"], options[@"fromUserID"], options[@"handleMsg"]);
}

RCT_EXPORT_METHOD(getGroupMemberList:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkGetGroupMemberList(proxy, operationID, options[@"groupID"],
        (int32_t)[options[@"filter"] integerValue],
        (int32_t)[options[@"offset"] integerValue],
        (int32_t)[options[@"count"] integerValue]);
}

RCT_EXPORT_METHOD(getGroupMemberOwnerAndAdmin:(NSString *)groupID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkGetGroupMemberOwnerAndAdmin(proxy, operationID, groupID);
}

RCT_EXPORT_METHOD(getGroupMemberListByJoinTimeFilter:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSArray *filterUserIDList = options[@"filterUserIDList"];
    NSString *filterUserIDListJson = [filterUserIDList isKindOfClass:[NSArray class]] ? [filterUserIDList json] : options[@"filterUserIDList"] ?: @"[]";
    Open_im_sdkGetGroupMemberListByJoinTimeFilter(proxy, operationID, options[@"groupID"],
        (int32_t)[options[@"offset"] integerValue],
        (int32_t)[options[@"count"] integerValue],
        (long)[options[@"joinTimeBegin"] integerValue],
        (long)[options[@"joinTimeEnd"] integerValue],
        filterUserIDListJson);
}

RCT_EXPORT_METHOD(getSpecifiedGroupMembersInfo:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSArray *userIDList = options[@"userIDList"];
    NSString *userIDListJson = [userIDList isKindOfClass:[NSArray class]] ? [userIDList json] : options[@"userIDList"];
    Open_im_sdkGetSpecifiedGroupMembersInfo(proxy, operationID, options[@"groupID"], userIDListJson);
}

RCT_EXPORT_METHOD(getUsersInGroup:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSArray *userIDList = options[@"userIDList"];
    NSString *userIDListJson = [userIDList isKindOfClass:[NSArray class]] ? [userIDList json] : options[@"userIDList"];
    Open_im_sdkGetUsersInGroup(proxy, operationID, options[@"groupID"], userIDListJson);
}

RCT_EXPORT_METHOD(kickGroupMember:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSArray *userIDList = options[@"userIDList"];
    NSString *userIDListJson = [userIDList isKindOfClass:[NSArray class]] ? [userIDList json] : options[@"userIDList"];
    Open_im_sdkKickGroupMember(proxy, operationID, options[@"groupID"], options[@"reason"], userIDListJson);
}

RCT_EXPORT_METHOD(transferGroupOwner:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    Open_im_sdkTransferGroupOwner(proxy, operationID, options[@"groupID"], options[@"newOwnerUserID"]);
}

RCT_EXPORT_METHOD(inviteUserToGroup:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSArray *userIDList = options[@"userIDList"];
    NSString *userIDListJson = [userIDList isKindOfClass:[NSArray class]] ? [userIDList json] : options[@"userIDList"];
    Open_im_sdkInviteUserToGroup(proxy, operationID, options[@"groupID"], options[@"reason"] ?: @"", userIDListJson);
}

RCT_EXPORT_METHOD(searchGroupMembers:(NSString *)searchOptionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSearchGroupMembers(proxy, operationID, searchOptionsJson);
}

RCT_EXPORT_METHOD(isJoinGroup:(NSString *)groupID operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter onSuccess:^id _Nullable(NSString * _Nullable data) {
        return data ? @([data boolValue]) : @NO;
    }];
    Open_im_sdkIsJoinGroup(proxy, operationID, groupID);
}

// ============== 工具方法 (TurboModule: 基本类型) ==============

RCT_EXPORT_METHOD(uploadFile:(NSString *)reqDataJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    ItcUploadFileCallbackProxy *uploadProxy = [[ItcUploadFileCallbackProxy alloc] initWithOpid:operationID module:self resolver:resolver rejecter:rejecter];
    Open_im_sdkUploadFile(proxy, operationID, reqDataJson, uploadProxy);
}

RCT_EXPORT_METHOD(uploadLogs:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    ItcUploadLogCallbackProxy *uploadProxy = [[ItcUploadLogCallbackProxy alloc] initWithOpid:operationID module:self resolver:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSString *ex = options[@"ex"] ?: @"";
    Open_im_sdkUploadLogs(proxy, operationID, [options[@"line"] longValue], ex, uploadProxy);
}

RCT_EXPORT_METHOD(logs:(NSString *)optionsJson operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    NSDictionary *options = [self parseJsonStr2Dict:optionsJson];
    if (!options) {
        rejecter(@"-1", @"Invalid options JSON", nil);
        return;
    }
    NSArray *keyAndValue = options[@"keyAndValue"];
    NSString *keyAndValueJson = [keyAndValue isKindOfClass:[NSArray class]] ? [keyAndValue json] : options[@"keyAndValue"] ?: @"[]";
    Open_im_sdkLogs(proxy, operationID, [options[@"logLevel"] longValue], options[@"file"], [options[@"line"] longValue], options[@"msgs"], options[@"err"], keyAndValueJson);
}

RCT_EXPORT_METHOD(unInitSDK:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    Open_im_sdkUnInitSDK(operationID);
}

RCT_EXPORT_METHOD(updateFcmToken:(NSString *)fcmToken expireTime:(nonnull NSNumber *)expireTime operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkUpdateFcmToken(proxy, operationID, fcmToken, (int64_t)[expireTime intValue]);
}

RCT_EXPORT_METHOD(setAppBadge:(nonnull NSNumber *)appUnreadCount operationID:(NSString *)operationID resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter) {
    ItcCallbackProxy *proxy = [[ItcCallbackProxy alloc] initWithCallback:resolver rejecter:rejecter];
    Open_im_sdkSetAppBadge(proxy, operationID, (int32_t)[appUnreadCount intValue]);
}

// ============== 监听器设置 ==============

RCT_EXPORT_METHOD(setUserListener) {
    Open_im_sdkSetUserListener(self);
}

RCT_EXPORT_METHOD(setConversationListener) {
    Open_im_sdkSetConversationListener(self);
}

RCT_EXPORT_METHOD(setFriendListener) {
    Open_im_sdkSetFriendListener(self);
}

RCT_EXPORT_METHOD(setGroupListener) {
    Open_im_sdkSetGroupListener(self);
}

RCT_EXPORT_METHOD(setAdvancedMsgListener) {
    Open_im_sdkSetAdvancedMsgListener(self);
}

RCT_EXPORT_METHOD(setBatchMsgListener) {
    Open_im_sdkSetBatchMsgListener(self);
}

// ============== 事件发送 (Native -> JS) ==============

- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"onConnectSuccess",
        @"onConnecting",
        @"onConnectFailed",
        @"onKickedOffline",
        @"onSelfInfoUpdated",
        @"onUserStatusChanged",
        @"onUserTokenExpired",
        @"onUserTokenInvalid",
        @"onRecvNewMessages",
        @"onRecvOfflineNewMessages",
        @"onMsgDeleted",
        @"onRecvC2CReadReceipt",
        @"onNewRecvMessageRevoked",
        @"onRecvMessageRevoked",
        @"onRecvNewMessage",
        @"onRecvOfflineNewMessage",
        @"onRecvOnlineOnlyMessage",
        @"onConversationChanged",
        @"onInputStatusChanged",
        @"onNewConversation",
        @"onSyncServerFailed",
        @"onSyncServerFinish",
        @"onSyncServerStart",
        @"onSyncServerProgress",
        @"onTotalUnreadMessageCountChanged",
        @"onBlackAdded",
        @"onBlackDeleted",
        @"onFriendApplicationAccepted",
        @"onFriendApplicationAdded",
        @"onFriendApplicationDeleted",
        @"onFriendApplicationRejected",
        @"onFriendInfoChanged",
        @"onFriendAdded",
        @"onFriendDeleted",
        @"onGroupApplicationAccepted",
        @"onGroupApplicationRejected",
        @"onGroupApplicationAdded",
        @"onGroupApplicationDeleted",
        @"onGroupInfoChanged",
        @"onGroupMemberInfoChanged",
        @"onGroupMemberAdded",
        @"onGroupMemberDeleted",
        @"onJoinedGroupAdded",
        @"onJoinedGroupDeleted",
        @"onGroupDismissed",
        @"uploadComplete",
        @"uploadOnProgress",
        @"onReceiveNewMessages",
        @"onReceiveOfflineNewMessages"
    ];
}

- (void)startObserving {
    hasListeners = YES;
}

- (void)stopObserving {
    hasListeners = NO;
}

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self sendEventWithName:eventName body:data];
}

// ============== SDK 回调 (OpenIM SDK -> Native -> JS) ==============

- (void)onConnectSuccess {
    [self pushEvent:@"onConnectSuccess" data:nil];
}

- (void)onConnecting {
    [self pushEvent:@"onConnecting" data:nil];
}

- (void)onKickedOffline {
    [self pushEvent:@"onKickedOffline" data:nil];
}

- (void)onUserTokenExpired {
    [self pushEvent:@"onUserTokenExpired" data:nil];
}

- (void)onUserTokenInvalid:(NSString *)errMsg {
    [self pushEvent:@"onUserTokenInvalid" data:nil];
}

- (void)onConnectFailed:(int32_t)errCode errMsg:(NSString *)errMsg {
    [self pushEvent:@"onConnectFailed" data:@{@"errCode": @(errCode), @"errMsg": errMsg ?: @""}];
}

- (void)onSelfInfoUpdated:(NSString *)userInfo {
    NSDictionary *data = [self parseJsonStr2Dict:userInfo];
    [self pushEvent:@"onSelfInfoUpdated" data:data];
}

- (void)onUserStatusChanged:(NSString *)statusMap {
    NSDictionary *data = [self parseJsonStr2Dict:statusMap];
    [self pushEvent:@"onUserStatusChanged" data:data];
}

- (void)onRecvNewMessages:(NSString *)messageList {
    NSArray *messageListArray = [self parseJsonStr2Array:messageList];
    [self pushEvent:@"onRecvNewMessages" data:messageListArray];
}

- (void)onRecvOfflineNewMessages:(NSString *)messageList {
    NSArray *messageListArray = [self parseJsonStr2Array:messageList];
    [self pushEvent:@"onRecvOfflineNewMessages" data:messageListArray];
}

- (void)onMsgDeleted:(NSString *)message {
    NSDictionary *messageDict = [self parseJsonStr2Dict:message];
    [self pushEvent:@"onMsgDeleted" data:messageDict];
}

- (void)onNewRecvMessageRevoked:(NSString *)messageRevoked {
    NSDictionary *messageRevokedDict = [self parseJsonStr2Dict:messageRevoked];
    [self pushEvent:@"onNewRecvMessageRevoked" data:messageRevokedDict];
}

- (void)onRecvC2CReadReceipt:(NSString *)msgReceiptList {
    NSArray *msgReceiptListArray = [self parseJsonStr2Array:msgReceiptList];
    [self pushEvent:@"onRecvC2CReadReceipt" data:msgReceiptListArray];
}

- (void)onRecvMessageRevoked:(NSString *)msgId {
    [self pushEvent:@"onRecvMessageRevoked" data:msgId];
}

- (void)onRecvNewMessage:(NSString *)message {
    NSDictionary *messageDict = [self parseJsonStr2Dict:message];
    [self pushEvent:@"onRecvNewMessage" data:messageDict];
}

- (void)onRecvOfflineNewMessage:(NSString *)message {
    NSArray *messageListArray = [self parseJsonStr2Array:message];
    [self pushEvent:@"onRecvOfflineNewMessage" data:messageListArray];
}

- (void)onRecvOnlineOnlyMessage:(NSString *)message {
    NSArray *messageListArray = [self parseJsonStr2Array:message];
    [self pushEvent:@"onRecvOnlineOnlyMessage" data:messageListArray];
}

- (void)onConversationChanged:(NSString *)conversationList {
    NSArray *conversationListArray = [self parseJsonStr2Array:conversationList];
    [self pushEvent:@"onConversationChanged" data:conversationListArray];
}

- (void)onConversationUserInputStatusChanged:(NSString *)datils {
    NSDictionary *datilsDic = [self parseJsonStr2Dict:datils];
    [self pushEvent:@"onInputStatusChanged" data:datilsDic];
}

- (void)onNewConversation:(NSString *)conversationList {
    NSArray *conversationListArray = [self parseJsonStr2Array:conversationList];
    [self pushEvent:@"onNewConversation" data:conversationListArray];
}

- (void)onSyncServerFailed:(BOOL)reinstalled {
    [self pushEvent:@"onSyncServerFailed" data:@(reinstalled)];
}

- (void)onSyncServerFinish:(BOOL)reinstalled {
    [self pushEvent:@"onSyncServerFinish" data:@(reinstalled)];
}

- (void)onSyncServerStart:(BOOL)reinstalled {
    [self pushEvent:@"onSyncServerStart" data:@(reinstalled)];
}

- (void)onSyncServerProgress:(long)progress {
    [self pushEvent:@"onSyncServerProgress" data:@(progress)];
}

- (void)onTotalUnreadMessageCountChanged:(int32_t)totalUnreadCount {
    [self pushEvent:@"onTotalUnreadMessageCountChanged" data:@(totalUnreadCount)];
}

- (void)onBlackAdded:(NSString *)blackInfo {
    NSDictionary *blackInfoDict = [self parseJsonStr2Dict:blackInfo];
    [self pushEvent:@"onBlackAdded" data:blackInfoDict];
}

- (void)onBlackDeleted:(NSString *)blackInfo {
    NSDictionary *blackInfoDict = [self parseJsonStr2Dict:blackInfo];
    [self pushEvent:@"onBlackDeleted" data:blackInfoDict];
}

- (void)onFriendAdded:(NSString *)friendInfo {
    NSDictionary *friendInfoDict = [self parseJsonStr2Dict:friendInfo];
    [self pushEvent:@"onFriendAdded" data:friendInfoDict];
}

- (void)onFriendApplicationAccepted:(NSString *)friendApplication {
    NSDictionary *friendApplicationDict = [self parseJsonStr2Dict:friendApplication];
    [self pushEvent:@"onFriendApplicationAccepted" data:friendApplicationDict];
}

- (void)onFriendApplicationAdded:(NSString *)friendApplication {
    NSDictionary *friendApplicationDict = [self parseJsonStr2Dict:friendApplication];
    [self pushEvent:@"onFriendApplicationAdded" data:friendApplicationDict];
}

- (void)onFriendApplicationDeleted:(NSString *)friendApplication {
    NSDictionary *friendApplicationDict = [self parseJsonStr2Dict:friendApplication];
    [self pushEvent:@"onFriendApplicationDeleted" data:friendApplicationDict];
}

- (void)onFriendApplicationRejected:(NSString *)friendApplication {
    NSDictionary *friendApplicationDict = [self parseJsonStr2Dict:friendApplication];
    [self pushEvent:@"onFriendApplicationRejected" data:friendApplicationDict];
}

- (void)onFriendDeleted:(NSString *)friendInfo {
    NSDictionary *friendInfoDict = [self parseJsonStr2Dict:friendInfo];
    [self pushEvent:@"onFriendDeleted" data:friendInfoDict];
}

- (void)onFriendInfoChanged:(NSString *)friendInfo {
    NSDictionary *friendInfoDict = [self parseJsonStr2Dict:friendInfo];
    [self pushEvent:@"onFriendInfoChanged" data:friendInfoDict];
}

- (void)onGroupApplicationAccepted:(NSString *)groupApplication {
    NSDictionary *groupApplicationDict = [self parseJsonStr2Dict:groupApplication];
    [self pushEvent:@"onGroupApplicationAccepted" data:groupApplicationDict];
}

- (void)onGroupApplicationAdded:(NSString *)groupApplication {
    NSDictionary *groupApplicationDict = [self parseJsonStr2Dict:groupApplication];
    [self pushEvent:@"onGroupApplicationAdded" data:groupApplicationDict];
}

- (void)onGroupApplicationDeleted:(NSString *)groupApplication {
    NSDictionary *groupApplicationDict = [self parseJsonStr2Dict:groupApplication];
    [self pushEvent:@"onGroupApplicationDeleted" data:groupApplicationDict];
}

- (void)onGroupApplicationRejected:(NSString *)groupApplication {
    NSDictionary *groupApplicationDict = [self parseJsonStr2Dict:groupApplication];
    [self pushEvent:@"onGroupApplicationRejected" data:groupApplicationDict];
}

- (void)onGroupInfoChanged:(NSString *)groupInfo {
    NSDictionary *groupInfoDict = [self parseJsonStr2Dict:groupInfo];
    [self pushEvent:@"onGroupInfoChanged" data:groupInfoDict];
}

- (void)onGroupMemberAdded:(NSString *)groupMemberInfo {
    NSDictionary *groupMemberInfoDict = [self parseJsonStr2Dict:groupMemberInfo];
    [self pushEvent:@"onGroupMemberAdded" data:groupMemberInfoDict];
}

- (void)onGroupMemberDeleted:(NSString *)groupMemberInfo {
    NSDictionary *groupMemberInfoDict = [self parseJsonStr2Dict:groupMemberInfo];
    [self pushEvent:@"onGroupMemberDeleted" data:groupMemberInfoDict];
}

- (void)onGroupMemberInfoChanged:(NSString *)groupMemberInfo {
    NSDictionary *groupMemberInfoDict = [self parseJsonStr2Dict:groupMemberInfo];
    [self pushEvent:@"onGroupMemberInfoChanged" data:groupMemberInfoDict];
}

- (void)onJoinedGroupAdded:(NSString *)groupInfo {
    NSDictionary *groupInfoDict = [self parseJsonStr2Dict:groupInfo];
    [self pushEvent:@"onJoinedGroupAdded" data:groupInfoDict];
}

- (void)onJoinedGroupDeleted:(NSString *)groupInfo {
    NSDictionary *groupInfoDict = [self parseJsonStr2Dict:groupInfo];
    [self pushEvent:@"onJoinedGroupDeleted" data:groupInfoDict];
}

- (void)onGroupDismissed:(NSString *)groupInfo {
    NSDictionary *groupInfoDict = [self parseJsonStr2Dict:groupInfo];
    [self pushEvent:@"onGroupDismissed" data:groupInfoDict];
}

- (void)onReceiveNewMessages:(NSString *)receiveNewMessagesCallback {
    [self pushEvent:@"onReceiveNewMessages" data:receiveNewMessagesCallback];
}

- (void)onReceiveOfflineNewMessages:(NSString *)receiveOfflineNewMessages {
    [self pushEvent:@"onReceiveOfflineNewMessages" data:receiveOfflineNewMessages];
}

@end
