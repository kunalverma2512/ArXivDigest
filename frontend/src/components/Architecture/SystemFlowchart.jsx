import React from 'react';
import { Database, Server, Search, FileText, Bot, ArrowRight, ArrowDown } from 'lucide-react';

const GithubIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const SystemFlowchart = () => {
  const steps = [
    {
      id: 1,
      title: "ArXiv API",
      description: "Source of truth for the latest research papers.",
      icon: <FileText size={24} />,
      color: "bg-blue-100 text-blue-600 border-blue-200"
    },
    {
      id: 2,
      title: "GitHub Actions",
      description: "Automated nightly cron jobs fetch new data.",
      icon: <GithubIcon size={24} />,
      color: "bg-gray-100 text-gray-800 border-gray-200"
    },
    {
      id: 3,
      title: "SciTLDR Summarization",
      description: "Local DistilBART extracts the 1-sentence crux.",
      icon: <Bot size={24} />,
      color: "bg-purple-100 text-purple-600 border-purple-200"
    },
    {
      id: 4,
      title: "Cohere Embeddings",
      description: "Generates 1024-D vectors for semantic search.",
      icon: <Search size={24} />,
      color: "bg-green-100 text-green-600 border-green-200"
    },
    {
      id: 5,
      title: "Qdrant & MongoDB",
      description: "Stores vectors, metadata, and handles queries.",
      icon: <Database size={24} />,
      color: "bg-orange-100 text-orange-600 border-orange-200"
    },
    {
      id: 6,
      title: "FastAPI + React",
      description: "Lightning-fast frontend and backend rendering.",
      icon: <Server size={24} />,
      color: "bg-red-100 text-red-600 border-red-200"
    }
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-b border-black/10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">
          Data Pipeline
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Fully automated from fetching papers to semantic search.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-2 relative z-10 w-full">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center max-w-[160px]">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-sm mb-4 bg-white ${step.color.split(' ')[1]}`}>
                <div className={`p-3 rounded-xl ${step.color.split(' ')[0]}`}>
                   {step.icon}
                </div>
              </div>
              <h3 className="font-bold text-black mb-2">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed px-2">
                {step.description}
              </p>
            </div>
            
            {/* Arrows */}
            {index < steps.length - 1 && (
              <div className="flex items-center justify-center text-gray-300 flex-shrink-0">
                <ArrowRight size={24} className="hidden lg:block" />
                <ArrowDown size={24} className="block lg:hidden" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default SystemFlowchart;
