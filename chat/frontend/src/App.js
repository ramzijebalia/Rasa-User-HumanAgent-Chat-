import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./Pages/Registre/Registre";
import Report from "./Pages/Report/report";
import Login from "./Pages/login/login";
import HChat from "./Pages/HChat/HChat";
import Settings from "./Pages/Settings/Settings";
import Layout from "./Componenets/Layout/Layout";
import { UserProvider } from "./Context/context";

export default function App() {

  const [ws, setWs] = useState(null);

  useEffect(() => {
    const newWs = new WebSocket('ws://localhost:3005');
    setWs(newWs);

    newWs.onopen = function() {
      console.log('Connected to WebSocket server');
    };

    return () => {
      newWs.close(); // Close WebSocket connection when component unmounts
    };
  }, []);

  return (
    <BrowserRouter>
    <UserProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout><HChat ws={ws}  /></Layout>} />
        <Route path="/report" element={<Layout><Report /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
      </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}