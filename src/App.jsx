import React, { useState } from 'react';
import ProblemPane from './components/ProblemPane';
import EditorPane from './components/EditorPane';
import ReportCard from './components/ReportCard';

function App() {
  // result contains: { status, output, passedCount, totalCount, aiReport? }
  const [result, setResult] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const handleSubmitComplete = (data) => {
    setResult(data);
    setShowReport(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-background overflow-hidden text-white font-sans selection:bg-primary/30">
      <ProblemPane className="w-full lg:w-1/2 lg:border-r border-white/10" />
      <EditorPane
        className="w-full lg:w-1/2"
        onSubmit={handleSubmitComplete}
      />
      <ReportCard
        data={result}
        isVisible={showReport}
      />
    </div>
  );
}

export default App;
