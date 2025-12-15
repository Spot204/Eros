import { useState } from "react";

export default function CreateProfile() {
  const [formData, setFormData] = useState({
    gender: "",
    birthDate: "",
    bio: "",
    jobTitle: "",
    company: "",
    education: "",
    location: "", // Hiện tại là text, sau này gắn AutoComplete API vào đây
  });

  // State lưu lỗi validation
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Xóa lỗi của trường đó khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Hàm tính tuổi chính xác
  const calculateAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // 1. Check Tuổi (Quan trọng nhất)
    if (!formData.birthDate) {
      newErrors.birthDate = "Please select your birth date.";
      isValid = false;
    } else {
      const age = calculateAge(formData.birthDate);
      if (age < 18) {
        newErrors.birthDate = `You must be at least 18 years old. (Current: ${age})`;
        isValid = false;
      }
    }

    // 2. Check Gender
    if (!formData.gender) {
      newErrors.gender = "Please select your gender.";
      isValid = false;
    }

    // 3. Check Location
    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
      isValid = false;
    }

    // 4. Check Bio (Không bắt buộc nhưng nên giới hạn độ dài)
    if (formData.bio.length > 500) {
      newErrors.bio = "Bio is too long (max 500 characters).";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Dữ liệu sạch, sẵn sàng gửi API hoặc chuyển trang
      console.log("Valid Data submitted:", formData);
      
      // TODO: Call API here
      // nextStep();
    } else {
      console.log("Form has errors");
      // Scroll lên đầu hoặc focus vào lỗi (optional)
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Complete Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Let others know more about you</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
              <div className="flex gap-4">
                {["Male", "Female", "Other"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={handleChange}
                        className="peer sr-only" 
                      />
                      {/* Custom Radio Button Style */}
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
                        formData.gender === option ? 'border-pink-500 bg-pink-500' : 'border-gray-300 group-hover:border-pink-300'
                      }`}>
                         <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                       formData.gender === option ? 'text-gray-900' : 'text-gray-500'
                    }`}>{option}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-xs mt-2 font-medium">{errors.gender}</p>}
            </div>

            {/* Birth Date */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Birth Date
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.birthDate 
                    ? "border-red-500 focus:ring-red-200" 
                    : "border-gray-200 focus:ring-pink-500/20 focus:border-pink-500"
                }`}
              />
              {errors.birthDate && <p className="text-red-500 text-xs mt-1.5">{errors.birthDate}</p>}
            </div>

            {/* Location (Text input for future API) */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: 13 Ngo Phung Khoang, Ha Noi"
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.location 
                    ? "border-red-500 focus:ring-red-200" 
                    : "border-gray-200 focus:ring-pink-500/20 focus:border-pink-500"
                }`}
              />
              {errors.location && <p className="text-red-500 text-xs mt-1.5">{errors.location}</p>}
              <p className="text-xs text-gray-400 mt-1">We will suggest exact addresses soon.</p>
            </div>

            {/* Job & Company (Gộp 2 cột cho gọn) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Designer"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Freelance"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            </div>

            {/* Education */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="University name..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                About You
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="I like coffee and coding..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                   errors.bio ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-pink-500/20 focus:border-pink-500"
                }`}
              />
              <div className="flex justify-between mt-1">
                 {errors.bio ? <span className="text-red-500 text-xs">{errors.bio}</span> : <span></span>}
                 <span className={`text-xs ${formData.bio.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.bio.length}/500
                 </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-600/30 transition-all active:scale-[0.98] mt-4"
            >
              Continue to Photos
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}