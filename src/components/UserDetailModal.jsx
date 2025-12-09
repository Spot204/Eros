export default function UserDetailModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-pink-50 w-[360px] max-h-[85vh] p-6 rounded-2xl overflow-y-auto relative shadow-xl">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-pink-500 hover:text-pink-700 text-xl"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-1">
          {user.name}, {user.age}
        </h2>

        <p className="text-gray-600 mb-4">{user.bio}</p>

        <div className="mb-4">
          <p className="font-semibold">🎓 Học vấn</p>
          <p>{user.education || "Không có thông tin"}</p>
        </div>

        <div className="mb-4">
          <p className="font-semibold">💼 Công việc</p>
          <p>{user.jobTitle ? `${user.jobTitle} tại ${user.company}` : "—"}</p>
        </div>

        <div className="mb-4">
          <p className="font-semibold">✨ Sở thích</p>
          <p>{user.hobbies || "—"}</p>
        </div>

        <div className="mb-4">
          <p className="font-semibold mb-2">📸 Ảnh khác</p>

          <div className="grid grid-cols-2 gap-2">
            {user.photos?.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-full h-28 object-cover rounded"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
