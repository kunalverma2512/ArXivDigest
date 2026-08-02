import ArchitectureHero from '../components/Architecture/ArchitectureHero';
import SystemFlowchart from '../components/Architecture/SystemFlowchart';
import TechStackCards from '../components/Architecture/TechStackCards';

const Architecture = () => {
  return (
    <div className="bg-white min-h-screen">
      <ArchitectureHero />
      <SystemFlowchart />
      <TechStackCards />
    </div>
  );
};

export default Architecture;
