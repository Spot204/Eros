import { useEffect, useRef, useState } from "react";
import SwipeCard from "../components/SwipeCard";
import UserDetailModal from "../components/UserDetailModal";

export default function Swipe() {
  const [users, setUsers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  const cardRefs = useRef([]);

  const currentUserId = 1; // tạm

  // ---- LOAD GỢI Ý ----
  const loadRecommendations = async () => {
    try {
      const res = await fetch(`http://localhost:8005/recommend/${currentUserId}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error loading recommendations:", err);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  // ---- GỬI API SWIPE ----
  const handleSwipe = async (targetId, direction) => {
    console.log("Swipe:", direction, "→", targetId);

    await fetch("http://localhost:8005/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        swiperId: currentUserId,
        targetId,
        direction,
      }),
    });

    setActiveIndex((prev) => prev + 1);
  };

  // ---- CLICK BUTTON SWIPE ----
  const swipeLeft = () => {
    if (cardRefs.current[0]) cardRefs.current[0].swipeLeft();
  };

  const swipeRight = () => {
    if (cardRefs.current[0]) cardRefs.current[0].swipeRight();
  };

  // ---- MODAL ----
  const openDetail = (user) => setSelectedUser(user);
  const closeDetail = () => setSelectedUser(null);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 relative">

      {/* ------ STACK SWIPE CARDS ------ */}
      {users.length > 0 &&
        users
          .slice(activeIndex, activeIndex + 3)
          .map((user, i) => (
            <SwipeCard
              key={user.id}
              user={user}
              zIndex={100 - i}
              onSwipe={handleSwipe}
              onShowDetail={() => openDetail(user)}
              ref={(el) => (cardRefs.current[i] = el)}
            />
          ))}

      {/* ------ NÚT SWIPE ------ */}
      <div className="absolute bottom-10 flex gap-12">
        
        {/* Nút X – Swipe Left */}
        <button
          onClick={swipeLeft}
          className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 text-3xl active:scale-90 transition"
        >
          ✖
        </button>

        {/* Nút Heart – Swipe Right */}
        <button
          onClick={swipeRight}
          className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-pink-500 text-3xl active:scale-90 transition"
        >
          ❤️
        </button>
      </div>

      {/* ----- MODAL ----- */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={closeDetail} />
      )}
    </div>
  );
}
