import { styles } from "@/styles/feed.styles";
import { View, Text, Image , TouchableOpacity } from "react-native";


type Story={
    id: string;
    username: string;
    avatar: string;
    isUserStory?: boolean;
};

export default function Story({ story }: { story: Story }) {
    return(
        <TouchableOpacity style={styles.storyWrapper}>
            <View style = {[styles.storyRing, !story.isUserStory && styles.noStory]}>
                <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
            </View>
            <Text style={styles.storyUsername} numberOfLines={1}>
                {story.username.length > 10 ? story.username.slice(0, 10) + "..." : story.username}
            </Text>
            </TouchableOpacity>
        );
    }
