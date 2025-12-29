import { React, useState, useEffect } from "react"; // Thêm useState
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faComment } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Header = () => {
  // Đổi tên thành Header (viết hoa chữ cái đầu)
  const navigate = useNavigate();

  // 1. Thêm State để lưu ảnh đại diện
  const [avatarUrl, setAvatarUrl] = useState(null);

  const handleClickHome = () => navigate("/home");
  const handleClickChat = () => navigate("/chat");
  const handleClickProfile = () => navigate("/edit-profile");

  const handleClickLogout = () => {
    localStorage.removeItem("userID"); // Xóa ID khi logout cho an toàn
    navigate("/");
  };

  useEffect(() => {
    const fetchSavedPhotos = async () => {
      const userId = localStorage.getItem("userID");
      if (!userId) return;

      try {
        const res = await fetch(
          `http://localhost:8008/api/photos/me?userId=${userId}`
        );
        const data = await res.json();

        if (data.photos && data.photos.length > 0) {
          // TÌM ẢNH ĐẠI DIỆN Ở ĐÂY
          const primaryPhoto =
            data.photos.find((p) => p.is_primary === true) || data.photos[0];

          // CHỈ LƯU STRING URL
          setAvatarUrl(`http://localhost:8008${primaryPhoto.url}`);
        }
      } catch (error) {
        console.error("Lỗi khi lấy ảnh header:", error);
      }
    };

    fetchSavedPhotos();
  }, []);

  return (
    <div>
      <div className="bg-linear-to-r from-blue-500 to-purple-500 h-[100px] flex items-center justify-between pr-[100px] pl-[100px]">
        <div className="flex">
          {/* Vùng hiển thị Avatar */}
          <div
            className="m-1 h-[60px] w-[60px] bg-white rounded-full hover:scale-[1.2] transition-transform duration-300 flex justify-center items-center cursor-pointer overflow-hidden border-2 border-white"
            onClick={handleClickProfile}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-gray-200 w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Nút Home */}
          <div
            className="m-1 h-[60px] w-[60px] bg-white rounded-full hover:scale-[1.2] transition-transform duration-300 flex justify-center items-center text-2xl cursor-pointer"
            onClick={handleClickHome}
          >
            <FontAwesomeIcon icon={faHome} />
          </div>

          {/* Nút Chat */}
          <div
            className="m-1 rounded-full hover:scale-[1.2] transition-transform duration-300 bg-white h-[60px] w-[60px] flex justify-center items-center text-2xl cursor-pointer"
            onClick={handleClickChat}
          >
            <FontAwesomeIcon icon={faComment} />
          </div>
        </div>

        {/* Nút Đăng xuất */}
        <div
          className="text-[30px] hover:text-white transition-colors duration-300 cursor-pointer text-white font-medium"
          onClick={handleClickLogout}
        >
          Đăng xuất
        </div>
      </div>
    </div>
  );
};

export default Header;
