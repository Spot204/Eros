// src/pages/ManagePhoto.jsx
import React, { useRef, useState } from "react";
import { Trash2, Star } from "lucide-react";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

export default function ManagePhoto() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]); // ảnh đã lưu
  const [draftPhotos, setDraftPhotos] = useState([]); // ảnh chưa lưu
  const [loading, setLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const fileInputRef = useRef(null);
  const allPhotos = [...photos, ...draftPhotos];
  useEffect(() => {
    const fetchSavedPhotos = async () => {
      const userId = localStorage.getItem("userID");
      if (!userId) return;

      try {
        const res = await fetch(
          `http://localhost:8008/api/photos/me?userId=${userId}`
        );
        const data = await res.json();

        if (data.photos) {
          // Chuyển đổi dữ liệu từ server sang format state của bạn
          const formattedPhotos = data.photos.map((p) => ({
            id: p.id,
            url: `http://localhost:8008${p.url}`, // Nối link server
            isPrimary: p.is_primary,
            status: "saved",
          }));
          setPhotos(formattedPhotos);
        }
      } catch (error) {
        console.error("Lỗi khi lấy ảnh cũ:", error);
      }
    };

    fetchSavedPhotos();
  }, []);

  const handleAddPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Chỉ được chọn ảnh!");
      return;
    }

    const newPhoto = {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
      isPrimary: allPhotos.length === 0,
      status: "draft",
    };

    setDraftPhotos((prev) => [...prev, newPhoto]);
    e.target.value = ""; // reset input
  };

  const handleSetPrimary = async (id, status) => {
    // 1. Nếu là ảnh vừa mới chọn (draft), chỉ cập nhật UI
    if (status === "draft") {
      setDraftPhotos((prev) =>
        prev.map((p) => ({ ...p, isPrimary: p.id === id }))
      );
      setPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: false })));
      return;
    }

    // 2. Nếu là ảnh đã lưu trên server, gọi API cập nhật Database
    try {
      const userId = localStorage.getItem("userID");
      const res = await fetch(
        `http://localhost:8008/api/photos/${id}/primary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }), // Gửi userId để server xác thực
        }
      );

      if (res.ok) {
        // Cập nhật UI đồng bộ
        setPhotos((prev) =>
          prev.map((p) => ({ ...p, isPrimary: p.id === id }))
        );
        setDraftPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: false })));
        alert("Đã đổi ảnh đại diện!");
      }
    } catch (error) {
      console.error("Lỗi set primary:", error);
    }
  };

  const handleDeletePhoto = async (id) => {
    const target = allPhotos.find((p) => p.id === id);

    // Chặn xóa ảnh Primary ngay tại giao diện
    if (target?.isPrimary) {
      alert(
        "Không thể xóa ảnh Primary. Vui lòng chọn ảnh khác làm Primary trước."
      );
      return;
    }

    // Xác nhận trước khi xóa
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;

    // Nếu là ảnh đã lưu (status === "saved"), gọi API xóa trên server
    if (target.status === "saved") {
      try {
        const userId = localStorage.getItem("userID");
        const res = await fetch(
          `http://localhost:8008/api/photos/${id}?userId=${userId}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message);
        }
      } catch (error) {
        alert("Lỗi: " + error.message);
        return; // Dừng lại không xóa ở UI nếu server lỗi
      }
    }

    // Cập nhật lại giao diện sau khi xóa thành công
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setDraftPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveChanges = async () => {
    if (draftPhotos.length === 0) return;
    setLoading(true);

    try {
      const userId = localStorage.getItem("userID");
      const formData = new FormData();
      formData.append("userId", userId);

      draftPhotos.forEach((photo) => {
        formData.append("photos", photo.file);
      });

      const res = await fetch("http://localhost:8008/api/photos/upload", {
        method: "POST",
        body: formData, // Khi dùng FormData, KHÔNG set Content-Type header
      });

      const data = await res.json();

      if (res.ok && data.photos) {
        // Format lại ảnh từ server trả về
        const saved = data.photos.map((p) => ({
          id: p.id,
          url: `http://localhost:8008${p.url}`,
          isPrimary: p.is_primary,
          status: "saved",
        }));

        setPhotos((prev) => [...prev, ...saved]);
        setDraftPhotos([]); // Quan trọng: Xóa ảnh tạm sau khi save thành công
        alert("Lưu thay đổi thành công!");
        navigate("/home");
      }
    } catch (error) {
      console.error("Lỗi save:", error);
      alert("Không thể lưu ảnh!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage photos</h1>
          <p className="text-gray-500">
            Upload and organize your profile photos
          </p>
        </div>

        {/* Add Photo Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex gap-3">
            <h2 className="text-lg font-bold text-gray-800 mb-7 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
              Add or Change photos
            </h2>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-9 h-9 cursor-pointer bg-pink-600 hover:bg-pink-700 disabled:opacity-70 text-white text-xl font-bold rounded-full shadow-lg shadow-pink-600/30 flex justify-center items-center active:scale-[0.98] transition-all"
            >
              +
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAddPhoto}
              hidden
            />
          </div>

          {/* Photos Grid */}
          {allPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-card rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={photo.url}
                      alt="Profile photo"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreviewPhoto(photo.url)}
                    />
                    {photo.isPrimary && (
                      <div className="absolute top-2 right-1 bg-primary text-yellow-500 text-primary-foreground px-3 py-1 rounded-full text-3xl font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-3 ">
                    <div className="flex gap-2 justify-center">
                      {!photo.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(photo.id)}
                          className="bg-yellow-500 text-white cursor-pointer bg-secondary hover:bg-yellow-600 hover:bg-secondary/80 text-foreground font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <Star className="w-4 h-4 fill-white" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="bg-red-500 text-white cursor-pointer bg-destructive hover:bg-red-600 hover:bg-destructive/90 text-destructive-foreground font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-gray-100 p-12 text-center">
              <p className="text-muted-foreground">
                No photo yet. Add your first photo above to get started!
              </p>
            </div>
          )}

          <div className="sticky bottom-4 mt-8">
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={loading || draftPhotos.length === 0}
              className="w-full cursor-pointer bg-pink-600 hover:bg-pink-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-600/30 flex justify-center items-center gap-2 active:scale-[0.98] transition-all"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
          {previewPhoto && (
            <div
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
              onClick={() => setPreviewPhoto(null)}
            >
              <img
                src={previewPhoto}
                className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-xl"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
