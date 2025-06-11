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
    const [showTable, setShowTable] = useState(true);

    const options = {
        title: "Temperaturverlauf",
        hAxis: { title: "Datum, Uhrzeit" },
        vAxis: { title: "Temperatur (°C)", minValue: 0 },
        legend: "none",
        curveType: "function",
        pointSize: 5,                    // Punkte bei den Messwerten für bessere Lesbarkeit
        tooltip: { isHtml: true, textStyle: { fontSize: 14 } },  // schicke Tooltips
        backgroundColor: '#fafafa',   
        chartArea: {                      // mehr Platz fürs Chart, weniger für Achsenbeschriftung
            left: 60,
            top: 50,
            width: '80%',
            height: '70%'
        },
        crosshair: {                    // wenn Maus über Chart, vertikale Linie anzeigen
            trigger: 'both',
            orientation: 'vertical',
            color: '#666',
            opacity: 0.5
        },
    };



    useEffect(() => {
        const init = async () => {
            try {
                const configResponse = await fetch('/launchsettings.json');
                const config = await configResponse.json();


                const fetchData =  () => {
           

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
            } catch (err) {
                console.error("Fehler beim Laden der Konfigurationsdatei:", err);
            }  
        };
        init();
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

            <h2>
                Derzeitige Temperatur:{" "}
                {dataPointsKurzzeit.length > 1
                    ? dataPointsKurzzeit[dataPointsKurzzeit.length - 1][1] + " °C"
                    : "Lade..."}
            </h2>

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
