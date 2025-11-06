import React, { useState } from "react";
import {StyleSheet, Text, TextInput, View, TouchableOpacity, Pressable, Keyboard, Platform, Alert, } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import RegistrosScreen from "./RegistrosScreen"; 
import EstadisticasScreen from "./EstadisticasScreen";


const Stack = createStackNavigator();


const Colors = {
  primary: "#1642a8ff", 
  secondary: "#ff0000ff", 
  background: "#d6cfcfff", 
  card: "#FFFFFF", 
  textPrimary: "#000000ff", 
  textSecondary: "#757575", 
  shadow: 'rgba(0, 0, 0, 0.1)', 
};


const PlaceholderScreen = ({ title }: { title: string }) => (
    <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>[{title} - Registros  Pendiente]</Text>
        <Text style={styles.placeholderTextSmall}>Registros.</Text>
    </View>
);



function HomeScreen({ navigation }: any) {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [edad, setEdad] = useState("");
  const [genero, setGenero] = useState("");
  const [resultado, setResultado] = useState(""); 
  const [estadoNutricion, setEstadoNutricion] = useState(""); 
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [fecha, setFecha] = useState(new Date());
  const [mostrarFecha, setMostrarFecha] = useState(false);

  
  const getResultColor = (estado: string) => {
    switch (estado) {
      case "Bajo de Peso": return "#2196F3"; 
      case "Normal": return Colors.primary; 
      case "Sobrepeso": return Colors.secondary; 
      case "Obesidad": return "#F44336"; 
      default: return Colors.textPrimary;
    }
  };

  const calcularIMC = async () => {
    Keyboard.dismiss(); 

    
    if (!peso || !altura || !genero || !edad) {
      Alert.alert( "Por favor, completa todos los campos del fromulario.");
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaCm = parseFloat(altura);
    const alturaM = alturaCm / 100;
    const edadNum = parseInt(edad);

    
    if (isNaN(pesoNum) || isNaN(alturaCm) || isNaN(edadNum) || pesoNum <= 0 || alturaCm <= 0 || edadNum <= 0) {
      Alert.alert( "Ingresa valores numéricos válidos y mayores a cero en todos los campos.");
      return;
    }
    
    
    if (pesoNum > 300) {
        Alert.alert( "El peso máximo permitido es de 300 kg.");
        return;
    }

    if (alturaCm > 250) {
        Alert.alert("La altura máxima permitida es de 250 cm.");
        return;
    }

    if (edadNum > 120) {
        Alert.alert("La edad máxima permitida es de 120 años.");
        return;
    }
    


    
    const imc = pesoNum / (alturaM * alturaM);

    
    let nuevoEstadoNutricion = "";
    if (imc < 18.5) nuevoEstadoNutricion = "Bajo de Peso";
    else if (imc < 25) nuevoEstadoNutricion = "Normal";
    else if (imc < 30) nuevoEstadoNutricion = "Sobrepeso";
    else nuevoEstadoNutricion = "Obesidad";

    setEstadoNutricion(nuevoEstadoNutricion);
    setResultado(imc.toFixed(2));

    
    try {
      const nuevoRegistro = {
        id: Date.now(), 
        fecha: fecha.toLocaleDateString("es-MX"),
        imc: parseFloat(imc.toFixed(2)),
        estado: nuevoEstadoNutricion,
      };
      
      const registrosGuardados = await AsyncStorage.getItem("registrosIMC");
      const registros = registrosGuardados ? JSON.parse(registrosGuardados) : [];
      registros.push(nuevoRegistro);
      await AsyncStorage.setItem("registrosIMC", JSON.stringify(registros));
    } catch (error) {
      console.log("Error al guardar registro", error);
      Alert.alert("Error de Guardado", "Hubo un problema al guardar tu registro en el almacenamiento local.");
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    
    setMostrarFecha(false); 
    if (selectedDate) {
        setFecha(selectedDate);
    }
  };

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <View style={styles.card}>
       
        <View style={[styles.resultBox, { borderColor: getResultColor(estadoNutricion) }]}>
            <Text style={styles.resultLabel}> IMC:</Text>
            <Text style={[styles.resultIMCText, { color: getResultColor(estadoNutricion) }]}>
                {resultado || "--"}
            </Text>
            <Text style={styles.resultDescriptionText}>
                {estadoNutricion || "IMC"}
            </Text>
        </View>

        
        <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Peso (kg)"
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
              placeholderTextColor={Colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Altura (cm)"
              keyboardType="numeric"
              value={altura}
              onChangeText={setAltura}
              placeholderTextColor={Colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Edad (años)"
              keyboardType="numeric"
              value={edad}
              onChangeText={setEdad}
              placeholderTextColor={Colors.textSecondary}
            />
            
            
            <View style={styles.dropdownWrapper}>
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setMostrarOpciones(!mostrarOpciones)}
                >
                    <Text style={styles.dropdownText}>{genero || " Género"}</Text>
                </TouchableOpacity>

                {mostrarOpciones && (
                    <View style={styles.dropdownOptions}>
                        <TouchableOpacity
                            style={styles.dropdownOption}
                            onPress={() => {
                                setGenero("Hombre");
                                setMostrarOpciones(false);
                            }}
                        >
                            <Text style={styles.dropdownText}>Hombre</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dropdownOption}
                            onPress={() => {
                                setGenero("Femenino");
                                setMostrarOpciones(false);
                            }}
                        >
                            <Text style={styles.dropdownText}>Femenino</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setMostrarFecha(true)}
            >
              <Text style={styles.dateButtonText}>
                📅 Fecha de Registro: {fecha.toLocaleDateString("es-MX")}
              </Text>
            </TouchableOpacity>
        </View>

        
        <TouchableOpacity style={styles.calcButton} onPress={calcularIMC}>
          <Text style={styles.buttonText}>CALCULAR</Text>
        </TouchableOpacity>

      </View>

      
      <View style={styles.buttonRow}>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Registros")}
        >
          <Text style={styles.navButtonText}> REGISTROS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Estadísticas")}
        >
          <Text style={styles.navButtonText}>GRAFICA</Text>
        </TouchableOpacity>
      </View>


      
      {mostrarFecha && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          
          is24Hour={true} 
        />
      )}

    </Pressable>
  );
}


export default function App() {
  const RegistrosComponent = RegistrosScreen || PlaceholderScreen;
  const EstadisticasComponent = EstadisticasScreen || PlaceholderScreen;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ 
        headerStyle: { 
          backgroundColor: Colors.primary 
        }, 
        headerTintColor: Colors.card,
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      }}>
        <Stack.Screen name="Calculadora IMC" component={HomeScreen} />
        <Stack.Screen name="Registros" component={RegistrosScreen} />
        <Stack.Screen name="Estadísticas" component={EstadisticasScreen} />
      </Stack.Navigator>

    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingTop: 30, 
    paddingHorizontal: 20,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  placeholderText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors.textSecondary,
      marginBottom: 5,
  },
  placeholderTextSmall: {
      fontSize: 14,
      color: Colors.textSecondary,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 20,
  },
  
  resultBox: {
    padding: 1,
    marginBottom: 25,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 100,
    backgroundColor: Colors.background,
  },
  resultLabel: {
      fontWeight: 'bold',
    fontSize: 24,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  resultIMCText: {
    fontWeight: "500", 
    fontSize: 48,
    lineHeight: 50,
  },
  resultDescriptionText: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
    color: Colors.textPrimary,
  },
  
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    width: "100%",
    padding: 15,
    marginBottom: 10,
    borderRadius: 100,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  
  dropdownWrapper: {
    width: "100%",
    marginBottom: 10,
    zIndex: 10, 
  },
  dropdownButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 15,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
      fontSize: 16,
      color: Colors.textPrimary,
  },
  dropdownOptions: {
    position: 'absolute',
    top: 55, 
    width: '100%',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    paddingVertical: 5,
  },
  dropdownOption: {
      padding: 15,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#F0F0F0',
  },
  
  dateButton: {
    backgroundColor: '#24991aff', 
    padding: 15,
    borderRadius: 100,
    marginBottom: 15,
    alignItems: "center",
  },
  dateButtonText: {
      color: Colors.textPrimary,
      fontWeight: '500',
      fontSize: 16,
  },
  
  calcButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 100,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: Colors.card,
    fontWeight: "bold",
    fontSize: 18,
  },
  
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 'auto', 
    marginBottom: 100,
  },
  navButton: {
    backgroundColor: Colors.textPrimary, 
    padding: 15,
    borderRadius: 100,
    width: "45%",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navButtonText: {
    color: Colors.card,
    fontWeight: "bold",
    fontSize: 16,
  },
});
