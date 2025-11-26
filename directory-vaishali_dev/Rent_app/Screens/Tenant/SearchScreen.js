import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SearchScreen() {
  return (
    <View style={styles.center}>
      <Text>Tenant Search Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" }
});
