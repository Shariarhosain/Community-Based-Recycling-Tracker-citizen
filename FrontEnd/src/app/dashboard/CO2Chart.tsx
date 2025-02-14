import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CO2Data {
  week: string;
  co2Saved: number;
}

const CO2Chart = () => {
  const [data, setData] = useState<CO2Data[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
    
        const accessToken = Cookies.get("access_token");

        // Make the API request to fetch CO2 data
        const response = await axios.get("http://localhost:3001/citizen/co2-saved-per-week", {
          headers: {
            Authorization: `Bearer ${accessToken}`, 
          },
        });

        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching CO2 data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const chartData = {
    labels: data.map((item) => item.week),
    datasets: [
      {
        label: "CO2 Saved per Week (kg)",
        data: data.map((item) => item.co2Saved),
        fill: false,
        borderColor: "#4F46E5", 
        backgroundColor: "rgba(70, 229, 168, 0.2)", 
        borderWidth: 3,
        pointBorderColor: "#4F46E5",
        pointBackgroundColor: "#fff",
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
      },
    ],
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="spinner"></div>
      </div>
    );
  }

  // Function to generate PDF from the chart and its details
  const generatePDF = () => {
    const chartElement = document.getElementById("chart-container"); 
    
    if (chartElement) {
      html2canvas(chartElement).then((canvas) => {
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/png");
        
   
        pdf.addImage(imgData, "PNG", 10, 10, 180, 160); 


        pdf.setFontSize(18);
        pdf.text("CO2 Saved per Week", 10, 180);


        pdf.setFontSize(12);
        const chartDetails = data.map((item, index) => `${item.week}: ${item.co2Saved.toFixed(2)} kg`);
        chartDetails.forEach((detail, index) => {
          pdf.text(detail, 10, 190 + index * 10); 
        });

    
        pdf.save("co2-saved-chart-details.pdf");
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-xl">
      <h2 className="text-4xl font-extrabold text-white text-center mb-6">CO2 Saved per Week</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 transform transition-all hover:scale-105 hover:shadow-2xl">
        <div id="chart-container">
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#4B5563",
                    font: {
                      weight: "bold",
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: { color: "#4B5563" },
                  grid: { color: "#E5E7EB" },
                },
                y: {
                  ticks: { color: "#4B5563" },
                  grid: { color: "#E5E7EB" },
                },
              },
            }}
          />
        </div>
        <button
          onClick={generatePDF}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
        >
          Download PDF with Details
        </button>
      </div>
    </div>
  );
};

export default CO2Chart;
