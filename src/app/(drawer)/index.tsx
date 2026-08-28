import AddButton from "@/components/AddButton";
import EmptyNotes from "@/components/EmptyNotes";
import HomeHeader from "@/components/HomeHeader";
import NoteCard from "@/components/NoteCard";
import { dummyTodos } from "@/constant/dummyTodos";
import { Note } from "@/types/note";
import {
  deleteAllNotes,
  deleteNote,
  getNotes,
  getViewMode,
  initializeDatabase,
  saveNote,
  saveViewMode,
  SortMode,
  ViewMode,
} from "@/utils/NoteStorage";
import { FlashList } from "@shopify/flash-list";
import { useIsFocused } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const isFocused = useIsFocused();
  const [data, setData] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("modified");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleAddDummy = async () => {
    try {
      await deleteAllNotes();
      await Promise.all(
        dummyTodos.map((note) => saveNote(note.title, note.content)),
      );
      setData(dummyTodos);
      setSelectedIds(new Set());
      setSelectionMode(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to add dummy notes:", error);
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

  const handleSelectAll = () => {
    setSelectedIds(
      isAllSelected ? new Set() : new Set(filteredData.map((note) => note.id)),
    );

    if (isAllSelected) {
      setSelectionMode(false);
    }
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

  const handleUnselect = async () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
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

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return data;
    }

    const normalizedQuery = searchQuery.toLowerCase();

    return data.filter((note) => {
      const title = note.title.toLowerCase();
      const content = note.content.toLowerCase();

      return (
        title.includes(normalizedQuery) || content.includes(normalizedQuery)
      );
    });
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((first, second) => {
      if (sortMode === "alphabetical") {
        return first.title.localeCompare(second.title);
      }

      const firstDate =
        sortMode === "created" ? first.created_at : first.updated_at;
      const secondDate =
        sortMode === "created" ? second.created_at : second.updated_at;

      return new Date(secondDate).getTime() - new Date(firstDate).getTime();
    });
  }, [filteredData, sortMode]);

  const numColumns = useMemo(() => {
    if (viewMode === "grid") {
      return 2;
    }

    if (viewMode === "griddetail") {
      return 3;
    }

    return 1;
  }, [viewMode]);

  const masonry = viewMode === "grid" || viewMode === "griddetail";

  const isDelete = selectedIds.size > 0;

  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((note) => selectedIds.has(note.id));

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
          sortMode={sortMode}
          onViewModeChange={handleViewModeChange}
          onSortModeChange={setSortMode}
          onAddDummy={handleAddDummy}
          onSearchQueryChange={setSearchQuery}
          selectionMode={selectionMode}
          totalCount={filteredData.length}
          selectedCount={selectedIds.size}
          handleUnselect={handleUnselect}
          handleSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
        />
        <AddButton isDelete={isDelete} handleDelete={handleDelete} />

        {filteredData.length > 0 ? (
          <FlashList
            key={viewMode}
            data={sortedData}
            numColumns={numColumns}
            masonry={masonry}
            keyExtractor={(item) => String(item?.id)}
            renderItem={({ item }) => (
              <NoteCard
                data={item}
                viewMode={viewMode}
                selectionMode={selectionMode}
                selected={selectedIds.has(item.id)}
                onLongPress={() => handleLongPress(item.id)}
                onSelect={() => handleSelect(item.id)}
              />
            )}
            contentContainerClassName="p-1"
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
