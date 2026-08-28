import DetailHeader from "@/components/DetailHeader";
import { Note } from "@/types/note";
import { generateTitle } from "@/utils/common";
import { deleteNote, getNoteById, updateNote } from "@/utils/NoteStorage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Redo, Undo } from "lucide-react-native";
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
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LINE_HEIGHT = 32;
const HISTORY_GROUP_DELAY = 700;

type NoteTextField = "title" | "content";
type NoteSnapshot = Pick<Note, "title" | "content">;

type HistoryEntry = {
  snapshot: NoteSnapshot;
  field: NoteTextField;
  timestamp: number;
};

const NoteDetail = () => {
  const router = useRouter();

  const { id, edit } = useLocalSearchParams<{
    id: string;
    edit?: string;
  }>();

  const [note, setNote] = useState<Note | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<NoteSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditMode, setIsEditMode] = useState(edit === "true");
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);

  const [editTarget, setEditTarget] = useState<"title" | "content">(
    edit === "true" ? "title" : "content",
  );

  /**
   * Height available for the editor before scrolling is needed.
   */
  const [editorHeight, setEditorHeight] = useState(0);

  /**
   * Actual height required by the TextInput content.
   */
  const [contentHeight, setContentHeight] = useState(0);

  const contentInputRef = useRef<TextInput>(null);
  const lastContentTapRef = useRef(0);
  const noteRef = useRef<Note | null>(null);
  const savedMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const undoStackRef = useRef<HistoryEntry[]>([]);
  const redoStackRef = useRef<HistoryEntry[]>([]);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [historyState, setHistoryState] = useState({
    canUndo: false,
    canRedo: false,
  });

  const updateHistoryState = () => {
    setHistoryState({
      canUndo: undoStackRef.current.length > 0,
      canRedo: redoStackRef.current.length > 0,
    });
  };

  const clearHistoryTimer = () => {
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
  };

  const setCurrentNote = (snapshot: NoteSnapshot) => {
    const currentNote = noteRef.current;

    if (!currentNote) return;

    const nextNote = { ...currentNote, ...snapshot };
    noteRef.current = nextNote;
    setNote(nextNote);
  };

  const hasUnsavedChanges = Boolean(
    note &&
    savedSnapshot &&
    (note.title.trim() !== savedSnapshot.title.trim() ||
      note.content.trim() !== savedSnapshot.content.trim()),
  );

  const showSavedMessage = useCallback(() => {
    if (Platform.OS === "android") {
      ToastAndroid.show("Note saved", ToastAndroid.SHORT);
      return;
    }

    setSavedMessageVisible(true);
    if (savedMessageTimerRef.current) {
      clearTimeout(savedMessageTimerRef.current);
    }
    savedMessageTimerRef.current = setTimeout(() => {
      setSavedMessageVisible(false);
      savedMessageTimerRef.current = null;
    }, 1800);
  }, []);

  const handleInput = (type: string, value: string) => {
    if (type !== "title" && type !== "content") return;

    const previousNote = noteRef.current;

    if (!previousNote || previousNote[type] === value) return;

    const now = Date.now();
    const lastEntry = undoStackRef.current.at(-1);
    const startsNewWord = /\s$/.test(previousNote[type]);
    const startsNewGroup =
      !lastEntry ||
      lastEntry.field !== type ||
      startsNewWord ||
      now - lastEntry.timestamp > HISTORY_GROUP_DELAY;

    if (startsNewGroup) {
      undoStackRef.current.push({
        snapshot: {
          title: previousNote.title,
          content: previousNote.content,
        },
        field: type,
        timestamp: now,
      });
    } else {
      lastEntry.timestamp = now;
    }

    redoStackRef.current = [];
    setCurrentNote({
      title: previousNote.title,
      content: previousNote.content,
      [type]: value,
    });
    updateHistoryState();

    clearHistoryTimer();
    historyTimerRef.current = setTimeout(() => {
      historyTimerRef.current = null;
      updateHistoryState();
    }, HISTORY_GROUP_DELAY);
  };

  const handleUndo = () => {
    const currentNote = noteRef.current;
    const entry = undoStackRef.current.pop();

    if (!currentNote || !entry) return;

    clearHistoryTimer();
    redoStackRef.current.push({
      snapshot: { title: currentNote.title, content: currentNote.content },
      field: entry.field,
      timestamp: Date.now(),
    });
    setCurrentNote(entry.snapshot);
    updateHistoryState();
  };

  const handleRedo = () => {
    const currentNote = noteRef.current;
    const entry = redoStackRef.current.pop();

    if (!currentNote || !entry) return;

    clearHistoryTimer();
    undoStackRef.current.push({
      snapshot: { title: currentNote.title, content: currentNote.content },
      field: entry.field,
      timestamp: Date.now(),
    });
    setCurrentNote(entry.snapshot);
    updateHistoryState();
  };

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (!note || !id) return false;

    const title = note.title.trim();
    const content = note.content.trim();

    try {
      if (!title && !content) {
        await deleteNote(Number(id));
        router.back();
        return true;
      }

      const finalTitle = title || generateTitle(content);

      await updateNote(Number(id), finalTitle, content);

      noteRef.current = { ...note, title: finalTitle, content };
      setNote(noteRef.current);
      setSavedSnapshot({ title: finalTitle, content });
      setIsEditMode(false);
      return true;
    } catch (error) {
      console.error("Failed to save note:", error);
      return false;
    }
  }, [id, note, router]);

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

    if (isEditMode && hasUnsavedChanges) {
      if (await handleSubmit()) {
        showSavedMessage();
      }
      return;
    }

    if (isEditMode) {
      setIsEditMode(false);
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

      router.back();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  }, [
    hasUnsavedChanges,
    handleSubmit,
    id,
    isEditMode,
    note,
    router,
    showSavedMessage,
  ]);

  /**
   * Load note.
   */
  useEffect(() => {
    const loadNote = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const loadedNote = await getNoteById(Number(id));

        if (loadedNote) {
          noteRef.current = loadedNote;
          setSavedSnapshot({
            title: loadedNote.title,
            content: loadedNote.content,
          });
          setNote(loadedNote);
        }
      } catch (error) {
        console.error("Failed to load note:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [id]);

  useEffect(() => clearHistoryTimer, []);

  useEffect(() => {
    return () => {
      if (savedMessageTimerRef.current) {
        clearTimeout(savedMessageTimerRef.current);
      }
    };
  }, []);

  /**
   * Android hardware back.
   */
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

  /**
   * Focus content when entering content edit mode.
   */
  useEffect(() => {
    if (!isEditMode || editTarget !== "content") {
      return;
    }

    requestAnimationFrame(() => {
      contentInputRef.current?.focus();
    });
  }, [editTarget, isEditMode]);

  /**
   * Double tap content to enter edit mode.
   */
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

  /**
   * Handle TextInput content size.
   *
   * Important:
   * We only update when the rounded height actually changes.
   * This prevents unnecessary layout updates/flickering.
   */
  const handleContentSizeChange = ({
    nativeEvent,
  }: {
    nativeEvent: {
      contentSize: {
        height: number;
      };
    };
  }) => {
    const measuredHeight = nativeEvent.contentSize.height;
    const requiredHeight =
      Math.ceil(measuredHeight / LINE_HEIGHT) * LINE_HEIGHT;

    setContentHeight((previous) => {
      if (previous === requiredHeight) {
        return previous;
      }

      return requiredHeight;
    });
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

  /**
   * The editor should initially occupy the whole available area.
   *
   * Once content becomes larger than this area,
   * the TextInput grows and ScrollView becomes scrollable.
   */
  const actualInputHeight = Math.max(editorHeight, contentHeight, LINE_HEIGHT);

  /**
   * Number of notebook lines required for the current content.
   */
  const lineCount = Math.ceil(actualInputHeight / LINE_HEIGHT);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 bg-background">
          <DetailHeader
            note={note}
            handleInput={handleInput}
            handleSubmit={handleSubmit}
            handleBack={handleBack}
            handleDelete={handleDelete}
            isEditMode={isEditMode}
            isBackDisabled={isEditMode && hasUnsavedChanges}
            editTarget={editTarget}
            setEditTarget={setEditTarget}
            setIsEditMode={setIsEditMode}
          />

          {savedMessageVisible && (
            <View className="absolute bottom-6 self-center rounded-full bg-black px-4 py-2">
              <Text className="text-white">Note saved</Text>
            </View>
          )}

          <ScrollView
            className="flex-1 bg-background"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
            }}
            onLayout={({ nativeEvent }) => {
              setEditorHeight(nativeEvent.layout.height);
            }}
          >
            <View
              style={{
                minHeight: editorHeight,
              }}
            >
              {/* Notebook lines */}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: Math.max(editorHeight, contentHeight),
                }}
              >
                {Array.from({
                  length: Math.ceil(
                    Math.max(editorHeight, contentHeight) / LINE_HEIGHT,
                  ),
                }).map((_, index) => (
                  <View
                    key={index}
                    className="border-gray-300"
                    style={{
                      height: LINE_HEIGHT,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
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
                  placeholder="Enter text here"
                  placeholderTextColor="#9ca3af"
                  value={note.content}
                  onChangeText={(value) => handleInput("content", value)}
                  onContentSizeChange={handleContentSizeChange}
                  style={{
                    width: "100%",
                    height: Math.max(editorHeight, contentHeight),

                    lineHeight: LINE_HEIGHT,
                    fontSize: 20,

                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingHorizontal: 20,

                    backgroundColor: "transparent",
                    includeFontPadding: false,
                  }}
                />
              </Pressable>
            </View>
          </ScrollView>
          {isEditMode && (
            <View className="bg-background border-t border-gray-400 items-center flex-row justify-center">
              <TouchableOpacity
                accessibilityLabel="Undo"
                disabled={!historyState.canUndo}
                onPress={handleUndo}
                className="size-16 items-center justify-center"
                style={{ opacity: historyState.canUndo ? 1 : 0.35 }}
              >
                <Undo color="#000" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Redo"
                disabled={!historyState.canRedo}
                onPress={handleRedo}
                className="size-16 items-center justify-center"
                style={{ opacity: historyState.canRedo ? 1 : 0.35 }}
              >
                <Redo color="#000" size={24} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NoteDetail;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
