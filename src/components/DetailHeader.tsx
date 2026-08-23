import { Note } from "@/types/note";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCheck, MoveLeft } from "lucide-react-native";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DetailHeaderProps {
  note: Note;
  handleInput: (type: string, v: string) => void;
  handleSubmit: () => void;
  handleBack: () => void;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  note,
  handleInput,
  handleSubmit,
  handleBack,
}) => {
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
            onPress={handleBack}
            className="size-16 items-center justify-center"
          >
            <MoveLeft size={24} color={"#fff"} />
          </TouchableOpacity>
          <View className="flex-1">
            <TextInput
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
        </View>
      </LinearGradient>
    </>
  );
};

export default DetailHeader;
