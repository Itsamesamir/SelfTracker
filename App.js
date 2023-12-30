import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
} from "react-native-chart-kit";

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [storedValues, setStoredValues] = useState([]);

  const storeData = async () => {
    try {
      const floatValue = parseFloat(inputValue);
      if (isNaN(floatValue)) {
        // Display an error message or handle the invalid input case
        console.error("Invalid input. Please enter a valid float.");
        return;
      }

      const currentDate = new Date();
      const dateString = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear().toString().slice(-2)}`;

      const newValue = {
        date: dateString,
        value: parseFloat(inputValue),
      };

      const newValues = [...storedValues, newValue];

      await AsyncStorage.setItem("floatValues", JSON.stringify(newValues));
      setStoredValues(newValues);
      setInputValue("");
    } catch (e) {
      console.error("Error storing data:", e);
    }
  };

  const getData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("floatValues");
      if (storedData) {
        // Parse the stored data
        const parsedData = JSON.parse(storedData);

        // Filter out values without a date
        const filteredData = parsedData.filter((item) => item && item.date);

        // Update the state with filtered data

        setStoredValues(filteredData);
      }
    } catch (e) {
      console.error("Error retrieving data:", e);
    }
  };

  const deleteAllValues = async () => {
    try {
      // Remove all values from AsyncStorage
      await AsyncStorage.removeItem("floatValues");

      // Update state to an empty array
      setStoredValues([]);
    } catch (e) {
      console.error("Error deleting all values:", e);
    }
  };

  useEffect(() => {
    getData();
  }, []); // Run on component mount to retrieve stored values
  let hiddenLabels = [];
  let mid;
  const labels = storedValues.map((item) => item.date);
  const dataValues = storedValues.map((item) => item.value);
  if (labels.length > 4) {
    mid = Math.ceil(labels.length / 2);
    console.log(mid);

    const range = (start, stop, step) =>
      Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
      );
    hiddenLabels = range(1, mid - 2, 1) + range(mid, labels.length - 2, 1);
    console.log(hiddenLabels);
  }

  return (
    <View style={styles.container}>
      <Text>Bezier Line Chart</Text>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: dataValues,
            },
          ],
        }}
        width={Dimensions.get("window").width} // from react-native
        height={220}
        yAxisLabel="$"
        yAxisSuffix="k"
        yAxisInterval={1} // optional, defaults to 1
        hidePointsAtIndex={hiddenLabels}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

      <Text>Stored Float Values:</Text>
      <FlatList
        data={storedValues}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text>
            {item.date}: {item.value}
          </Text>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter float value"
        keyboardType="numeric"
        value={inputValue}
        onChangeText={(text) => setInputValue(text)}
      />
      <Button title="Store Float" onPress={storeData} />
      <Button title="Delete All Values" onPress={deleteAllValues} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: "80%",
  },
});
