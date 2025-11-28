import React from "react";
import { Input } from "../components/input";
import {ChatSidebar} from "../components/ChatSIdebar.jsx";
import {ChatWindow} from "../components/ChatWindow.jsx";

const Chat = () => {
  return (
     <div className="flex h-[calc(100vh-100px)]">
      <ChatSidebar />
      <ChatWindow />
    </div>

  );
};

export default Chat;
