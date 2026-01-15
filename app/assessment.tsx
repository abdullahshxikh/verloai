import { View, StyleSheet, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../constants/theme';
import VoiceConversation from '../components/VoiceConversation';
import { LEVELS } from '../constants/levels';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssessmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Determine the correct assessment based on the selected goal
  // Defaults to social if not found or unspecified
  const goal = (params.goal as string) || 'social';
  let levelId = 'assessment-social';

  if (['professional', 'leadership', 'networking'].includes(goal)) {
    levelId = 'assessment-professional';
  } else if (goal === 'dating') {
    levelId = 'assessment-dating';
  } else {
    levelId = 'assessment-social';
  }

  const assessmentLevel = LEVELS.find(l => l.id === levelId) || LEVELS.find(l => l.id === '0');

  const handleComplete = (uris: string[]) => {
    router.replace({
      pathname: '/processing',
      params: { ...params, uris: JSON.stringify(uris) }
    });
  };

  const handleExit = () => {
    router.back();
  };

  if (!assessmentLevel) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'white' }}>Error: Assessment level not found.</Text>
      </SafeAreaView>
    );
  }

  // Construct scenario object compatible with VoiceConversation
  const scenario = {
    title: assessmentLevel.title,
    opener: assessmentLevel.opener,
    role: assessmentLevel.aiCharacter.role,
    systemPrompt: assessmentLevel.systemPrompt
  };

  return (
    <View style={styles.container}>
      <VoiceConversation
        scenario={scenario}
        levelContext={assessmentLevel.context} // Pass context for the modal
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
