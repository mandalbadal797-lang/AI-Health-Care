import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  FileText,
  Headphones,
  HeartHandshake,
  CheckCircle,
  AlertTriangle,
  Send,
  History,
  Lightbulb,
  Search,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Hero } from '../../components/typography/Hero';
import { Badge } from '../../components/badges/Badge';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/feedback/Skeleton';
import {
  aiStudioService,
  AIGenerationItem,
  ContentIdeaItem,
  AnalysisResult,
} from '../../services/aiStudioService';

export const AdminAIContentStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'improve' | 'analyze' | 'ideas' | 'history'>('generate');

  // Generate Tab State
  const [contentType, setContentType] = useState<'article' | 'podcast' | 'story'>('article');
  const [topic, setTopic] = useState<string>('');
  const [audience] = useState<string>('College Students');
  const [tone, setTone] = useState<string>('Supportive');
  const [length, setLength] = useState<string>('medium');
  const [generatedDraft, setGeneratedDraft] = useState<AIGenerationItem | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Improve Tab State
  const [improveText, setImproveText] = useState<string>('');
  const [improveOp, setImproveOp] = useState<string>('simplify');
  const [improvedResult, setImprovedResult] = useState<any | null>(null);
  const [isImproving, setIsImproving] = useState<boolean>(false);

  // Analyze Tab State
  const [analyzeText, setAnalyzeText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Ideas & History State
  const [ideas, setIdeas] = useState<ContentIdeaItem[]>([]);
  const [history, setHistory] = useState<AIGenerationItem[]>([]);
  const [isCmsLoading, setIsCmsLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    aiStudioService.getGenerationHistory().then(setHistory).catch(() => {});
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setFeedbackMsg(null);

    aiStudioService
      .generateContentDraft({
        content_type: contentType,
        topic,
        audience,
        tone,
        length,
      })
      .then((res) => {
        setGeneratedDraft(res);
        loadHistory();
      })
      .catch(() => setFeedbackMsg('Failed to generate content draft. Please try again.'))
      .finally(() => setIsGenerating(false));
  };

  const handleImprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!improveText.trim()) return;

    setIsImproving(true);
    setFeedbackMsg(null);

    aiStudioService
      .improveContent({ text: improveText, operation: improveOp, content_type: contentType })
      .then((res) => {
        setImprovedResult(res.output);
        loadHistory();
      })
      .catch(() => setFeedbackMsg('Failed to generate improvement suggestion.'))
      .finally(() => setIsImproving(false));
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyzeText.trim()) return;

    setIsAnalyzing(true);
    setFeedbackMsg(null);

    aiStudioService
      .analyzeContent({ text: analyzeText, content_type: contentType })
      .then(setAnalysisResult)
      .catch(() => setFeedbackMsg('Failed to analyze content.'))
      .finally(() => setIsAnalyzing(false));
  };

  const handleLoadIdeas = () => {
    aiStudioService
      .generateContentIdeas({ content_type: contentType, include_analytics: true })
      .then(setIdeas)
      .catch(() => {});
  };

  const handleSendToCMS = (genId: string) => {
    setIsCmsLoading(true);
    setFeedbackMsg(null);

    aiStudioService
      .sendDraftToCMS(genId)
      .then((res) => {
        setFeedbackMsg(`Success! AI draft converted to CMS ${res.content_type.toUpperCase()} draft.`);
        loadHistory();
      })
      .catch(() => setFeedbackMsg('Failed to send draft to CMS.'))
      .finally(() => setIsCmsLoading(false));
  };

  return (
    <div className="container py-6 animate-fade-in">
      {/* Header */}
      <Hero
        eyebrow="Admin Content Studio"
        title="AI Content Creation & Intelligence Studio"
        subtitle="Use AI to draft, improve, and analyze student-focused content. All AI-generated content requires human review before publication."
      />

      {/* Mandatory Human Review Warning Banner */}
      <div className="bg-warning-light border-warning p-4 rounded-md mb-6 flex items-start gap-sm">
        <AlertTriangle className="text-warning flex-shrink-0 mt-1" size={20} />
        <div>
          <h4 className="font-bold text-small text-warning">Mandatory Human Review Policy</h4>
          <p className="text-xs text-muted">
            AI-generated content is created strictly as an administrative draft (`publication_status = "draft"`). Automatic publishing is strictly forbidden. A human administrator must verify facts and edit before publishing.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="card p-4 mb-6 bg-subtle text-primary font-medium text-small flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button className="btn btn-xs btn-ghost" onClick={() => setFeedbackMsg(null)}>Dismiss</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-xs border-b mb-6 overflow-x-auto" style={{ borderColor: 'var(--border-color)' }}>
        <button
          className={`px-md py-sm font-semibold text-small flex items-center gap-xs border-b-2 transition-colors ${
            activeTab === 'generate' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-main'
          }`}
          onClick={() => setActiveTab('generate')}
        >
          <Wand2 size={16} /> Generate Content
        </button>

        <button
          className={`px-md py-sm font-semibold text-small flex items-center gap-xs border-b-2 transition-colors ${
            activeTab === 'improve' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-main'
          }`}
          onClick={() => setActiveTab('improve')}
        >
          <RotateCcw size={16} /> Side-by-Side Improvement
        </button>

        <button
          className={`px-md py-sm font-semibold text-small flex items-center gap-xs border-b-2 transition-colors ${
            activeTab === 'analyze' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-main'
          }`}
          onClick={() => setActiveTab('analyze')}
        >
          <Search size={16} /> Readability & Safety Analysis
        </button>

        <button
          className={`px-md py-sm font-semibold text-small flex items-center gap-xs border-b-2 transition-colors ${
            activeTab === 'ideas' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-main'
          }`}
          onClick={() => {
            setActiveTab('ideas');
            handleLoadIdeas();
          }}
        >
          <Lightbulb size={16} /> Content Ideas (Phase 14 Informed)
        </button>

        <button
          className={`px-md py-sm font-semibold text-small flex items-center gap-xs border-b-2 transition-colors ${
            activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-main'
          }`}
          onClick={() => {
            setActiveTab('history');
            loadHistory();
          }}
        >
          <History size={16} /> Draft History ({history.length})
        </button>
      </div>

      {/* TAB 1: GENERATE CONTENT */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleGenerate} className="lg:col-span-5 card p-6 space-y-4">
            <h3 className="text-h4 font-bold flex items-center gap-xs mb-2">
              <Sparkles className="text-primary" size={18} /> Draft Generator
            </h3>

            <div>
              <label className="form-label">Content Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${contentType === 'article' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setContentType('article')}
                >
                  <FileText size={14} /> Blog
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${contentType === 'podcast' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setContentType('podcast')}
                >
                  <Headphones size={14} /> Podcast
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${contentType === 'story' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setContentType('story')}
                >
                  <HeartHandshake size={14} /> Story
                </button>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="topic">Topic / Main Concept *</label>
              <input
                id="topic"
                className="form-input"
                placeholder="e.g. Overcoming Academic Stress Before Midterms"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="tone">Tone</label>
                <select id="tone" className="form-input" value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="Supportive">Supportive</option>
                  <option value="Motivational">Motivational</option>
                  <option value="Educational">Educational</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="length">Length</label>
                <select id="length" className="form-input" value={length} onChange={(e) => setLength(e.target.value)}>
                  <option value="short">Short (~300 words)</option>
                  <option value="medium">Medium (~600 words)</option>
                  <option value="long">Long (~1000 words)</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isGenerating} leftIcon={<Wand2 size={16} />}>
              Generate Draft
            </Button>
          </form>

          {/* Generated Output Preview */}
          <div className="lg:col-span-7 card p-6">
            <h3 className="text-h4 font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              Generated Draft Preview
            </h3>

            {isGenerating ? (
              <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
            ) : generatedDraft ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="info">{generatedDraft.content_type.toUpperCase()}</Badge>
                  <Badge variant={generatedDraft.safety_status === 'pass' ? 'success' : 'warning'}>
                    Safety: {generatedDraft.safety_status}
                  </Badge>
                </div>

                <div className="bg-subtle p-4 rounded text-small space-y-3" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  <h4 className="font-bold text-lg text-main">{generatedDraft.output?.title}</h4>

                  {generatedDraft.output?.summary && (
                    <p className="text-secondary italic">{generatedDraft.output.summary}</p>
                  )}

                  {generatedDraft.output?.body && (
                    <div className="whitespace-pre-line text-main">{generatedDraft.output.body}</div>
                  )}

                  {generatedDraft.output?.intro_script && (
                    <div className="text-main">
                      <strong>Intro Script:</strong>
                      <p className="mt-1">{generatedDraft.output.intro_script}</p>
                    </div>
                  )}

                  {generatedDraft.output?.story_body && (
                    <div className="text-main whitespace-pre-line">{generatedDraft.output.story_body}</div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendToCMS(generatedDraft.id)}
                    isLoading={isCmsLoading}
                    leftIcon={<Send size={14} />}
                  >
                    Send to CMS Draft
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState title="No Draft Generated Yet" description="Fill in the parameters on the left and click 'Generate Draft' to generate structured content." />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SIDE-BY-SIDE IMPROVEMENT */}
      {activeTab === 'improve' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleImprove} className="lg:col-span-5 card p-6 space-y-4">
            <h3 className="text-h4 font-bold mb-2">Content Improvement</h3>

            <div>
              <label className="form-label" htmlFor="improveText">Source Content Phrasing *</label>
              <textarea
                id="improveText"
                className="form-input"
                rows={6}
                placeholder="Paste paragraph or introductory section here..."
                value={improveText}
                onChange={(e) => setImproveText(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="improveOp">Improvement Goal</label>
              <select id="improveOp" className="form-input" value={improveOp} onChange={(e) => setImproveOp(e.target.value)}>
                <option value="simplify">Simplify Vocabulary</option>
                <option value="intro">Engaging Hook Alternative</option>
                <option value="practical">Structured Bullet Point Summary</option>
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isImproving} leftIcon={<RotateCcw size={16} />}>
              Generate Improvement
            </Button>
          </form>

          <div className="lg:col-span-7 card p-6">
            <h3 className="text-h4 font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              Side-by-Side Revision Comparison
            </h3>

            {improvedResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-subtle rounded border" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-xs font-bold text-muted block mb-2">ORIGINAL TEXT</span>
                  <p className="text-small text-secondary">{improvedResult.original_text}</p>
                </div>

                <div className="p-3 bg-subtle rounded border" style={{ borderColor: 'var(--color-primary)' }}>
                  <span className="text-xs font-bold text-primary block mb-2">AI SUGGESTED REVISION</span>
                  <p className="text-small text-main whitespace-pre-line font-medium">{improvedResult.improved_text}</p>
                  <p className="caption text-muted mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <strong>Notes:</strong> {improvedResult.improvement_notes}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState title="No Revision Suggested" description="Paste existing text on the left to review side-by-side improvements." />
            )}
          </div>
        </div>
      )}

      {/* TAB 3: READABILITY & SAFETY ANALYSIS */}
      {activeTab === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleAnalyze} className="lg:col-span-5 card p-6 space-y-4">
            <h3 className="text-h4 font-bold mb-2">Readability & Safety Analyzer</h3>

            <div>
              <label className="form-label" htmlFor="analyzeText">Content Text to Analyze *</label>
              <textarea
                id="analyzeText"
                className="form-input"
                rows={8}
                placeholder="Paste full draft or section here..."
                value={analyzeText}
                onChange={(e) => setAnalyzeText(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isAnalyzing} leftIcon={<Search size={16} />}>
              Run Quality Analysis
            </Button>
          </form>

          <div className="lg:col-span-7 card p-6">
            <h3 className="text-h4 font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              Analysis Results
            </h3>

            {analysisResult ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-subtle rounded">
                    <span className="caption text-muted block">Word Count</span>
                    <span className="text-lg font-bold">{analysisResult.word_count}</span>
                  </div>
                  <div className="p-3 bg-subtle rounded">
                    <span className="caption text-muted block">Reading Time</span>
                    <span className="text-lg font-bold">{analysisResult.estimated_reading_time_minutes} min</span>
                  </div>
                  <div className="p-3 bg-subtle rounded">
                    <span className="caption text-muted block">Avg Sentence Length</span>
                    <span className="text-lg font-bold">{analysisResult.avg_sentence_length} words</span>
                  </div>
                  <div className="p-3 bg-subtle rounded">
                    <span className="caption text-muted block">Readability</span>
                    <span className="text-xs font-bold text-success">{analysisResult.readability_label}</span>
                  </div>
                </div>

                <div className="p-4 border rounded" style={{ borderColor: analysisResult.safety_status === 'pass' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  <div className="flex items-center gap-xs mb-2">
                    <ShieldCheck className={analysisResult.safety_status === 'pass' ? 'text-success' : 'text-warning'} size={20} />
                    <h4 className="font-bold text-small">Safety Verification Status: {analysisResult.safety_status.toUpperCase()}</h4>
                  </div>

                  {analysisResult.safety_flags.length > 0 ? (
                    <ul className="list-disc pl-5 text-xs text-warning space-y-1">
                      {analysisResult.safety_flags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted">No clinical or medical claim violations detected. Content is safe for student educational publishing.</p>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState title="No Analysis Performed" description="Paste draft text on the left and run analysis to evaluate readability and safety." />
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CONTENT IDEAS (PHASE 14 INFORMED) */}
      {activeTab === 'ideas' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <h3 className="text-h4 font-bold flex items-center gap-xs">
                <Lightbulb size={20} className="text-warning" /> Analytics-Informed Content Opportunities
              </h3>
              <p className="text-muted text-small">Suggested topics based on Phase 14 content performance metrics and completion signals.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLoadIdeas} leftIcon={<RotateCcw size={14} />}>
              Refresh Ideas
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <div key={idea.id} className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="info">{idea.content_type.toUpperCase()}</Badge>
                    <span className="caption text-muted">{idea.target_audience}</span>
                  </div>

                  <h4 className="font-bold text-small text-main mb-2">{idea.title}</h4>
                  <p className="text-xs text-secondary mb-2"><strong>Need:</strong> {idea.problem_need}</p>
                  <p className="text-xs text-secondary mb-2"><strong>Angle:</strong> {idea.suggested_angle}</p>
                  
                  {idea.reason_analytics && (
                    <div className="bg-subtle p-2 rounded text-xs text-muted mt-2">
                      <strong>Analytics Context:</strong> {idea.reason_analytics}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    className="btn btn-xs btn-primary flex items-center gap-xs"
                    onClick={() => {
                      setContentType(idea.content_type);
                      setTopic(idea.title);
                      setActiveTab('generate');
                    }}
                  >
                    Use as Topic <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AI DRAFT HISTORY */}
      {activeTab === 'history' && (
        <div className="card p-6">
          <h3 className="text-h4 font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
            AI Generation History ({history.length})
          </h3>

          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" style={{ minWidth: '700px' }}>
                <thead>
                  <tr className="bg-subtle border-b text-small font-semibold" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="p-3">Creation Date</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Operation</th>
                    <th className="p-3">Topic / Summary</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-subtle transition-colors text-small" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="p-3 caption text-muted">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="p-3"><Badge variant="info">{item.content_type}</Badge></td>
                      <td className="p-3 text-secondary font-medium">{item.operation_type}</td>
                      <td className="p-3 font-semibold text-main">{item.topic || item.output?.title || 'Generated Draft'}</td>
                      <td className="p-3">
                        <Badge variant={item.status === 'approved' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {item.status !== 'approved' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSendToCMS(item.id)}
                            leftIcon={<Send size={12} />}
                          >
                            Send to CMS
                          </Button>
                        ) : (
                          <span className="caption text-success font-semibold flex items-center gap-xs">
                            <CheckCircle size={12} /> CMS Draft Created
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No Generation History" description="Generations created in this studio will be recorded here for human review." />
          )}
        </div>
      )}
    </div>
  );
};
