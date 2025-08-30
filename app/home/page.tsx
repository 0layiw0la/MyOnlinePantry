"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import NavCard from "../components/NavCard";
import Spices from "@/app/assets/recipe.png";
import Pantry from "@/app/assets/pantry.png"
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return null; 
  } // Will redirect, so don't render anything

 return (
   <div className="w-full">
     <Header col={false} text={true}/>
     <div className="">
       <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-[5vh] md:mt-[20vh]">
         <Link href='/pantry'>
           <NavCard 
             iconSrc={Pantry} 
             cardText="Manage your ingredients"
             name="Pantry" 
           />
         </Link>
         <Link href='/recipes'>
           <NavCard 
             iconSrc={Spices} 
             cardText="Get meal suggestions based of your pantry"  
             name="Recipes" 
           />
         </Link>
       </div>
     </div>
   </div> 
 );
}