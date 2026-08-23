import { getAppLockEnabled, saveAppLockEnabled } from "@/utils/NoteStorage";
import { Host, Switch } from "@expo/ui";
import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

const Settings = () => {
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAppLockEnabled()
      .then(setEnabled)
      .catch(() => setEnabled(false));
  }, []);

  const handleAppLockChange = async (nextEnabled: boolean) => {
    if (saving) return;

    setSaving(true);

    try {
      if (!nextEnabled) {
        await saveAppLockEnabled(false);
        setEnabled(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Enable App Lock",
        promptDescription: "Confirm your device security to protect NoteLo.",
      });

      if (!result.success) {
        Alert.alert(
          "App Lock not enabled",
          "Device authentication was not completed.",
        );
        return;
      }

      await saveAppLockEnabled(true);
      setEnabled(true);
    } catch {
      Alert.alert("App Lock error", "The setting could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-5 py-5">
          <View className="bg-gray-200 px-5 py-3 rounded-lg">
            <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
              <Switch
                label="App Lock"
                value={enabled}
                disabled={saving}
                onValueChange={handleAppLockChange}
              />
            </Host>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;
