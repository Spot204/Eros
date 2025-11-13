import React from "react";

export function UserCard({ user, score }) {
  return (
    <div className="border rounded-2xl p-4 shadow-md flex flex-col bg-white hover:shadow-xl transition-shadow">
      {/* Header: Name + Age */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <span className="text-sm text-gray-500">{user.age} yrs</span>
      </div>

      {/* Gender + Orientation */}
      <div className="text-sm text-gray-600 mb-2">
        {user.gender} • {user.orientation}
      </div>

      {/* Interests */}
      {user.interests && user.interests.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {user.interests.map((interest, idx) => (
            <span
              key={idx}
              className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      {/* Match Score */}
      <div className="mt-auto">
        <div className="text-sm text-gray-500 mb-1">Match Score</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600 mt-1">{score}%</div>
      </div>
    </div>
  );
}
