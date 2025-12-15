import { useState, useEffect } from "react";
import { Camera, Save, AlertCircle } from "lucide-react";

export default function EditProfile() {
  // State chứa thông tin Profile
  const [formData, setFormData] = useState({
    username: "", // Read only
    email: "",    // Read only
    bio: "",
    jobTitle: "",
    company: "",
    education: "",
    birthDate: "",
    gender: "male",
  });

  // State cho phần Sở thích (Interests)
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- 1. LOAD DATA KHI VÀO TRANG ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = 1; // Hardcode user 1

        // Gọi 2 API song song: Metadata và Profile hiện tại
        const [metaRes, profileRes] = await Promise.all([
          fetch("http://localhost:4000/api/metadata/interests"),
          fetch(`http://localhost:4000/api/profile/${userId}`),
        ]);

        const metaData = await metaRes.json();
        const userData = await profileRes.json();

        // 1. Set Menu Sở thích
        if (Array.isArray(metaData)) setCategories(metaData);

        // 2. Set Sở thích đã chọn
        if (userData.selectedInterestIds) setSelectedIds(userData.selectedInterestIds);

        // 3. Set Profile Data (Mapping từ DB sang State)
        if (userData.profile) {
          const p = userData.profile;
          setFormData({
            username: p.username || "User",
            email: p.email || "",
            bio: p.bio || "",
            // Lưu ý: DB trả về snake_case (job_title), State dùng camelCase (jobTitle)
            jobTitle: p.job_title || "", 
            company: p.company || "",
            education: p.education || "",
            gender: p.gender || "male",
            // Cắt chuỗi ngày: 2000-01-01T00:00... -> 2000-01-01
            birthDate: p.birth_date ? p.birth_date.toString().split('T')[0] : "",
          });
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Lỗi kết nối Server!" });
      }
    };

    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 10) {
        alert("Tối đa 10 sở thích thôi nhé!");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const userId = 1;

      // Gọi 2 API song song: Update Profile & Update Interests
      const [profileRes, interestRes] = await Promise.all([
        // 1. Lưu Profile cơ bản
        fetch("http://localhost:4000/api/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ...formData }),
        }),
        // 2. Lưu Sở thích
        fetch("http://localhost:4000/api/profile/interests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, interest_ids: selectedIds }),
        }),
      ]);

      if (!profileRes.ok || !interestRes.ok) throw new Error("Lỗi lưu dữ liệu");

      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Có lỗi xảy ra, vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-500">Update your personal details</p>
          </div>
          {/* Nút giả chuyển sang trang ảnh (Sau này dùng React Router Link) */}
          <button className="flex items-center gap-2 bg-white text-pink-600 border border-pink-200 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-pink-50 transition">
            <Camera className="w-5 h-5" />
            Manage Photos
          </button>
        </div>

        {/* Thông báo */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
          }`}>
            <AlertCircle className="w-5 h-5" />
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. BASIC INFO */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
              Basic Info
            </h2>
            
            <div className="space-y-5">
               {/* Read-only fields */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                    <input type="text" value={formData.username} disabled className="w-full px-4 py-2.5 rounded-xl border bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={formData.email} disabled className="w-full px-4 py-2.5 rounded-xl border bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
               </div>

               {/* Bio */}
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition resize-none"
                    placeholder="Describe yourself..."
                  />
               </div>

               {/* Job & Edu */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title</label>
                    <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company</label>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" />
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Education</label>
                    <input type="text" name="education" value={formData.education} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Birth Date</label>
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" />
                  </div>
               </div>

               {/* Gender */}
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                 <div className="flex gap-4">
                    {['male', 'female', 'other'].map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gender" 
                          value={g} 
                          checked={formData.gender === g} 
                          onChange={handleChange}
                          className="accent-pink-600 w-4 h-4"
                        />
                        <span className="capitalize text-gray-700">{g}</span>
                      </label>
                    ))}
                 </div>
               </div>
            </div>
          </div>

          {/* 2. INTERESTS (Tinder Style) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-end mb-5">
               <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                 Interests
               </h2>
               <span className="text-sm text-gray-500 font-medium">{selectedIds.length}/10 selected</span>
            </div>

            <div className="space-y-6">
              {categories.map((cat) => (
                cat.items.length > 0 && (
                  <div key={cat.category_id}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                       <span>{cat.icon}</span> {cat.category_name}
                    </h3>
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
                                            ? "bg-white border-pink-500 text-pink-600 shadow-sm ring-1 ring-pink-500" 
                                            : "bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:bg-pink-50"
                                        }
                                    `}
                                >
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

          {/* SUBMIT BUTTON */}
          <div className="sticky bottom-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-600/30 flex justify-center items-center gap-2 active:scale-[0.98] transition-all"
            >
              {loading ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}