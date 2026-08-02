import { Link } from 'react-router-dom';

import { TypeAnimation } from 'react-type-animation';

const HeroSection = () => {
  return (
    <section className="py-20 flex flex-col items-center text-center border-b border-black/10">
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-black mb-6 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] flex items-center justify-center">
        <span>
          Research,{' '}
          <TypeAnimation
            sequence={[
              'Decoded.',
              2000,
              'Simplified.',
              2000,
              'Unlocked.',
              2000,
              'Accessible.',
              2000
            ]}
            wrapper="span"
            speed={30}
            repeat={Infinity}
            className="text-gray-400"
          />
        </span>
      </h1>
      <p className="max-w-2xl text-lg md:text-xl text-gray-600 font-medium leading-relaxed mb-10">
        We read the math so you don't have to. 100+ daily AI papers summarized into 2 sentences using Cohere and PyTorch.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
        <Link 
          to="/explore" 
          className="bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors w-full sm:w-auto text-center"
        >
          Start Reading
        </Link>
        <Link 
          to="/architecture" 
          className="bg-white text-black border-2 border-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
        >
          How it Works
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl w-full px-4 sm:px-0">
        <div className="p-6 border border-black/10 bg-gray-50/50">
          <h3 className="font-bold text-black mb-2 text-lg">1. We Crawl ArXiv</h3>
          <p className="text-sm text-gray-600">Automated ingestion of the latest AI/ML papers directly from the ArXiv API.</p>
        </div>
        <div className="p-6 border border-black/10 bg-gray-50/50">
          <h3 className="font-bold text-black mb-2 text-lg">2. AI Summarizes</h3>
          <p className="text-sm text-gray-600">Local Hugging Face models distill 500-word abstracts into 2 punchy sentences.</p>
        </div>
        <div className="p-6 border border-black/10 bg-gray-50/50">
          <h3 className="font-bold text-black mb-2 text-lg">3. You Read Faster</h3>
          <p className="text-sm text-gray-600">Search and consume research 10x faster with semantic search powered by Cohere.</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
