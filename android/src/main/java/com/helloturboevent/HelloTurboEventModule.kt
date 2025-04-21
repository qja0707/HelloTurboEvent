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
    Timer().schedule(3000){
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
