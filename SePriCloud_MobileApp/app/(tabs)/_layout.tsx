import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#444f5d',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: "#3f83cc"
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Account settings",
          tabBarLabel: "Account",
          tabBarIcon: ({color}) => <Ionicons name="person" color={color} size={30} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          headerTitle: "Upload new files to the cloud",
          tabBarLabel: "Upload",
          tabBarIcon: ({color}) => <Ionicons name="add" color={color} size={30} />,
        }}
      />
      <Tabs.Screen
        name="fileList"
        options={{
            headerTitle: "View files from the cloud",
            tabBarLabel: "View",
            tabBarIcon: ({color}) => <Ionicons name="image" color={color} size={30} />,
          }}
        />
    </Tabs>
   );
}
