import React, { useState, useRef } from "react";
import { View, Dimensions, Text, Image } from "react-native";
import PagerView from "react-native-pager-view";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
}

export function MediaCarousel({ media }: MediaCarouselProps) {
  const [activePage, setActivePage] = useState(0);

  if (media.length === 0) return null;

  // Single media item - no pager needed
  if (media.length === 1) {
    return (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}>
        <MediaContent item={media[0]} />
      </View>
    );
  }

  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}>
      <PagerView
        className="flex-1"
        initialPage={0}
        onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
      >
        {media.map((item, index) => (
          <View key={item.id || index} className="flex-1">
            <MediaContent item={item} />
          </View>
        ))}
      </PagerView>

      {/* Pagination Indicators */}
      <View className="absolute -bottom-5 flex-row self-center">
        {media.map((_, index) => (
          <View
            key={index}
            className={`w-1.5 h-1.5 rounded-full mx-0.5 ${
              activePage === index ? "bg-primary" : "bg-neutral-500"
            }`}
          />
        ))}
      </View>
      
      {/* Page count badge */}
      <View className="absolute top-2.5 right-2.5 bg-black/60 px-2 py-1 rounded-xl">
        <Text className="text-white text-xs font-bold">
          {activePage + 1}/{media.length}
        </Text>
      </View>
    </View>
  );
}

function MediaContent({ item }: { item: MediaItem }) {
  const video = useRef(null);

  if (item.type === "video") {
    return (
      <View className="flex-1 bg-neutral-800 justify-center items-center">
        <Video
            ref={video}
            source={{ uri: item.url }}
            style={{ width: "100%", height: "100%" }}
            resizeMode={ResizeMode.COVER}
            useNativeControls
            isLooping
            shouldPlay={true}
            isMuted={true}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-800 justify-center items-center">
      <Image 
        source={{ uri: item.url }} 
        className="w-full h-full" 
        resizeMode="cover"
      />
    </View>
  );
}
