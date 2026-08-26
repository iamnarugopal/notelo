import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowDownUp,
  Database,
  EllipsisVertical,
  LayoutGrid,
  TextAlignStart,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SortList, ViewList } from "@/constant/common";
import { SortMode, ViewMode } from "@/utils/NoteStorage";
import { useNavigation } from "expo-router";
import { DrawerNavigationProp } from "expo-router/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  viewMode: ViewMode;
  sortMode: SortMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSortModeChange: (mode: SortMode) => void;
  onAddDummy: () => void;
  onSearchQueryChange: (query: string) => void;
  selectionMode: boolean;
  totalCount: number;
  selectedCount: number;
  handleUnselect: () => void;
}

const HomeHeader = ({
  viewMode,
  sortMode,
  onViewModeChange,
  onSortModeChange,
  onAddDummy,
  onSearchQueryChange,
  selectionMode,
  selectedCount,
  totalCount,
  handleUnselect,
}: HomeHeaderProps) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"sort" | "view">("view");
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

  const handleSortModeChange = (mode: SortMode) => {
    onSortModeChange(mode);
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
          {selectionMode ? (
            <>
              <TouchableOpacity
                onPress={() => handleUnselect()}
                className="size-16 items-center justify-center"
              >
                <X size={24} color={"#fff"} />
              </TouchableOpacity>
              <View className="flex-1 relative">
                <Text className="text-white text-xl tracking-widest font-bold">
                  {selectedCount}/{totalCount}
                </Text>
              </View>
            </>
          ) : (
            <>
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
                onPress={() => setMenuVisible(true)}
                className="size-16 items-center justify-center"
              >
                <EllipsisVertical size={24} color={"#fff"} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
      <Modal
        animationType="none"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable className="flex-1" onPress={() => setMenuVisible(false)}>
          <View className="absolute right-0 top-16 w-2/5 bg-white py-3 shadow-lg">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                onAddDummy();
              }}
              className="flex-row items-center gap-3 px-6 py-3 active:bg-gray-300"
            >
              <Database size={22} color="#111827" />
              <Text className="text-base font-semibold">Add Dummy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                setActiveTab("sort");
                setModalVisible(true);
              }}
              className="flex-row items-center gap-3 px-6 py-3 active:bg-gray-300"
            >
              <ArrowDownUp size={22} color="#111827" />
              <Text className="text-base font-semibold">Sort</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                setActiveTab("view");
                setModalVisible(true);
              }}
              className="flex-row items-center gap-3 px-6 py-3 active:bg-gray-300"
            >
              <LayoutGrid size={22} color="#111827" />
              <Text className="text-base font-semibold">View</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center  px-5 z-10"
          onPress={() => setModalVisible(false)}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="w-full max-w-md rounded-xl bg-white p-4 shadow-2xl">
            <View className="mb-3 flex-row border-b border-gray-200">
              <TouchableOpacity
                onPress={() => setActiveTab("sort")}
                className={`flex-1 flex-row items-center justify-center gap-2 border-b-2 p-3 ${
                  activeTab === "sort"
                    ? "border-teal-500"
                    : "border-transparent"
                }`}
              >
                <ArrowDownUp size={19} color="#111827" />
                <Text className="font-semibold">Sort</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("view")}
                className={`flex-1 flex-row items-center justify-center gap-2 border-b-2 p-3 ${
                  activeTab === "view"
                    ? "border-teal-500"
                    : "border-transparent"
                }`}
              >
                <LayoutGrid size={19} color="#111827" />
                <Text className="font-semibold">View</Text>
              </TouchableOpacity>
            </View>
            {(activeTab === "sort" ? SortList : ViewList).map((item) => {
              const Icon = item.icon;
              const selected =
                activeTab === "sort"
                  ? sortMode === item.slug
                  : viewMode === item.slug;

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  key={item.slug}
                  onPress={() =>
                    activeTab === "sort"
                      ? handleSortModeChange(item.slug as SortMode)
                      : handleViewModeChange(item.slug as ViewMode)
                  }
                  className={`flex-row items-center gap-3 rounded-lg p-3 active:bg-gray-100 ${
                    selected ? "bg-gray-100" : ""
                  }`}
                >
                  <Icon size={21} color="#111827" />
                  <Text className="text-base font-medium">{item.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default HomeHeader;
