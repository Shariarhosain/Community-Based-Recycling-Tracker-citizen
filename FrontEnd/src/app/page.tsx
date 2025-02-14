"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation"; 

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("unauthorized");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [emptyFields, setEmptyFields] = useState({ email: false, password: false });
  const [showProgress, setShowProgress] = useState(false);


  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    setError(null);
    setMessage(null);
    setShowProgress(false);


    const newEmptyFields = {
      email: !email.trim() || !isValidEmail(email),
      password: !password.trim(),
    };
    setEmptyFields(newEmptyFields);

    if (newEmptyFields.email || newEmptyFields.password) {
      setError(newEmptyFields.email ? "Please enter a valid email address." : "Password is required.");
      setShowProgress(true);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
      });

      if (response.status === 201) {
        const token = response.data.access_token;
       

 
        Cookies.set("access_token", token, { expires: 1 });

        setMessage("Login successful!");
        setShowProgress(true);

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      

      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.status === 400) {
        setError("Please fill in all required fields.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setShowProgress(true);
    }
  };



  useEffect(() => {
    if (unauthorized) {
      setError("You must log in to access the dashboard.");
    }
  }, [unauthorized]);


  useEffect(() => {
    if (error || message) {
      setShowProgress(true);
      const timer = setTimeout(() => {
        setError(null);
        setMessage(null);
        setShowProgress(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center">
      <div className="max-w-screen-xl  bg-white shadow-lg sm:rounded-lg flex ">
        {/*  Left Section - Login Form */}
        <div className=" p-8 ">
          <div className="flex flex-col items-center">
            <img
              src="/picture/logo.png"
              alt="logo"
              className="mb-4 rounded-tl-md rounded-br-lg shadow-md"
              height="80"
              width="80"
            />
            <span className="text-xl font-semibold text-green-600 bg-green-100 px-4 py-2 rounded-lg shadow-sm">
              ♻️ Community-Based Recycling Tracker
            </span>
          </div>

          {/* Top-Right Alert for Error or Success */}
          {(error || message) && (
            <div
              className={`fixed top-5 right-5 ${
                error ? "bg-red-600" : "bg-green-600"
              } text-white px-6 py-3 rounded-lg shadow-lg flex flex-col max-w-md w-auto transition-opacity duration-500`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{error || message}</span>
                <button onClick={() => { setError(null); setMessage(null); }} className="ml-4">
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

          {/* Input Fields */}
          <div className="mt-6">
            <input
              className={`w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border ${
                emptyFields.email ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmptyFields({ ...emptyFields, email: false });
              }}
            />
            {emptyFields.email && <p className="text-red-500 text-sm mt-1">Invalid email format</p>}

            <input
              className={`w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border ${
                emptyFields.password ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-4`}
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setEmptyFields({ ...emptyFields, password: false });
              }}
            />
            {emptyFields.password && <p className="text-red-500 text-sm mt-1">Password is required</p>}

            <button
              onClick={handleLogin}
              className="mt-6 tracking-wide font-semibold bg-green-500 text-white w-full py-3 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
            >
              Sign In
            </button>
          </div>
        </div>

       
      </div>
    </div>
  );
}
