import { Note } from "@/types/note";
import { trimText } from "@/utils/common";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface NoteCardProps {
  data: Note;
  selectionMode: boolean;
  selected: boolean;
  onLongPress: () => void;
  onSelect: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  data,
  selectionMode,
  selected,
  onLongPress,
  onSelect,
}) => {
  const router = useRouter();
  const handlePress = () => {
    if (selectionMode) {
      onSelect();
      return;
    }

    router.push({
      pathname: "/note/[id]/detail",
      params: {
        id: String(data?.id),
      },
    });
  };

  return (
    <View className="p-2">
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={500}
        className={`relative flex-1 rounded-lg bg-white p-4 border-2 shadow-sm ${
          selected ? "border-primary-start" : "border-transparent"
        }`}
      >
        {selectionMode && (
          <View
            className={`absolute right-2 top-2 size-6 items-center justify-center rounded-full ${
              selected ? "bg-primary-start" : "bg-white"
            }`}
          >
            {selected && <Check size={12} color="#fff" />}
          </View>
        )}
        <Text className="font-bold mb-2 text-lg" numberOfLines={1}>
          {trimText(data?.title)}
        </Text>
        <Text className="text-gray-500 text-base" numberOfLines={4}>
          {trimText(data?.content)}
        </Text>
      </Pressable>
    </View>
  );
};

export default NoteCard;
