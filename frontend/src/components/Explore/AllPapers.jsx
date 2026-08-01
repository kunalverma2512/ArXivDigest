import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { fetchAllPapers } from '../../api/client';

const AllPapers = ({ currentPage, onPageChange }) => {
  const [data, setData] = useState(null); // { papers, total, page, total_pages }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchAllPapers(currentPage, 20);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
    // Scroll to section top smoothly
    document.getElementById('all-papers-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="all-papers-section" className="py-16 border-t-4 border-black">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-10 border-b border-black pb-6">
        <div className="flex items-center gap-4">
          <BookOpen size={32} className="text-black" strokeWidth={2.5} />
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-black uppercase">Browse All Papers</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              {data ? `${data.total} papers in the archive` : 'Loading archive…'}
            </p>
          </div>
        </div>
        {data && data.total_pages > 1 && (
          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest hidden md:block">
            Page {data.page} of {data.total_pages}
          </span>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-black" size={40} strokeWidth={2.5} />
          <p className="text-gray-500 font-medium uppercase tracking-widest text-sm">Loading papers…</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="w-full border-2 border-red-500 p-8 bg-red-50 text-red-700 flex flex-col items-center justify-center py-16">
          <AlertCircle size={40} className="mb-4" />
          <p className="font-bold text-lg mb-1">Failed to load papers</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Papers Grid */}
      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {data.papers.map((paper) => (
              <Link
                key={paper.arxiv_id}
                to={`/paper/${encodeURIComponent(paper.arxiv_id)}`}
                className="group block border border-black p-6 bg-white hover:bg-gray-50 transition-colors relative overflow-hidden"
              >
                {/* Category badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                    {paper.primary_category}
                  </span>
                  <span className="text-xs text-gray-400 font-bold hidden md:block">
                    {new Date(paper.published_date).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-black text-black mb-3 leading-snug group-hover:underline decoration-2 underline-offset-4 line-clamp-2">
                  {paper.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {paper.ai_summary || paper.abstract}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-black uppercase tracking-widest border-b-2 border-black pb-0.5 group-hover:border-transparent transition-colors">
                    Read Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-black/10">
              <button
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page === 1}
                className="flex items-center gap-2 px-5 py-3 border-2 border-black font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              {/* Page number buttons — show up to 5 around current page */}
              {Array.from({ length: data.total_pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === data.total_pages || Math.abs(p - data.page) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-3 py-3 text-gray-400 font-bold select-none">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item)}
                      className={`px-5 py-3 border-2 border-black font-bold uppercase tracking-widest text-sm transition-colors
                        ${data.page === item
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-100'
                        }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page === data.total_pages}
                className="flex items-center gap-2 px-5 py-3 border-2 border-black font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default AllPapers;
