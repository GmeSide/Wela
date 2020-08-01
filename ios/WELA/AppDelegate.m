#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#if DEBUG
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>
#import <GoogleMaps/GoogleMaps.h>
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
#import "RNGoogleSignin.h"
#import <Firebase.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
 
#if DEBUG
  InitializeFlipper(application);
  [FIRApp configure];
   [GMSServices provideAPIKey:@"AIzaSyCb3txixm6dLD7YTal0QsPEUV64XbxtXo0"];
  // Called when a notification is delivered to a foreground app.
  - (void)userNotificationCenter:(UNUserNotificationCenter *)center
         willPresentNotification:(UNNotification *)notification
           withCompletionHandler:
               (void (^)(UNNotificationPresentationOptions options))
                   completionHandler {
    completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert |
                      UNAuthorizationOptionBadge);
  }
  // Required to register for notifications
  - (void)application:(UIApplication *)application
      didRegisterUserNotificationSettings:
          (UIUserNotificationSettings *)notificationSettings {
    [RNCPushNotificationIOS
        didRegisterUserNotificationSettings:notificationSettings];
  }
  // Required for the register event.
  - (void)application:(UIApplication *)application
      didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [RNCPushNotificationIOS
        didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
  }
  // Required for the notification event. You must call the completion handler
  // after handling the remote notification.
  - (void)application:(UIApplication *)application
      didReceiveRemoteNotification:(NSDictionary *)userInfo
            fetchCompletionHandler:
                (void (^)(UIBackgroundFetchResult))completionHandler {
    [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo
                                  fetchCompletionHandler:completionHandler];
  }
  // Required for the registrationError event.
  - (void)application:(UIApplication *)application
      didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    [RNCPushNotificationIOS
        didFailToRegisterForRemoteNotificationsWithError:error];
  }
  // Required for the localNotification event.
  - (void)application:(UIApplication *)application
      didReceiveLocalNotification:(UILocalNotification *)notification {
    [RNCPushNotificationIOS didReceiveLocalNotification:notification];
  }
  // IOS 10+ Required for local notification tapped event
  - (void)userNotificationCenter:(UNUserNotificationCenter *)center
      didReceiveNotificationResponse:(UNNotificationResponse *)response
               withCompletionHandler:(void (^)(void))completionHandler {
    [RNCPushNotificationIOS didReceiveNotificationResponse:response];
    completionHandler();
  }

  
#endif
  

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"WELA"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
 
  
  return YES;
}

// Called when a notification is delivered to a foreground app.
//- (void)userNotificationCenter:(UNUserNotificationCenter *)center
//       willPresentNotification:(UNNotification *)notification
//         withCompletionHandler:
//             (void (^)(UNNotificationPresentationOptions options))
//                 completionHandler {
//  completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert |
//                    UNAuthorizationOptionBadge);
//}
//
//// Required to register for notifications
//- (void)application:(UIApplication *)application
//    didRegisterUserNotificationSettings:
//        (UIUserNotificationSettings *)notificationSettings {
//  [RNCPushNotificationIOS
//      didRegisterUserNotificationSettings:notificationSettings];
//}
//// Required for the register event.
//- (void)application:(UIApplication *)application
//    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
//  [RNCPushNotificationIOS
//      didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
//}
//// Required for the notification event. You must call the completion handler
//// after handling the remote notification.
//- (void)application:(UIApplication *)application
//    didReceiveRemoteNotification:(NSDictionary *)userInfo
//          fetchCompletionHandler:
//              (void (^)(UIBackgroundFetchResult))completionHandler {
//  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo
//                                fetchCompletionHandler:completionHandler];
//}
//// Required for the registrationError event.
//- (void)application:(UIApplication *)application
//    didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
//  [RNCPushNotificationIOS
//      didFailToRegisterForRemoteNotificationsWithError:error];
//}
//// Required for the localNotification event.
//- (void)application:(UIApplication *)application
//    didReceiveLocalNotification:(UILocalNotification *)notification {
//  [RNCPushNotificationIOS didReceiveLocalNotification:notification];
//}
//// IOS 10+ Required for local notification tapped event
//- (void)userNotificationCenter:(UNUserNotificationCenter *)center
//    didReceiveNotificationResponse:(UNNotificationResponse *)response
//             withCompletionHandler:(void (^)(void))completionHandler {
//  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
//  completionHandler();
//}

//- (BOOL)application:(UIApplication *)application openURL:(nonnull NSURL *)url options:(nonnull NSDictionary<NSString *,id> *)options {
//  return [[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options] || [RNGoogleSignin application:application openURL:url options:options];
//}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
