import { Note } from "@/types/note";
import { LinearGradient } from "expo-linear-gradient";
import {
    CheckCheck,
    EllipsisVertical,
    MoveLeft,
    Pen,
    Trash2,
} from "lucide-react-native";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface DetailHeaderProps {
  note: Note;
  handleInput: (type: string, v: string) => void;
  handleSubmit: () => void;
  handleBack: () => void;
  handleDelete: () => void;
  isEditMode: boolean;
  isBackDisabled: boolean;
  editTarget: "title" | "content";
  setEditTarget: (target: "title" | "content") => void;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  note,
  handleInput,
  handleSubmit,
  handleBack,
  handleDelete,
  isEditMode,
  isBackDisabled,
  editTarget,
  setEditTarget,
  setIsEditMode,
}) => {
  const insets = useSafeAreaInsets();
  const titleInputRef = useRef<TextInput>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    requestAnimationFrame(() => {
      if (editTarget === "title") titleInputRef.current?.focus();
    });
  }, [editTarget, isEditMode]);

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .runOnJS(true)
    .onEnd((_event, success) => {
      if (success) {
        setEditTarget("title");
        setIsEditMode(true);
      }
    });

  const confirmDelete = () => {
    Alert.alert("Delete note", "Are you sure you want to delete this note?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: handleDelete,
      },
    ]);
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
            onPress={handleBack}
            disabled={isBackDisabled}
            className="size-16 items-center justify-center"
            style={{ opacity: isBackDisabled ? 0.35 : 1 }}
          >
            <MoveLeft size={24} color={"#fff"} />
          </TouchableOpacity>

          {isEditMode ? (
            <>
              <View className="flex-1">
                <TextInput
                  ref={titleInputRef}
                  autoFocus
                  className="bg-white/20 rounded-lg ps-4 pe-3 text-white"
                  placeholder="Enter title"
                  placeholderTextColor="#fff"
                  value={note?.title}
                  onChangeText={(value) => handleInput("title", value)}
                />
              </View>
              <TouchableOpacity
                onPress={handleSubmit}
                className="size-16 items-center justify-center"
              >
                <CheckCheck size={24} color={"#fff"} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <GestureDetector gesture={doubleTapGesture}>
                <Pressable className="flex-1">
                  <Text
                    className="text-white text-xl"
                    ellipsizeMode="tail"
                    numberOfLines={1}
                  >
                    {note?.title}
                  </Text>
                </Pressable>
              </GestureDetector>
              <TouchableOpacity
                onPress={() => {
                  setEditTarget("title");
                  setIsEditMode(true);
                }}
                className="size-16 items-center justify-center"
              >
                <Pen size={24} color={"#fff"} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="size-16 items-center justify-center"
          >
            <EllipsisVertical size={24} color={"#fff"} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <Modal
        animationType="none"
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable className="flex-1" onPress={() => setMenuVisible(false)}>
          <View className="absolute right-2 w-48 bg-white p-2 shadow-lg top-16">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                confirmDelete();
              }}
              className="flex-row items-center gap-3 p-3"
            >
              <Trash2 size={20} color="#dc2626" />
              <Text className="text-base font-semibold text-red-600">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default DetailHeader;
