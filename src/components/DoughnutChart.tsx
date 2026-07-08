// Chart.tsx
import React from "react";
import { WebView } from "react-native-webview";
import { currentOS } from "../utils/Utils";
import { useTheme } from "../context/ThemeContext";

type IDoughnutChart = {
  chartId: string;
  chartData: any;
};

const DoughnutChart = (props: IDoughnutChart) => {
  const { chartId, chartData } = props;
  const { colors } = useTheme();

  const chartHtml = `
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { margin: 0; background: transparent; }
        </style>
      </head>
      <body>
        <canvas id="${chartId}"></canvas>
        <script>
          var ctx = document.getElementById("${chartId}").getContext('2d');
          var myChart = new Chart(ctx, {
            type: 'pie',
            data: ${JSON.stringify(chartData)},
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: ${JSON.stringify(colors.text)},
                            font: {
                                size: ${currentOS == "web" ? "15" : "40"}
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        titleFont: {
                          size: ${currentOS == "web" ? "15" : "40"}
                        },
                        bodyFont: {
                            size: ${currentOS == "web" ? "15" : "40"}
                        },
                        footerFont: {
                          size: 20
                        },
                        padding: ${currentOS == "web" ? "15" : "30"}
                    },
                }
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <>
      {currentOS == "web" ? (
        <iframe
          style={{
            height: 300,
            width: 300,
            border: "none",
            background: "transparent",
          }}
          srcDoc={chartHtml}
        />
      ) : (
        <WebView
          source={{ html: chartHtml }}
          style={{ height: 300, width: 300, backgroundColor: "transparent" }}
          backgroundColor="transparent"
          opaque={false}
          onError={(syntheticEvent) =>
            console.error("WebView error:", syntheticEvent.nativeEvent)
          }
        />
      )}
    </>
  );
};

export default DoughnutChart;
