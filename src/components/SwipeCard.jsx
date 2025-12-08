import { useState, forwardRef, useImperativeHandle } from "react";

const SwipeCard = forwardRef(({ user, zIndex, onSwipe, onShowDetail }, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [buttonSwipe, setButtonSwipe] = useState(null); // 'left' | 'right'

  // Drag start
  const handleStart = (e) => {
    if (buttonSwipe) return;
    setIsDragging(true);
    const touch = e.touches ? e.touches[0] : e;
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  // Drag move
  const handleMove = (e) => {
    if (!isDragging || buttonSwipe) return;
    const touch = e.touches ? e.touches[0] : e;
    setPosition({
      x: touch.clientX - startPos.x,
      y: touch.clientY - startPos.y,
    });
  };

  // Drag end
  const handleEnd = () => {
    if (buttonSwipe) return;
    setIsDragging(false);

    if (position.x > 120) triggerSwipe("right");
    else if (position.x < -120) triggerSwipe("left");
    else setPosition({ x: 0, y: 0 });
  };

  // Button swipe
  const triggerSwipe = (direction) => {
    setButtonSwipe(direction);

    setTimeout(() => {
      onSwipe(user.id, direction);
    }, 300);
  };

  // Expose swipeLeft/swipeRight to parent
  useImperativeHandle(ref, () => ({
    swipeLeft: () => triggerSwipe("left"),
    swipeRight: () => triggerSwipe("right"),
  }));

  // Animation transform
  let transformStyle = `translate(${position.x}px, ${position.y}px) rotate(${position.x / 10}deg)`;
  if (buttonSwipe === "left") transformStyle = "translateX(-200px) rotate(-12deg)";
  if (buttonSwipe === "right") transformStyle = "translateX(200px) rotate(12deg)";

  return (
    <div
      className="absolute w-[350px] h-[520px] rounded-xl shadow-lg overflow-hidden bg-gray-200 cursor-grab active:cursor-grabbing transition-all duration-300"
      style={{ zIndex, transform: transformStyle }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* ► Ảnh chính */}
      <img
        src={user.photos?.[0] || "https://via.placeholder.com/400"}
        alt={user.name}
        className="w-full h-full object-cover"
      />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
        <h2 className="text-xl font-semibold">
          {user.name}, {user.age}
        </h2>

        <p className="text-white/80 text-sm">{user.bio}</p>

        <button
          onClick={onShowDetail}
          className="mt-4 px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 font-medium shadow-sm hover:bg-pink-200 transition flex items-center gap-2 text-sm"
        >
          Xem thêm
        </button>
      </div>
    </div>
  );
});

export default SwipeCard;
