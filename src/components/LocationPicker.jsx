import { useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

export default function LocationPicker({ onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayAddress, setDisplayAddress] = useState("");

  // 1. Tìm kiếm địa chỉ (Dùng OpenStreetMap Nominatim)
  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // API miễn phí, không cần key
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Lấy vị trí hiện tại (GPS Browser)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ GPS");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse Geocoding: Đổi tọa độ ra tên đường để hiển thị
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addressName = data.display_name;
          
          setDisplayAddress(addressName);
          // Gửi dữ liệu ra ngoài cho form cha
          onLocationSelect({
            latitude,
            longitude,
            address: addressName
          });
        } catch (e) {
            setDisplayAddress(`GPS: ${latitude}, ${longitude}`);
             onLocationSelect({ latitude, longitude, address: "GPS Location" });
        }
        setLoading(false);
      },
      () => {
        alert("Không thể lấy vị trí. Hãy bật quyền truy cập GPS.");
        setLoading(false);
      }
    );
  };

  // 3. Khi user chọn 1 địa chỉ từ gợi ý
  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    
    setDisplayAddress(item.display_name);
    setSuggestions([]); // Ẩn gợi ý
    setQuery("");       // Xóa ô tìm kiếm

    onLocationSelect({
        latitude: lat,
        longitude: lon,
        address: item.display_name
    });
  };

  return (
    <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">Location</label>
        
        {/* Hiển thị kết quả đã chọn */}
        {displayAddress && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{displayAddress}</span>
            </div>
        )}

        <div className="flex gap-2">
            {/* Ô nhập tìm kiếm */}
            <div className="relative flex-1">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                    placeholder="Search city (e.g. Hanoi)"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 outline-none"
                />
                <button 
                    type="button"
                    onClick={handleSearch}
                    className="absolute right-2 top-2 text-gray-400 hover:text-pink-500"
                >
                    <Search className="w-5 h-5" />
                </button>

                {/* Dropdown Gợi ý */}
                {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white mt-1 rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                        {suggestions.map((item) => (
                            <div 
                                key={item.place_id} 
                                onClick={() => handleSelectSuggestion(item)}
                                className="p-3 hover:bg-pink-50 cursor-pointer text-sm border-b last:border-0 text-gray-700"
                            >
                                {item.display_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Nút lấy GPS hiện tại */}
            <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 rounded-xl transition-colors flex items-center justify-center"
                title="Use current location"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
            </button>
        </div>
    </div>
  );
}