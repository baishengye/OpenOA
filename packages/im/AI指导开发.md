## 根据以下指导完成im模块的开发
1. 修改OpenOA/packages/im的包名为@openim/rn-client-sdk-plus和描述
2. 阅读OpenOA/docs中的文档，在IOS上运行确保没有问题，只有先commit一次，备注：所有提交信息都不要标注cluade code
3. 根据OpenOA的RN环境和turboModule的配置和open-im-sdk-reactnative的rn实现接口将OpenOA/packages/im先实现对于openim android和ios的实现桥接，要确保的是我不是希望在im中引入open-im-sdk-reactnative，而是参考open-im-sdk-reactnative的代码实现在0.82+turboModule下的新代码，按照ios-》android的调试顺序。可以先评估工作量