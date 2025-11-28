export default function UserDetailModal({ user, onClose, onBlock, onReport }) {
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

                {/* Education */}
                <div className="mb-4">
                    <p className="font-semibold">🎓 Học vấn</p>
                    <p>{user.edu}</p>
                </div>

                {/* Hobby */}
                <div className="mb-4">
                    <p className="font-semibold">✨ Sở thích</p>
                    <p>{user.hobby}</p>
                </div>

                {/* Additional Photos */}
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
                {/* Actions */}
                <div className="flex justify-between mt-8 gap-4">
                    {/* Nút Chặn */}
                    <button
                        onClick={() => onBlock(user.id)}
                        className="
                            flex-1 px-3 py-2 rounded-full 
                            bg-pink-100 text-pink-600 font-semibold 
                            shadow-sm hover:bg-pink-200 
                            transition-all
                        ">
                        Chặn
                    </button>
                    {/* Nút Báo cáo */}
                    <button
                        onClick={() => onReport(user.id)}
                        className="
                            flex-1 px-3 py-2 rounded-full 
                            bg-white text-pink-500 font-semibold 
                            border border-pink-300 
                            shadow-sm hover:bg-pink-50
                            transition-all
                        "
                    >
                        Báo cáo
                    </button>
                </div>
            </div>
        </div>
    );
}
