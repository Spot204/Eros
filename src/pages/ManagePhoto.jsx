// src/pages/ManagePhoto.jsx
import React, { useState } from "react";
import { Trash2, Star } from "lucide-react";

export default function ManagePhoto() {
  const [photos, setPhotos] = useState([
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      isPrimary: true,
      orderIndex: 1,
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      isPrimary: false,
      orderIndex: 2,
    },
  ]);

  const [photoUrl, setPhotoUrl] = useState("");
  const [setAsPrimary, setSetAsPrimary] = useState(false);

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;

    const newPhoto = {
      id: Date.now().toString(),
      url: photoUrl,
      isPrimary: setAsPrimary,
      orderIndex: photos.length + 1,
    };

    if (setAsPrimary) {
      // nếu chọn làm primary thì bỏ primary cũ
      setPhotos(
        photos.map((p) => ({ ...p, isPrimary: false })).concat(newPhoto)
      );
    } else {
      setPhotos([...photos, newPhoto]);
    }

    setPhotoUrl("");
    setSetAsPrimary(false);
  };

  const handleSetPrimary = (id) => {
    setPhotos(
      photos.map((p) => ({
        ...p,
        isPrimary: p.id === id,
      }))
    );
  };

  const handleDeletePhoto = (id) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Manage your photos
          </h1>
          <p className="text-muted-foreground">
            Upload and organize your profile photos
          </p>
        </div>

        {/* Add Photo Card */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full" />
            Add New Photo
          </h2>
          <form onSubmit={handleAddPhoto} className="space-y-4">
            <div>
              <label
                htmlFor="photoUrl"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Photo URL
              </label>
              <input
                type="url"
                id="photoUrl"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={setAsPrimary}
                onChange={(e) => setSetAsPrimary(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
              <span className="text-sm text-foreground">
                Set as primary photo
              </span>
            </label>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-colors"
            >
              Add Photo
            </button>
          </form>
        </div>

        {/* Photos Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img
                    src={photo.url}
                    alt="Profile photo"
                    className="w-full h-full object-cover"
                  />
                  {photo.isPrimary && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Primary
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Order:{" "}
                    <span className="font-semibold text-foreground">
                      {photo.orderIndex}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!photo.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(photo.id)}
                        className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Star className="w-4 h-4" />
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <p className="text-muted-foreground">
              No photos yet. Add your first photo above to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
