import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Quote, Loader2, AlertCircle } from 'lucide-react';
import { fetchPaperDetails } from '../api/client';

const PaperDetails = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPaper = async () => {
      try {
        setLoading(true);
        // id is decoded by react-router, we just pass it to our API client which will encode it
        const data = await fetchPaperDetails(id);
        setPaper(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPaper();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-black mb-4" size={48} />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Paper Details...</p>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-12">
          <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black hover:opacity-70 transition-opacity">
            <ArrowLeft size={16} /> Back to Search
          </Link>
        </div>
        <div className="border-2 border-red-500 p-12 bg-red-50 text-red-700 flex flex-col items-center justify-center text-center">
          <AlertCircle size={64} className="mb-6" />
          <p className="font-bold text-2xl mb-2">Paper Not Found</p>
          <p className="text-base">{error || "The requested paper could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="mb-12">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} /> Back to Search
        </Link>
      </div>

      {/* Header Section */}
      <header className="mb-12 border-b border-black/10 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
            {paper.primary_category}
          </span>
          <span className="text-sm font-bold text-gray-500">
            ArXiv ID: {paper.arxiv_id}
          </span>
          <span className="text-sm font-bold text-gray-500">
            Published: {new Date(paper.published_date).toLocaleDateString()}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-6 leading-tight">
          {paper.title}
        </h1>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-lg font-medium text-gray-700">
          {paper.authors.join(', ')}
        </div>
      </header>

      {/* AI Summary Section (The Core Feature) */}
      {paper.ai_summary && (
        <section className="mb-16">
          <h2 className="text-xl font-bold uppercase tracking-widest text-black mb-6 flex items-center gap-2">
            <Quote size={20} /> AI Summary
          </h2>
          <div className="border-4 border-black p-8 bg-gray-50/50">
            <p className="text-2xl font-medium text-black leading-relaxed">
              {paper.ai_summary}
            </p>
          </div>
        </section>
      )}

      {/* Full Abstract Section */}
      <section className="mb-16">
        <h2 className="text-xl font-bold uppercase tracking-widest text-black mb-6">
          Original Abstract
        </h2>
        <div className="border-l-4 border-black/20 pl-6">
          <p className="text-lg text-gray-700 leading-relaxed text-justify">
            {paper.abstract}
          </p>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="flex flex-col sm:flex-row gap-4 border-t border-black/10 pt-12 mb-20">
        <a 
          href={paper.pdf_url || `https://arxiv.org/pdf/${paper.arxiv_id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 bg-black text-white px-8 py-5 text-sm font-bold uppercase tracking-widest text-center hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Read Full PDF on ArXiv <ExternalLink size={16} />
        </a>
        <button 
          className="flex-1 bg-white text-black border-2 border-black px-8 py-5 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          onClick={() => {
            navigator.clipboard.writeText(`${paper.title} - ${paper.authors.join(', ')} (${new Date(paper.published_date).getFullYear()})`);
            alert("Citation copied to clipboard!");
          }}
        >
          Cite this Paper
        </button>
      </section>
    </div>
  );
};

export default PaperDetails;
