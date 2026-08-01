import { Link } from 'react-router-dom';

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
          <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">GitHub Repository</a>
          <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">Developer Portfolio</a>
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
