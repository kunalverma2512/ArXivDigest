import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

const GithubIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-black/10 bg-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-black mb-4">ArXivDigest</h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
            We read the math so you don't have to. Automated AI research summaries powered by PyTorch and Cohere.
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-black">Product</h4>
          <Link to="/explore" className="text-sm text-gray-600 hover:text-black transition-colors">Search Papers</Link>
          <Link to="/architecture" className="text-sm text-gray-600 hover:text-black transition-colors">How it Works</Link>
        </div>

        <div className="flex flex-col space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-black">Connect</h4>
          <a href="https://github.com/kunalverma2512/ArXivDigest" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
            <GithubIcon size={16} /> GitHub Repository
          </a>
          <a href="https://kunal-verma.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
            <Globe size={16} /> Developer Portfolio
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-black/5 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} ArXivDigest. Built by Kunal Verma.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
