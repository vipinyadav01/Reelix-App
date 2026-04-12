import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#555",
        tabBarStyle: {
          backgroundColor: "black",
          borderTopWidth: 0,
          position: "absolute",
          elevation: 0,
          height: 60,
          paddingTop: 10,
          paddingBottom: 0,
          borderTopColor: 'transparent',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={focused ? "house.fill" : "house"}
              size={24}
              tintColor={color}
              fallback={<Ionicons name="home" size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={focused ? "bookmark.fill" : "bookmark"}
              size={24}
              tintColor={color}
              fallback={<Ionicons name="bookmark" size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={focused ? "message.fill" : "message"}
              size={24}
              tintColor={color}
              fallback={<Ionicons name="chatbubble-ellipses" size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color }) => (
            <SymbolView
              name="plus.circle.fill"
              size={34}
              tintColor={color}
              style={{ marginTop: -4 }}
              fallback={<Ionicons name="add-circle" size={34} color={color} style={{ marginTop: -4 }} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={focused ? "person.circle.fill" : "person.circle"}
              size={26}
              tintColor={color}
              fallback={<Ionicons name="person-circle" size={26} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="u/[userId]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
