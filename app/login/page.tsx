export default function Login() {
    return (
        <div className="flex justify-center items-center h-dvh">
            <form className="flex flex-col bg-green-100 px-4 py-10 rounded-md shadow-sm">
                <label className="text-sm font-semibold mb-1">Email</label>
                <input
                 type="email" 
                 name="email" 
                 placeholder="name@example.com"
                 className="border border-neutral-400 w-70 rounded-md px-1 py-1.5 text-base outline-none focus:ring-3 focus:ring-neutral-300"/>
                <label className="text-sm font-semibold mb-1 mt-3">Password</label>
                <input 
                type="password" 
                name="password" 
                placeholder="********"
                className="border border-neutral-400 w-70 rounded-md px-1 py-1.5 text-base outline-none focus:ring-3 focus:ring-neutral-300"/>
                <button type="submit" className="mt-5 bg-green-600 text-white text-sm py-1.5 rounded-md font-semibold">Login</button>
            </form>
        </div>
    );
};
