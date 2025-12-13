import { useEffect, useRef, useState } from "react";
import SwipeCard from "../components/SwipeCard";
import UserDetailModal from "../components/UserDetailModal";
import { getRecommendations, swipe as swipeApi } from "../api/match";

export default function Swipe() {
  const [users, setUsers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const cardRefs = useRef([]);

  const currentUserId = 1;

  // ---- LOAD GỢI Ý ----
  const loadNextUser = async () => {
    try {
      console.log("➡️ Load recommendations for user:", currentUserId);
      const res = await getRecommendations(currentUserId);
      console.log("✅ Recommendations:", res.data);

      setUsers(res.data);
      setActiveIndex(0);
    } catch (err) {
      console.error("❌ loadNextUser error:", err);
    }
  };

  useEffect(() => {
    loadNextUser();
  }, []);

  // ---- SWIPE ----
  const handleSwipe = async (targetId, direction) => {
    try {
      await swipeApi(
        currentUserId,
        targetId,
        direction === "right" ? "LIKE" : "PASS"
      );
      console.log("✅ Swipe success:", targetId);
    } catch (err) {
      console.error("❌ Swipe error:", err);
    }

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
              key={user.user_id}
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
          className="w-12 h-12 bg-white rounded-full shadow-md border flex items-center justify-center hover:scale-110 transition"
        >
          ✖
        </button>

        {/* Nút Heart – Swipe Right */}
        <button
          onClick={swipeRight}
          className="w-12 h-12 bg-white rounded-full shadow-md border flex items-center justify-center hover:scale-110 transition"
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
