import React from "react";
import { View, Text, StyleSheet ,TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

function TenantHome() {
 const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "user",
        "loginTimestamp",
      ]);

      Alert.alert("Logged Out", "You have been successfully logged out.");

    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Something went wrong while logging out.");
    }
  };

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Landlord Dashboard</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
    <TenantHome/>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30, color: "#000" },
  logoutButton: {
    backgroundColor: "#FF6F00",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

