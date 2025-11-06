import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, StyleSheet, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit"; 
//import IMCPieChart from './IMCPieChart'; 
//import { Colors, EstadoColorMap } from './config/colors'; 

interface Registro {
  fecha: string;
  imc: number;
  estado: string; 
}



export default function EstadisticasScreen() {
    const [registros, setRegistros] = useState<Registro[]>([]);
    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - 40; 

    useEffect(() => {
        const cargarRegistros = async () => {
            try {
                const data = await AsyncStorage.getItem("registrosIMC");
                if (data) {
                    const lista = JSON.parse(data);
                    const ordenados = lista.sort(
                        (a: Registro, b: Registro) => {

                            const parseDate = (fechaStr: string) => {
                                const parts = fechaStr.split('/');
                                if (parts.length === 3) {
                                     return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                }
                                return new Date(fechaStr); 
                            };
                            return parseDate(a.fecha).getTime() - parseDate(b.fecha).getTime();
                        }
                    );
                    setRegistros(ordenados); 
                }
            } catch (error) {
                console.log("Error al cargar registros", error);
                Alert.alert("Error de Carga", "No se pudieron cargar los registros de IMC.");
            }
        };
        cargarRegistros();
    }, []);

    if (registros.length === 0) { 
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.noDataText}>No hay suficientes datos para generar estadísticas. Por favor, realiza al menos un cálculo de IMC.</Text>
            </View>
        );
    }

    
    const labelsLinea = registros.map((r) => r.fecha.substring(0, r.fecha.lastIndexOf('/'))); 
    const valoresLinea = registros.map((r) => r.imc);

    const labelsToDisplay = labelsLinea.filter((_, index) => 
        index % Math.ceil(labelsLinea.length / Math.min(labelsLinea.length, 5)) === 0 
    );

    const dataConfigLinea = {
        labels: labelsToDisplay,
        datasets: [{ data: valoresLinea }],
    };


    
    const baseChartConfig = {
        backgroundColor: Colors.card, 
        backgroundGradientFrom: Colors.card,
        
        backgroundGradientTo: Colors.card,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`, 
        labelColor: (opacity = 1) => `rgba(33, 37, 41, ${opacity})`, 
        style: {
            borderRadius: 15,
        },
        propsForBackgroundLines: {
            strokeDasharray: '4, 4', 
            stroke: '#E0E0E0',
        },
    };
    
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
            
            
            <Text style={styles.chartTitle}>IMC a lo Largo del Tiempo</Text>
            <View style={styles.chartWrapper}>
                <LineChart
                    data={dataConfigLinea}
                    width={chartWidth}
                    height={300}
                    yAxisSuffix=" kg/m²"
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    chartConfig={{
                        ...baseChartConfig,
                        propsForDots: {
                            r: "6",
                            strokeWidth: "3",
                            stroke: Colors.primary,
                            fill: Colors.card,
                        },
                    }}
                    bezier
                    style={styles.chart}
                />
            </View>

          
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    noDataText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 18,
        color: Colors.textSecondary,
        lineHeight: 25,
    },
   
    chartTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 0,
        alignSelf: 'flex-start',
        color: Colors.textPrimary,
    },
    chartWrapper: {
        borderRadius: 0,
        overflow: 'hidden',
        marginVertical: 10,
        backgroundColor: Colors.card,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 8,
        width: '100%',
    },
    chart: {
        paddingRight: 150,
        paddingBottom: 0,
        paddingTop: 20,
    },
    noPieDataText: {
        padding: 20,
        textAlign: 'center',
        color: Colors.textSecondary,
    },
    legendCard: {
        marginTop: 20,
        marginBottom: 40,
        backgroundColor: Colors.card,
        padding: 20,
        borderRadius: 15,
        width: '100%',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    legendTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.textPrimary,
    },
    legendText: {
        fontSize: 15,
        marginBottom: 5,
    },
});