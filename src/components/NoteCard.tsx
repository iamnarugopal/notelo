import { Note } from "@/types/note";
import { trimText } from "@/utils/common";
import { ViewMode } from "@/utils/NoteStorage";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

const indiaDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

const formatIndianDateTime = (createdAt?: string) => {
  if (!createdAt) {
    return "";
  }

  const normalized = createdAt.includes("T")
    ? createdAt
    : `${createdAt.replace(" ", "T")}Z`;
  const parsedDate = new Date(normalized);

  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt;
  }

  return indiaDateFormatter.format(parsedDate);
};

interface NoteCardProps {
  data: Note;
  viewMode: ViewMode;
  selectionMode: boolean;
  selected: boolean;
  onLongPress: () => void;
  onSelect: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  data,
  viewMode,
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

  const isList = viewMode === "list";
  const showsContent = viewMode !== "list";
  const showsDate = viewMode === "listdetail" || isList;
  const titleLines =
    viewMode === "listdetail" || viewMode === "griddetail" ? 1 : 2;
  const contentLines = viewMode === "listdetail" ? 2 : 6;
  const createdAtLabel = formatIndianDateTime(data?.created_at);

  return (
    <View className="p-1">
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={500}
        className={`relative flex-1 rounded-lg  p-4 border-2 shadow-sm ${
          selected
            ? "border-primary-start bg-primary-start/5"
            : "border-transparent bg-white"
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
        {isList ? (
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-lg font-bold" numberOfLines={2}>
              {trimText(data?.title)}
            </Text>
            <Text className="text-right text-sm text-gray-400">
              {createdAtLabel}
            </Text>
          </View>
        ) : (
          <>
            <Text className="mb-2 text-lg font-bold" numberOfLines={titleLines}>
              {trimText(data?.title)}
            </Text>
            {showsContent && (
              <Text
                className="text-base text-gray-500"
                numberOfLines={contentLines}
              >
                {trimText(data?.content)}
              </Text>
            )}
            {showsDate && (
              <Text className="mt-4 text-sm text-gray-400">
                {createdAtLabel}
              </Text>
            )}
          </>
        )}
      </Pressable>
    </View>
  );
};

export default NoteCard;
