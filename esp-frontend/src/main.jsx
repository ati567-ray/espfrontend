import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Chart } from "react-google-charts";
import { useState, useEffect } from "react";

function RootComponent() {
    const [dataPointsLangzeit, setDataPointsLangzeit] = useState([
        ["Zeit", "Temperatur (°C)"]
    ]);
    const [dataPointsKurzzeit, setDataPointsKurzzeit] = useState([
        ["Zeit", "Temperatur (°C)"]
    ]);
    const [showTable, setShowTable] = useState(false);

    const options = {
        title: "Temperaturverlauf",
        hAxis: { title: "Datum, Uhrzeit" },
        vAxis: { title: "Temperatur (°C)", minValue: 0 },
        legend: "none",
        curveType: "function"
    };

    useEffect(() => {
   
        const fetchData = async () => {
            const configResponse = await fetch('/launchsettings.json');
            const config = await configResponse.json();

            fetch(`${config.apiUrl}langzeit`)
                .then((res) => {
                    if (!res.ok) throw new Error("Fehler beim Laden");
                    return res.json();
                })
                .then((json) => {
                    const chartData = [["Zeit", "Temperatur (°C)"]];
                    json.forEach(([zeit, temp]) => {
                        chartData.push([zeit, parseFloat(temp)]);
                    });
                    setDataPointsLangzeit(chartData);
                })
                .catch((err) => {
                    console.error("Fehler beim Abrufen der Messwerte (Langzeit):", err);
                    
                });

            fetch(`${config.apiUrl}kurzzeit`)
                .then((res) => {
                    if (!res.ok) throw new Error("Fehler beim Laden");
                    return res.json();
                })
                .then((json) => {
                    const chartData = [["Zeit", "Temperatur (°C)"]];
                    json.forEach(([zeit, temp]) => {
                        chartData.push([zeit, parseFloat(temp)]);
                    });
                    setDataPointsKurzzeit(chartData);
                })
                .catch((err) => {
                    console.error("Fehler beim Abrufen der Messwerte (Kurzzeit):", err);
                    
                });
        };

        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <Chart
                chartType="LineChart"
                width="100%"
                height="400px"
                data={dataPointsLangzeit}
                options={options}
            />

            <p>
                Letzte Temperatur:{" "}
                {dataPointsKurzzeit.length > 1
                    ? dataPointsKurzzeit[dataPointsKurzzeit.length - 1][1] + " °C"
                    : "Lade..."}
            </p>

            <button
                onClick={() => setShowTable(!showTable)}
                style={{ marginBottom: "10px" }}
            >
                {showTable ? "Tabelle ausblenden" : "Tabelle anzeigen"}
            </button>

            {showTable && (
                <table
                    border="1"
                    cellPadding="8"
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        background: "#f9f9f9",
                    }}
                >
                    <thead>
                        <tr>
                            <th>Zeit</th>
                            <th>Temperatur (°C)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataPointsKurzzeit.slice(1).map(([zeit, temp], index) => (
                            <tr key={index}>
                                <td>{zeit}</td>
                                <td>{temp.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RootComponent />
    </StrictMode>
);
