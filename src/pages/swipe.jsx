import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SwipeCard from "../components/SwipeCard";
import UserDetailModal from "../components/UserDetailModal";
import { getRecommendations, swipe as swipeApi } from "../api/match";

export default function Swipe() {
  const [users, setUsers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchId, setMatchId] = useState(null);

  const cardRefs = useRef([]);
  const navigate = useNavigate();

  const currentUserId = 1;

  // ---- LOAD GỢI Ý ----
  const loadNextUser = async () => {
    try {
      const res = await getRecommendations(currentUserId);
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
      const action = direction === "right" ? "LIKE" : "PASS";

      const res = await swipeApi(currentUserId, targetId, action);

      if (res.data.match) {
        setMatchId(res.data.match_id);
        setShowMatchPopup(true);
      }
    } catch (err) {
      console.error("❌ Swipe error:", err);
    }

    setActiveIndex((prev) => prev + 1);
  };

  // ---- CLICK BUTTON SWIPE ----
  const swipeLeft = () => {
    cardRefs.current[0]?.swipeLeft();
  };

  const swipeRight = () => {
    cardRefs.current[0]?.swipeRight();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 relative">
      
      {/* ------ STACK SWIPE CARDS ------ */}
      {users
        .slice(activeIndex, activeIndex + 3)
        .map((user, i) => (
          <SwipeCard
            key={user.user_id}
            user={user}
            zIndex={100 - i}
            onSwipe={handleSwipe}
            onShowDetail={() => setSelectedUser(user)}
            ref={(el) => (cardRefs.current[i] = el)}
          />
        ))}

      {/* ------ NÚT SWIPE ------ */}
      <div className="absolute bottom-10 flex gap-12">
        <button onClick={swipeLeft} className="w-12 h-12 bg-white rounded-full shadow-md border flex items-center justify-center hover:scale-110 transition">
          ✖
        </button>
        <button onClick={swipeRight} className="w-12 h-12 bg-white rounded-full shadow-md border flex items-center justify-center hover:scale-110 transition">
          ❤️
        </button>
      </div>

      {/* ----- MODAL CHI TIẾT ----- */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* ----- MATCH POPUP ----- */}
      {showMatchPopup && (
        <MatchPopup
          onChat={() => navigate(`/chat/${matchId}`)}
          onClose={() => setShowMatchPopup(false)}
        />
      )}
    </div>
  );
}

/* ---------- MATCH POPUP ---------- */
function MatchPopup({ onChat, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 text-center w-80">
        <h2 className="text-2xl font-bold mb-4">💖 It’s a Match!</h2>

        <button
          onClick={onChat}
          className="w-full bg-pink-500 text-white py-2 rounded-xl mb-3"
        >
          💬 Trò chuyện
        </button>

        <button onClick={onClose} className="text-gray-500 text-sm">
          Để sau
        </button>
      </div>
    </div>
  );
}
