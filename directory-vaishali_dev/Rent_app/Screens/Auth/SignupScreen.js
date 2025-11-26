import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignupScreen({ navigation, setRole }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [role, setLocalRole] = useState("user"); // Local state for role selection

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !role) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // Use proxy URL to bypass CORS if needed (replace with actual API URL)
    const API_URL = "http://localhost:5000/api/users/signup";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          mobile: phone,
          role: role.toLowerCase(), // Ensure role is lowercase ("landlord" or "tenant")
        }),
      });

      const data = await response.json();
console.log("Signup response:", data);
      if (response.ok && data.success) {
        // Validate role from API response
        if (!["landlord", "tenant"].includes(data.user.role)) {
          Alert.alert("Error", "Invalid role received from server");
          return;
        }

        // Store token and user data
        await AsyncStorage.setItem("accessToken", data.accessToken);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        // Update global role state from App.js
        setRole(data.user.role); // Set role based on API response

        // Navigate to the appropriate tab navigator
        const targetNavigator = data.user.role === "landlord" ? "LandlordTabs" : "TenantTabs";
        navigation.replace(targetNavigator);

        Alert.alert("Success", data.msg || "Registration Successful");
      } else {
        Alert.alert("Error", data.msg || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error.message);
      Alert.alert("Error", "Failed to connect to the server. Please check your network or server configuration.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Create Account ✨</Text>
      <Text style={styles.subtitle}>Please enter your details to sign up.</Text>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons
            name={secure ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Role Dropdown */}
      <View style={styles.dropdown}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setLocalRole(itemValue)}
        >
          <Picker.Item label="Landlord" value="admin" />
          <Picker.Item label="Tenant" value="user" />
        </Picker>
      </View>

      {/* Signup Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Already have account link */}
      <Text style={styles.login}>
        Already have an account?{" "}
        <Text style={styles.loginLink} onPress={() => navigation.replace("Login")}>
          Login
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#000" },
  subtitle: { fontSize: 14, color: "#777", marginBottom: 30 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 50,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: "#000" },
  dropdown: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    height: 50,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  login: { textAlign: "center", fontSize: 14, color: "#555" },
  loginLink: { color: "#8A2BE2", fontWeight: "600" },
});