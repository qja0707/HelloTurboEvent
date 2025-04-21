#import "HelloTurboEvent.h"

@implementation HelloTurboEvent

RCT_EXPORT_MODULE()

- (void)testAsyncFunction:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    NSLog(@"HelloTurboEvent: Emitting event after 3 seconds with message");
    
    [self emitOnStringEvent:@"Hello from TurboModule!"];
  });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeHelloTurboEventSpecJSI>(params);
}

@end
