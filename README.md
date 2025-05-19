# 터보 모듈 이벤트

## 문제 정의

터보 모듈에서 이벤트 발생시키는 방법  잘 모르겠음.
왜 레거시 버전으로 하면 안되냐 -> 터보 모듈로 함수를 만들었을 때 레거시와 혼용하는게 더 좋은 방법이 있는데 브릿지에 JSON 핑퐁하는게 불필요하다고 생각됨

## iOS

### Turbo Module에서 이벤트 발생시키기

Turbo Module 시스템에서 이벤트를 발생시키려면 다음과 같은 단계를 따릅니다:

1. TypeScript 인터페이스에 이벤트 정의하기

```typescript
// src/NativeHelloTurboEvent.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  // 이벤트 정의: `onStringEvent`라는 이름의 이벤트 emitter 정의
  readonly onStringEvent: EventEmitter<string>;
  
  // 메소드 정의
  testAsyncFunction(): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('HelloTurboEvent');
```

2. 모듈 인터페이스 노출하기

```typescript
// src/index.tsx
import HelloTurboEvent from './NativeHelloTurboEvent';

export function testAsyncFunction() {
  return HelloTurboEvent.testAsyncFunction();
}

// 이벤트 emitter 노출
export const onStringEvent = HelloTurboEvent.onStringEvent;
```

3. 코드젠 실행하기

TypeScript 인터페이스에서 네이티브 코드를 자동 생성하려면 코드젠을 실행해야 합니다.


코드젠이 실행되면 다음 파일들이 자동 생성됩니다:
- iOS: `ios/HelloTurboEvent/RNHelloTurboEventSpec.h`
- Android: `android/src/main/java/com/helloturbovent/NativeHelloTurboEventSpec.java`

이 파일들에는 이벤트 emitter 메소드(`emitOnStringEvent`)가 정의되어 있어 네이티브 코드에서 사용할 수 있습니다.

4. 헤더 파일에서 자동 생성된 스펙 사용하기

코드젠으로 생성된 스펙을 사용하기 위해 헤더 파일을 다음과 같이 설정합니다:

```objc
// ios/HelloTurboEvent.h

#import <HelloTurboEvent/RNHelloTurboEventSpec.h>

@interface HelloTurboEvent : NativeHelloTurboEventSpecBase <NativeHelloTurboEventSpec>

@end
```

`NativeHelloTurboEventSpecBase`를 상속받고 `NativeHelloTurboEventSpec` 프로토콜을 구현하는 인터페이스를 정의합니다. 이를 통해:

- `emitOnStringEvent:` 메소드가 자동으로 사용 가능해집니다.
- 코드젠이 생성한 모든 메소드와 이벤트 emit 기능을 사용할 수 있습니다.

5. iOS에서 이벤트 발생시키기 (Objective-C)

```objc
// ios/HelloTurboEvent.mm

@implementation HelloTurboEvent

RCT_EXPORT_MODULE()

- (void)testAsyncFunction{
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    NSLog(@"HelloTurboEvent: Emitting event after 3 seconds");
    
    // onStringEvent 이벤트 발생시키기
    [self emitOnStringEvent:@"Hello from TurboModule!"];
  });
}

@end
```

## Android

### Android에서 이벤트 발생시키기 (Kotlin)

안드로이드에서도 코드젠을 통해 생성된 스펙을 사용하여 이벤트를 발생시킬 수 있습니다.

```kotlin
// android/src/main/java/com/helloturboevent/HelloTurboEventModule.kt
package com.helloturboevent

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import android.util.Log
import java.util.Timer
import kotlin.concurrent.schedule

@ReactModule(name = HelloTurboEventModule.NAME)
class HelloTurboEventModule(reactContext: ReactApplicationContext) :
  NativeHelloTurboEventSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun testAsyncFunction() {
    Timer().schedule(3000) {
      // 이벤트 발생
      emitOnStringEvent("Hello from Android TurboModule!")

      // 간단한 로그 출력
      Log.d(NAME, "Emitted event after 3 seconds")
    }
  }

  companion object {
    const val NAME = "HelloTurboEvent"
  }
}
```

코틀린에서 이벤트를 발생시키는 주요 포인트:

1. **상속**: `NativeHelloTurboEventSpec` 클래스를 상속받아 코드젠으로 생성된 기능을 활용합니다.

2. **이벤트 발생**: `emitOnStringEvent()` 메소드를 사용하여 이벤트를 발생시킵니다.

## React Native 앱에서 이벤트 수신하기

```tsx
// App.tsx
import { onStringEvent, testAsyncFunction } from 'hello-turbo-event';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // 이벤트 리스너 등록
    const listener = onStringEvent((event) => {
      console.log('이벤트 수신:', event); // 문자열 데이터 수신
    });

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      listener.remove();
    };
  }, []);
  
  // 이벤트를 발생시키는 함수 호출
  const handleTest = () => {
    testAsyncFunction()
      .then(result => console.log('함수 결과:', result))
      .catch(error => console.error('에러:', error));
  };

  return (
    // ... UI 코드 ...
  );
}
```

## 주요 특징

1. **코드젠 활용**: TypeScript 타입 정의에서 네이티브 코드가 자동 생성됩니다.
2. **타입 안전성**: TypeScript 인터페이스를 통해 이벤트 타입이 보장됩니다.
3. **성능 향상**: JSI(JavaScript Interface)를 활용하여 브릿지 오버헤드 없이 직접 네이티브 메소드 호출이 가능합니다.
4. **이벤트 발생 방식**: `emitOn{EventName}` 형식의 메소드를 사용하여 이벤트를 발생시킵니다.

## 레거시 방식과의 차이점

1. **브릿지 우회**: Turbo Module은 JSI를 활용하여 브릿지를 통한 JSON 직렬화/역직렬화 과정을 생략합니다.
2. **자동 코드 생성**: 인터페이스 정의로부터 보일러플레이트 코드가 자동 생성됩니다.
3. **이벤트 처리 방식**: `emitOn{EventName}` 메소드를 사용하여 더 명확하고 타입 안전한 이벤트 발생이 가능합니다.

### 참고 문헌

1. React Native Docs - Custom Events in Native Modules  
   https://reactnative.dev/docs/the-new-architecture/native-modules-custom-events#step-1-update-the-specs-of-nativelocalstorage
