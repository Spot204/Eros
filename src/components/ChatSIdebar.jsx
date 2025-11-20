import React from 'react';

function ChatSidebar(){
  return (
    <div className="h-full w-[400px] overflow-y-auto border-r border-gray-300">
      <div className="flex items-center p-4">
        <div className="h-[70px] w-[70px] rounded-full overflow-hidden mr-4">
          <img src="/public/IMG_0111.JPG" alt="avatar" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-semibold text-lg">Anh Nguyen</h1>
          <div className="flex gap-3 text-sm text-gray-500">
            <span>Hello</span>
            <span>Thời gian</span>
          </div>
        </div>
      </div>
      <hr className="border-gray-400 mx-4" />
      {/* Thêm danh sách người dùng ở đây */}
    </div>
  );
};

export {ChatSidebar};
