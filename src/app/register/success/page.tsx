"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-dvh w-full bg-white flex flex-col justify-between p-4">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Logo - Much bigger for mobile */}
        <div className="flex justify-center">
          <div className="w-40 h-40 md:w-48 md:h-48">
            <Image
              src="/logo.png"
              alt="Barangay Logo"
              width={160}
              height={160}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Animated Check */}
        <div className="flex justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20">
            <svg viewBox="0 0 72 72" className="w-full h-full">
              <circle
                cx="36"
                cy="36"
                r="32"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                className="check-circle"
              />
              <path
                d="M22 37 L31 46 L50 27"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="check-mark"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 text-center max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Thank you for registering!
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to the community! Your registration was successful. We&apos;ve sent a confirmation email with your login details and next steps. An official will review your application and approve your account shortly.
          </p>
        </div>
      </div>

      {/* CTA Button at bottom with padding */}
      <div className="w-full max-w-sm mx-auto pb-8 space-y-2">
        <Link href="/login" className="w-full">
          <Button variant={"outline"} className="w-full  py-6 rounded-lg font-medium flex items-center justify-center">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go to Login
          </Button>
        </Link>
      </div>

      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .check-circle {
          stroke-dasharray: 210;
          stroke-dashoffset: 210;
          animation: draw 0.8s ease-out forwards, popIn 0.4s ease-out 0.2s forwards;
        }
        .check-mark {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: draw 0.6s ease-out 0.4s forwards, popIn 0.3s ease-out 0.6s forwards;
        }
      `}</style>
    </div>
  )
}