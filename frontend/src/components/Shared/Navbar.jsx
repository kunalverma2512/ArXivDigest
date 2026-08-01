import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="border-b border-black/10 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight text-black">
          ArXiv<span className="font-light">Digest</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link to="/explore" className="text-sm font-medium text-black hover:opacity-70 transition-opacity">
            Explore
          </Link>
          <Link to="/architecture" className="text-sm font-medium text-black hover:opacity-70 transition-opacity">
            Architecture
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-white bg-black px-4 py-2 hover:bg-black/80 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
