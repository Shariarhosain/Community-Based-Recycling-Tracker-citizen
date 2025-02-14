"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

interface RecyclingData {
  total: number;
  percentageChange: number;
}

const TotalRecycled = () => {
  const [recyclingData, setRecyclingData] = useState<RecyclingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("access_token");

      
      if (!token) {
        setError("Unauthorized: No access token found");
        setLoading(false);
        return;
      }

      try {

        const response = await axios.get("http://localhost:3001/citizen/total-recycling", {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        setRecyclingData(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching recycling data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

 
  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
      <h3 className="text-xl">Total Recycled</h3>
      <div className="flex justify-between items-center mt-4">
        <div className="text-3xl font-semibold">{recyclingData?.total}</div>
        <span
          className={`${
            recyclingData?.percentageChange >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {recyclingData?.percentageChange >= 0 ? "+" : ""}
          {recyclingData?.percentageChange}% from next week
        </span>
      </div>
    </div>
  );
};

export default TotalRecycled;
