import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useRouter } from "expo-router";

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

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritePokemons, setFavoritePokemons] = useState<Pokemon[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("favorites").then((data) => {
      if (data) {
        const favs = JSON.parse(data);
        setFavorites(favs);
        fetchFavoritePokemons(favs);
      }
    });
  }, []);

  const fetchFavoritePokemons = async (names: string[]) => {
    const fetched: Pokemon[] = [];
    for (const name of names) {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const details = await res.json();
      fetched.push({
        name,
        url: `https://pokeapi.co/api/v2/pokemon/${name}`,
        image: details.sprites.front_default,
        imageBack: details.sprites.back_default,
        types: details.types,
      });
    }
    setFavoritePokemons(fetched);
  };

const renderPokemon = ({ item }: { item: Pokemon }) => (
  // The entire card view should be wrapped or contain the Pressable/Link
  <Pressable
   style={[
    styles.card,
    { backgroundColor: colorByType[item.types?.[0]?.type.name ?? "normal"] },
   ]}
   // Use the useRouter hook to push to the details screen
   onPress={() => router.push({ pathname: "/details", params: { name: item.name } })}
  >
   <View style={styles.cardContent}>
    <View style={styles.imageContainer}>
     {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
     {item.imageBack && <Image source={{ uri: item.imageBack }} style={styles.image} />}
    </View>
    <Text style={styles.name}>{item.name.toUpperCase()}</Text>
   </View>
  </Pressable>
 );

  const router = useRouter();

  return (
    <FlatList
      data={favoritePokemons}
      renderItem={renderPokemon}
      keyExtractor={(item) => item.name}
      contentContainerStyle={{ padding: 16, gap: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: "hidden", elevation: 5 },
  cardContent: { padding: 16, alignItems: "center" },
  imageContainer: { flexDirection: "row", gap: 12, marginBottom: 8 },
  image: { width: 120, height: 120 },
  name: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 4 },
});
