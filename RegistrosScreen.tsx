import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Registro {
  fecha: string;
  imc: number;
  estado: string;
}

const Colors = {
    primary: "#222722ff", 
    background: "#F5F7FA", 
    card: "#FFFFFF", 
    textPrimary: "#333333",
    textSecondary: "#757575",
    shadow: 'rgba(0, 0, 0, 0.1)', 
};


const getStatusStyle = (estado: string) => {
    switch (estado) {
        case "Normal": return { color: Colors.primary };
        case "Bajo de Peso": return { color: "#2196F3" };
        case "Sobrepeso": return { color: "#FF9800" };
        case "Obesidad": return { color: "#F44336" };
        default: return { color: Colors.textPrimary };
    }
};

export default function RegistrosScreen() {
  const [registros, setRegistros] = useState<Registro[]>([]);

  useEffect(() => {
    const cargarRegistros = async () => {
      try {
        const data = await AsyncStorage.getItem("registrosIMC");
        if (data) {
          
          const lista = JSON.parse(data).reverse(); 
          setRegistros(lista);
        }
      } catch (error) {
        console.log("Error al cargar los registros", error);
      }
    };
    cargarRegistros();
  }, []);

  const renderItem = ({ item }: { item: Registro }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.fecha}</Text>
      <Text style={[styles.cell, styles.imcCell]}>{item.imc.toFixed(2)}</Text>
      <Text style={[styles.cell, getStatusStyle(item.estado)]}>{item.estado}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>REGISTROS</Text>

      {registros.length === 0 ? (
        <View style={styles.emptyState}>
            <Text style={styles.noData}>No hay registros de IMC guardados. ¡Calcula tu primer IMC en la pantalla de inicio!</Text>
        </View>
      ) : (
        <>
        
        <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.headerCell}>FECHA</Text>
            <Text style={styles.headerCell}>IMC</Text>
            <Text style={styles.headerCell}>ESTADO</Text>
        </View>
        
        <FlatList
          data={registros}
          keyExtractor={(item, index) => index.toString() + item.fecha}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: Colors.textPrimary,
  },
  headerRow: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderBottomWidth: 0,
    borderRadius: 8,
    marginBottom: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  headerCell: {
    width: "33%",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.card, 
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 8,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cell: {
    width: "33%",
    textAlign: "center",
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  imcCell: {
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noData: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
