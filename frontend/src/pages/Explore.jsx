import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchPapers } from '../api/client';
import AllPapers from '../components/Explore/AllPapers';

const Explore = () => {
  // Use URL search params to persist state across back-navigation
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Page state for AllPapers section — also preserved in URL
  const [browsePage, setBrowsePage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  // On mount: if there was a previous search query in the URL, re-run it
  const runSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const data = await searchPapers(query, 12);
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore previous search results when navigating back
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      runSearch(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    // Persist query in URL so back-navigation restores it
    setSearchParams({ q: searchQuery, page: String(browsePage) });
    await runSearch(searchQuery);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePageChange = (newPage) => {
    setBrowsePage(newPage);
    // Keep search query in URL if present
    const params = { page: String(newPage) };
    if (searchQuery) params.q = searchQuery;
    setSearchParams(params);
  };

  return (
    <div className="w-full">
      {/* MASSIVE SEARCH SECTION */}
      <section className="py-12 border-b border-black/10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-black mb-8">
          Search the Archive.
        </h1>

        <div className="relative max-w-4xl">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-8 w-8 text-black" strokeWidth={3} />
          </div>
          <input
            type="text"
            className="block w-full pl-20 pr-[120px] py-6 border-4 border-black text-2xl font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-black bg-white"
            placeholder="Search by topic, author, or semantic concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="absolute inset-y-2 right-2 bg-black text-white px-8 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
          </button>
        </div>
      </section>

      {/* 2-COLUMN LAYOUT: FILTERS & RESULTS */}
      <section className="py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">

        {/* LEFT COLUMN: FILTERS */}
        <div className="lg:col-span-1 space-y-8 border-r border-black/10 pr-8 hidden md:block">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <Filter size={20} className="text-black" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-black">Filters</h2>
          </div>
          <div className="opacity-50 pointer-events-none">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Categories (Coming Soon)</h3>
            <div className="space-y-3">
              {['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'cs.RO', 'cs.CR'].map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 border-2 border-black flex items-center justify-center group-hover:bg-gray-100">
                    <input type="checkbox" className="opacity-0 absolute w-5 h-5 cursor-pointer" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-black">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-end mb-8 border-b border-black/10 pb-4">
            <h2 className="text-2xl font-bold text-black">Results</h2>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              {hasSearched ? `Found ${results.length} papers` : 'Ready to search'}
            </span>
          </div>

          {error && (
            <div className="w-full border-2 border-red-500 p-6 bg-red-50 text-red-700 flex flex-col items-center justify-center py-12 mb-8">
              <AlertCircle size={48} className="mb-4" />
              <p className="font-bold text-lg mb-1">Search Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && hasSearched && results.length === 0 && (
            <div className="w-full border-2 border-black border-dashed p-12 text-center text-gray-500 font-medium">
              No matches found for your query. Try a different author name, topic, or keyword!
            </div>
          )}

          {!hasSearched && (
            <div className="w-full border-2 border-black/10 border-dashed p-12 text-center text-gray-500 font-medium bg-gray-50">
              Enter a concept above to perform an AI-powered semantic search across the archive.
            </div>
          )}

          <div className="space-y-6">
            {results.map((result) => (
              <Link
                key={result.paper.arxiv_id}
                to={`/paper/${encodeURIComponent(result.paper.arxiv_id)}`}
                className="group block border border-black p-6 bg-white hover:bg-gray-50 transition-colors relative overflow-hidden"
              >
                {/* Score + match type badge top right */}
                <div className="absolute top-0 right-0 flex">
                  <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-l border-b border-black ${
                    result.match_type === 'hybrid' ? 'bg-gray-700 text-white' :
                    result.match_type === 'keyword' ? 'bg-white text-black' :
                    'bg-black text-white'
                  }`}>
                    {result.match_type === 'hybrid' ? '⚡ Hybrid' :
                     result.match_type === 'keyword' ? '🔤 Keyword' : '🧠 Semantic'}
                  </div>
                  <div className="bg-black text-white px-3 py-1 text-xs font-bold font-mono border-l border-b border-black">
                    {(result.score * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 mt-2 md:mt-0 pr-24">
                  <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                    {result.paper.primary_category}
                  </span>
                  <span className="text-sm text-gray-500 font-bold hidden md:block">
                    {new Date(result.paper.published_date).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-black mb-3 leading-snug group-hover:underline decoration-4 underline-offset-4 pr-12">
                  {result.paper.title}
                </h3>

                <p className="text-base text-gray-700 leading-relaxed max-w-3xl line-clamp-3">
                  {result.paper.ai_summary || result.paper.abstract}
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <span className="text-sm font-bold text-black uppercase tracking-widest border-b-2 border-black pb-1 group-hover:border-transparent transition-colors">
                    Read Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ALL PAPERS BROWSE SECTION — full width below search */}
      <AllPapers currentPage={browsePage} onPageChange={handlePageChange} />
    </div>
  );
};

export default Explore;
