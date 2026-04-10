import { Tabs } from "expo-router";
import { Home, Search, User, Bell } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#A02535",
        tabBarInactiveTintColor: "#5A4C3A",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#FAF7F0",
          borderTopColor: "#E4DDD0",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
        },
        tabBarIconStyle: {
          marginBottom: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          letterSpacing: 0.2,
        },
        headerStyle: {
          backgroundColor: "#FAF7F0",
        },
        headerTintColor: "#1C3557",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerTitle: "श्रम सेवा",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          headerTitle: "Find Workers",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarLabel: "Alerts",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          headerTitle: "Notifications",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          headerTitle: "My Profile",
        }}
      />
    </Tabs>
  );
}
