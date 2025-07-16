export default function Home() {
    return (
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen flex items-center justify-center bg-zinc-900/30 p-4">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Audio UI Components</h1>
                <p className="text-lg md:text-xl text-zinc-400 mb-6 md:mb-8">
                    Select a component from the sidebar to view its demo
                </p>
                <div className="text-zinc-500 text-sm md:text-base">
                    A library of React components for audio applications
                </div>
            </div>
        </div>
    );
}
