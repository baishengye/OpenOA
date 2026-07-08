# OpenIM SDK ProGuard Rules
# Keep OpenIM SDK classes

# Keep Kotlin metadata
-keep class kotlin.Metadata { *; }

# Keep OpenIM classes
-keep class io.openim.** { *; }
-keep class com.openim.** { *; }
-keep class open_im_sdk.** { *; }

# Keep React Native TurboModule
-keep class com.facebook.react.turbomodule.** { *; }

# Keep Codegen generated classes
-keep class com.openim.rnclient.** { *; }
