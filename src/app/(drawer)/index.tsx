import AddButton from "@/components/AddButton";
import EmptyNotes from "@/components/EmptyNotes";
import HomeHeader from "@/components/HomeHeader";
import NoteCard from "@/components/NoteCard";
import { Note } from "@/types/note";
import {
  deleteNote,
  getNotes,
  getViewMode,
  initializeDatabase,
  saveViewMode,
  ViewMode,
} from "@/utils/NoteStorage";
import { FlashList } from "@shopify/flash-list";
import { useIsFocused } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const isFocused = useIsFocused();
  const [data, setData] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const loadNotes = async () => {
    try {
      await initializeDatabase();
      const fetchedNotes = await getNotes();
      setData(fetchedNotes);
    } catch (error) {
      console.error("Failed to load secure notes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reload notes every time the page comes into view
  useEffect(() => {
    if (isFocused) {
      loadNotes();
    }
  }, [isFocused]);

  // useEffect(() => {
  //   if (resetDatabase) {
  //     (async () => {
  //       await resetDatabase();
  //     })();
  //   }
  // }, []);

  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode);

    try {
      await saveViewMode(mode);
    } catch (error) {
      console.error("Failed to save view mode:", error);
    }
  };

  const handleLongPress = (id: number) => {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      if (next.size === 0) {
        setSelectionMode(false);
      }

      return next;
    });
  };

  const handleDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => deleteNote(id)));
      setData((prev) => prev.filter((note) => !selectedIds.has(note.id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error("Failed to delete selected notes:", error);
    }
  };

  useEffect(() => {
    const loadViewMode = async () => {
      try {
        const mode = await getViewMode();
        setViewMode(mode);
      } catch (error) {
        console.error("Failed to load view mode:", error);
      }
    };

    loadViewMode();
  }, []);

  const isDelete = selectedIds.size > 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View className="flex-1 bg-background relative">
        <HomeHeader
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
        <AddButton isDelete={isDelete} handleDelete={handleDelete} />

        {data?.length > 0 ? (
          <FlashList
            data={data}
            numColumns={viewMode === "list" ? 1 : 2}
            masonry={viewMode === "grid"}
            keyExtractor={(item) => String(item?.id)}
            renderItem={({ item }) => (
              <NoteCard
                data={item}
                selectionMode={selectionMode}
                selected={selectedIds.has(item.id)}
                onLongPress={() => handleLongPress(item.id)}
                onSelect={() => handleSelect(item.id)}
              />
            )}
            contentContainerClassName="p-2"
            // columnWrapperClassName="gap-4"
            className="flex-1"
          />
        ) : (
          <EmptyNotes />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
