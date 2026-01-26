"use client"

import ErrorMessage from "@/components/ErrorMessage";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
    const router = useRouter();
    
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    }

    const handleSubmit =async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false
            })
            setLoading(false);

            if(res?.error){
                setError(res?.error);
                return;
            }

            router.push("/dashboard")
        } catch (err: any) {
            setLoading(false);
            const message = err.response?.data?.error || "Login failed";
            setError(message);
        }
    }
    return (
        <div className="flex justify-center items-center h-dvh">
            {error && <ErrorMessage message={error}/>}
            <form onSubmit={handleSubmit} className="flex flex-col bg-green-100 px-4 py-10 rounded-md shadow-sm">
                <label className="text-sm font-semibold mb-1">Email</label>
                <input
                 type="email" 
                 name="email"
                 value={form.email}
                 onChange={handleChange}
                 placeholder="name@example.com"
                 className="border border-neutral-400 w-70 rounded-md px-1 py-1.5 text-base outline-none focus:ring-3 focus:ring-neutral-300"/>
                <label className="text-sm font-semibold mb-1 mt-3">Password</label>
                <input 
                type="password" 
                name="password" 
                placeholder="********"
                value={form.password}
                 onChange={handleChange}
                className="border border-neutral-400 w-70 rounded-md px-1 py-1.5 text-base outline-none focus:ring-3 focus:ring-neutral-300"/>
                <button type="submit" className="mt-5 bg-green-600 text-white text-sm py-2 rounded-md font-semibold">{loading ? "Logging..." : "Login"}</button>
            </form>
        </div>
    );
};
