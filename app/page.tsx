"use client";
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Header from './components/Header';
import Image from 'next/image';
import Plate from '@/app/assets/plate.png';
import Meal from '@/app/assets/meal.png';

export default function LandingPage() {
  const plateRef = useRef(null);
  const mealRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Set initial states
    gsap.set(plateRef.current, { rotation: 0, scale: 0, opacity: 0 });
    gsap.set(mealRef.current, { rotation: 0, scale: 0, opacity: 0 });
    gsap.set(ctaRef.current, { y: 30, opacity: 0 });

    // Create timeline
    const tl = gsap.timeline({ delay: 0.5 });

    // Spin in plate
    tl.to(plateRef.current, {
      duration: 1.2,
      rotation: 360,
      scale: 1,
      opacity: 1,
      ease: "back.out(1.7)"
    })
    // Hold for a moment
    .to({}, { duration: 1 })
    // Spin out plate and spin in meal
    .to(plateRef.current, {
      duration: 0.8,
      rotation: 720,
      scale: 0,
      opacity: 0,
      ease: "back.in(1.7)"
    }, "swap")
    .to(mealRef.current, {
      duration: 1.2,
      rotation: 360,
      scale: 1,
      opacity: 1,
      ease: "back.out(1.7)"
    }, "swap+=0.2")
    // Animate CTA
    .to(ctaRef.current, {
      duration: 0.8,
      y: 0,
      opacity: 1,
      ease: "power2.out"
    }, "-=0.5");

    // Cleanup
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header col={true} text={false} />
      
      <p className='text-[#254635] text-4xl font-bold text-center mt-10 mb-10'>My Online Pantry</p>
      
      {/* Animated Image Container */}
      <div className="flex justify-center items-center mt-10">
        <div className="relative w-64 h-64">
          {/* Plate Image */}
          <div
            ref={plateRef}
            className="absolute inset-0"
          >
            <Image
              src={Plate}
              alt="Empty Plate"
              fill
              className="object-contain"
              sizes="256px"
            />
          </div>
          
          {/* Meal Image */}
          <div
            ref={mealRef}
            className="absolute inset-0"
          >
            <Image
              src={Meal}
              alt="Delicious Meal"
              fill
              className="object-contain"
              sizes="256px"
            />
          </div>
        </div>
      </div>

      

      {/* Simple CTA */}
      <div ref={ctaRef} className="flex justify-center mt-15">
        <button className="text-lg font-semibold text-[#254635] mt-3 px-8">
          Discover recipes, manage your pantry, and reduce food waste. All in one
        place.
        </button>
      </div>
    </div>
  );
}