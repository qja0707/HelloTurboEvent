import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  readonly onStringEvent: EventEmitter<string>;

  testAsyncFunction(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('HelloTurboEvent');
