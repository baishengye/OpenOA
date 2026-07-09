//
//  ItcJSONExtensions.m
//  ItcOpenIM
//
//  JSON 工具扩展实现
//

#import "ItcJSONExtensions.h"

@implementation NSDictionary (ItcJSON)

- (nullable NSString *)toJsonString {
    if (!self) return nil;
    NSError *error = nil;
    NSData *data = [NSJSONSerialization dataWithJSONObject:self options:0 error:&error];
    if (error) return nil;
    return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

@end

@implementation NSArray (ItcJSON)

- (nullable NSString *)toJsonString {
    if (!self) return nil;
    NSError *error = nil;
    NSData *data = [NSJSONSerialization dataWithJSONObject:self options:0 error:&error];
    if (error) return nil;
    return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

@end

// ============ 通用 JSON 解析函数 ============

NSDictionary * _Nullable ItcParseJsonStr2Dict(NSString *jsonStr) {
    if (!jsonStr || jsonStr.length == 0) return nil;
    NSData *data = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
    if (!data) return nil;
    NSError *error = nil;
    id jsonObject = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
    if (error || ![jsonObject isKindOfClass:[NSDictionary class]]) return nil;
    return (NSDictionary *)jsonObject;
}

NSArray * _Nullable ItcParseJsonStr2Array(NSString *jsonStr) {
    if (!jsonStr || jsonStr.length == 0) return nil;
    NSData *data = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
    if (!data) return nil;
    NSError *error = nil;
    id jsonObject = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
    if (error || ![jsonObject isKindOfClass:[NSArray class]]) return nil;
    return (NSArray *)jsonObject;
}

NSString * _Nullable ItcDict2JsonStr(NSDictionary *dict) {
    if (!dict) return nil;
    return [dict toJsonString];
}

NSString * _Nullable ItcArray2JsonStr(NSArray *array) {
    if (!array) return nil;
    return [array toJsonString];
}
