import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SwipeCard from "../components/SwipeCard";
import UserDetailModal from "../components/UserDetailModal";
import {
  getRecommendations,
  swipe as swipeApi,
  getLikedMe,
  getAllInterests
} from "../api/match";

export default function Swipe() {
  const [users, setUsers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  const [detailUser, setDetailUser] = useState(null);

  const [showLikedMe, setShowLikedMe] = useState(false);
  const [likedMeUsers, setLikedMeUsers] = useState([]);

  const [allInterests, setAllInterests] = useState([]);

  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState({
    maxDistance: 10,
    interests: []
  });

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

    getAllInterests()
      .then(res => setAllInterests(res.data))
      .catch(err => console.error("❌ load interests error", err));
  }, []);

  // ---- SWIPE ----
  const handleSwipe = async (
    targetId,
    direction,
    options = { fromLikedMe: false }
  ) => {
    try {
      const action =
        direction === "right" || direction === "LIKE"
          ? "LIKE"
          : "PASS";

      const res = await swipeApi(currentUserId, targetId, action);

      // ---- MATCH ----
      if (res.data.match) {
        setMatchId(res.data.match_id);
        setShowMatchPopup(true);
      }

      // ---- SWIPE TỪ LIKED ME ----
      if (options.fromLikedMe) {
        // 1️⃣ XÓA KHỎI Liked Me
        setLikedMeUsers((prev) =>
          prev.filter((u) => u.user_id !== targetId)
        );

        // XÓA KHỎI STACK SWIPE
        setUsers((prev) =>
          prev.filter((u) => u.user_id !== targetId)
        );

        setSelectedUser(null);
        setDetailUser(null);
        return; // không tăng activeIndex
      }
    } catch (err) {
      console.error("❌ Swipe error:", err);
    }

    // ---- SWIPE STACK CHÍNH ----
    setActiveIndex((prev) => prev + 1);
  };

  // ---- CLICK BUTTON SWIPE ----
  const swipeLeft = () => {
    cardRefs.current[0]?.swipeLeft();
  };

  const swipeRight = () => {
    cardRefs.current[0]?.swipeRight();
  };

  /* ---------------- Liked Me ---------------- */
  const loadLikedMe = async () => {
  try {
    const res = await getLikedMe(currentUserId);
    setLikedMeUsers(res.data);
    setShowLikedMe(true);
  } catch (err) {
    console.error("❌ loadLikedMe error:", err.response?.data || err.message);
  }
};

  /* ---------------- APPLY FILTER ---------------- */
  const applyFilter = () => {
    setShowFilter(false);
    loadNextUser(filter);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 relative">
    
      {/* ---------- TOP RIGHT BUTTONS ---------- */}
      <div className="absolute top-4 right-6 flex gap-3 z-50">
        <button
          onClick={loadLikedMe}
          className="bg-white px-4 py-2 rounded-full shadow text-sm hover:bg-pink-50"
        >
          ❤️ Đã thích bạn
        </button>

        <button
          onClick={() => setShowFilter(true)}
          className="bg-white w-10 h-10 rounded-full shadow flex items-center justify-center"
        >
          🔍
        </button>
      </div>
      
      {/* ------ STACK SWIPE CARDS ------ */}
      {users
        .slice(activeIndex, activeIndex + 3)
        .map((user, i) => (
          <SwipeCard
            key={user.user_id}
            user={user}
            zIndex={100 - i}
            onSwipe={handleSwipe}
            onShowDetail={() => setDetailUser(user)}
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
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
        />
      )}

      {/* ----------  LIKED ME MODAL ---------- */}
      {showLikedMe && (
        <Modal onClose={() => setShowLikedMe(false)} title="Đã thích bạn">
          <div className="grid grid-cols-2 gap-4">
            {likedMeUsers.map((u) => (
              <div
                key={u.user_id}
                className="text-center cursor-pointer"
                onClick={() => setSelectedUser(u)}
              >
                <img
                  src={u.avatar}
                  className="rounded-xl mb-2 hover:scale-105 transition"
                />
                <p>{u.username}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {selectedUser && (
        <Modal
          title={selectedUser.username}
          onClose={() => setSelectedUser(null)}
        >
          <div className="space-y-4">
            <img
              src={selectedUser.avatar}
              className="rounded-xl w-full"
            />

            <p className="text-sm text-gray-600">{selectedUser.bio}</p>

            {/* ACTIONS */}
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() =>
                  handleSwipe(selectedUser.user_id, "left", {
                    fromLikedMe: true
                  })
                }
              >
                ❌ Bỏ qua
              </button>

              <button
                className="px-4 py-2 bg-pink-500 text-white rounded-lg"
                onClick={() =>
                  handleSwipe(selectedUser.user_id, "right", {
                    fromLikedMe: true
                  })
                }
              >
                ❤️ Thích lại
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ----------  FILTER MODAL ---------- */}
      {showFilter && (
        <Modal onClose={() => setShowFilter(false)} title="Lọc">
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">Khoảng cách</p>
              {[3, 10].map((km) => (
                <label key={km} className="block">
                  <input
                    type="radio"
                    checked={filter.maxDistance === km}
                    onChange={() =>
                      setFilter({ ...filter, maxDistance: km })
                    }
                  />{" "}
                  Dưới {km} km
                </label>
              ))}
            </div>

            <div>
              <p className="font-semibold mb-2">Sở thích</p>

              <div className="max-h-40 overflow-y-auto space-y-1">
                {allInterests.map((it) => (
                  <label key={it.interest_id} className="block">
                    <input
                      type="checkbox"
                      checked={filter.interests.includes(it.interest_id)}
                      onChange={() => {
                        const selected = filter.interests.includes(it.interest_id)
                          ? filter.interests.filter(id => id !== it.interest_id)
                          : [...filter.interests, it.interest_id];

                        setFilter({ ...filter, interests: selected });
                      }}
                    />{" "}
                    {it.icon} {it.interest_tag}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={applyFilter}
              className="w-full bg-pink-500 text-white py-2 rounded-xl"
            >
              Áp dụng
            </button>
          </div>
        </Modal>
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

/* ---------- COMMON MODAL ---------- */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-96">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose}>✖</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- MATCH POPUP ---------- */
function MatchPopup({ onChat, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
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
