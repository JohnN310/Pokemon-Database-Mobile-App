import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Pokemon {
  name: string;
  url: string;
  image?: string;
  imageBack?: string;
  types?: { type: { name: string } }[];
}

const colorByType: Record<string, string> = {
  grass: "#78C850",
  fire: "#F08030",
  water: "#6890F0",
  bug: "#A8B820",
  normal: "#A8A878",
  poison: "#A040A0",
  electric: "#F8D030",
  ground: "#E0C068",
  fairy: "#EE99AC",
  fighting: "#C03028",
  psychic: "#F85888",
  rock: "#B8A038",
  ghost: "#705898",
  ice: "#98D8D8",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  flying: "#A890F0",
};

// --- CONSTANTS FOR LOADING AND ANIMATION ---
const HEADER_TOP_PADDING = 40;
const SEARCH_BAR_HEIGHT = 48;
const HEADER_HIDE_DISTANCE = SEARCH_BAR_HEIGHT + 10;
const TOP_OFFSET = HEADER_TOP_PADDING + 10;

const INITIAL_LOAD_COUNT = 50;
const LOAD_MORE_COUNT = 30;
// ------------------------------------------

export default function HomeScreen() {
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [visiblePokemons, setVisiblePokemons] = useState<Pokemon[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [typeAnimationValue] = useState(new Animated.Value(1));
  const [loadCount, setLoadCount] = useState(INITIAL_LOAD_COUNT); // New state for Load More

  const scrollY = new Animated.Value(0);
  const router = useRouter();

  // Load favorites from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("favorites").then((data) => {
      if (data) setFavorites(JSON.parse(data));
    });
  }, []);

  // Initial fetch of all Pokémon names and URLs
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
      .then((res) => res.json())
      .then((data) => {
        setAllPokemons(data.results);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtering and Load Count Logic
  useEffect(() => {
    let filtered = allPokemons;

    // 1. Filter by search text
    if (searchText) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 2. Filter by selected type
    if (selectedType) {
      filtered = filtered.filter((p) =>
        p.types?.some((t) => t.type.name === selectedType)
      );
    }

    // 3. Apply Load Count limit to the filtered list
    // This is crucial: we limit the *rendered* list, not the full search result.
    const limitedFiltered = filtered.slice(0, loadCount);
    
    setVisiblePokemons(limitedFiltered);
  }, [searchText, selectedType, allPokemons, loadCount]); 

  // Detail fetching (Images and Types) for currently visible Pokémon
  useEffect(() => {
    visiblePokemons.forEach(async (p) => {
      if (!p.image && p.url) {
        try {
          const res = await fetch(p.url);
          const details = await res.json();
          const updatedPokemon = {
            ...p,
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            types: details.types,
          };
          
          // Update the visiblePokemons list
          setVisiblePokemons(prev => 
            prev.map(item => item.name === p.name ? updatedPokemon : item)
          );
          
          // Update the allPokemons list so filters work correctly on full data set
          setAllPokemons(prev => 
            prev.map(item => item.name === p.name ? updatedPokemon : item)
          );
        } catch (error) {
          console.error(`Failed to fetch details for ${p.name}:`, error);
        }
      }
    });
  }, [visiblePokemons]);


  const toggleFavorite = async (name: string) => {
    let updated: string[] = [];
    if (favorites.includes(name)) {
      updated = favorites.filter((f) => f !== name);
    } else {
      updated = [...favorites, name];
    }
    setFavorites(updated);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  };

  // Handler for selecting type from the main dropdown filter
  const handleTypeSelect = (type: string) => {
    const newType = selectedType === type ? null : type;
    setSelectedType(newType);
    setIsFilterVisible(false);
    // When filtering by type, reset the load count to initial size
    setLoadCount(INITIAL_LOAD_COUNT); 
  };
  
  // Handler for pressing a type badge on a Pokemon Card (new functionality)
  const handleCardTypePress = (type: string) => {
    setSelectedType(type);
    setSearchText(""); // Clear search to focus on type filter
    setLoadCount(INITIAL_LOAD_COUNT); // Reset load count
  }
  
  // Handler for loading more items when scrolling to the end
  const handleLoadMore = () => {
    // Only load more if the number of visible items is less than the total available items
    if (visiblePokemons.length >= allPokemons.length) {
        return; // All items are loaded
    }
    
    // Check if the currently rendered list has reached its limit based on the current loadCount
    // This prevents re-triggering if the user filters and the current set is small
    const currentFilteredCount = allPokemons.filter(p => 
      !searchText || p.name.toLowerCase().includes(searchText.toLowerCase())
    ).filter(p => 
      !selectedType || p.types?.some((t) => t.type.name === selectedType)
    ).length;

    if (visiblePokemons.length < currentFilteredCount) {
      setLoadCount(prevCount => prevCount + LOAD_MORE_COUNT);
    }
  };

  const handleTypePressIn = () => {
    Animated.spring(typeAnimationValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleTypePressOut = () => {
    Animated.spring(typeAnimationValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const renderPokemon = ({ item }: { item: Pokemon }) => (
    <Pressable
      key={item.name}
      style={[
        styles.card,
        { backgroundColor: colorByType[item.types?.[0]?.type.name ?? "normal"] },
      ]}
    >
      <Link
        href={{ pathname: "/details", params: { name: item.name } }}
        style={styles.linkOverlay}
      />
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
          {item.imageBack && <Image source={{ uri: item.imageBack }} style={styles.image} />}
        </View>
        <Text style={styles.name}>{item.name.toUpperCase()}</Text>
        <View style={styles.typeContainer}>
          {item.types?.map((t) => (
            <Animated.View
              key={t.type.name}
              style={{ transform: [{ scale: typeAnimationValue }] }}
            >
              <Pressable
                onPressIn={handleTypePressIn}
                onPressOut={handleTypePressOut}
                onPress={() => handleCardTypePress(t.type.name)} 
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor: colorByType[t.type.name],
                    shadowColor: colorByType[t.type.name],
                  },
                ]}
              >
                <Text style={styles.typeText}>{t.type.name.toUpperCase()}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
        <Pressable
          onPress={() => toggleFavorite(item.name)}
          style={styles.favoriteButton}
        >
          <Text style={{ color: "white" }}>
            {favorites.includes(item.name) ? "★" : "☆"} Favorite
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Pokémon list...</Text>
      </View>
    );
  }

  // Animation for the search bar (only visible at the top, disappears as you scroll down)
  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HIDE_DISTANCE / 2, HEADER_HIDE_DISTANCE],
    outputRange: [1, 1, 0], 
    extrapolate: "clamp",
  });

  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HIDE_DISTANCE],
    outputRange: [0, -HEADER_HIDE_DISTANCE], 
    extrapolate: "clamp",
  });
  
  // Calculate the total padding required for the FlatList content
  const filterDropdownHeight = isFilterVisible ? 120 : 0;
  const flatListPaddingTop = TOP_OFFSET + SEARCH_BAR_HEIGHT + 10 + filterDropdownHeight;
  
  // Check if there are more items available to load
  const hasMoreToLoad = visiblePokemons.length < allPokemons.length;


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 1. FLOATING SEARCH BAR AND FILTER BUTTON */}
      <Animated.View
        style={[
          styles.floatingSearchContainer,
          { 
            top: TOP_OFFSET,
            opacity: searchBarOpacity, 
            transform: [{ translateY: searchBarTranslateY }] 
          },
        ]}
      >
        <View style={styles.searchBarWrapper}>
          <TextInput
            placeholder="Search Pokémon..."
            placeholderTextColor = "gray"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
          <Pressable
            style={[
              styles.filterHeaderButton,
              // Highlight the filter button if a type is selected
              selectedType && { backgroundColor: colorByType[selectedType] || "#F97316" }
            ]}
            onPress={() => setIsFilterVisible(!isFilterVisible)}
          >
            <Text style={styles.filterButtonText}>{isFilterVisible ? "▲" : "▼"}</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* 2. FLOATING FILTER DROPDOWN */}
      {isFilterVisible && (
        <View style={styles.filterDropdown}>
          {Object.keys(colorByType).map((type) => (
            <Pressable
              key={type}
              onPress={() => handleTypeSelect(type)}
              style={[
                styles.typeFilterBadge,
                selectedType === type && styles.selectedTypeBadge,
                { backgroundColor: colorByType[type] },
              ]}
            >
              <Text style={styles.typeText}>{type.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* 3. POKEMON LIST */}
      <FlatList
        data={visiblePokemons}
        renderItem={renderPokemon}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{
          paddingBottom: 80,
          gap: 16,
          paddingTop: flatListPaddingTop, 
          paddingHorizontal: 16,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        indicatorStyle="black"
        // --- Load More Implementation ---
        onEndReached={handleLoadMore} 
        onEndReachedThreshold={0.5} 
        ListFooterComponent={() => 
          hasMoreToLoad ? (
            <View style={styles.loadMoreIndicator}>
              <Text style={{ color: '#4F46E5' }}>Loading more Pokémon...</Text>
            </View>
          ) : (
             <View style={styles.loadMoreIndicator}>
              <Text style={{ color: '#A8A8A8' }}>End of the list</Text>
            </View>
          )
        }
      />

      {/* 4. FLOATING FAVORITE BUTTON */}
      <Pressable
        style={styles.floatingFavoriteButton}
        onPress={() => router.push("/FavoriteScreen")}
      >
        <Text style={styles.floatingButtonText}>⭐</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Updated style for the floating search bar
  floatingSearchContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
  },

  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    marginRight: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    
  },

  filterHeaderButton: {
    height: 48,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  filterButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },

  filterDropdown: {
    position: "absolute",
    top: TOP_OFFSET + SEARCH_BAR_HEIGHT + 10, 
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.9)", 
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 16,
  },

  typeFilterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  
  selectedTypeBadge: {
    borderWidth: 2, 
    borderColor: "#fff" 
  },

  loadMoreIndicator: {
    paddingVertical: 20,
    alignItems: "center",
  },
  
  floatingFavoriteButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 50,
  },

  floatingButtonText: {
    fontSize: 28,
  },

  card: { borderRadius: 20, overflow: "hidden", elevation: 5 },
  linkOverlay: { ...StyleSheet.absoluteFillObject },
  cardContent: { padding: 16, alignItems: "center" },
  imageContainer: { flexDirection: "row", gap: 12, marginBottom: 8 },
  image: { width: 120, height: 120 },
  name: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 4 },
  typeContainer: { flexDirection: "row", gap: 8, marginBottom: 8 },
  typeBadge: { 
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  typeText: { color: "white", fontWeight: "bold" },
  favoriteButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
  },
});