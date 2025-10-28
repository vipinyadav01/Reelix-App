# Reelix App 📱

A modern social media application built with React Native, Expo, and real-time backend integration. Reelix combines the best features of popular social platforms with a sleek, dark-themed interface.

## 🚀 Features

### Current Implementation

- **User Authentication**: Secure login/signup with Clerk
- **Real-time Feed**: Dynamic posts with likes, comments, and interactions
- **Stories System**: Instagram-style stories with view tracking
- **User Profiles**: Comprehensive profile pages with posts grid
- **Follow System**: Follow/unfollow users with real-time updates
- **Comments**: Interactive commenting system with real-time updates
- **Bookmarks**: Save and organize favorite posts
- **Modern UI**: Dark theme with smooth animations and responsive design

### Technical Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Authentication**: Clerk
- **Backend**: Convex (real-time database)
- **Styling**: React Native StyleSheet with custom theme
- **State Management**: React Hooks with custom hooks
- **Real-time**: Convex real-time queries and mutations

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Reelix-App
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Create a `.env` file in the root directory
   - Add your Clerk and Convex environment variables:

   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   EXPO_PUBLIC_CONVEX_URL=your_convex_url
   ```

4. **Start the development server**

   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## 📱 App Structure

```
app/
├── (auth)/           # Authentication screens
├── (tabs)/           # Main app tabs (Home, Profile, etc.)
├── profile/          # User profile screens
├── _layout.tsx       # Root layout with providers
└── index.tsx         # Entry point

components/
├── Post.tsx          # Post component with interactions
├── Story.tsx         # Individual story circle
├── Stories.tsx       # Stories horizontal scroll
├── CommentsModal.tsx # Comments modal
└── ...

hooks/
├── useProfileScreen.ts    # Profile data management
├── useProfileIntegration.ts # Profile integration logic
├── useSystemMonitoring.ts  # Real-time monitoring
└── ...

convex/
├── schema.ts         # Database schema
├── user.ts          # User-related queries/mutations
├── posts.ts         # Posts functionality
└── stories.ts       # Stories system

## 🧭 Where to find features

- Stories bar: `app/(tabs)/index.tsx` via `components/Stories.tsx`
- Story circle: `components/Story.tsx` (always shows + for your profile)
- Add story flow: `hooks/useAddStory.ts` (camera or gallery upload, routes to edit)
- Story viewer: `app/story/[id].tsx` (tap/hold navigation, viewers sheet)
- Story edit screen: `app/story/edit.tsx` (preview + Public / Close Friends)
- Backend:
  - `convex/schema.ts` (tables: stories, storyViews, storyMetrics)
  - `convex/stories.ts` (queries/mutations: upload, metrics, viewers)
```

## 🔧 Key Features Implementation

### Real-time Stories

- 24-hour expiration with backend filtering
- Always-visible add button on your story circle
- Add story from Camera or Gallery (image/video)
- Viewer list (author-only): usernames, view count, and replays
- Engagement metrics (impressions, reach, taps forward/back)
- Smooth viewer: tap right/left to navigate, long-press to pause/seek
- Accurate progress bar per story (pauses/resumes and advances automatically)
- Video playback migrated to expo-video with async source replacement
- Story deletion by author (trash icon in viewer)
- Story ring states: new (primary), viewed (gray), uploading (spinning ring)
- Edit screen with Share Public and Close Friends (coming soon)

### User Profiles

- Dynamic profile pages for any user
- Posts grid with lazy loading
- Follow/unfollow functionality
- Profile editing capabilities

### Feed System

- Infinite scroll with optimized performance
- Real-time updates for likes, comments, follows
- Story integration at the top

### Authentication Flow

- Secure Clerk integration
- User data synchronization with Convex
- Protected routes and navigation

### UI/UX

- Glassmorphism tab bar using BlurView with gradient overlay
- Dark/light adaptive tab icon colors

## 🚧 Future Implementation Plans

### Phase 1: Enhanced Social Features

- [ ] **Direct Messaging**: Real-time chat system
- [ ] **Video Posts**: Support for video content
- [ ] **Live Streaming**: Real-time video streaming
- [ ] **Advanced Search**: User and content search
- [ ] **Notifications**: Push notifications for interactions

### Phase 2: Content & Discovery

- [ ] **Explore Page**: Algorithm-based content discovery
- [ ] **Hashtags**: Content categorization and trending
- [ ] **Reels/Short Videos**: TikTok-style short content
- [ ] **Content Moderation**: AI-powered content filtering
- [ ] **Analytics**: User engagement metrics

### Phase 3: Advanced Features

- [ ] **Stories Highlights**: Permanent story collections
- [ ] **Group Stories**: Collaborative story creation
- [ ] **AR Filters**: Augmented reality effects
- [ ] **Monetization**: Creator tools and revenue sharing
- [ ] **Multi-language**: Internationalization support

### Phase 4: Platform Expansion

- [ ] **Web Version**: React web application
- [ ] **Desktop App**: Electron-based desktop client
- [ ] **API Integration**: Third-party service integrations
- [ ] **Advanced Analytics**: Detailed user insights
- [ ] **Enterprise Features**: Business account tools

## 🎨 Design System

The app uses a consistent dark theme with:

- **Primary Color**: Custom green accent
- **Background**: Deep dark tones
- **Typography**: JetBrains Mono for headers, system fonts for body
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Optimized for various screen sizes

## 🔒 Security & Privacy

- End-to-end encryption for sensitive data
- Secure authentication with Clerk
- Privacy controls for user content
- GDPR compliance features
- Content moderation tools

## 📊 Performance Optimizations

- Lazy loading for images and content
- Optimized database queries
- Efficient state management
- Memory leak prevention
- Smooth 60fps animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ using React Native, Expo, and Convex**
