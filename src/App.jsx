import { useState } from "react";
import Home from "./pages/home";
import Header from "./components/header";
import Chat from "./pages/chat";
function App() {
  return (
    <>
     <div className="h-screen"> <Header />
      <Chat /></div>
    </>
  );
}

export default App;
