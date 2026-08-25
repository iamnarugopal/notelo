import { LinearGradient } from "expo-linear-gradient";
import { EllipsisVertical, TextAlignStart, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ViewList } from "@/constant/common";
import { ViewMode } from "@/utils/NoteStorage";
import { useNavigation } from "expo-router";
import { DrawerNavigationProp } from "expo-router/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchQueryChange: (query: string) => void;
}

const HomeHeader = ({
  viewMode,
  onViewModeChange,
  onSearchQueryChange,
}: HomeHeaderProps) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalizedQuery = searchText.trim();

      if (normalizedQuery.length >= 2) {
        onSearchQueryChange(normalizedQuery);
        return;
      }

      onSearchQueryChange("");
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, onSearchQueryChange]);

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
          <View className="flex-1 relative">
            <TextInput
              className="bg-white/20 rounded-lg ps-4 pe-12 text-white"
              placeholder="Search notes"
              placeholderTextColor="#fff"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText && (
              <Pressable
                onPress={() => setSearchText("")}
                className="absolute inset-0 left-auto items-center justify-center px-3 opacity-80"
              >
                <X size={24} color={"#fff"} />
              </Pressable>
            )}
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
            <View className="flex-row flex-wrap">
              {ViewList.map((item) => {
                const Icon = item?.icon;
                return (
                  <TouchableOpacity
                    key={item?.slug}
                    activeOpacity={0.5}
                    onPress={() => handleViewModeChange(item?.slug)}
                    className={`w-1/2 items-center justify-center gap-2 p-4 ${
                      viewMode === item?.slug ? "bg-gray-200" : ""
                    }`}
                  >
                    <Icon size={30} color={"#000"} />
                    <Text className="text-sm uppercase tracking-widest font-semibold">
                      {item?.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default HomeHeader;
