import { useState } from "react";
import { Button } from "../components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export function AuthDialog({ open, onOpenChange, defaultMode = "login"}) {
    const [mode, setMode] = useState(defaultMode);
    const isLogin = mode === "login";

    const toggleMode = () => {
        setMode(isLogin ? "register" : "login");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLogin) {
            console.log("Logging in...");
        } else {
            console.log("Registering...");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className ="bg-white max-w-md">
                <DialogHeader>
                    <DialogTitle>{isLogin ? "Đăng nhập" : "Tạo tài khoản"}</DialogTitle>
                    <DialogDescription>
                        {isLogin ? "Chào mừng bạn trở lại! Đăng nhập để tiếp tục." : "Tạo tài khoản để bắt đầu kết nối!"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Register thêm input name */}
                    {!isLogin && (
                        <input className="w-full border p-2 rounded" placeholder="Tên hiển thị" required />
                    )}
                    <input type="email" className="w-full border p-2 rounded" placeholder="Email" required />
                    <input type="password" className="w-full border p-2 rounded" placeholder="Mật khẩu" required />
                    {!isLogin && (
                        <input type="password" className="w-full border p-2 rounded" placeholder="Xác nhận mật khẩu" required />
                    )}
                    <Button type="submit" variant="default" size="default" className="w-full">
                        {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
                    </Button>
                </form>

                {/* Chuyển đổi giữa đăng nhập và đăng ký */}
                <div className="text-center text-sm mt-2">
                    {isLogin ? (
                        <>
                            Chưa có tài khoản?{" "}
                            <button onClick={toggleMode} className="text-blue-600 hover:underline cursor-pointer">
                                Tạo tài khoản
                            </button>
                        </>
                    ) : (
                        <>  
                            Đã có tài khoản?{" "}
                            <button onClick={toggleMode} className="text-blue-600 hover:underline cursor-pointer">
                                Đăng nhập
                            </button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}