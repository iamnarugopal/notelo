import { LinearGradient } from "expo-linear-gradient";
import { TextAlignStart } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

import { useNavigation } from "expo-router";
import { DrawerNavigationProp } from "expo-router/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SettingsHeader = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const insets = useSafeAreaInsets();

  return (
    <>
      <LinearGradient
        colors={["#22b6c6", "#0fd5ac"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            className="size-16 items-center justify-center"
          >
            <TextAlignStart size={24} color={"#fff"} />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl">Settings</Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

export default SettingsHeader;
