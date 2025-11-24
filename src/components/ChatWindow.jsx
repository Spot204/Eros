import React from 'react';

function ChatWindow() {
  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Tin nhắn sẽ hiển thị ở đây */}
      </div>
      <div className="p-4 border-t border-gray-300">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none"
        />
      </div>
    </div>
  );
};

export {ChatWindow};