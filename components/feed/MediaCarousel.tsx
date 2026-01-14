import React, { useState, useRef } from "react";
import { View, Dimensions, Text, Image, ScrollView } from "react-native";
import { Video, ResizeMode } from "expo-av";

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
  const scrollViewRef = useRef<ScrollView>(null);

  if (media.length === 0) return null;

  // Single media item - no pager needed
  if (media.length === 1) {
    return (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}>
        <MediaContent item={media[0]} />
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setActivePage(page);
  };

  // Multiple media items
  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
      >
        {media.map((item) => (
          <View key={item.id} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}>
            <MediaContent item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Page Indicator */}
      <View className="absolute top-3 right-3 bg-black/60 px-2.5 py-1 rounded-full">
        <Text className="text-white text-xs font-semibold">
          {activePage + 1}/{media.length}
        </Text>
      </View>

      {/* Dots Indicator */}
      <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
        {media.map((_, index) => (
          <View
            key={index}
            className={`w-1.5 h-1.5 rounded-full ${
              index === activePage ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </View>
    </View>
  );
}

function MediaContent({ item }: { item: MediaItem }) {
  if (item.type === "video") {
    return (
      <Video
        source={{ uri: item.url }}
        style={{ width: "100%", height: "100%" }}
        resizeMode={ResizeMode.COVER}
        useNativeControls
        isLooping
        shouldPlay={false}
      />
    );
  }

  return (
    <Image
      source={{ uri: item.url }}
      style={{ width: "100%", height: "100%" }}
      resizeMode="cover"
    />
  );
}
