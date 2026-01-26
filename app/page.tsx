import { Dot, Menu, MessageCircleDashed, Phone } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-dvh">
      <nav className="flex mt-4 mx-10 justify-between items-center bg-neutral-300/50 rounded-full text-black p-4">
        <div className="flex gap-2">
          <MessageCircleDashed className="cursor-pointer"/>
          <Phone className="cursor-pointer"/>
        </div>
        <h1 className="font-semibold italic">CerebroChat</h1>
        <Menu className="cursor-pointer"/>
      </nav>

      <div className="grid xl:grid-cols-2 grid-cols-1 xl:max-w-7xl xl:mx-auto mx-10">
          <div className="flex flex-col mt-10">
            <span className="bg-neutral-300 w-fit text-xs font-semibold px-1 rounded-full text-green-600 flex items-center"><Dot/>HEALTH CHECK</span>
            <h1 className="mt-10 text-5xl font-semibold text-green-600 leading-14">Empathetic <br/>Mental Health <br/><span className="text-green-800">Chatbot</span></h1>
            <p className="text-center mt-2 text-neutral-500 text-sm">This Chatbot is only for educational purposes and is not a substitute for professional help.</p>
            <Link href="/login"><button className="border border-neutral-600 w-fit mt-10 flex justify-center items-center px-4 py-2 rounded-full  text-sm cursor-pointer">Try it out</button></Link>
          </div>
      </div>

      <div className="flex justify-center items-center mx-10 text-center mt-10">
        <p className="text-sm font-semibold">“An AI-assisted psychological self-assessment platform designed to help users understand potential mental health patterns for awareness purposes only — not for medical diagnosis or treatment.”</p>
      </div>

      <p className="absolute bottom-4 right-4 text-xs text-neutral-500">Developed by [<span className="font-semibold">Waris Ali, Uzair Wahid & Mohammad Asrar</span>]</p>
    </div>
  );
}
