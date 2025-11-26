import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation, setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // const API_URL = "http://localhost:5000";
const API_URL = "http://10.0.2.2:5000";

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const [accessToken, userString] = await Promise.all([
        AsyncStorage.getItem("accessToken"),
        AsyncStorage.getItem("user"),
      ]);

      if (accessToken && userString) {
        const user = JSON.parse(userString);
        const loginTimestamp = await AsyncStorage.getItem("loginTimestamp");
        const now = Date.now();
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

        if (loginTimestamp && now - parseInt(loginTimestamp) > thirtyDaysInMs) {
          await clearAuthData();
          setIsLoading(false);
          return;
        }

        setRole(user.role || "user");
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "user",
        "loginTimestamp",
      ]);
    } catch (error) {
      console.error("Clear auth data error:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
        return;
      }

      await AsyncStorage.setItem("accessToken", data.accessToken);
      await AsyncStorage.setItem("refreshToken", data.refreshToken);
      await AsyncStorage.setItem("loginTimestamp", Date.now().toString());
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        })
      );

      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        setRole(data.user.role || "user");
        navigation.navigate("Home");
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        error.message.includes("Network")
          ? "Network issue. Please check your connection."
          : "Something went wrong. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6F00" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logo.png")} // 👈 place your flag logo image here
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>जय जिनेन्द्र</Text>
      <Text style={styles.subtitle}>
        Please enter your email & password to sign in.
      </Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      {/* <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signupLink}> Sign up</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: "#fff", justifyContent: "center" },
  loadingContainer: { alignItems: "center" },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logo: { width: 150, height: 150 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#000", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#777", marginBottom: 30, textAlign: "center" },
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
  button: {
    backgroundColor: "#FF6F00", // 🟧 orange theme
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  signupContainer: { flexDirection: "row", justifyContent: "center" },
  signupText: { fontSize: 14, color: "#777" },
  signupLink: { fontSize: 14, fontWeight: "bold", color: "#FF6F00" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
});
