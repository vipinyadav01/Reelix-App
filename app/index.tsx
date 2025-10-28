import { View, Text } from 'react-native'
import { theme } from '@/constants/theme'

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.color.background.dark }}>
      <Text style={{ color: theme.colorWhite }}>Loading...</Text>
    </View>
  )
}