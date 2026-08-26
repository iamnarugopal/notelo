import DetailHeader from "@/components/DetailHeader";
import { Note } from "@/types/note";
import { generateTitle } from "@/utils/common";
import { deleteNote, getNoteById, updateNote } from "@/utils/NoteStorage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NoteDetail = () => {
  const LINE_HEIGHT = 32;
  const router = useRouter();
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(edit === "true");
  const [editTarget, setEditTarget] = useState<"title" | "content">(
    edit === "true" ? "title" : "content",
  );
  const [contentHeight, setContentHeight] = useState(LINE_HEIGHT);
  const contentInputRef = useRef<TextInput>(null);
  const lastContentTapRef = useRef(0);

  const handleInput = (type: string, value: string) => {
    setNote((prev) => (prev ? { ...prev, [type]: value } : null));
  };

  const handleSubmit = async () => {
    if (!note || !id) return;

    const title = note.title.trim();
    const content = note.content.trim();

    try {
      if (!title && !content) {
        await deleteNote(Number(id));
        router.back();
        return;
      }
      const finalTitle = title || generateTitle(content);
      await updateNote(Number(id), finalTitle, content);

      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteNote(Number(id));
      router.back();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleBack = useCallback(async () => {
    if (!note || !id) {
      router.back();
      return;
    }

    const title = note.title.trim();
    const content = note.content.trim();

    try {
      // Empty note → delete it
      if (!title && !content) {
        await deleteNote(Number(id));
        router.back();
        return;
      }

      // Generate title from content if title is empty
      const finalTitle = title || generateTitle(content);

      // Save note
      await updateNote(Number(id), finalTitle, content);

      router.back();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  }, [note, id, router]);

  useEffect(() => {
    const loadNote = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const note = await getNoteById(Number(id));

        if (note) {
          setNote(note);
        }
      } catch (error) {
        console.error("Failed to load note:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [id]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      },
    );

    return () => subscription.remove();
  }, [handleBack]);

  useEffect(() => {
    if (!isEditMode || editTarget !== "content") return;

    requestAnimationFrame(() => contentInputRef.current?.focus());
  }, [editTarget, isEditMode]);

  const handleContentPress = () => {
    const now = Date.now();

    if (now - lastContentTapRef.current <= 300) {
      setEditTarget("content");
      setIsEditMode(true);
      lastContentTapRef.current = 0;
      return;
    }

    lastContentTapRef.current = now;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.centered}>
        <Text>Note not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1 bg-background">
          <DetailHeader
            note={note}
            handleInput={handleInput}
            handleSubmit={handleSubmit}
            handleBack={handleBack}
            handleDelete={handleDelete}
            isEditMode={isEditMode}
            editTarget={editTarget}
            setEditTarget={setEditTarget}
            setIsEditMode={setIsEditMode}
          />
          <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="relative">
              <View pointerEvents="none" className="absolute inset-0">
                {Array.from({ length: 50 }).map((_, index) => (
                  <View
                    key={index}
                    style={{ height: LINE_HEIGHT }}
                    className="border-b border-gray-200"
                  />
                ))}
              </View>
              <Pressable disabled={isEditMode} onPress={handleContentPress}>
                <TextInput
                  ref={contentInputRef}
                  multiline
                  editable={isEditMode}
                  pointerEvents={isEditMode ? "auto" : "none"}
                  textAlignVertical="top"
                  className="w-full text-xl bg-transparent ps-5 pe-5 z-10"
                  placeholder="Enter text here"
                  value={note?.content}
                  onChangeText={(value) => handleInput("content", value)}
                  onContentSizeChange={({ nativeEvent }) =>
                    setContentHeight(nativeEvent.contentSize.height)
                  }
                  style={{
                    height: Math.max(contentHeight, LINE_HEIGHT),
                    lineHeight: LINE_HEIGHT,
                    paddingTop: 8, // Matches the py-2 padding of the background container
                    paddingBottom: 8,
                  }}
                />
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NoteDetail;

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
