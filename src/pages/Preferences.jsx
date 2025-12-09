import { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react"; 

// --- DỮ LIỆU MẪU (MOCK DATA) --- 
// Đã đồng bộ 100% với file init.sql
const MOCK_CATEGORIES = [
  {
    category_id: 1, category_name: 'Creativity', icon: '🎨',
    items: [
      { interest_id: 1, interest_tag: 'Art', icon: '🎨' },
      { interest_id: 2, interest_tag: 'Crafts', icon: '🧶' },
      { interest_id: 3, interest_tag: 'Dancing', icon: '💃' },
      { interest_id: 4, interest_tag: 'Design', icon: '✏️' },
      { interest_id: 5, interest_tag: 'Make-up', icon: '💄' },
      { interest_id: 6, interest_tag: 'Making videos', icon: '📹' },
      { interest_id: 7, interest_tag: 'Photography', icon: '📷' },
      { interest_id: 8, interest_tag: 'Singing', icon: '🎤' },
      { interest_id: 9, interest_tag: 'Writing', icon: '📝' },
    ]
  },
  {
    category_id: 2, category_name: 'Sports', icon: '⚽',
    items: [
      { interest_id: 10, interest_tag: 'Athletics', icon: '🎽' },
      { interest_id: 11, interest_tag: 'Badminton', icon: '🏸' },
      { interest_id: 12, interest_tag: 'Baseball', icon: '⚾' },
      { interest_id: 13, interest_tag: 'Basketball', icon: '🏀' },
      { interest_id: 14, interest_tag: 'Bouldering', icon: '🧗' },
      { interest_id: 15, interest_tag: 'Bowling', icon: '🎳' },
      { interest_id: 16, interest_tag: 'Boxing', icon: '🥊' },
      { interest_id: 17, interest_tag: 'Crew', icon: '🚣' },
      { interest_id: 18, interest_tag: 'Football', icon: '⚽' },
      { interest_id: 19, interest_tag: 'Gym', icon: '💪' },
      { interest_id: 20, interest_tag: 'Yoga', icon: '🧘' },
    ]
  },
  {
    category_id: 3, category_name: 'Going Out', icon: '🍻',
    items: [
      { interest_id: 21, interest_tag: 'Bars', icon: '🍻' },
      { interest_id: 22, interest_tag: 'Cafe-hopping', icon: '☕' },
      { interest_id: 23, interest_tag: 'Clubs', icon: '🕺' },
      { interest_id: 24, interest_tag: 'Concerts', icon: '🎫' },
      { interest_id: 25, interest_tag: 'Festivals', icon: '🎉' },
      { interest_id: 26, interest_tag: 'Karaoke', icon: '🎤' },
      { interest_id: 27, interest_tag: 'Museums & galleries', icon: '🏛️' },
      { interest_id: 28, interest_tag: 'Stand up', icon: '🎙️' },
      { interest_id: 29, interest_tag: 'Theater', icon: '🎭' },
    ]
  },
  {
    category_id: 4, category_name: 'Music', icon: '🎵',
    items: [
      { interest_id: 30, interest_tag: 'Pop', icon: '🎤' },
      { interest_id: 31, interest_tag: 'Rock', icon: '🎸' },
      { interest_id: 32, interest_tag: 'Hip Hop', icon: '🎧' },
      { interest_id: 33, interest_tag: 'Indie', icon: '🎹' },
      { interest_id: 34, interest_tag: 'K-Pop', icon: '🇰🇷' },
      { interest_id: 35, interest_tag: 'EDM', icon: '🎛️' },
    ]
  },
  {
    category_id: 5, category_name: 'Food & Drink', icon: '🍕',
    items: [
      { interest_id: 36, interest_tag: 'Sushi', icon: '🍣' },
      { interest_id: 37, interest_tag: 'Vegan', icon: '🥗' },
      { interest_id: 38, interest_tag: 'Coffee', icon: '☕' },
      { interest_id: 39, interest_tag: 'Bubble Tea', icon: '🧋' },
      { interest_id: 40, interest_tag: 'Pizza', icon: '🍕' },
      { interest_id: 41, interest_tag: 'Street Food', icon: '🍢' },
    ]
  },
  {
    category_id: 6, category_name: 'Tech', icon: '💻',
    items: [
      { interest_id: 42, interest_tag: 'Coding', icon: '💻' },
      { interest_id: 43, interest_tag: 'Gaming', icon: '🎮' },
      { interest_id: 44, interest_tag: 'Crypto', icon: '💰' },
      { interest_id: 45, interest_tag: 'AI', icon: '🤖' },
      { interest_id: 46, interest_tag: 'Startups', icon: '🚀' },
    ]
  },
  {
    // Pets & Traveling có trong bảng Categories nhưng chưa có Items trong đoạn SQL bạn gửi
    // Tôi vẫn để đây để hiển thị Category, sau này bạn insert thêm item vào SQL thì nó hiện ra
    category_id: 7, category_name: 'Pets', icon: '🐶', items: []
  },
  {
    category_id: 8, category_name: 'Traveling', icon: '✈️', items: []
  }
];

export default function Preferences() {
  const [prefs, setPrefs] = useState({
    interested_in: "everyone",
    age_min: 18,
    age_max: 35,
    max_distance_km: 50,
  });

  // State lưu danh sách Category (Mock Data)
  const [categories, setCategories] = useState([]); 
  
  // State lưu các ID sở thích đã chọn
  const [selectedIds, setSelectedIds] = useState([]); 

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- 1. Load dữ liệu khi vào trang ---
  useEffect(() => {
    // Load Mock Data
    setCategories(MOCK_CATEGORIES);
    
    // Demo: Giả sử User này đã chọn trước "Art" (ID 1) và "Gym" (ID 19)
    // setSelectedIds([1, 19]); 
  }, []);

  // --- Handlers ---
  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    setPrefs((prev) => ({
      ...prev,
      [name]: ["age_min", "age_max", "max_distance_km"].includes(name) 
        ? Number(value) : value,
    }));
  };

  // Logic Chọn/Bỏ chọn sở thích
  const toggleInterest = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id); // Bỏ chọn
      } else {
        if (prev.length >= 10) {
           alert("Chỉ được chọn tối đa 10 sở thích!");
           return prev;
        }
        return [...prev, id]; // Chọn thêm
      }
    });
  };

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
      // const userId = 1; // Lấy từ Auth Context
      
      console.log("Submitting Data:", { ...prefs, selectedIds });
      
      // Giả lập thành công
      setTimeout(() => {
          setMessage({ type: "success", text: "Cập nhật thành công!" });
          setLoading(false);
      }, 1000);

    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Có lỗi xảy ra." });
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discovery Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Customize your matching experience</p>
        </div>

        {/* Thông báo */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
            message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
          }`}>
            <AlertCircle className="w-4 h-4" />
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* --- PHẦN 1: PREFERENCES --- */}
            <div className="space-y-6 border-b border-gray-100 pb-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">I'm interested in</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['male', 'female', 'everyone'].map((option) => (
                        <button
                            key={option} type="button"
                            onClick={() => setPrefs(p => ({ ...p, interested_in: option }))}
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
                            <label className="text-sm font-bold text-gray-700">Age Range</label>
                            <span className="text-sm font-medium text-pink-600">{prefs.age_min} - {prefs.age_max}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <input type="number" name="age_min" value={prefs.age_min} onChange={handlePrefChange} className="w-full px-3 py-2 border rounded-lg text-center outline-none focus:ring-2 focus:ring-pink-500/20" />
                            <span className="text-gray-400">-</span>
                            <input type="number" name="age_max" value={prefs.age_max} onChange={handlePrefChange} className="w-full px-3 py-2 border rounded-lg text-center outline-none focus:ring-2 focus:ring-pink-500/20" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-gray-700">Distance</label>
                            <span className="text-sm font-medium text-pink-600">{prefs.max_distance_km} km</span>
                        </div>
                        <input type="range" name="max_distance_km" min="1" max="200" value={prefs.max_distance_km} onChange={handlePrefChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600 mt-3" />
                    </div>
                </div>
            </div>

            {/* --- PHẦN 2: INTERESTS (Tinder Style) --- */}
            <div>
              <div className="flex justify-between items-end mb-4">
                  <label className="block text-lg font-bold text-gray-800">Interests</label>
                  <span className="text-sm text-gray-500">{selectedIds.length}/10 selected</span>
              </div>
              
              <div className="space-y-6">
                {categories.map((cat) => (
                  // Chỉ hiển thị category nếu có items bên trong (ẩn Pets/Traveling nếu rỗng)
                  cat.items.length > 0 && (
                    <div key={cat.category_id}>
                      {/* Tiêu đề nhóm */}
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span>{cat.icon}</span> {cat.category_name}
                      </h3>
                      
                      {/* Danh sách Pills */}
                      <div className="flex flex-wrap gap-2">
                          {cat.items.map((item) => {
                              const isSelected = selectedIds.includes(item.interest_id);
                              return (
                                  <button
                                      key={item.interest_id}
                                      type="button"
                                      onClick={() => toggleInterest(item.interest_id)}
                                      className={`
                                          px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5
                                          ${isSelected 
                                              ? "bg-white border-pink-500 text-pink-600 shadow-sm ring-1 ring-pink-500" // Đã chọn
                                              : "bg-white border-gray-300 text-gray-600 hover:border-pink-300 hover:bg-gray-50" // Chưa chọn
                                          }
                                      `}
                                  >
                                      {/* Icon riêng của từng Tag */}
                                      <span>{item.icon}</span>
                                      {item.interest_tag}
                                  </button>
                              )
                          })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-pink-600/30 flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              {loading ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}