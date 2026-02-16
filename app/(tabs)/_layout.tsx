import { Tabs } from 'expo-router';
import { Home, User, Sparkles } from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 24,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDim,
        tabBarLabelStyle: {
          fontFamily: FONTS.bodyMedium,
          fontSize: 11,
          marginTop: 4,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 8,
              borderRadius: 12,
              backgroundColor: focused ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
            }}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="freestyle"
        options={{
          title: 'Freestyle',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 8,
              borderRadius: 12,
              backgroundColor: focused ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
            }}>
              <Sparkles size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 8,
              borderRadius: 12,
              backgroundColor: focused ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
            }}>
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      {/* Hidden tabs */}
      <Tabs.Screen
        name="practice"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="rizz"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}





