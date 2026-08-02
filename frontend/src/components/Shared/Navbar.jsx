import { Link } from 'react-router-dom';

const GithubIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const Navbar = () => {
  return (
    <nav className="border-b border-black/10 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight text-black">
          ArXiv<span className="font-light">Digest</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/explore" className="text-sm font-medium text-black hover:opacity-70 transition-opacity hidden sm:block">
            Explore
          </Link>
          <Link to="/architecture" className="text-sm font-medium text-black hover:opacity-70 transition-opacity hidden sm:block">
            Architecture
          </Link>
          
          {/* Mobile-only links just in case */}
          <Link to="/explore" className="text-xs font-medium text-black hover:opacity-70 transition-opacity sm:hidden">
            Exp
          </Link>
          <Link to="/architecture" className="text-xs font-medium text-black hover:opacity-70 transition-opacity sm:hidden">
            Arch
          </Link>

          <a
            href="https://github.com/kunalverma2512/ArXivDigest"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white bg-black px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-black/80 transition-colors"
          >
            <GithubIcon size={16} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
