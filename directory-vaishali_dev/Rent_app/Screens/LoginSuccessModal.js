import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Modal, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon"; // optional: for confetti

export default function LoginSuccessModal({ visible }) {
  const scaleValue = useRef(new Animated.Value(0.5)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();

      // Icon bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounce, { toValue: -10, duration: 500, useNativeDriver: true }),
          Animated.timing(iconBounce, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ scale: scaleValue }] }]}>
          <LinearGradient colors={['#8A2BE2', '#4B0082']} style={styles.iconContainer}>
            <Animated.Text style={[styles.icon, { transform: [{ translateY: iconBounce }] }]}>👤</Animated.Text>
          </LinearGradient>
          <Text style={styles.title}>Login Successful!</Text>
          <Text style={styles.subtitle}>
            Please wait...{"\n"}You will be directed to the homepage.
          </Text>
          <ActivityIndicator size="large" color="#8A2BE2" style={{ marginTop: 25 }} />

          {/* Optional confetti */}
          {visible && <ConfettiCannon count={50} origin={{ x: -10, y: 0 }} fadeOut />}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#8A2BE2",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  icon: { fontSize: 36, color: "#fff" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 10, color: "#333" },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", lineHeight: 24 },
});
