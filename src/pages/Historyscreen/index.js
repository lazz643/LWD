import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Historyscreen = () => {
    const [dummyData, setDummyData] = useState({
        force: 100,          // P dalam kN atau satuan gaya lainnya
        diameter: 300,       // Diameter dari area tekan dalam mm atau satuan panjang lainnya
        poissonRatio: 0.35,  // Rasio Poisson (unitless)
        deflection: 1.2,     // Defleksi dalam mm atau satuan panjang lainnya
    });

    // Function to calculate E-Modulli, Correct E-Modulli, Deflection, and Delta Deflection
    const calculateValues = (data) => {
        const { force, diameter, poissonRatio, deflection } = data;

        // Calculate radius of the load area
        const R = diameter / 2; // Assuming diameter in mm, convert to radius in mm

        // Calculate E-Modulli using Boussinesq's Equation
        const eModulli = (2 * (1 + poissonRatio) * force * (1 - Math.pow(poissonRatio, 2))) / (deflection * R);

        // Correct E-Modulli with correction factor
        const correctionFactor = 1.05; // Example correction factor
        const correctEModulli = eModulli * correctionFactor;

        // Calculate Delta Deflection (change in deflection)
        const previousDeflection = 1.0; // Example previous deflection value
        const deltaDeflection = deflection - previousDeflection;

        // Convert to percentages
        const percentEModulli = ((eModulli - 100) / 100) * 100; // Example initial value 100
        const percentCorrectEModulli = ((correctEModulli - 100) / 100) * 100; // Example initial value 100
        const percentDeflection = ((deflection - previousDeflection) / previousDeflection) * 100;
        const percentDeltaDeflection = (deltaDeflection / previousDeflection) * 100;

        // Determine pass or fail status
        const eModulliStatus = percentEModulli < 10 ? 'Failed' : 'Passed'; // Example threshold: 10%
        const correctEModulliStatus = percentCorrectEModulli < 10 ? 'Failed' : 'Passed'; // Consistent threshold
        const deflectionStatus = percentDeflection < 5 ? 'Failed' : 'Passed'; // Example threshold: 5%

        return {
            percentEModulli,
            percentCorrectEModulli,
            percentDeflection,
            percentDeltaDeflection,
            eModulliStatus,
            correctEModulliStatus,
            deflectionStatus
        };
    };

    const {
        percentEModulli,
        percentCorrectEModulli,
        percentDeflection,
        percentDeltaDeflection,
        eModulliStatus,
        correctEModulliStatus,
        deflectionStatus
    } = calculateValues(dummyData);

    useEffect(() => {
        // Simulate fetching new data
        const timer = setTimeout(() => {
            setDummyData({
                force: 110,
                diameter: 320,
                poissonRatio: 0.40,
                deflection: 1.3,
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={{ backgroundColor: "white", flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.box}>
                    <Text style={styles.text1}>Measurements</Text>
                </View>

                {/* Two boxes per row */}
                <View style={styles.row}>
                    <View style={[styles.box1, eModulliStatus === 'Failed' ? styles.failedBox : styles.passedBox]}>
                        <Text style={styles.text3}>E-Modulli</Text>
                        <Text style={styles.textPercent}>{percentEModulli.toFixed(2)}%</Text>
                        <Text style={styles.statusText}>{eModulliStatus}</Text>
                    </View>
                    <View style={[styles.box2, correctEModulliStatus === 'Failed' ? styles.failedBox : styles.passedBox]}>
                        <Text style={styles.text3}>Correct E-Modulli</Text>
                        <Text style={styles.textPercent}>{percentCorrectEModulli.toFixed(2)}%</Text>
                        <Text style={styles.statusText}>{correctEModulliStatus}</Text>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.box3, deflectionStatus === 'Failed' ? styles.failedBox : styles.passedBox]}>
                        <Text style={styles.text3}>Deflection</Text>
                        <Text style={styles.textPercent}>{percentDeflection.toFixed(2)}%</Text>
                        <Text style={styles.statusText}>{deflectionStatus}</Text>
                    </View>
                    <View style={[styles.box4, deflectionStatus === 'Failed' ? styles.failedBox : styles.passedBox]}>
                        <Text style={styles.text3}>Delta Deflection</Text>
                        <Text style={styles.textPercent}>{percentDeltaDeflection.toFixed(2)}%</Text>
                        <Text style={styles.statusText}>{deflectionStatus}</Text>
                    </View>
                </View>
                <View style={styles.box5}>
                    <Text style={styles.text4}>Drops</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        paddingVertical: 20,
        paddingHorizontal: 10
    },
    box: {
        width: '100%',
        height: 190,
        backgroundColor: '#E9E471',
        marginTop: 20,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text1: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingHorizontal: 10,
    },
    box1: {
        width: 180,
        height: 140,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        right: 5
    },
    box2: {
        width: 185,
        height: 140,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        left: 3
    },
    box3: {
        width: 180,
        height: 140,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        right: 5
    },
    box4: {
        width: 185,
        height: 140,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        left: 3
    },
    box5: {
        width: 185,
        height: 140,
        backgroundColor: '#4541E4',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        left: 100,
        top: 10
    },
    text3: {
        fontSize: 18,
        color: "#000000",
        textAlign: 'left',
        bottom: 25,
        right: 15,
    },
    text4: {
        fontSize: 25,
        color: "#000000",
        textAlign: 'center',
        fontWeight: 'bold',
    },
    textPercent: {
        fontSize: 23,
        color: "#000000",
        textAlign: 'center',
        marginTop: 5,
        fontWeight: 'bold',
    },
    statusText: {
        fontSize: 16,
        color: '#000000',
        textAlign: 'center',
        marginTop: 10,
        fontWeight: 'bold',
    },
    passedBox: {
        backgroundColor: '#E9E471', // Original color for passed status
    },
    failedBox: {
        backgroundColor: '#FF6347', // Red color for failed status
    }
});

export default Historyscreen;
