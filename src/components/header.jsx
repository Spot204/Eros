import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faHome, faComment } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const header = () => {
  const navigate = useNavigate();

  const handleClickHome = () => {
    navigate("/home");
  }

  const handleClickChat = () => {
    navigate("/chat");
  }

  const handleClickProfile = () => {
    navigate("/profile");
  }

  const handleClickLogout = () => {
    navigate("/");
  }
  return (
    <div>
      <div className="bg-linear-to-r from-blue-500 to-purple-500 h-[100px] flex items-center justify-between pr-[100px] pl-[100px]">
        <div className=" flex">
          <div className="m-1 h-[60px] w-[60px] bg-white rounded-full hover:scale-[1.2] transform-fill duration-300 flex justify-center items-center cursor-pointer" onClick={()=>{handleClickProfile()}} ></div>
          {/*profile */}
          <div className="m-1 h-[60px] w-[60px] bg-white rounded-full hover:scale-[1.2] transform-fill duration-300 flex justify-center items-center text-2xl cursor-pointer" onClick={()=>{handleClickHome()}} >
            <FontAwesomeIcon icon={faHome} />
          </div>
          {/*home */}
          <div className="m-1 rounded-full hover:scale-[1.2] transform-fill duration-300 bg-white h-[60px] w-[60px] flex justify-center items-center text-2xl cursor-pointer" onClick={()=>{handleClickChat()}} >
            <FontAwesomeIcon icon={faComment} />
          </div>
          {/*mess */}
        </div>
        <div className="text-[30px] hover:text-white transform-fill duration-300 cursor-pointer" onClick={()=>{handleClickLogout()}} >Đăng xuất</div> {/*logout */}
      </div>
    </div>
  );
};

export default header;
