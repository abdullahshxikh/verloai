import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, FlatList, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Send, X, Clock, ChevronRight, MessageCircle, Trash2, Zap, Flame, Star, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { InworldService } from '../../services/inworld';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

const RIZZ_TIPS = [
  { icon: Flame, title: "Be Confident", tip: "Confidence is magnetic. Own your words." },
  { icon: Star, title: "Be Genuine", tip: "Authenticity beats pickup lines every time." },
  { icon: Zap, title: "Be Witty", tip: "A well-timed joke breaks the ice perfectly." },
  { icon: Heart, title: "Be Attentive", tip: "Listen and respond to what they actually say." },
];

export default function RizzScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPastChats, setShowPastChats] = useState(false);
  const [pastChats, setPastChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadPastChats();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadPastChats = async () => {
    try {
      const stored = await AsyncStorage.getItem('rizz_chats');
      if (stored) {
        setPastChats(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load past chats', e);
    }
  };

  const saveCurrentChat = async () => {
    if (messages.length === 0) return;

    try {
      const chatId = currentChatId || `chat_${Date.now()}`;
      const title = messages[0].content.substring(0, 40) + (messages[0].content.length > 40 ? '...' : '');

      const newChat: Chat = {
        id: chatId,
        title,
        messages,
        createdAt: Date.now(),
      };

      const existingChats = pastChats.filter(c => c.id !== chatId);
      const updatedChats = [newChat, ...existingChats].slice(0, 20); // Keep last 20 chats

      await AsyncStorage.setItem('rizz_chats', JSON.stringify(updatedChats));
      setPastChats(updatedChats);
      setCurrentChatId(chatId);
    } catch (e) {
      console.error('Failed to save chat', e);
    }
  };

  const loadChat = (chat: Chat) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setShowPastChats(false);
  };

  const deleteChat = async (chatId: string) => {
    try {
      const updatedChats = pastChats.filter(c => c.id !== chatId);
      await AsyncStorage.setItem('rizz_chats', JSON.stringify(updatedChats));
      setPastChats(updatedChats);
    } catch (e) {
      console.error('Failed to delete chat', e);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInputText('');
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const baseSystemPrompt = `You are "Rizz AI" - the ultimate texting wingman and dating coach. You're like a best friend who happens to be incredible at flirting and knows exactly what to say.

CORE PERSONALITY:
- Confident, playful, and genuinely helpful
- You speak like a cool friend, not a formal assistant
- Sharp wit with perfect timing
- You understand Gen-Z/millennial dating culture deeply

YOUR EXPERTISE:
- Crafting first messages that actually get replies
- Turning boring convos into engaging ones
- Knowing when to be bold vs. subtle
- Reading between the lines of what someone texts
- Recovery moves when things get awkward

RESPONSE STYLE:
- Give 2-3 message options ranked from safe to bold
- Explain the psychology behind WHY each works
- Use relevant emojis naturally
- Keep it real - if their approach is off, tell them
- Be specific to their situation, never generic

NEVER DO:
- Be creepy, manipulative, or disrespectful
- Give boring "just be yourself" advice
- Be overly formal or robotic
- Ignore red flags they should know about

You're here to help them become genuinely more charismatic and confident in how they communicate.`;

      const response = await InworldService.generateChallengeResponse(history, baseSystemPrompt);

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: "Hmm, I hit a snag. Try asking again!",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
    setTimeout(() => saveCurrentChat(), 500);
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={COLORS.secondaryGradient}
              style={styles.assistantAvatar}
            >
              <Heart size={16} color="#fff" />
            </LinearGradient>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}>
            {message.content}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={['rgba(255, 118, 117, 0.2)', 'rgba(255, 118, 117, 0.05)']}
          style={styles.heroGradient}
        >
          <View style={styles.heroIconContainer}>
            <LinearGradient
              colors={COLORS.secondaryGradient}
              style={styles.heroIcon}
            >
              <Heart size={32} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Rizz AI</Text>
          <Text style={styles.heroSubtitle}>Your personal texting wingman</Text>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setInputText("How do I keep a conversation going when it starts to die out?")}
        >
          <LinearGradient
            colors={['rgba(108, 92, 231, 0.15)', 'rgba(108, 92, 231, 0.05)']}
            style={styles.actionGradient}
          >
            <View style={styles.actionIconContainer}>
              <Zap size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>Revive a Convo</Text>
            <Text style={styles.actionDesc}>Save a dying conversation</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setInputText("I need help crafting a first message to someone I matched with")}
        >
          <LinearGradient
            colors={['rgba(0, 206, 201, 0.15)', 'rgba(0, 206, 201, 0.05)']}
            style={styles.actionGradient}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(0, 206, 201, 0.2)' }]}>
              <MessageCircle size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.actionTitle}>First Message Help</Text>
            <Text style={styles.actionDesc}>Craft the perfect opener</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Tips Carousel */}
      <Text style={styles.tipsHeader}>Quick Tips</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tipsContainer}
      >
        {RIZZ_TIPS.map((tip, index) => (
          <View key={index} style={styles.tipCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.tipGradient}
            >
              <tip.icon size={20} color={COLORS.secondary} />
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Past Chats Button */}
      {pastChats.length > 0 && (
        <TouchableOpacity style={styles.pastChatsButton} onPress={() => setShowPastChats(true)}>
          <Clock size={18} color={COLORS.textDim} />
          <Text style={styles.pastChatsText}>View Past Conversations ({pastChats.length})</Text>
          <ChevronRight size={18} color={COLORS.textDim} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F11', '#1a1a2e', '#0F0F11']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        {messages.length > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={startNewChat}>
            <ArrowLeft size={20} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerLeft}>
            <Heart size={20} color={COLORS.secondary} />
            <Text style={styles.headerTitle}>Rizz AI</Text>
          </View>
        )}

        <View style={styles.headerRight}>
          {pastChats.length > 0 && (
            <TouchableOpacity style={styles.historyButton} onPress={() => setShowPastChats(true)}>
              <Clock size={20} color={COLORS.textDim} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        {messages.length === 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderEmptyState()}
          </ScrollView>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message, index) => renderMessage(message, index))}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color={COLORS.secondary} />
                  <Text style={styles.loadingText}>Crafting the perfect response...</Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask for texting help..."
              placeholderTextColor={COLORS.textDim}
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={inputText.trim() ? COLORS.secondaryGradient : [COLORS.surfaceLight, COLORS.surfaceLight]}
              style={styles.sendButtonGradient}
            >
              <Send size={20} color={inputText.trim() ? '#fff' : COLORS.textDim} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Past Chats Modal */}
      <Modal visible={showPastChats} transparent animationType="slide">
        <View style={styles.pastChatsOverlay}>
          <View style={styles.pastChatsContent}>
            <View style={styles.pastChatsHeader}>
              <Text style={styles.pastChatsTitle}>Past Conversations</Text>
              <TouchableOpacity onPress={() => setShowPastChats(false)}>
                <X size={24} color={COLORS.textDim} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={pastChats}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chatItem}
                  onPress={() => loadChat(item)}
                >
                  <View style={styles.chatItemLeft}>
                    <View style={styles.chatItemIcon}>
                      <MessageCircle size={18} color={COLORS.secondary} />
                    </View>
                    <View style={styles.chatItemInfo}>
                      <Text style={styles.chatItemTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.chatItemDate}>
                        {new Date(item.createdAt).toLocaleDateString()} • {item.messages.length} messages
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteChat(item.id)}
                  >
                    <Trash2 size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyChats}>
                  <Text style={styles.emptyChatsText}>No past conversations yet</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    padding: SPACING.l,
  },
  heroContainer: {
    marginBottom: SPACING.xl,
  },
  heroGradient: {
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 117, 0.2)',
  },
  heroIconContainer: {
    marginBottom: SPACING.m,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.xl,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: SPACING.m,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minHeight: 140,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    textAlign: 'center',
  },
  tipsHeader: {
    fontSize: 16,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  tipsContainer: {
    paddingRight: SPACING.l,
    gap: 12,
  },
  tipCard: {
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tipGradient: {
    padding: SPACING.m,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  tipTitle: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    lineHeight: 16,
  },
  pastChatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.m,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    gap: 8,
  },
  pastChatsText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textDim,
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.m,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 10,
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: SPACING.m,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  messageText: {
    fontSize: 15,
    fontFamily: FONTS.body,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: COLORS.text,
  },
  loadingContainer: {
    marginBottom: SPACING.m,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
    backgroundColor: COLORS.background,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.m,
    paddingVertical: 12,
    color: COLORS.text,
    fontFamily: FONTS.body,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastChatsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  pastChatsContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '80%',
  },
  pastChatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  pastChatsTitle: {
    fontSize: 20,
    fontFamily: FONTS.displaySemi,
    color: COLORS.text,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.m,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginBottom: 10,
  },
  chatItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 118, 117, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatItemInfo: {
    flex: 1,
  },
  chatItemTitle: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
    marginBottom: 2,
  },
  chatItemDate: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 118, 117, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChats: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyChatsText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
  },
});
