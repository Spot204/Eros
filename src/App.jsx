import { useState } from "react";
import React from "react";
import Header from "./components/header";
import Chat from "./pages/chat";
import Swipe from "./pages/swipe";
import Auth from "./pages/auth";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<> <Header/><Swipe/></>} />
          <Route path="/home" element={<> <Header/><Swipe/></>} />
          <Route path="/chat" element={<> <Header/><Chat/></>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
