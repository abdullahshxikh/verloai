import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../constants/theme';
import VoiceConversation from '../components/VoiceConversation';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FreestyleSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const difficulty = parseInt(params.difficulty as string || '5', 10);

  const handleComplete = (uris: string[]) => {
    // This is for normal completion (after 4 turns)
    router.replace({
      pathname: '/processing',
      params: { uris: JSON.stringify(uris) }
    });
  };

  const handleEndConversation = (uris: string[]) => {
    // User manually ended the conversation - analyze it
    router.replace({
      pathname: '/processing',
      params: { uris: JSON.stringify(uris) }
    });
  };

  const handleExit = () => {
    router.back();
  };

  // Construct dynamic scenario based on difficulty
  const getSystemPrompt = (level: number) => {
    let tone = "friendly and casual";
    if (level > 3) tone = "professional but challenging";
    if (level > 6) tone = "critical, sharp, and high-pressure";
    if (level > 9) tone = "extremely difficult, skeptical, and argumentative";

    return `You are a Verlo Coach operating in Freestyle Mode (Difficulty: ${level}/10). 
    Your tone is ${tone}. 
    Engage the user in a conversation about any topic they choose, or challenge them if they are passive.
    If the user is doing well, ramp up the difficulty by asking tougher questions.
    If they struggle, guide them slightly but maintain the difficulty level.
    Keep responses concise (under 2 sentences) to keep the flow fast.`;
  };

  const scenario = {
    title: `Freestyle (Lvl ${difficulty})`,
    opener: "I'm ready. What's on your mind?",
    role: "Freestyle Coach",
    systemPrompt: getSystemPrompt(difficulty)
  };

  return (
    <View style={styles.container}>
      <VoiceConversation
        scenario={scenario}
        levelContext={null} // No context modal for freestyle
        onComplete={handleComplete}
        onExit={handleExit}
        onEndConversation={handleEndConversation}
        showEndButton={true}
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





