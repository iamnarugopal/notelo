import { Text, View } from "react-native";

import EmptyIcon from "@/assets/images/empty.svg";

const EmptyNotes = () => {
  return (
    <View className="items-center py-20 gap-10 px-10">
      <EmptyIcon width={100} height={100} />
      <Text className="text-2xl text-center text-gray-500">
        You haven’t added any notes. Tap the '+' to create your first one.
      </Text>
    </View>
  );
};

export default EmptyNotes;
