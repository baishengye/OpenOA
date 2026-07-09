//
//  ItcJSONExtensions.h
//  ItcOpenIM
//
//  JSON 工具扩展，提供 NSDictionary/NSArray 与 JSON 字符串之间的转换
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSDictionary (ItcJSON)

// 将字典序列化为 JSON 字符串
- (nullable NSString *)toJsonString;

@end

@interface NSArray (ItcJSON)

// 将数组序列化为 JSON 字符串
- (nullable NSString *)toJsonString;

@end

// ============ 通用 JSON 解析函数 ============

// 使用 extern "C" 确保 C++ 链接时正确找到符号
#ifdef __cplusplus
extern "C" {
#endif

NSDictionary * _Nullable ItcParseJsonStr2Dict(NSString *jsonStr);
NSArray * _Nullable ItcParseJsonStr2Array(NSString *jsonStr);
NSString * _Nullable ItcDict2JsonStr(NSDictionary *dict);
NSString * _Nullable ItcArray2JsonStr(NSArray *array);

#ifdef __cplusplus
}
#endif

NS_ASSUME_NONNULL_END
