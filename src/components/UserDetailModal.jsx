export default function UserDetailModal({ user, onClose }) {
  const age =
    new Date().getFullYear() - new Date(user.birth_date).getFullYear();

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center">
      <div className="bg-white w-[380px] max-h-[90vh] rounded-2xl overflow-y-auto shadow-2xl relative">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"
        >
          ✖
        </button>

        {/* AVATAR */}
        <div className="w-full h-[360px]">
          <img
            src={
              user.avatar
                ? `http://localhost:8008${user.avatar}` // Nối link server nếu có ảnh
                : "https://placehold.co/400x600?text=No+Image" // Ảnh dự phòng nếu avatar bị null
            }
            alt={user.username}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            // Trường hợp file ảnh trên server bị xóa mất nhưng link vẫn còn trong DB
            onError={(e) => {
              e.target.src =
                "https://placehold.co/400x600?text=Error+Loading+Image";
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="p-5">
          <h2 className="text-2xl font-bold mb-1">
            {user.username}, {age}
          </h2>

          {user.bio && <p className="text-gray-600 mb-4">{user.bio}</p>}

          {/* EDUCATION */}
          <div className="mb-3">
            <p className="font-semibold">🎓 Học vấn</p>
            <p className="text-gray-700">{user.education || "Chưa cập nhật"}</p>
          </div>

          {/* JOB */}
          <div className="mb-3">
            <p className="font-semibold">💼 Công việc</p>
            <p className="text-gray-700">
              {user.job_title
                ? `${user.job_title}${
                    user.company ? " tại " + user.company : ""
                  }`
                : "Chưa cập nhật"}
            </p>
          </div>

          {/* INTERESTS */}
          {user.interests?.length > 0 && (
            <div className="mb-4">
              <p className="font-semibold mb-2">✨ Sở thích</p>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PHOTOS */}
          {user.photos?.length > 1 && (
            <div className="mt-4">
              <p className="font-semibold mb-2">📸 Ảnh khác</p>
              <div className="grid grid-cols-2 gap-2">
                {user.photos.slice(1).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
