import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { fetchFeed } from '../../api/client';

const DailyDigestFeed = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        const data = await fetchFeed(6); // Fetch 6 papers for the home page
        setPapers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadFeed();
  }, []);

  return (
    <section className="py-20">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-black mb-2">Today's Digest</h2>
          <p className="text-gray-600">The most important papers processed in the last 24 hours.</p>
        </div>
        <Link to="/explore" className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {loading && (
        <div className="w-full flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-black" size={32} />
        </div>
      )}

      {error && !loading && (
        <div className="w-full border-2 border-red-500 p-6 bg-red-50 text-red-700 flex flex-col items-center justify-center py-12">
          <AlertCircle size={48} className="mb-4" />
          <p className="font-bold text-lg mb-1">Failed to load feed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && papers.length === 0 && (
        <div className="w-full border-2 border-black border-dashed p-12 text-center text-gray-500 font-medium">
          No papers processed yet. Run the crawler!
        </div>
      )}

      {!loading && !error && papers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <Link 
              key={paper.arxiv_id}
              to={`/paper/${encodeURIComponent(paper.arxiv_id)}`}
              className="group block border border-black/10 p-6 bg-white hover:border-black transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gray-100 text-black text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  {paper.primary_category}
                </span>
                <span className="text-xs text-gray-500 font-medium">ArXiv: {paper.arxiv_id}</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 leading-snug group-hover:underline decoration-2 underline-offset-4 line-clamp-3">
                {paper.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-black/20 pl-4 line-clamp-4">
                {paper.ai_summary || paper.abstract}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default DailyDigestFeed;
