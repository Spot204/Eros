import React from "react";

function ChatSidebar({ matches, selectedMatchId, onSelectMatch, currentId }) {
  return (
    <div className="w-96 bg-white border-r border-gray-300 flex flex-col">
      <div className="px-5 border-b font-bold text-xl py-5.5">Tin nhắn</div>

      <div className="flex-1 overflow-y-auto">
        {matches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Chưa có tin nhắn nào
          </div>
        ) : (
          matches.map((match) => {
            const isActive = selectedMatchId == match.match_id;

            return (
              <div
                key={match.match_id}
                onClick={() =>
                  onSelectMatch(match.match_id, match.partner_name)
                }
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-all border-b ${
                  isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        match.avatar
                          ? `http://localhost:8008${match.avatar}`
                          : "https://placehold.co/100x100?text=User"
                      }
                      alt={match.username || "User"}
                      className="w-14 h-14 rounded-full object-cover border border-gray-100"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/100x100?text=Error";
                      }}
                    />
                    {/* Green dot online status */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{match.partner_name}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {match.last_message || "Bắt đầu trò chuyện"}
                    </div>
                  </div>

                  {match.unread_count > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {match.unread_count}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export { ChatSidebar };
