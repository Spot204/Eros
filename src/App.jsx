import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/header";
import Auth from "./pages/auth.jsx";
import Swipe from "./pages/swipe.jsx";
import Chat from "./pages/chat.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import ManagePhoto from "./pages/ManagePhoto.jsx";
import Preferences from "./pages/Preferences.jsx";

// Layout chung cho các trang có Header
const MainLayout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/" element={<Auth />} />

        {/* Các trang chính */}
        <Route
          path="/home"
          element={
            <MainLayout>
              <Swipe />
            </MainLayout>
          }
        />
        <Route path="/preferences" element={<Preferences />} />
        <Route
          path="/chat"
          element={
            <MainLayout>
              <Chat />
            </MainLayout>
          }
        />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route
          path="/edit-profile"
          element={
            <MainLayout>
              <EditProfile />
            </MainLayout>
          }
        />
        <Route path="/manage-photo" element={
          <MainLayout>
            <ManagePhoto />
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
