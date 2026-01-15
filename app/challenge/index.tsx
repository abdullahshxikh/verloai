import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import VoiceConversation from '../../components/VoiceConversation';

export default function ChallengeScreen() {
  const router = useRouter();

  // Challenge Configuration
  const challengeScenario = {
    title: "Master the Pause",
    opener: "Hey! Let's practice that pause. Tell me about your morning, but take a full breath before you start.",
    role: "A friendly communication coach"
  };

  const handleComplete = (uris: string[]) => {
    // For challenge, we go to feedback
    router.replace('/challenge/feedback');
  };

  const handleExit = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <VoiceConversation 
        scenario={challengeScenario} 
        onComplete={handleComplete}
        onExit={handleExit}
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
