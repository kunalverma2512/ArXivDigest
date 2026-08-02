import { Code2, Brain, Database, Layers, Search, Cpu } from 'lucide-react';

const TechStackCards = () => {
  const tech = [
    {
      id: 1,
      name: "Qdrant Vector DB",
      description: "Stores 1024-dimensional vectors from Cohere, enabling lightning-fast semantic similarity search to find papers by meaning, not just keywords.",
      icon: <Layers size={20} />,
    },
    {
      id: 2,
      name: "MongoDB Atlas",
      description: "The primary document store handling all the heavy lifting for raw paper metadata, authors, publication dates, and regex-based keyword search.",
      icon: <Database size={20} />,
    },
    {
      id: 3,
      name: "SciTLDR (DistilBART)",
      description: "A lightweight HuggingFace model fine-tuned on academic datasets. It extracts the absolute crux of complex papers into a single sentence.",
      icon: <Brain size={20} />,
    },
    {
      id: 4,
      name: "Cohere Embed-V3",
      description: "Enterprise-grade embedding models that understand the deep context and mathematical jargon of ArXiv papers for accurate search.",
      icon: <Search size={20} />,
    },
    {
      id: 5,
      name: "FastAPI Backend",
      description: "High-performance Python backend serving search results and processing the daily ML pipeline asynchronously.",
      icon: <Cpu size={20} />,
    },
    {
      id: 6,
      name: "React + Tailwind",
      description: "A minimalist, premium frontend interface optimized for speed and readability, deployed via Vercel.",
      icon: <Code2 size={20} />,
    }
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto mb-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">
          Tech Stack
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Built using modern, scalable, and open-source infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tech.map((item) => (
          <div key={item.id} className="p-8 border border-black/10 bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 rounded-xl group">
            <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-black mb-3">{item.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TechStackCards;
