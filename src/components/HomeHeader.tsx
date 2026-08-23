import { LinearGradient } from "expo-linear-gradient";
import {
  EllipsisVertical,
  Grid2X2,
  TextAlignJustify,
  TextAlignStart,
} from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ViewMode } from "@/utils/NoteStorage";
import { useNavigation } from "expo-router";
import { DrawerNavigationProp } from "expo-router/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const HomeHeader = ({ viewMode, onViewModeChange }: HomeHeaderProps) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const handleViewModeChange = (mode: ViewMode) => {
    onViewModeChange(mode);
    setModalVisible(false);
  };

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
          <View className="flex-1">
            <TextInput
              className="bg-white/20 rounded-lg ps-4 pe-3 text-white"
              placeholder="Search notes"
              placeholderTextColor="#fff"
            />
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(!modalVisible)}
            className="size-16 items-center justify-center"
          >
            <EllipsisVertical size={24} color={"#fff"} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <Pressable className="flex-1" onPress={() => setModalVisible(false)}>
          <View className="absolute right-0 top-16 w-2/3 bg-white p-3 shadow-lg">
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => handleViewModeChange("list")}
                className={`flex-1 basis-0 items-center justify-center gap-2 py-4 ${
                  viewMode === "list" ? "bg-gray-200" : ""
                }`}
              >
                <TextAlignJustify size={30} color={"#000"} />
                <Text className="text-sm uppercase tracking-widest font-semibold">
                  List
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                className={`flex-1 basis-0 items-center justify-center gap-2 py-4 ${
                  viewMode === "grid" ? "bg-gray-200" : ""
                }`}
                onPress={() => handleViewModeChange("grid")}
              >
                <Grid2X2 size={30} color={"#000"} />
                <Text className="text-sm uppercase tracking-widest font-semibold">
                  Grid
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default HomeHeader;
