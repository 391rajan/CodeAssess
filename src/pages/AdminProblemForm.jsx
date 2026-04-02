import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Code, Loader2, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../utils/animations';

export default function AdminProblemForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    companyTags: '',
    description: '',
    constraints: '',
    functionName: '',
    examples: [
      { input: '', output: '', explanation: '' },
      { input: '', output: '', explanation: '' }
    ],
    hiddenTestCases: [
      { input: '', expectedOutput: '' },
      { input: '', expectedOutput: '' }
    ],
    solutionTemplates: {
      python: 'def solution():\n    pass',
      java: 'class Solution {\n    public void solution() {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    void solution() {\n        \n    }\n};'
    }
  });

  const [activeTab, setActiveTab] = useState('python');

  useEffect(() => {
    if (isEditing) {
      const fetchProblem = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/admin/problems/${id}`, { credentials: 'include' });
          const json = await res.json();
          if (json.success) {
            const p = json.data;
            setFormData({
              ...p,
              companyTags: p.companyTags ? p.companyTags.join(', ') : '',
              hiddenTestCases: p.hiddenTestCases.map(tc => ({
                input: JSON.stringify(tc.input, null, 2),
                expectedOutput: JSON.stringify(tc.expectedOutput, null, 2)
              }))
            });
          } else {
            toast.error("Failed to load problem");
            navigate('/admin');
          }
        } catch (error) {
          toast.error("Error loading problem details");
          navigate('/admin');
        } finally {
          setLoading(false);
        }
      };
      fetchProblem();
    }
  }, [id, navigate, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null }); // clear error on change
  };

  const handleArrayChange = (index, field, value, type) => {
    const updated = [...formData[type]];
    updated[index][field] = value;
    setFormData({ ...formData, [type]: updated });
  };

  const addArrayItem = (type) => {
    const newItem = type === 'examples' 
      ? { input: '', output: '', explanation: '' }
      : { input: '', expectedOutput: '' };
    setFormData({ ...formData, [type]: [...formData[type], newItem] });
  };

  const removeArrayItem = (index, type) => {
    const updated = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: updated });
  };

  const handleTemplateChange = (value) => {
    setFormData({
      ...formData,
      solutionTemplates: {
        ...formData.solutionTemplates,
        [activeTab]: value
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.functionName.trim()) newErrors.functionName = 'Function Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);

    try {
      // Process payload
      const payload = { ...formData };
      payload.companyTags = formData.companyTags.split(',').map(t => t.trim()).filter(Boolean);

      // Parse JSON for hiddenTestCases safely
      try {
        payload.hiddenTestCases = formData.hiddenTestCases.map(tc => ({
          input: JSON.parse(tc.input || '{}'),
          expectedOutput: JSON.parse(tc.expectedOutput || '{}')
        }));
      } catch (err) {
        toast.error("Invalid JSON format in Hidden Test Cases");
        setSubmitting(false);
        return;
      }

      const url = isEditing ? `http://localhost:5000/api/admin/problems/${id}` : `http://localhost:5000/api/admin/problems`;
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(isEditing ? 'Problem updated successfully!' : 'Problem created successfully!');
        navigate('/admin');
      } else {
        toast.error(json.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Server connection error. Ensure backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mb-4">
          <Loader2 className="w-10 h-10 text-primary" />
        </motion.div>
        <p className="text-gray-400 font-medium">Loading problem payload...</p>
      </div>
    );
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="min-h-screen w-full bg-background text-white p-8 overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-between items-center border-b border-white/10 pb-6 sticky top-0 bg-background/90 backdrop-blur-md z-30 pt-4"
        >
          <div>
            <Link to="/admin" className="text-gray-400 hover:text-white flex items-center gap-2 mb-2 text-sm transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Edit Problem Configuration' : 'Add New Problem'}
            </h1>
          </div>
          <motion.button 
            disabled={submitting}
            onClick={handleSubmit}
            whileHover={submitting ? {} : { scale: 1.02 }}
            whileTap={submitting ? {} : { scale: 0.98 }}
            className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 rounded-lg font-bold text-white transition-all shadow-lg disabled:opacity-50"
          >
            {submitting ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEditing ? 'Save Changes' : 'Create Problem'}
          </motion.button>
        </motion.div>

        <motion.form 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          onSubmit={handleSubmit} 
          className="space-y-8 pb-32"
        >
          
          {/* Basics */}
          <motion.div variants={fadeInUp} className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent" /> Basic Information
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Problem Title <span className="text-red-400">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass} placeholder="e.g. Reverse Linked List" />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Difficulty</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className={inputClass}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Company Tags (comma separated)</label>
                <input type="text" name="companyTags" value={formData.companyTags} onChange={handleChange} className={inputClass} placeholder="Google, Amazon, Meta" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Description (HTML supported) <span className="text-red-400">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className={inputClass} placeholder="<p>Given an array of integers...</p>" />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Constraints (HTML supported)</label>
              <textarea name="constraints" value={formData.constraints} onChange={handleChange} rows={3} className={inputClass} placeholder="<ul><li>1 <= nums.length <= 10^4</li></ul>" />
            </div>
          </motion.div>

          {/* Examples */}
          <motion.div variants={fadeInUp} className="glass-card p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold">Public Examples</h2>
              <button type="button" onClick={() => addArrayItem('examples')} className="text-sm flex items-center gap-1 text-accent hover:text-white transition-colors">
                <Plus className="w-4 h-4" /> Add Example
              </button>
            </div>
            
            {formData.examples.map((ex, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4 relative group"
              >
                <button type="button" onClick={() => removeArrayItem(idx, 'examples')} className="absolute top-4 right-4 text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Input String</label>
                    <input type="text" value={ex.input} onChange={e => handleArrayChange(idx, 'input', e.target.value, 'examples')} className={inputClass} placeholder="nums = [2,7,11,15], target = 9" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Output String</label>
                    <input type="text" value={ex.output} onChange={e => handleArrayChange(idx, 'output', e.target.value, 'examples')} className={inputClass} placeholder="[0,1]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Explanation (Optional)</label>
                    <input type="text" value={ex.explanation} onChange={e => handleArrayChange(idx, 'explanation', e.target.value, 'examples')} className={inputClass} placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]." />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Solution Templates Manager */}
          <motion.div variants={fadeInUp} className="glass-card p-8 space-y-6 flex flex-col h-[500px]">
             <h2 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-accent" /> Solution Templates
            </h2>
            <div className="flex border-b border-white/10">
              {['python', 'java', 'cpp'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className={`px-6 py-3 font-semibold text-sm capitalize transition-colors border-b-2 ${activeTab === lang ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  {lang === 'cpp' ? 'C++' : lang}
                </button>
              ))}
            </div>
            <div className="flex-1 rounded-lg overflow-hidden border border-white/5 bg-[#0a0a0f]">
              <Editor
                height="100%"
                language={activeTab === 'cpp' ? 'cpp' : activeTab}
                theme="vs-dark"
                value={formData.solutionTemplates[activeTab]}
                onChange={handleTemplateChange}
                options={{
                  fontFamily: 'Fira Code',
                  fontSize: 14,
                  minimap: { enabled: false }
                }}
              />
            </div>
          </motion.div>

          {/* Hidden Test Cases */}
          <motion.div variants={fadeInUp} className="glass-card p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-rose-400">
                Hidden Test Cases <span className="text-xs font-normal text-gray-400 ml-2">(JSON format required)</span>
              </h2>
              <button type="button" onClick={() => addArrayItem('hiddenTestCases')} className="text-sm flex items-center gap-1 text-accent hover:text-white transition-colors">
                <Plus className="w-4 h-4" /> Add Test Case
              </button>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-xl">
              <label className="block text-sm font-semibold text-rose-300 mb-2">Global Injection Function Name <span className="text-rose-400">*</span></label>
              <input type="text" name="functionName" value={formData.functionName} onChange={handleChange} className={`${inputClass} !border-rose-500/30 !focus:ring-rose-500 placeholder-rose-900/40`} placeholder="e.g. twoSum" />
              {errors.functionName && <p className="text-red-400 text-sm mt-1">{errors.functionName}</p>}
            </div>

            {formData.hiddenTestCases.map((tc, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-4 relative group"
              >
                <button type="button" onClick={() => removeArrayItem(idx, 'hiddenTestCases')} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-rose-400/80 mb-1">Input JSON Schema</label>
                    <textarea value={tc.input} onChange={e => handleArrayChange(idx, 'input', e.target.value, 'hiddenTestCases')} rows={3} className={`${inputClass} font-mono text-sm`} placeholder='{"nums": [2,7,11,15], "target": 9}' />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-400/80 mb-1">Expected Output JSON Schema</label>
                    <textarea value={tc.expectedOutput} onChange={e => handleArrayChange(idx, 'expectedOutput', e.target.value, 'hiddenTestCases')} rows={3} className={`${inputClass} font-mono text-sm`} placeholder='[0, 1]' />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </motion.form>
      </div>
    </div>
  );
}
