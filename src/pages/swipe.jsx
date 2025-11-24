import { useState, useRef } from "react";
import SwipeCard from "../components/SwipeCard";
import mockUsers from "../assets/mockUsers";
import UserDetailModal from "../components/UserDetailModal";

export default function Swipe() {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const topCardRef = useRef(null);

  const handleSwipe = (id, direction) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="flex flex-col items-center w-full mt-20 bg-white">
      <div className="relative w-[350px] h-[520px]">
        {users.map((user, index) => (
          <SwipeCard
            key={user.id}
            user={user}
            zIndex={users.length - index}
            onSwipe={handleSwipe}
            onShowDetail={() => setSelectedUser(user)}
            ref={index === 0 ? topCardRef : null} // <-- ref top card
          />
        ))}
      </div>

      <div className="flex gap-6 mt-6">
        <button
          onClick={() => topCardRef.current?.swipeLeft()}
          className="w-12 h-12 bg-white rounded-full shadow-md border flex items-center justify-center hover:scale-110 transition"
        >
          ❌
        </button>

        <button
          onClick={() => topCardRef.current?.swipeRight()}
          className="w-12 h-12 bg-white rounded-full shadow-md border flex items-center justify-center hover:scale-110 transition"
        >
          ❤️
        </button>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onBlock={(id) => {
            setUsers(prev => prev.filter(u => u.id !== id));
            setSelectedUser(null);
          }}
          onReport={(id) => {
            console.log("Reported user", id);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
