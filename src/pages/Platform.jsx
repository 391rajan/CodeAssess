import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ProblemPane from '../components/ProblemPane';
import EditorPane from '../components/EditorPane';
import ReportCard from '../components/ReportCard';
import StudentHeader from '../components/StudentHeader';

export default function Platform() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProblemData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch public problem by ID instead of fetching all
      const res = await fetch(`http://localhost:5000/api/problems`);
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error("Could not fetch valid problem data.");
      }
      
      const p = json.data.find(prob => prob._id === id);
      if (!p) {
         // Assuming toast is available or handle error appropriately
         return navigate('/problems');
      }
      setProblem(p);
    } catch (err) {
      setError("Could not load problem. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
       fetchProblemData();
    } else {
       navigate('/problems');
    }
  }, [id, navigate]);

  const handleSubmitComplete = (data) => {
    setResult(data);
    setShowReport(true);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-400 font-medium">Entering development environment...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-white p-6">
        <div className="glass-card p-8 flex flex-col items-center max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-red-300">Connection Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={fetchProblemData}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden text-white font-sans selection:bg-primary/30">
      <StudentHeader />
      
      <div className="flex flex-col lg:flex-row flex-1 w-full overflow-hidden">
        <ProblemPane 
          className="w-full lg:w-1/2 lg:border-r border-white/10"
          problem={problem} 
        />
        <EditorPane
          className="w-full lg:w-1/2"
          problem={problem}
          onSubmit={handleSubmitComplete}
        />
      </div>

      <ReportCard
        data={result}
        isVisible={showReport}
        onClose={() => setShowReport(false)}
      />
    </div>
  );
}
