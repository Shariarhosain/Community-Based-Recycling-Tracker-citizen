
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { jsPDF } from "jspdf";

export default function addContribution() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [activeItem, setActiveItem] = useState("history");

  const [historyData, setHistoryData] = useState<RecyclingHistory[]>([]);
  const [filteredData, setFilteredData] = useState<RecyclingHistory[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  // Search/filter states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [quantityFilter, setQuantityFilter] = useState<number | "">("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [recentDaysFilter, setRecentDaysFilter] = useState<boolean>(false);



interface RecyclingHistory {
  id: number;
  material_type: string;
  quantity: number;
  status: string;
  reward_points: number;
  timestamp: string;
  image: string | null;
  message: string;
  recycling_center: {
    name: string;
  };
}




  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const token = Cookies.get("access_token");
        const response = await axios.get("http://localhost:3001/citizen/show-all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHistoryData(response.data);
        setFilteredData(response.data); 
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  useEffect(() => {
    
    let filtered = historyData;


    if (statusFilter) {
      filtered = filtered.filter((item) => item.status.toLowerCase() === statusFilter.toLowerCase());
    }


    if (quantityFilter) {
      filtered = filtered.filter((item) => item.quantity >= quantityFilter);
    }

   
    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      filtered = filtered.filter((item) => new Date(item.timestamp) >= startDate);
    }

    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      filtered = filtered.filter((item) => new Date(item.timestamp) <= endDate);
    }

    // Filter by recent 15 days
    if (recentDaysFilter) {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15); // Get the date 15 days ago
      filtered = filtered.filter((item) => new Date(item.timestamp) >= recentDate);
    }


    setFilteredData(filtered);
    setCurrentPage(1); 
  }, [statusFilter, quantityFilter, startDateFilter, endDateFilter, recentDaysFilter, historyData]);



  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Recycling History", 20, 20);

    let yPosition = 30; 

    filteredData.forEach((item, index) => {
      
      if (yPosition + 70 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        yPosition = 20;
        doc.setFontSize(18);
        doc.text("Recycling History (cont.)", 20, 20);
        yPosition = 30;
      }

   
      doc.setFillColor(230, 230, 230);
      doc.rect(20, yPosition, 180, 60, "F");

      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Material: ${item.material_type}`, 25, yPosition + 10);
      doc.text(`Quantity: ${item.quantity} kg`, 25, yPosition + 20);
      doc.text(`Status: ${item.status}`, 25, yPosition + 30);
      doc.text(`Reward Points: ${item.reward_points}`, 25, yPosition + 40);
      doc.text(`Recycling Center: ${item.recycling_center.name}`, 25, yPosition + 50);
      doc.text(`Timestamp: ${new Date(item.timestamp).toLocaleString()}`, 25, yPosition + 60);

      
      yPosition += 70;
    });

 
    doc.save("recycling_history_full.pdf");
  };

  const fallbackImageUrl = "https://img.freepik.com/free-vector/people-sorting-garbage-into-recycle-bins-illustration_53876-43173.jpg?semt=ais_hybrid";

  useEffect(() => {
    if (error || message) {
      setShowProgress(true);
      const timer = setTimeout(() => {
        setError("");
        setMessage("");
        setShowProgress(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error, message]);
  
  useEffect(() => {
    const token = Cookies.get("access_token");

    if (!token) {
      router.replace("/?unauthorized=true");
      return;
    }

    
    axios
      .get("http://localhost:3001/citizen/check-auth", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user); 
      })
      .catch((error) => {
       
        Cookies.remove("access_token"); 
        router.replace("/?unauthorized=true");
      })
      .finally(() => setLoading(false)); 
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("access_token");
    router.push("/");
  };
 

  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName);
    if (itemName === "myImpact") {
      router.push("/dashboard");
    }
    if (itemName === "addContribution") {
      router.push("/add-contribution");
    }
    if (itemName === "recyclingCenters") {
      router.push("/search-center");
    }
    if (itemName === "history") {
      router.push("/history");
    }}

 
    if (loading) {
      return (
       
        <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 dark:bg-gray-900">
        <div className="relative flex items-center justify-center">
          <div className="absolute animate-bounce h-[16rem] w-[16rem] shadow-xl shadow-red-500 rounded-full border-t-4 border-b-4 border-red-500"></div>
          <div className="absolute animate-bounce h-[14rem] w-[14rem] shadow-xl shadow-indigo-500 rounded-full border-t-4 border-b-4 border-purple-500"></div>
          <div className="absolute animate-bounce h-[12rem] w-[12rem] shadow-xl shadow-pink-500 rounded-full border-t-4 border-b-4 border-pink-500"></div>
          <div className="absolute animate-bounce h-[10rem] w-[10rem] shadow-xl shadow-yellow-500 rounded-full border-t-4 border-b-4 border-yellow-500"></div>
          <div className="absolute animate-bounce h-[8rem] w-[8rem] shadow-xl shadow-green-500 rounded-full border-t-4 border-b-4 border-green-500"></div>
          <div className="absolute animate-bounce h-[6rem] w-[6rem] shadow-xl shadow-blue-500 rounded-full border-t-4 border-b-4 border-blue-500"></div>
          <div className="rounded-full h-28 w-28 animate-bounce flex items-center justify-center text-gray-400 font-semibold text-xl dark:text-black">
            Loading...
          </div>
        </div>
      </div>
      
      );
    }
    


    return (
        <div >
 
  
 <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
  <div className="px-3 py-3 lg:px-5 lg:pl-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-start rtl:justify-end">
        <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
            <span className="sr-only">Open sidebar</span>
            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
               <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
            </svg>
         </button>
         <span className="text-xl font-semibold text-green-600 bg-green-100 px-4 py-2 rounded-lg shadow-sm">
              Welcome To ♻️CBRT
            </span>
      </div> 
    
  

      
      <div className="flex items-center">
          <div className="flex items-center ms-3">
            <div>
              <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                <span className="sr-only">Open user menu</span>
                <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo"/>
              </button>
            </div>
            <div className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
              <div className="px-4 py-3" role="none">
                <p className="text-sm text-gray-900 dark:text-white" role="none">
                  Neil Sims
                </p>
                <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">
                  neil.sims@flowbite.com
                </p>
              </div>
              <ul className="py-1" role="none">
                <li>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Dashboard</a>
                </li>
                <li>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Settings</a>
                </li>
                <li>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Earnings</a>
                </li>
                <li>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Sign out</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  </div>
</nav>

<aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
   <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
    <ul className="space-y-2 font-medium">
      {/* My Impact */}
      <li>
        <button
          
          className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white group transition-all duration-300 ease-in-out mb-4 ${
            activeItem === "myImpact"
              ? "bg-[#92DA9E] text-black font-bold mr-2"
              : "hover:bg-[#76C79C]"
          }`}
          onClick={() => handleItemClick("myImpact")}
        >
         <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 50 50">
<path d="M 25 2 C 12.354545 2 2 12.354545 2 25 C 2 37.645455 12.354545 48 25 48 C 37.645455 48 48 37.645455 48 25 C 48 12.354545 37.645455 2 25 2 z M 25 4 C 36.554545 4 46 13.445455 46 25 C 46 36.554545 36.554545 46 25 46 C 13.445455 46 4 36.554545 4 25 C 4 13.445455 13.445455 4 25 4 z M 24.984375 5.8789062 A 1.0001 1.0001 0 0 0 24 6.8945312 L 24 8.953125 A 1.0001 1.0001 0 1 0 26 8.953125 L 26 6.8945312 A 1.0001 1.0001 0 0 0 24.984375 5.8789062 z M 15.892578 8.3007812 A 1.0001 1.0001 0 0 0 15.097656 9.8261719 L 16.171875 11.617188 A 1.0001 1.0001 0 1 0 17.886719 10.587891 L 16.8125 8.796875 A 1.0001 1.0001 0 0 0 15.892578 8.3007812 z M 34.078125 8.3007812 A 1.0001 1.0001 0 0 0 33.1875 8.796875 L 32.113281 10.587891 A 1.0001 1.0001 0 1 0 33.828125 11.617188 L 34.902344 9.8261719 A 1.0001 1.0001 0 0 0 34.078125 8.3007812 z M 9.359375 14.84375 A 1.0001 1.0001 0 0 0 8.9042969 16.707031 L 10.695312 17.78125 A 1.0001 1.0001 0 1 0 11.722656 16.066406 L 9.9316406 14.992188 A 1.0001 1.0001 0 0 0 9.359375 14.84375 z M 40.027344 15 A 1.0001 1.0001 0 0 0 39.640625 15.066406 L 23.652344 21.228516 A 1.0001 1.0001 0 0 0 23.185547 21.599609 C 21.931912 22.266866 21 23.474558 21 25 C 21 27.209804 22.790196 29 25 29 C 25.690891 29 26.258107 28.68094 26.820312 28.380859 A 1.0001 1.0001 0 0 0 27.509766 28.140625 L 40.654297 16.755859 A 1.0001 1.0001 0 0 0 40.027344 15 z M 35.017578 18.992188 L 26.318359 26.527344 A 1.0001 1.0001 0 0 0 26.238281 26.582031 C 25.898116 26.844731 25.49009 27 25 27 C 23.809804 27 23 26.190196 23 25 C 23 24.057093 23.530471 23.384107 24.330078 23.119141 A 1.0001 1.0001 0 0 0 24.482422 23.052734 L 35.017578 18.992188 z M 7 23.894531 A 1.0001 1.0001 0 1 0 7 25.894531 L 9.0605469 25.894531 A 1.0001 1.0001 0 1 0 9.0605469 23.894531 L 7 23.894531 z M 40.939453 23.894531 A 1.0001 1.0001 0 1 0 40.939453 25.894531 L 43 25.894531 A 1.0001 1.0001 0 1 0 43 23.894531 L 40.939453 23.894531 z M 11.236328 31.857422 A 1.0001 1.0001 0 0 0 10.695312 32.005859 L 8.9042969 33.082031 A 1.0001 1.0001 0 1 0 9.9335938 34.796875 L 11.724609 33.720703 A 1.0001 1.0001 0 0 0 11.236328 31.857422 z M 38.734375 31.857422 A 1.0001 1.0001 0 0 0 38.275391 33.720703 L 40.066406 34.796875 A 1.0001 1.0001 0 1 0 41.095703 33.082031 L 39.304688 32.005859 A 1.0001 1.0001 0 0 0 38.734375 31.857422 z"></path>
</svg>  
          <span className="ms-3">My Impact</span>
          </button>
      </li>

      {/* Add Contribution */}
      <li>
        <button
          className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white group transition-all duration-300 ease-in-out mb-4 ${
            activeItem === "addContribution"
              ? "bg-[#92DA9E] text-black font-bold mr-2"
              : "hover:bg-[#76C79C]"
          }`}
          onClick={() => handleItemClick("addContribution")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 80 80">
<path d="M 40 7 C 21.785156 7 7 21.785156 7 40 C 7 58.214844 21.785156 73 40 73 C 58.214844 73 73 58.214844 73 40 C 73 21.785156 58.214844 7 40 7 Z M 40 9 C 57.132813 9 71 22.867188 71 40 C 71 57.132813 57.132813 71 40 71 C 22.867188 71 9 57.132813 9 40 C 9 22.867188 22.867188 9 40 9 Z M 40 12 C 39.449219 12 39 12.449219 39 13 C 39 13.550781 39.449219 14 40 14 C 40.550781 14 41 13.550781 41 13 C 41 12.449219 40.550781 12 40 12 Z M 45.292969 12.515625 C 44.804688 12.503906 44.382813 12.84375 44.285156 13.324219 C 44.179688 13.863281 44.53125 14.390625 45.074219 14.5 C 45.613281 14.605469 46.140625 14.253906 46.25 13.714844 C 46.355469 13.171875 46.003906 12.644531 45.464844 12.535156 C 45.40625 12.527344 45.351563 12.519531 45.292969 12.515625 Z M 34.738281 12.519531 C 34.671875 12.519531 34.605469 12.523438 34.539063 12.535156 C 33.996094 12.644531 33.644531 13.171875 33.753906 13.714844 C 33.804688 13.972656 33.957031 14.203125 34.179688 14.351563 C 34.398438 14.496094 34.667969 14.550781 34.929688 14.5 C 35.472656 14.390625 35.824219 13.867188 35.714844 13.324219 C 35.621094 12.859375 35.214844 12.523438 34.738281 12.519531 Z M 29.675781 14.054688 C 29.542969 14.054688 29.410156 14.078125 29.285156 14.128906 C 28.773438 14.34375 28.53125 14.925781 28.746094 15.4375 C 28.957031 15.949219 29.539063 16.191406 30.050781 15.980469 C 30.5625 15.765625 30.804688 15.183594 30.59375 14.671875 C 30.4375 14.300781 30.078125 14.058594 29.675781 14.054688 Z M 50.355469 14.054688 C 49.941406 14.046875 49.566406 14.289063 49.40625 14.671875 C 49.195313 15.183594 49.4375 15.765625 49.949219 15.980469 C 50.460938 16.191406 51.042969 15.949219 51.253906 15.4375 C 51.46875 14.925781 51.226563 14.34375 50.714844 14.128906 C 50.601563 14.082031 50.476563 14.058594 50.355469 14.054688 Z M 25.011719 16.546875 C 24.808594 16.546875 24.609375 16.605469 24.441406 16.71875 C 23.984375 17.023438 23.859375 17.644531 24.167969 18.105469 C 24.472656 18.5625 25.09375 18.6875 25.554688 18.378906 C 26.015625 18.074219 26.136719 17.453125 25.832031 16.996094 C 25.648438 16.71875 25.339844 16.550781 25.011719 16.546875 Z M 55.015625 16.546875 C 54.675781 16.542969 54.355469 16.710938 54.167969 16.996094 C 53.859375 17.453125 53.984375 18.074219 54.441406 18.378906 C 54.902344 18.6875 55.523438 18.5625 55.828125 18.105469 C 55.976563 17.886719 56.03125 17.613281 55.980469 17.355469 C 55.929688 17.09375 55.777344 16.863281 55.554688 16.71875 C 55.394531 16.609375 55.210938 16.550781 55.015625 16.546875 Z M 20.921875 19.90625 C 20.652344 19.90625 20.390625 20.011719 20.203125 20.203125 C 19.8125 20.589844 19.8125 21.226563 20.203125 21.613281 C 20.589844 22.003906 21.226563 22.003906 21.613281 21.613281 C 22.003906 21.226563 22.003906 20.589844 21.613281 20.203125 C 21.429688 20.015625 21.183594 19.910156 20.921875 19.90625 Z M 59.105469 19.90625 C 58.835938 19.90625 58.574219 20.011719 58.386719 20.203125 C 57.996094 20.589844 57.996094 21.226563 58.386719 21.613281 C 58.773438 22.003906 59.410156 22.003906 59.796875 21.613281 C 60.1875 21.226563 60.1875 20.589844 59.796875 20.203125 C 59.613281 20.015625 59.367188 19.910156 59.105469 19.90625 Z M 62.460938 24 C 62.257813 23.996094 62.0625 24.054688 61.894531 24.167969 C 61.4375 24.472656 61.3125 25.09375 61.621094 25.550781 C 61.925781 26.011719 62.546875 26.136719 63.003906 25.828125 C 63.464844 25.519531 63.589844 24.902344 63.28125 24.441406 C 63.097656 24.167969 62.789063 24 62.460938 24 Z M 17.566406 24 C 17.226563 23.992188 16.90625 24.160156 16.71875 24.441406 C 16.414063 24.902344 16.535156 25.523438 16.996094 25.828125 C 17.457031 26.136719 18.074219 26.011719 18.382813 25.554688 C 18.6875 25.09375 18.566406 24.472656 18.105469 24.167969 C 17.945313 24.0625 17.761719 24.003906 17.566406 24 Z M 36 26 L 36 36 L 26 36 L 26 44 L 36 44 L 36 54 L 44 54 L 44 44 L 54 44 L 54 36 L 44 36 L 44 26 Z M 38 28 L 42 28 L 42 38 L 52 38 L 52 42 L 42 42 L 42 52 L 38 52 L 38 42 L 28 42 L 28 38 L 38 38 Z M 64.953125 28.667969 C 64.820313 28.664063 64.6875 28.691406 64.5625 28.742188 C 64.050781 28.953125 63.808594 29.539063 64.019531 30.046875 C 64.234375 30.558594 64.816406 30.800781 65.328125 30.589844 C 65.839844 30.378906 66.082031 29.792969 65.871094 29.28125 C 65.714844 28.914063 65.355469 28.667969 64.953125 28.667969 Z M 15.078125 28.667969 C 14.664063 28.660156 14.289063 28.902344 14.132813 29.285156 C 13.921875 29.796875 14.164063 30.378906 14.671875 30.59375 C 15.183594 30.804688 15.769531 30.5625 15.980469 30.050781 C 16.191406 29.539063 15.949219 28.957031 15.4375 28.746094 C 15.324219 28.695313 15.203125 28.671875 15.078125 28.667969 Z M 66.484375 33.734375 C 66.417969 33.730469 66.351563 33.738281 66.285156 33.75 C 65.746094 33.859375 65.394531 34.386719 65.5 34.925781 C 65.609375 35.46875 66.136719 35.820313 66.675781 35.714844 C 67.21875 35.605469 67.570313 35.078125 67.464844 34.535156 C 67.371094 34.070313 66.960938 33.734375 66.484375 33.734375 Z M 13.546875 33.734375 C 13.058594 33.722656 12.636719 34.058594 12.539063 34.535156 C 12.488281 34.796875 12.539063 35.070313 12.6875 35.289063 C 12.835938 35.511719 13.066406 35.664063 13.328125 35.714844 C 13.585938 35.765625 13.855469 35.710938 14.078125 35.566406 C 14.296875 35.417969 14.449219 35.1875 14.5 34.925781 C 14.609375 34.386719 14.257813 33.859375 13.71875 33.75 C 13.660156 33.742188 13.605469 33.734375 13.546875 33.734375 Z M 13 39 C 12.449219 39 12 39.449219 12 40 C 12 40.550781 12.449219 41 13 41 C 13.550781 41 14 40.550781 14 40 C 14 39.449219 13.550781 39 13 39 Z M 67 39 C 66.449219 39 66 39.449219 66 40 C 66 40.550781 66.449219 41 67 41 C 67.550781 41 68 40.550781 68 40 C 68 39.449219 67.550781 39 67 39 Z M 13.523438 44.265625 C 13.457031 44.265625 13.390625 44.273438 13.324219 44.285156 C 12.78125 44.394531 12.429688 44.921875 12.539063 45.464844 C 12.648438 46.003906 13.171875 46.355469 13.714844 46.25 C 14.257813 46.140625 14.609375 45.613281 14.5 45.074219 C 14.40625 44.605469 14 44.269531 13.523438 44.265625 Z M 66.507813 44.265625 C 66.019531 44.253906 65.597656 44.59375 65.5 45.074219 C 65.394531 45.613281 65.746094 46.140625 66.285156 46.25 C 66.828125 46.355469 67.355469 46.003906 67.464844 45.464844 C 67.570313 44.921875 67.21875 44.394531 66.675781 44.285156 C 66.621094 44.277344 66.566406 44.269531 66.507813 44.265625 Z M 64.96875 49.328125 C 64.554688 49.320313 64.179688 49.566406 64.019531 49.949219 C 63.808594 50.457031 64.050781 51.042969 64.5625 51.253906 C 65.074219 51.464844 65.65625 51.222656 65.871094 50.714844 C 66.082031 50.203125 65.839844 49.617188 65.328125 49.40625 C 65.214844 49.359375 65.089844 49.332031 64.96875 49.328125 Z M 15.0625 49.332031 C 14.929688 49.332031 14.796875 49.355469 14.671875 49.40625 C 14.429688 49.507813 14.234375 49.703125 14.132813 49.949219 C 14.03125 50.195313 14.03125 50.46875 14.128906 50.714844 C 14.34375 51.226563 14.925781 51.46875 15.4375 51.253906 C 15.683594 51.15625 15.878906 50.960938 15.980469 50.714844 C 16.082031 50.46875 16.082031 50.195313 15.980469 49.949219 C 15.828125 49.578125 15.464844 49.335938 15.0625 49.332031 Z M 62.46875 54 C 62.128906 53.992188 61.808594 54.160156 61.621094 54.441406 C 61.3125 54.902344 61.4375 55.519531 61.894531 55.828125 C 62.113281 55.976563 62.386719 56.03125 62.644531 55.976563 C 62.90625 55.925781 63.136719 55.773438 63.28125 55.550781 C 63.589844 55.09375 63.464844 54.472656 63.003906 54.167969 C 62.847656 54.058594 62.660156 54 62.46875 54 Z M 17.5625 54 C 17.359375 53.996094 17.164063 54.054688 16.996094 54.167969 C 16.539063 54.476563 16.414063 55.09375 16.71875 55.554688 C 17.027344 56.011719 17.648438 56.136719 18.109375 55.828125 C 18.566406 55.523438 18.691406 54.902344 18.382813 54.441406 C 18.199219 54.167969 17.890625 54.003906 17.5625 54 Z M 20.921875 58.09375 C 20.652344 58.089844 20.390625 58.195313 20.203125 58.386719 C 19.8125 58.773438 19.8125 59.410156 20.203125 59.796875 C 20.589844 60.1875 21.226563 60.1875 21.613281 59.796875 C 22.003906 59.410156 22.003906 58.773438 21.613281 58.386719 C 21.429688 58.199219 21.183594 58.09375 20.921875 58.09375 Z M 59.105469 58.09375 C 58.835938 58.089844 58.574219 58.195313 58.386719 58.386719 C 57.996094 58.773438 57.996094 59.410156 58.386719 59.796875 C 58.773438 60.1875 59.410156 60.1875 59.796875 59.796875 C 60.1875 59.410156 60.1875 58.773438 59.796875 58.386719 C 59.613281 58.199219 59.367188 58.09375 59.105469 58.09375 Z M 25.019531 61.449219 C 24.679688 61.441406 24.359375 61.609375 24.171875 61.890625 C 23.863281 62.351563 23.988281 62.972656 24.449219 63.28125 C 24.90625 63.585938 25.527344 63.460938 25.832031 63.003906 C 26.140625 62.542969 26.015625 61.925781 25.558594 61.617188 C 25.398438 61.511719 25.210938 61.449219 25.019531 61.449219 Z M 55.011719 61.449219 C 54.808594 61.445313 54.613281 61.503906 54.445313 61.613281 C 54.222656 61.761719 54.070313 61.992188 54.019531 62.253906 C 53.96875 62.511719 54.023438 62.785156 54.171875 63.003906 C 54.476563 63.460938 55.097656 63.585938 55.558594 63.28125 C 56.015625 62.972656 56.140625 62.351563 55.832031 61.890625 C 55.652344 61.617188 55.34375 61.449219 55.011719 61.449219 Z M 29.691406 63.941406 C 29.277344 63.933594 28.902344 64.179688 28.746094 64.5625 C 28.535156 65.070313 28.777344 65.65625 29.285156 65.867188 C 29.796875 66.078125 30.382813 65.835938 30.59375 65.328125 C 30.804688 64.816406 30.5625 64.230469 30.050781 64.019531 C 29.9375 63.972656 29.816406 63.945313 29.691406 63.941406 Z M 50.339844 63.941406 C 50.207031 63.941406 50.074219 63.96875 49.953125 64.019531 C 49.707031 64.121094 49.511719 64.316406 49.410156 64.558594 C 49.308594 64.804688 49.308594 65.082031 49.40625 65.328125 C 49.621094 65.835938 50.203125 66.078125 50.714844 65.867188 C 50.960938 65.765625 51.15625 65.570313 51.257813 65.328125 C 51.359375 65.082031 51.359375 64.804688 51.257813 64.5625 C 51.105469 64.1875 50.742188 63.945313 50.339844 63.941406 Z M 34.761719 65.480469 C 34.273438 65.46875 33.847656 65.808594 33.753906 66.285156 C 33.644531 66.828125 33.996094 67.351563 34.539063 67.460938 C 35.082031 67.570313 35.605469 67.21875 35.714844 66.675781 C 35.824219 66.132813 35.472656 65.609375 34.929688 65.5 C 34.875 65.488281 34.816406 65.480469 34.761719 65.480469 Z M 45.269531 65.484375 C 45.203125 65.480469 45.136719 65.488281 45.074219 65.5 C 44.53125 65.609375 44.179688 66.132813 44.285156 66.675781 C 44.339844 66.9375 44.492188 67.164063 44.710938 67.3125 C 44.933594 67.460938 45.203125 67.515625 45.464844 67.464844 C 45.722656 67.410156 45.953125 67.257813 46.101563 67.039063 C 46.246094 66.816406 46.300781 66.546875 46.25 66.285156 C 46.15625 65.820313 45.746094 65.484375 45.269531 65.484375 Z M 40 66 C 39.449219 66 39 66.449219 39 67 C 39 67.550781 39.449219 68 40 68 C 40.550781 68 41 67.550781 41 67 C 41 66.449219 40.550781 66 40 66 Z"></path>
</svg>   
          <span className="ms-3">Add Contribution</span>
          </button>
      </li>

      {/* Recycling Centers */}
      <li>
        <button
          className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white group transition-all duration-300 ease-in-out mb-4 ${
            activeItem === "recyclingCenters"
              ? "bg-[#92DA9E] text-black font-bold mr-2"
              : "hover:bg-[#76C79C]"
          }`}
          onClick={() => handleItemClick("recyclingCenters")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 80 80" className={`shrink-0 w-5 h-5 transition duration-75 ${
              activeItem === "recyclingCenters"
                ? "text-black"
                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            }`}>
<path fill="#99c99e" d="M31.759,65.472L42.5,56.1v5.4h26.375l-6.62-11.236l7.295-4.297l6.804,12.054 c1.391,2.462,1.517,5.394,0.329,7.65c-1.262,2.397-3.711,3.829-6.549,3.829H42.5v5.396L31.759,65.472z"></path><path fill="#5e9c76" d="M69.365,46.656l6.554,11.61c1.308,2.316,1.431,5.064,0.322,7.172 C75.049,67.701,72.823,69,70.134,69H43h-1v1v3.792l-9.481-8.32L42,57.2V61v1h1h25h1.75l-0.888-1.508L62.94,50.441L69.365,46.656 M69.735,45.277l-8.165,4.809L68,61H43v-6L31,65.47L43,76v-6h27.134c2.948,0,5.592-1.438,6.992-4.097 c1.337-2.54,1.075-5.63-0.336-8.129L69.735,45.277L69.735,45.277z"></path><path fill="#99c99e" d="M11.866,69.5c-2.838,0-5.287-1.432-6.549-3.83c-1.188-2.256-1.062-5.188,0.329-7.649L18.59,35.09 l-4.462-2.429l13.396-4.599l3.446,13.788l-5.132-2.669L14.054,60.5h10.489v9H11.866z"></path><path fill="#5e9c76" d="M27.17,28.713l3.045,12.182l-3.715-1.931l-0.865-0.45l-0.472,0.853l-11.138,20.15L13.206,61h1.695 h9.141v8H11.866c-2.689,0-4.915-1.299-6.107-3.563c-1.109-2.107-0.986-4.855,0.322-7.172l12.694-22.488l0.499-0.884l-0.892-0.485 l-3.018-1.642L27.17,28.713 M27.876,27.413L12.89,32.558l5.015,2.729L5.21,57.774c-1.411,2.499-1.673,5.589-0.336,8.129 C6.274,68.562,8.919,70,11.866,70h13.176V60H14.901l11.138-20.15l5.685,2.956L27.876,27.413L27.876,27.413z"></path><g><path fill="#99c99e" d="M49.015,37.987l4.554-2.532L41.012,12.756l-5.716,9.798l-7.452-3.858l5.468-9.686 C34.905,6.186,37.779,4.5,41,4.5s6.095,1.686,7.688,4.51l12.195,22.473l4.879-2.79l-3.251,13.738L49.015,37.987z"></path><path fill="#5e9c76" d="M41,5c3.038,0,5.749,1.591,7.245,4.241L60.2,31.272l0.488,0.899l0.888-0.508l3.435-1.965 l-2.86,12.088L50.256,37.87l3.12-1.734l0.872-0.485l-0.483-0.873l-11.89-21.493l-0.852-1.54l-0.887,1.52l-5.033,8.627 l-6.569-3.401l5.213-9.234C35.251,6.591,37.962,5,41,5 M41,4c-3.403,0-6.44,1.781-8.124,4.764l-5.722,10.137l8.334,4.315 L41,13.768l11.89,21.493l-5.116,2.844l15.098,4.972l3.641-15.391l-5.436,3.109L49.124,8.764C47.44,5.781,44.403,4,41,4L41,4z"></path></g>
</svg>
          <span className="ms-3">Recycling Centers</span>
          </button>
      </li>

      {/* History */}
      <li>
        <a
          href="#"
          className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white group transition-all duration-300 ease-in-out mb-4 ${
            activeItem === "history"
              ? "bg-[#92DA9E] text-black font-bold mr-2"
              : "hover:bg-[#76C79C]"
          }`}
          onClick={() => handleItemClick("history")}
        >
        <svg  className={`shrink-0 w-5 h-5 transition duration-75 ${
              activeItem === "history"
                ? "text-black"
                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            }`} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 80 80">
