import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const params = useLocalSearchParams();
  const [pokemon, setPokemon] = useState<any>(null);

  const animatedStats = useRef(
    Array(6)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (params.name) {
      fetchPokemonByName(params.name as string);
    }
  }, [params.name]);

  async function fetchPokemonByName(name: string) {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name}`
      );
      const data = await response.json();
      setPokemon(data);

      Animated.stagger(
        120,
        animatedStats.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          })
        )
      ).start();
    } catch (error) {
      console.error("Error fetching pokemon:", error);
    }
  }

  const primaryType = pokemon?.types?.[0]?.type?.name;
  const gradientColors = primaryType
    ? gradientByType[primaryType]
    : ["#ddd", "#aaa"];

  return (
    <>
      <Stack.Screen options={{ title: params.name as string }} />
      {/* @ts-ignore */}
      <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {!pokemon ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : (
            <>
              {/* Image + Name */}
              <View style={styles.imageNameContainer}>
                <Image
                  source={{ uri: pokemon.sprites.front_default }}
                  style={styles.image}
                />
                <Text style={styles.name}>
                  {pokemon.name.toUpperCase()}
                </Text>
              </View>

              {/* Types */}
              <View style={styles.typeContainer}>
                {pokemon.types.map((t: any) => (
                  <View
                    key={t.type.name}
                    style={[
                      styles.typeBadge,
                      { backgroundColor: colorByType[t.type.name] },
                    ]}
                  >
                    <Text style={styles.typeText}>
                      {t.type.name.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Card */}
              <View style={styles.card}>
                {/* Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Info</Text>
                  <Text style={styles.infoText}>
                    Height: {pokemon.height}
                  </Text>
                  <Text style={styles.infoText}>
                    Weight: {pokemon.weight}
                  </Text>
                </View>

                {/* Stats */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Stats</Text>

                  {pokemon.stats.map((s: any, index: number) => {
                    const width = animatedStats[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", `${Math.min(s.base_stat, 150)}%`],
                    });

                    return (
                      <View key={s.stat.name} style={styles.statBlock}>
                        <Text style={styles.statLabel}>
                          {s.stat.name.toUpperCase()} ({s.base_stat})
                        </Text>

                        <View style={styles.statBarBackground}>
                          <Animated.View
                            style={[styles.statBarFill, { width }]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const gradientByType: Record<string, string[]> = {
  grass: ["#78C850", "#A7DB8D"],
  fire: ["#F08030", "#F5AC78"],
  water: ["#6890F0", "#9DB7F5"],
  electric: ["#F8D030", "#FAE078"],
  psychic: ["#F85888", "#FA92B2"],
  ice: ["#98D8D8", "#BCE6E6"],
  dragon: ["#7038F8", "#A27DFA"],
  dark: ["#705848", "#A29288"],
  fairy: ["#EE99AC", "#F4BDC9"],
  normal: ["#A8A878", "#C6C6A7"],
  fighting: ["#C03028", "#D67873"],
  flying: ["#A890F0", "#C6B7F5"],
  poison: ["#A040A0", "#C183C1"],
  ground: ["#E0C068", "#EBD69D"],
  rock: ["#B8A038", "#D1C17D"],
  bug: ["#A8B820", "#C6D16E"],
  ghost: ["#705898", "#A292BC"],
  steel: ["#B8B8D0", "#D1D1E0"],
};

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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },

  loading: {
    textAlign: "center",
    marginTop: 80,
    fontSize: 18,
    color: "white",
  },

  imageNameContainer: {
    alignItems: "center",
    marginBottom: 8, // Reduced space between image and name
  },

  image: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },

  name: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },

  typeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12, // Reduced space between types and card
  },

  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  typeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    gap: 24,

    // Shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    // Elevation (Android)
    elevation: 8,
  },

  section: {
    gap: 12,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  infoText: {
    fontSize: 18,
  },

  statBlock: {
    gap: 6,
  },

  statLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  statBarBackground: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },

  statBarFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 6,

  },
});
