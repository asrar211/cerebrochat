"use client"

import ErrorMessage from "@/components/ErrorMessage";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
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
            const res = await axios.post("/api/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password
            })
            setLoading(false);
            router.push("/login")
        } catch (err: any) {
            setLoading(false);
            const message = err.response?.data?.error || "Registration failed";
            setError(message);
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="flex justify-center items-center h-dvh">
            {error && <ErrorMessage message={error}/>}
            <form onSubmit={handleSubmit} className="flex flex-col bg-green-100 px-4 py-10 rounded-md shadow-sm">
                <label className="text-sm font-semibold mb-1">Name</label>
                <input
                 type="text" 
                 name="name"
                 value={form.name}
                 onChange={handleChange}
                 placeholder="name@example.com"
                 className="border border-neutral-400 w-70 rounded-md px-1 py-1.5 text-base outline-none focus:ring-3 focus:ring-neutral-300"/>
                <label className="text-sm font-semibold mb-1 mt-3">Email</label>
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
                <button type="submit" className="mt-5 bg-green-600 text-white text-sm py-2 rounded-md font-semibold">{loading ? "Regsitering..." : "Register"}</button>
            </form>
        </div>
    );
};
