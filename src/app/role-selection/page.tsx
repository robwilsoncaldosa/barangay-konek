"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Shield, User } from "lucide-react"

export default function RoleSelectionPage() {
    return (
        <div className="min-h-dvh w-full bg-background flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-8 text-center space-y-8">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="w-32 h-32">
                            <Image
                                src="/logo.png"
                                alt="Barangay Logo"
                                width={128}
                                height={128}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-foreground">
                            Join Barangay Konek
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            I am signing up as a...
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3 w-full">
                        <Link href="/register?role=resident" className="w-full">
                            <Button className="w-full h-12 mb-4" variant="default">
                                <User className="w-5 h-5 mr-2" />
                                Resident
                            </Button>
                        </Link>
                        <Link href="/register?role=official" className="w-full">
                            <Button className="w-full h-12" variant="outline">
                                <Shield className="w-5 h-5 mr-2" />
                                Official
                            </Button>
                        </Link>
                    </div>

                    {/* Login Link */}
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Login here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}