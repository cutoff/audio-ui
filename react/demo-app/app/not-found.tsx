"use client";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen flex items-center justify-center bg-zinc-900/30 p-4">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-lg md:text-xl text-zinc-400 mb-6 md:mb-8">
                    The page you are looking for does not exist.
                </p>
            </div>
        </div>
    );
}
