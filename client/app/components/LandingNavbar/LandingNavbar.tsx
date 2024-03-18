import Link from "next/link";

export default function LandingNavbar() {
  return (
    <nav className="flex justify-between p-4">
      <Link href="/" className="text-2xl font-bold">
        <span className="text-blue-500">Travel</span>Planner
      </Link>
      <div className="flex space-x-4">
        <Link href="/login" className="text-blue-500">
          Login
        </Link>
        <Link href="/signup" className="text-blue-500">
          Sign Up
        </Link>
        <Link href="/map" className="text-blue-500">
          Map
        </Link>
      </div>
    </nav>
  );
}
