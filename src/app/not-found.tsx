import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">404 - Page Not Found</h2>
            <p className="text-slate-600 mb-8 max-w-md">
                The page you are looking for might have been moved or doesn&apos;t exist.
            </p>
            <Link href="/">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Back to Dashboard
                </Button>
            </Link>
        </div>
    )
}
