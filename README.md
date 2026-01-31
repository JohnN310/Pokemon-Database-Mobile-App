# PokéDex Expo App 🧩⚡

A sleek, high-performance Pokémon encyclopedia built with **React Native**, **Expo**, and **Expo Router**. This app leverages the **PokeAPI** to deliver real-time data on over **1,000 Pokémon**, featuring smooth animations, type-based filtering, and a persistent favorites system.

---

## 🚀 Features

### 🔍 Dynamic PokéDex
- Browse a comprehensive list of Pokémon
- Lazy-loading (pagination) for smooth scrolling and performance

### 🧠 Advanced Filtering
- **Search:** Real-time name-based Pokémon search
- **Type Filter:** Custom dropdown menu to filter Pokémon by elemental type
- **Quick-Type Access:** Tap any type badge on a Pokémon card to instantly filter the list by that type

### 🎨 Animated Details View
- Staggered animations for base stats (HP, Attack, Defense, etc.)
- Dynamic background gradients matching the Pokémon’s primary type

### ⭐ Favorites System
- Save favorite Pokémon using **AsyncStorage**
- Favorites persist even after restarting the app

### 🧩 Interactive UI
- Floating action buttons
- Custom spring animations on touch
- Hidden search bar that collapses on scroll to maximize screen space

---

## 🛠️ Tech Stack

- **Framework:** Expo (React Native)
- **Navigation:** Expo Router (file-based routing)
- **Styling:** React Native `StyleSheet` with `expo-linear-gradient`
- **Storage:** `@react-native-async-storage/async-storage`
- **Data Source:** PokeAPI

---

## 📂 Project Structure

app/
├── _layout.tsx         # Global navigation stack and modal presentation
├── index.tsx           # Home screen with searchable, paginated Pokémon list
├── details.tsx         # Pokémon detail screen with animated stats and gradients
├── FavoriteScreen.tsx  # View for managing and displaying favorite Pokémon

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
- git clone <repository-url>
- cd pokedex-expo-app

### 2️⃣ Install Dependencies
- npm install

### 3️⃣ Start the Development Server
- npx expo start

### 4️⃣ Run on a Device
- Mobile: Scan the QR code with the Expo Go app (iOS / Android)
- Android Emulator: Press a
- iOS Simulator: Press i

