import { onStringEvent, testAsyncFunction } from 'hello-turbo-event';
import { useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  useEffect(() => {
    const listener = onStringEvent((event) => {
      console.log(event);
    });

    return () => {
      listener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: nothing</Text>

      <TouchableOpacity onPress={testAsyncFunction} style={styles.button}>
        <Text>Test</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  button: {
    padding: 10,
    backgroundColor: 'lightblue',
    borderRadius: 5,
  },
});
