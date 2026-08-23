import "@/styles/global.css";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "expo-router/drawer";
import { House, Settings } from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CustomDrawerContent(props: any) {
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? "1.0.0";
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop: 0,
        backgroundColor: "#f1f8fa",
      }}
      scrollEnabled={false}
    >
      <LinearGradient
        colors={["#22b6c6", "#0fd5ac"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-50 mb-5 items-center justify-center -mx-4"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-white text-4xl">Note Lo</Text>
      </LinearGradient>
      {/* Drawer items */}
      <DrawerItemList {...props} />
      <DrawerItem
        label="Setting"
        icon={({ color, size }) => <Settings size={size} color={color} />}
        labelStyle={{ marginLeft: 10 }}
        onPress={() => {
          props.navigation.closeDrawer();
          props.navigation.getParent()?.navigate("settings");
        }}
      />

      {/* Bottom */}
      <View
        style={{
          marginTop: "auto",
          alignItems: "center",
          paddingVertical: 20,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: "#999",
          }}
        >
          Version {version}
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerHideStatusBarOnOpen: true,
        drawerActiveBackgroundColor: "#22b6c6",
        drawerActiveTintColor: "#fff",
        drawerLabelStyle: { marginLeft: 10 },
        drawerItemStyle: {
          borderRadius: 5,
          marginBottom: 5,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}
