//
//  JSONExtensions.h
//  ItcOpenIM
//
//  JSON 工具扩展，提供 NSDictionary/NSArray 与 JSON 字符串之间的转换
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSDictionary (ItcJSONPlus)

// 将字典序列化为 JSON 字符串
- (nullable NSString *)toJsonString;

@end

@interface NSArray (ItcJSONPlus)

// 将数组序列化为 JSON 字符串
- (nullable NSString *)toJsonString;

@end

// ============ 通用 JSON 解析函数 ============

// 使用 extern "C" 确保 C++ 链接时正确找到符号
#ifdef __cplusplus
extern "C" {
#endif

NSDictionary * _Nullable ItcParseJsonStr2DictPlus(NSString *jsonStr);
NSArray * _Nullable ItcParseJsonStr2ArrayPlus(NSString *jsonStr);
NSString * _Nullable ItcDict2JsonStrPlus(NSDictionary *dict);
NSString * _Nullable ItcArray2JsonStrPlus(NSArray *array);

#ifdef __cplusplus
}
#endif

NS_ASSUME_NONNULL_END
