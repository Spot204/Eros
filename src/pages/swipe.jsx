import { useState, useRef, useEffect } from "react";
import SwipeCard from "../components/SwipeCard";
import UserDetailModal from "../components/UserDetailModal";
import axios from "axios";

export default function Swipe() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const topCardRef = useRef(null);

  const CURRENT_USER = 1; // TODO: lấy từ login sau này

  // ⭐ Load danh sách gợi ý từ backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/recommend/${CURRENT_USER}`
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Load users failed", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ⭐ Gửi swipe lên backend
  const handleSwipe = async (toUserId, direction) => {
    try {
      await axios.post("http://localhost:8080/swipe", {
        fromUser: CURRENT_USER,
        toUser: toUserId,
        action: direction === "right" ? "LIKE" : "PASS",
      });
    } catch (err) {
      console.error("Swipe failed", err);
    }

    // Xóa user khỏi UI
    setUsers((prev) => prev.filter((u) => u.id !== toUserId));
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
            ref={index === 0 ? topCardRef : null}
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
            setUsers((prev) => prev.filter((u) => u.id !== id));
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
