"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/auth-store"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuthStore()
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        // Typecast form event to get values easily
        const target = event.target as typeof event.target & {
            email: { value: string };
            password: { value: string };
        };

        const email = target.email.value
        const password = target.password.value

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                throw new Error('Invalid credentials')
            }

            const data = await res.json()

            // Save to store
            login(data.access_token, {
                id: 'user-id-placeholder',
                email: email,
                roles: ['ADMIN'] // We'll decode this properly later
            })

            router.push('/')
        } catch (err) {
            setError('Authentication failed. Check your credentials.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-zinc-950 px-4">
            <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        FintERP Access
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Enter your credentials to access the financial core.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={onSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-red-900/20 border border-red-900 text-red-200 text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="cfo@finterp.com" required className="bg-zinc-950/50 border-zinc-800 focus:ring-violet-600" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required className="bg-zinc-950/50 border-zinc-800 focus:ring-violet-600" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
        </div>
    )
}
