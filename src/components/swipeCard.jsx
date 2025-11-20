import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./card.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faXmark,
  faComment,
  faRotateLeft,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const SwipeCard = ({ onSwipe, person }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const user = {
    image: ["IMG_0111.JPG", "IMG_0112.JPG", "IMG_0138.JPG", "IMG_0142.JPG"],
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev < user.image.length - 1 ? prev + 1 : prev));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleStart = (e) => {
    setIsDragging(true);
    const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const y = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    setStartPos({ x, y });
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const y = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    const dx = x - startPos.x;
    const dy = y - startPos.y;
    setTranslate({ x: dx, y: dy });
    setRotation(dx / 20);
    if (dx > 50) {
      setSwipeDirection("right");
    } else if (dx < -50) {
      setSwipeDirection("left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (translate.x > 150) {
      onSwipe?.("right", person);
    } else if (translate.x < -150) {
      onSwipe?.("left", person);
    }
    setTranslate({ x: 0, y: 0 });
    setRotation(0);
    setSwipeDirection(null);
  };

  return (
    <div
      className="absolute"
      style={{
        transform: `translate(${translate.x}px, ${translate.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? "none" : "transform 0.3s ease",
        touchAction: "none",
      }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <Card className="w-[390px] h-[520px] bg-gray-400 shadow-xl shadow-gray-400 relative border-0">
        <div className="absolute top-2 w-full flex justify-center gap-2 z-20 shadow-lg shadow-gray-400">
          {user.image.map((_, index) => (
            <span
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white scale-125" : "bg-gray-400"
              }`}
            />
          ))}
        </div>

        <CardContent className="relative w-full h-full">
          <img
            src={`/public/${user.image[currentIndex]}`}
            alt={currentIndex}
            draggable="false"
            className="w-full h-full object-cover rounded-xl "
          />
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full w-6 h-6 z-10 hover:scale-105 transition-transform duration-200"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full w-6 h-6 z-10 hover:scale-105 transition-transform duration-200"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <CardHeader className="absolute bottom-16 left-4">
            <CardTitle className=" font-bold text-white text-3xl shadow-2xs w-[200px] shadow-gray-400 bg-black bg-opacity-50 px-2 rounded-md">
              Anh nguyen, 22
            </CardTitle>
            <CardDescription className=" text-white text-md mt-1 bg-black bg-opacity-50 px-2 rounded-md">
              5 km away
            </CardDescription>
          </CardHeader>
        </CardContent>

        <div className="flex gap-4 mt-4 items-center justify-center absolute -bottom-10 w-full z-10">
          <div
            className={`bg-white w-[60px] h-[60px] rounded-full flex justify-center items-center text-2xl transition-transform duration-300 hover:scale-[1.2] ${
              swipeDirection === "left" ? "scale-[1.2]" : ""
            }`}
          >
            <FontAwesomeIcon icon={faXmark} className="text-red-500 m-4" />
          </div>
          <div className="bg-white w-[60px] h-[60px] rounded-full flex justify-center items-center text-2xl transition-transform duration-300 hover:scale-[1.2]">
            <FontAwesomeIcon
              icon={faRotateLeft}
              className="text-yellow-500 m-4"
            />
          </div>
          <div className="bg-white w-[60px] h-[60px] rounded-full flex justify-center items-center text-2xl transition-transform duration-300 hover:scale-[1.2]">
            <FontAwesomeIcon icon={faComment} className="text-blue-500 m-4" />
          </div>
          <div
            className={`bg-white w-[60px] h-[60px] rounded-full flex justify-center items-center text-2xl transition-transform duration-300 hover:scale-[1.2] ${
              swipeDirection === "right" ? "scale-[1.2]" : ""
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className="text-green-500 m-4" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SwipeCard;
