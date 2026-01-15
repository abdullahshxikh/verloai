import { View, StyleSheet, Text } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../constants/theme';
import VoiceConversation from '../../components/VoiceConversation';
import { LEVELS } from '../../constants/levels';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LevelScreen() {
  const router = useRouter();
  const { id, data } = useLocalSearchParams();

  let level = LEVELS.find(l => l.id === id);

  // If it's a generated level, parse from params
  if (id === 'generated' && data) {
    try {
      level = JSON.parse(data as string);
    } catch (e) {
      console.error('Failed to parse generated level', e);
    }
  }

  const handleComplete = (uris: string[]) => {
    if (!level) return;

    // Pass level data to processing so Reveal knows what to score against
    // We can stick to standard processing for now, but maybe tag it with the level ID
    router.replace({
      pathname: '/processing',
      params: { uris: JSON.stringify(uris), levelId: level.id, levelXp: level.xp.toString() }
    });
  };

  const handleEndConversation = (uris: string[]) => {
    if (!level) return;

    // User manually ended - analyze their conversation
    router.replace({
      pathname: '/processing',
      params: { uris: JSON.stringify(uris), levelId: level.id, levelXp: level.xp.toString() }
    });
  };

  const handleExit = () => {
    router.back();
  };

  if (!level) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>Level not found</Text>
      </SafeAreaView>
    )
  }

  // State for avatar and voice
  // State for avatar and voice
  const [avatarSource, setAvatarSource] = useState(require('../../assets/lottie/talking_man.json'));
  const [voiceId, setVoiceId] = useState('daniel');

  // Removed complex rotation logic. Defaulting to Talking Man (Daniel) for consistency as requested.
  // If needed later, we can re-introduce logic here.

  // Construct scenario object for VoiceConversation
  const scenario = {
    title: level.title,
    opener: level.opener,
    role: level.aiCharacter.role,
    systemPrompt: level.systemPrompt
  };

  return (
    <View style={styles.container}>
      <VoiceConversation
        scenario={scenario}
        levelContext={level.context}
        onComplete={handleComplete}
        onExit={handleExit}
        onEndConversation={level.id !== '0' ? handleEndConversation : undefined}
        showEndButton={level.id !== '0'}
        avatarSource={avatarSource}
        voiceId={voiceId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});