<path d="M 15 9 L 15 57 L 9 57 L 9 64 C 9 67.859375 12.140625 71 16 71 L 56 71 L 56 68.578125 C 54.238281 67.800781 53 66.046875 53 64 L 53 57 L 17 57 L 17 11 L 63 11 L 63 41 L 65 41 L 65 9 Z M 28 22.5 C 27.171875 22.5 26.5 23.171875 26.5 24 C 26.5 24.828125 27.171875 25.5 28 25.5 C 28.828125 25.5 29.5 24.828125 29.5 24 C 29.5 23.171875 28.828125 22.5 28 22.5 Z M 33 23 L 33 25 L 53 25 L 53 23 Z M 28 30.5 C 27.171875 30.5 26.5 31.171875 26.5 32 C 26.5 32.828125 27.171875 33.5 28 33.5 C 28.828125 33.5 29.5 32.828125 29.5 32 C 29.5 31.171875 28.828125 30.5 28 30.5 Z M 33 31 L 33 33 L 53 33 L 53 31 Z M 28 38.5 C 27.171875 38.5 26.5 39.171875 26.5 40 C 26.5 40.828125 27.171875 41.5 28 41.5 C 28.828125 41.5 29.5 40.828125 29.5 40 C 29.5 39.171875 28.828125 38.5 28 38.5 Z M 33 39 L 33 41 L 53 41 L 53 39 Z M 57 45 C 56.640625 44.996094 56.304688 45.183594 56.121094 45.496094 C 55.941406 45.808594 55.941406 46.191406 56.121094 46.503906 C 56.304688 46.816406 56.640625 47.003906 57 47 L 58 47 L 58 54 C 58 57.652344 60.023438 60.757813 62.953125 62.5 C 60.023438 64.242188 58 67.347656 58 71 L 58 78 L 57 78 C 56.640625 77.996094 56.304688 78.183594 56.121094 78.496094 C 55.941406 78.808594 55.941406 79.191406 56.121094 79.503906 C 56.304688 79.816406 56.640625 80.003906 57 80 L 79 80 C 79.359375 80.003906 79.695313 79.816406 79.878906 79.503906 C 80.058594 79.191406 80.058594 78.808594 79.878906 78.496094 C 79.695313 78.183594 79.359375 77.996094 79 78 L 78 78 L 78 71 C 78 67.347656 75.976563 64.242188 73.046875 62.5 C 75.976563 60.757813 78 57.652344 78 54 L 78 47 L 79 47 C 79.359375 47.003906 79.695313 46.816406 79.878906 46.503906 C 80.058594 46.191406 80.058594 45.808594 79.878906 45.496094 C 79.695313 45.183594 79.359375 44.996094 79 45 Z M 28 46.5 C 27.171875 46.5 26.5 47.171875 26.5 48 C 26.5 48.828125 27.171875 49.5 28 49.5 C 28.828125 49.5 29.5 48.828125 29.5 48 C 29.5 47.171875 28.828125 46.5 28 46.5 Z M 33 47 L 33 49 L 53 49 L 53 47 Z M 60 47 L 76 47 L 76 49 L 60 49 Z M 60 51 L 76 51 L 76 54 C 76 57.492188 73.769531 60.4375 70.667969 61.535156 L 70 61.769531 L 70 63.230469 L 70.667969 63.464844 C 73.769531 64.5625 76 67.507813 76 71 L 76 74 L 60 74 L 60 71 C 60 67.507813 62.230469 64.5625 65.332031 63.464844 L 66 63.230469 L 66 61.769531 L 65.332031 61.535156 C 62.230469 60.4375 60 57.492188 60 54 Z M 66 57 C 65.449219 57 65 57.449219 65 58 C 65 58.550781 65.449219 59 66 59 C 66.550781 59 67 58.550781 67 58 C 67 57.449219 66.550781 57 66 57 Z M 70 57 C 69.449219 57 69 57.449219 69 58 C 69 58.550781 69.449219 59 70 59 C 70.550781 59 71 58.550781 71 58 C 71 57.449219 70.550781 57 70 57 Z M 11 59 L 51 59 L 51 64 C 51 65.957031 51.808594 67.730469 53.105469 69 L 16 69 C 13.242188 69 11 66.757813 11 64 Z M 68 60 C 67.449219 60 67 60.449219 67 61 C 67 61.550781 67.449219 62 68 62 C 68.550781 62 69 61.550781 69 61 C 69 60.449219 68.550781 60 68 60 Z M 13 61 C 12.449219 61 12 61.449219 12 62 C 12 62.550781 12.449219 63 13 63 C 13.550781 63 14 62.550781 14 62 C 14 61.449219 13.550781 61 13 61 Z M 17 61 C 16.449219 61 16 61.449219 16 62 C 16 62.550781 16.449219 63 17 63 C 17.550781 63 18 62.550781 18 62 C 18 61.449219 17.550781 61 17 61 Z M 21 61 C 20.449219 61 20 61.449219 20 62 C 20 62.550781 20.449219 63 21 63 C 21.550781 63 22 62.550781 22 62 C 22 61.449219 21.550781 61 21 61 Z M 25 61 C 24.449219 61 24 61.449219 24 62 C 24 62.550781 24.449219 63 25 63 C 25.550781 63 26 62.550781 26 62 C 26 61.449219 25.550781 61 25 61 Z M 29 61 C 28.449219 61 28 61.449219 28 62 C 28 62.550781 28.449219 63 29 63 C 29.550781 63 30 62.550781 30 62 C 30 61.449219 29.550781 61 29 61 Z M 33 61 C 32.449219 61 32 61.449219 32 62 C 32 62.550781 32.449219 63 33 63 C 33.550781 63 34 62.550781 34 62 C 34 61.449219 33.550781 61 33 61 Z M 37 61 C 36.449219 61 36 61.449219 36 62 C 36 62.550781 36.449219 63 37 63 C 37.550781 63 38 62.550781 38 62 C 38 61.449219 37.550781 61 37 61 Z M 41 61 C 40.449219 61 40 61.449219 40 62 C 40 62.550781 40.449219 63 41 63 C 41.550781 63 42 62.550781 42 62 C 42 61.449219 41.550781 61 41 61 Z M 45 61 C 44.449219 61 44 61.449219 44 62 C 44 62.550781 44.449219 63 45 63 C 45.550781 63 46 62.550781 46 62 C 46 61.449219 45.550781 61 45 61 Z M 49 61 C 48.449219 61 48 61.449219 48 62 C 48 62.550781 48.449219 63 49 63 C 49.550781 63 50 62.550781 50 62 C 50 61.449219 49.550781 61 49 61 Z M 66 67 C 65.449219 67 65 67.449219 65 68 C 65 68.550781 65.449219 69 66 69 C 66.550781 69 67 68.550781 67 68 C 67 67.449219 66.550781 67 66 67 Z M 70 67 C 69.449219 67 69 67.449219 69 68 C 69 68.550781 69.449219 69 70 69 C 70.550781 69 71 68.550781 71 68 C 71 67.449219 70.550781 67 70 67 Z M 64 70 C 63.449219 70 63 70.449219 63 71 C 63 71.550781 63.449219 72 64 72 C 64.550781 72 65 71.550781 65 71 C 65 70.449219 64.550781 70 64 70 Z M 68 70 C 67.449219 70 67 70.449219 67 71 C 67 71.550781 67.449219 72 68 72 C 68.550781 72 69 71.550781 69 71 C 69 70.449219 68.550781 70 68 70 Z M 72 70 C 71.449219 70 71 70.449219 71 71 C 71 71.550781 71.449219 72 72 72 C 72.550781 72 73 71.550781 73 71 C 73 70.449219 72.550781 70 72 70 Z M 60 76 L 76 76 L 76 78 L 60 78 Z"></path>
</svg>
          <span className="ms-3">History</span>
        </a>
      </li>

      {/* Sign Out */}
      <li>
        <a
          href="#"
          className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white group transition-all duration-300 ease-in-out mb-4 ${
            activeItem === "logout"
              ? "bg-[#92DA9E] text-black font-bold mr-2"
              : "hover:bg-[#76C79C]"
          }`}
          onClick={handleLogout}
        >
          <svg
            width="18"
            height="17"
            viewBox="0 0 18 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 w-5 h-5 transition duration-75 ${
              activeItem === "logout"
                ? "text-black"
                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            }`}
          >
            <path d="M8.3125 0.5H9.6875V8.75H8.3125V0.5ZM6.25 0.972656V2.47656C5.01823 2.99219 4.01562 3.82292 3.24219 4.96875C2.4974 6.11458 2.125 7.375 2.125 8.75C2.125 10.6406 2.79818 12.2591 4.14453 13.6055C5.49089 14.9518 7.10938 15.625 9 15.625C10.8906 15.625 12.5091 14.9518 13.8555 13.6055C15.2018 12.2591 15.875 10.6406 15.875 8.75C15.875 7.375 15.4883 6.11458 14.7148 4.96875C13.9701 3.82292 12.9818 2.99219 11.75 2.47656V0.972656C13.3828 1.54557 14.7005 2.54818 15.7031 3.98047C16.7344 5.38411 17.25 6.97396 17.25 8.75C17.25 11.013 16.4336 12.9609 14.8008 14.5938C13.1966 16.1979 11.263 17 9 17C6.73698 17 4.78906 16.1979 3.15625 14.5938C1.55208 12.9609 0.75 11.013 0.75 8.75C0.75 6.97396 1.2513 5.38411 2.25391 3.98047C3.28516 2.54818 4.61719 1.54557 6.25 0.972656Z" fill="#202224"/>
          </svg>
          <span className="ms-3">Sign Out</span>
        </a>
      </li>
    </ul>
  </div>
