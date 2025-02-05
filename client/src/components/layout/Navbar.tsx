import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="bg-[#2C3E50] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <a className="text-xl font-montserrat font-bold hover:text-[#3498DB] transition-colors">
              Ronny Reyes
            </a>
          </Link>
          <div className="space-x-8">
            <Link href="/">
              <a className="font-open-sans hover:text-[#3498DB] transition-colors">
                Home
              </a>
            </Link>
            <Link href="/gallery">
              <a className="font-open-sans hover:text-[#3498DB] transition-colors">
                Gallery
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
