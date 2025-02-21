import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: 'olive',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: "olive"
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Upload new files to the cloud",
          tabBarLabel: "Upload",
          tabBarIcon: ({color}) => <Ionicons name="add" color={color} size={30} />,
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
            headerTitle: "View files from the cloud",
            tabBarLabel: "View",
            tabBarIcon: ({color}) => <Ionicons name="image" color={color} size={30} />,
          }}
        />
    </Tabs>
   );
}
