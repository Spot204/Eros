import { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Preferences() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    interested_in: "everyone",
    age_min: 18,
    age_max: 35,
    max_distance_km: 50,
  });

  // State lưu danh sách Category lấy từ Server
  const [categories, setCategories] = useState([]);

  // State lưu các ID sở thích đã chọn
  const [selectedIds, setSelectedIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- 1. Load dữ liệu khi vào trang ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userID");
        // Gọi song song 2 API để tiết kiệm thời gian
        const [metaRes, profileRes] = await Promise.all([
          fetch("http://localhost:4000/api/metadata/interests"), // Lấy Menu sở thích
          fetch(`http://localhost:4000/api/profile/${userId}`),
          fetch(``) // Lấy cài đặt cũ của User
        ]);

        const metaData = await metaRes.json();
        const userData = await profileRes.json();

        // 1. Cập nhật Menu Categories
        if (Array.isArray(metaData)) {
          setCategories(metaData);
        }

        // 2. Điền dữ liệu cũ vào Form (nếu có)
        if (userData.profile) {
          // Merge dữ liệu preferences từ server vào state
          setPrefs((prev) => ({
            ...prev,
            interested_in: userData.profile.interested_in || "everyone",
            age_min: userData.profile.age_min || 18,
            age_max: userData.profile.age_max || 35,
            max_distance_km: userData.profile.max_distance_km || 50,
          }));
        }

        // 3. Highlight các sở thích đã chọn
        if (userData.selectedInterestIds) {
          setSelectedIds(userData.selectedInterestIds);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        setMessage({
          type: "error",
          text: "Không thể kết nối tới Server Backend!",
        });
      }
    };

    fetchData();
  }, []);

  // --- Handlers ---
  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    setPrefs((prev) => ({
      ...prev,
      [name]: ["age_min", "age_max", "max_distance_km"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  // Logic Chọn/Bỏ chọn sở thích
  const toggleInterest = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id); // Bỏ chọn
      } else {
        if (prev.length >= 10) {
          alert("Chỉ được chọn tối đa 10 sở thích!");
          return prev;
        }
        return [...prev, id]; // Chọn thêm
      }
    });
  };

  // --- Gửi dữ liệu về Backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation
    if (prefs.age_min >= prefs.age_max) {
      setMessage({ type: "error", text: "Min Age phải nhỏ hơn Max Age." });
      setLoading(false);
      return;
    }

    try {
      const userId = location.userId;

      // Gọi API song song: Lưu Prefs và Lưu Interests cùng lúc
      const [prefRes, intRes] = await Promise.all([
        // Request 1: Preferences
        fetch("http://localhost:4000/api/profile/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ...prefs }),
        }),
        // Request 2: Interests (Chỉ gửi mảng ID)
        fetch("http://localhost:4000/api/profile/interests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, interest_ids: selectedIds }),
        }),
      ]);

      if (!prefRes.ok || !intRes.ok) {
        throw new Error("Lỗi khi lưu dữ liệu.");
      }

      // Thành công
      setMessage({ type: "success", text: "Đã lưu cài đặt thành công!" });
      navigate("/manage-photos");
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Có lỗi xảy ra, vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Discovery Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Customize your matching experience
          </p>
        </div>

        {/* Thông báo */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
              message.type === "error"
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-green-50 text-green-600 border border-green-100"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- PHẦN 1: PREFERENCES --- */}
            <div className="space-y-6 border-b border-gray-100 pb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  I'm interested in
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["male", "female", "everyone"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setPrefs((p) => ({ ...p, interested_in: option }))
                      }
                      className={`py-2 rounded-lg text-sm font-medium capitalize border transition-all ${
                        prefs.interested_in === option
                          ? "bg-pink-600 text-white border-pink-600 shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">
                      Age Range
                    </label>
                    <span className="text-sm font-medium text-pink-600">
                      {prefs.age_min} - {prefs.age_max}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      name="age_min"
                      value={prefs.age_min}
                      onChange={handlePrefChange}
                      className="w-full px-3 py-2 border rounded-lg text-center outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      name="age_max"
                      value={prefs.age_max}
                      onChange={handlePrefChange}
                      className="w-full px-3 py-2 border rounded-lg text-center outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">
                      Distance
                    </label>
                    <span className="text-sm font-medium text-pink-600">
                      {prefs.max_distance_km} km
                    </span>
                  </div>
                  <input
                    type="range"
                    name="max_distance_km"
                    min="1"
                    max="200"
                    value={prefs.max_distance_km}
                    onChange={handlePrefChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600 mt-3"
                  />
                </div>
              </div>
            </div>

            {/* --- PHẦN 2: INTERESTS (Load từ Backend) --- */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-lg font-bold text-gray-800">
                  Interests
                </label>
                <span className="text-sm text-gray-500">
                  {selectedIds.length}/10 selected
                </span>
              </div>

              <div className="space-y-6">
                {/* Kiểm tra nếu categories chưa tải xong hoặc rỗng */}
                {categories.length === 0 && (
                  <p className="text-center text-gray-400">
                    Loading interests...
                  </p>
                )}

                {categories.map(
                  (cat) =>
                    // Backend trả về mảng items, cần check null/undefined
                    cat.items &&
                    cat.items.length > 0 && (
                      <div key={cat.category_id}>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span>{cat.icon}</span> {cat.category_name}
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((item) => {
                            const isSelected = selectedIds.includes(
                              item.interest_id
                            );
                            return (
                              <button
                                key={item.interest_id}
                                type="button"
                                onClick={() => toggleInterest(item.interest_id)}
                                className={`
                                          px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5
                                          ${
                                            isSelected
                                              ? "bg-white border-pink-500 text-pink-600 shadow-sm ring-1 ring-pink-500"
                                              : "bg-white border-gray-300 text-gray-600 hover:border-pink-300 hover:bg-gray-50"
                                          }
                                      `}
                              >
                                <span>{item.icon}</span>
                                {item.interest_tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-pink-600/30 flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
