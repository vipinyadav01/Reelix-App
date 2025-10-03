import { View, Text } from 'react-native'
import { COLORS } from '@/constants/theme'

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Text style={{ color: COLORS.white }}>Loading...</Text>
    </View>
  )
}