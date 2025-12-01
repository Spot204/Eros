// src/pages/Preferences.jsx
import { useState } from "react";

export default function Preferences() {
  const [prefs, setPrefs] = useState({
    interested_in: "everyone",
    age_min: 18,
    age_max: 99,
    max_distance_km: 100,
  });

  const [interestsText, setInterestsText] = useState(""); // "music, travel, coding"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    setPrefs((prev) => ({
      ...prev,
      [name]:
        name === "age_min" ||
        name === "age_max" ||
        name === "max_distance_km"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // TODO: lấy userId thật
      const userId = 1;

      // 1) Gửi preferences
      const prefRes = await fetch("http://localhost:3000/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...prefs,
        }),
      });

      if (!prefRes.ok) {
        const err = await prefRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save preferences");
      }

      // 2) Gửi interests
      const interests = interestsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const intRes = await fetch("http://localhost:3000/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          interests, // array string
        }),
      });

      if (!intRes.ok) {
        const err = await intRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save interests");
      }

      setMessage("Lưu preferences & interests thành công!");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Match preferences
          </h1>
          {message && (
            <p className="mt-2 text-sm text-foreground">{message}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* interested_in */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Interested in
              </label>
              <select
                name="interested_in"
                value={prefs.interested_in}
                onChange={handlePrefChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="everyone">Everyone</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Age range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="age_min"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Age min
                </label>
                <input
                  type="number"
                  id="age_min"
                  name="age_min"
                  min={18}
                  max={99}
                  value={prefs.age_min}
                  onChange={handlePrefChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="age_max"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Age max
                </label>
                <input
                  type="number"
                  id="age_max"
                  name="age_max"
                  min={18}
                  max={99}
                  value={prefs.age_max}
                  onChange={handlePrefChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* max_distance_km */}
            <div>
              <label
                htmlFor="max_distance_km"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Max distance (km)
              </label>
              <input
                type="number"
                id="max_distance_km"
                name="max_distance_km"
                min={1}
                value={prefs.max_distance_km}
                onChange={handlePrefChange}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Interests */}
            <div>
              <label
                htmlFor="interests"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Interests (comma separated)
              </label>
              <textarea
                id="interests"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="music, sport, travel..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-70 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors mt-8"
            >
              {loading ? "Saving..." : "Save preferences"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
