import { createNote } from "@/utils/NoteStorage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Plus, Trash2 } from "lucide-react-native";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

interface AddButtonProps {
  isDelete: boolean;
  handleDelete: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ handleDelete, isDelete }) => {
  const router = useRouter();

  const handlePress = async () => {
    try {
      const id = await createNote();

      router.push({
        pathname: "/note/[id]/detail",
        params: {
          id: String(id),
        },
      });
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete notes",
      "Are you sure you want to delete the selected notes?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDelete,
        },
      ],
    );
  };

  if (isDelete) {
    return (
      <TouchableOpacity
        onPress={confirmDelete}
        activeOpacity={0.8}
        className="absolute bottom-5 right-5 z-10 rounded-full shadow-lg"
      >
        <LinearGradient
          colors={["#22b6c6", "#0fd5ac"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circle}
        >
          <Trash2 size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="absolute bottom-5 right-5 z-10 rounded-full shadow-lg"
    >
      <LinearGradient
        colors={["#22b6c6", "#0fd5ac"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.circle}
      >
        <Plus size={24} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default AddButton;

const styles = StyleSheet.create({
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
