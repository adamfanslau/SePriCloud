import { Stack } from "expo-router";
import { LogBox, View, Image, Text } from "react-native";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontSize: 30,
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../assets/images/SePriCloud-logo.png")} // Adjust the path if needed
                style={{ width: 35, height: 35, marginRight: 10 }} // Adjust size as needed
                resizeMode="contain"
              />
              <Text style={{ fontSize: 30, fontWeight: "bold" }}>SePriCloud</Text>
            </View>
          ),
          headerLeft: () => <></>,
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
   );
}