</aside>


<div className="container bg-gray-100">
         
         
   <div className="w-auto imgg mx-auto p-6">
   

      {/* Search Filters */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-md shadow-sm"
        />
        <input
          type="number"
          placeholder="Min Quantity"
          value={quantityFilter}
          onChange={(e) => setQuantityFilter(Number(e.target.value) || "")}
          className="px-4 py-2 border rounded-md shadow-sm"
        />
        <input
          type="date"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
          className="px-4 py-2 border rounded-md shadow-sm"
        />
        <input
          type="date"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
          className="px-4 py-2 border rounded-md shadow-sm"
        />
        <label className="flex items-center">
          Recent 15 Days:
          <input
            type="checkbox"
            checked={recentDaysFilter}
            onChange={() => setRecentDaysFilter(!recentDaysFilter)}
            className="ml-2"
          />
        </label>
           {/* Download Button */}
     
      </div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={generatePDF}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
        >
          Download Full History PDF
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {currentItems.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-4">{item.material_type}</h3>
            <div className="text-sm text-gray-500 mb-4">
              <p>Quantity: {item.quantity} kg</p>
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${
                    item.status === "Pending" ? "text-yellow-500" : "text-green-500"
                  }`}
                >
                  {item.status}
                </span>
              </p>
              <p>Reward Points: {item.reward_points}</p>
              <p>Recycling Center: {item.recycling_center.name}</p>
              <p>Message: {item.message || "No message provided"}</p>
              <p>Timestamp: {new Date(item.timestamp).toLocaleString()}</p>
            </div>

            {/* Show image or fallback */}
            <div className="mb-4">
              <img
                src={item.image ? `http://localhost:3001/uploads/${item.image}` : fallbackImageUrl}
                alt={`Image for ${item.material_type}`}
                className="w-full h-64 object-cover rounded-md"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center space-x-4 py-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
 
     
  
{/*  Top-Right Alert for Error or Success */}

          {/*  Top-Right Alert for Error or Success */}
          {(error || message) && (
            <div
              className={`fixed top-5 right-5 ${
                error ? "bg-red-600" : "bg-green-600"
              } text-white px-6 py-3 rounded-lg shadow-lg flex flex-col max-w-md w-auto transition-opacity duration-500 z-50`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{error || message}</span>
                <button onClick={() => { setError(""); setMessage(""); }} className="ml-4">
                  <svg className="w-5 h-5 fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                  </svg>
                </button>
              </div>

              {/*  Progress Bar */}
              {showProgress && (
                <div className="w-full bg-opacity-50 h-1 rounded-full overflow-hidden mt-2">
                  <div className={`h-full ${error ? "bg-red-400" : "bg-green-400"} animate-progress`}></div>
                </div>
              )}
            </div>
          )}

    </div>

</div>





            
    );

}

