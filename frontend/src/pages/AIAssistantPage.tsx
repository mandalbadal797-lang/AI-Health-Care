import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Send, Bot, User, AlertTriangle, ArrowRight, RefreshCw, BookOpen, Headphones, HeartHandshake } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { Button } from '../components/buttons/Button';
import { Badge } from '../components/badges/Badge';
import { SafetyNotice } from '../components/content/SafetyNotice';
import { aiService, ChatMessage } from '../services/aiService';

const STARTER_PROMPTS = [
  "I feel unmotivated to study today. What can I do?",
  "How can I recover after a bad exam?",
  "I keep comparing my progress with other students.",
  "Recommend something motivating to listen to.",
  "Show me stories about overcoming academic failure.",
  "Give me a simple 5-minute study reset plan.",
];

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! I am your MindCampus Student Wellness & Motivation Guide. How can I support your study habits, mindset, or focus today? Feel free to select a prompt below or type your question.",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInputText('');

    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.sendMessage(textToSend);
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: response.message,
        recommendations: response.recommendations,
        safetyLevel: response.safety_level,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err?.message || 'AI Assistant is currently unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const getItemIcon = (type: string) => {
    if (type === 'podcast') return <Headphones size={14} />;
    if (type === 'story') return <HeartHandshake size={14} />;
    return <BookOpen size={14} />;
  };

  return (
    <div className="container py-6 animate-fade-in">
      {/* Hero Header */}
      <Hero
        eyebrow="AI-Assisted Guidance"
        title="Your Student Wellness & Motivation Guide"
        subtitle="Ask questions, explore micro-action study plans, and discover grounded MindCampus articles, podcasts, and digital stories tailored to your academic needs."
        visualElement={
          <div className="card p-lg flex flex-col items-center text-center gap-xs">
            <Sparkles size={40} className="text-primary" />
            <h4 style={{ fontSize: '1.1rem' }}>Non-Clinical Assistant</h4>
            <span className="caption text-muted">Grounded Resource Guide</span>
          </div>
        }
      />

      {/* Starter Prompts */}
      <div className="mb-6">
        <span className="caption text-muted font-semibold mb-2 block">Try asking one of these starter prompts:</span>
        <div className="flex flex-wrap gap-sm">
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              className="btn btn-ghost btn-sm"
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-pill)',
                textAlign: 'left',
              }}
            >
              <Sparkles size={14} className="mr-1 inline" /> {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div
        className="card glass p-lg mb-6 flex flex-col gap-md"
        style={{
          minHeight: '400px',
          maxHeight: '600px',
          overflowY: 'auto',
          border: '1px solid var(--border-color)',
        }}
        role="region"
        aria-label="AI Assistant Conversation"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-sm ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={20} />
              </div>
            )}

            <div
              className={`p-md card ${msg.sender === 'user' ? 'bg-primary text-white' : 'glass'}`}
              style={{
                maxWidth: '85%',
                borderRadius: 'var(--radius-lg)',
                borderLeft: msg.safetyLevel === 'IMMINENT_DANGER' ? '4px solid var(--color-danger)' : undefined,
                backgroundColor: msg.safetyLevel === 'IMMINENT_DANGER' ? 'var(--color-danger-light)' : undefined,
              }}
            >
              {msg.safetyLevel === 'IMMINENT_DANGER' && (
                <div className="flex items-center gap-xs text-danger font-semibold mb-2">
                  <AlertTriangle size={18} /> Immediate Support & Crisis Resources
                </div>
              )}

              <p className="body-regular" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {msg.text}
              </p>

              {/* Grounded Content Recommendations */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <span className="caption font-semibold block mb-2" style={{ color: msg.sender === 'user' ? 'white' : 'var(--color-text-muted)' }}>
                    Recommended MindCampus Content:
                  </span>
                  <div className="flex flex-col gap-xs">
                    {msg.recommendations.map((rec) => (
                      <NavLink
                        key={rec.id}
                        to={rec.url}
                        className="card p-xs flex items-center justify-between gap-sm"
                        style={{
                          textDecoration: 'none',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div className="flex items-center gap-xs" style={{ overflow: 'hidden' }}>
                          <Badge variant="info" className="flex items-center gap-xs text-xs">
                            {getItemIcon(rec.type)} {rec.type.toUpperCase()}
                          </Badge>
                          <span className="text-small font-medium" style={{ color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {rec.title}
                          </span>
                        </div>
                        <ArrowRight size={14} className="text-primary flex-shrink-0" />
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={20} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-sm text-muted body-regular p-sm">
            <Bot size={20} className="text-primary animate-spin" />
            <span>Formulating supportive response & selecting grounded resources...</span>
          </div>
        )}

        {error && (
          <div className="card p-md text-center flex flex-col items-center gap-xs" style={{ borderColor: 'var(--color-danger)' }}>
            <span className="text-danger text-small font-medium">{error}</span>
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => handleSend()}>
              Try Again
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-sm mb-6"
      >
        <input
          type="text"
          className="form-input flex-1"
          placeholder="Ask for motivation, study tips, or content recommendations..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          maxLength={2000}
          aria-label="Ask AI Assistant a question"
        />
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading || !inputText.trim()}
          leftIcon={<Send size={18} />}
        >
          Send
        </Button>
      </form>

      {/* Safety Notice */}
      <SafetyNotice />
    </div>
  );
};
