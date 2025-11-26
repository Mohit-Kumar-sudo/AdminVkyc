import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import Screens
import LoginScreen from "./Screens/Auth/LoginScreen";
import SignupScreen from "./Screens/Auth/SignupScreen";

// Landlord Screens
import DashboardScreen from "./Screens/Landlords/DashboardScreen";
import PropertiesScreen from "./Screens/Landlords/PropertiesScreen";
import AddPropertyScreen from "./Screens/Landlords/AddPropertyScreen";
console.log('AddPropertyScreen import:', AddPropertyScreen);
import RequestsScreen from "./Screens/Landlords/RequestsScreen";
import ProfileScreen from "./Screens/Landlords/ProfileScreen";

// Tenant Screens
import HomeScreen from "./Screens/Tenant/HomeScreen";
import SearchScreen from "./Screens/Tenant/SearchScreen";
import WishlistScreen from "./Screens/Tenant/WishlistScreen";
import TenantRequestsScreen from "./Screens/Tenant/RequestsScreen";
import TenantProfileScreen from "./Screens/Tenant/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Landlord Bottom Tabs
function LandlordTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard" // Explicitly set Dashboard as initial screen
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "Dashboard") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Properties") iconName = focused ? "business" : "business-outline";
          else if (route.name === "AddProperty") iconName = focused ? "add-circle" : "add-circle-outline";
          else if (route.name === "Requests") iconName = focused ? "chatbubble" : "chatbubble-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Properties" component={PropertiesScreen} />
      <Tab.Screen name="AddProperty" component={AddPropertyScreen} />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Tenant Bottom Tabs
function TenantTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Search") iconName = focused ? "search" : "search-outline";
          else if (route.name === "Wishlist") iconName = focused ? "heart" : "heart-outline";
          else if (route.name === "Requests") iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Requests" component={TenantRequestsScreen} />
      <Tab.Screen name="Profile" component={TenantProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [role, setRole] = useState(null); // Global role state (null, "landlord", or "tenant")

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!role ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} setRole={setRole} />}
            </Stack.Screen>
            <Stack.Screen name="Signup">
              {(props) => <SignupScreen {...props} setRole={setRole} />}
            </Stack.Screen>
          </>
        ) : role === "admin" ? (
          <Stack.Screen name="LandlordTabs" component={LandlordTabs} />
        ) : (
          <Stack.Screen name="TenantTabs" component={TenantTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}