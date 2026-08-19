import React, { useState } from 'react';
import { Sparkles, Layers, Bell, Heart, BookOpen, Clock } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { SectionHeader } from '../components/typography/SectionHeader';
import { Button } from '../components/buttons/Button';
import { IconButton } from '../components/buttons/IconButton';
import { Input } from '../components/forms/Input';
import { Textarea } from '../components/forms/Textarea';
import { Select } from '../components/forms/Select';
import { Checkbox } from '../components/forms/Checkbox';
import { RadioGroup } from '../components/forms/RadioGroup';
import { SearchInput } from '../components/forms/SearchInput';
import { Card } from '../components/cards/Card';
import { ArticleCardPreview } from '../components/cards/ArticleCardPreview';
import { PodcastCardPreview } from '../components/cards/PodcastCardPreview';
import { StoryCardPreview } from '../components/cards/StoryCardPreview';
import { RecommendationCard } from '../components/cards/RecommendationCard';
import { CategoryCard } from '../components/cards/CategoryCard';
import { Badge } from '../components/badges/Badge';
import { Tag } from '../components/badges/Tag';
import { AIBadge } from '../components/badges/AIBadge';
import { Avatar } from '../components/badges/Avatar';
import { QuoteBlock } from '../components/content/QuoteBlock';
import { CalloutBlock } from '../components/content/CalloutBlock';
import { KeyTakeawayBlock } from '../components/content/KeyTakeawayBlock';
import { SafetyNotice } from '../components/content/SafetyNotice';
import { PodcastPlayerPreview } from '../components/media/PodcastPlayerPreview';
import { StorySectionPreview } from '../components/media/StorySectionPreview';
import { AIMessage } from '../components/ai/AIMessage';
import { UserMessage } from '../components/ai/UserMessage';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { Modal } from '../components/feedback/Modal';
import { Toast } from '../components/feedback/Toast';
import { CardSkeleton } from '../components/feedback/Skeleton';

export const DesignSystemShowcasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'components' | 'media' | 'ai'>('tokens');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [selectedRadio, setSelectedRadio] = useState('exam-stress');
  const [activeCategory, setActiveCategory] = useState<string | number>('all');

  return (
    <div className="container py-6">
      {/* Dev Verification Hero Header */}
      <Hero
        eyebrow="Development Design System Showcase"
        title="MindCampus UI/UX Component Foundation"
        subtitle="A calm, accessible, WCAG 2.2 AA compliant visual design system supporting student mental wellness, podcasts, and digital storytelling."
        primaryCta={
          <Button variant="primary" leftIcon={<Layers size={18} />} onClick={() => setIsModalOpen(true)}>
            Test Modal Dialog
          </Button>
        }
        secondaryCta={
          <Button variant="outline" leftIcon={<Bell size={18} />} onClick={() => setShowToast(true)}>
            Trigger Toast Alert
          </Button>
        }
        visualElement={
          <div className="flex flex-col items-center gap-md text-center">
            <Sparkles size={48} className="text-primary" />
            <span className="badge badge-success">WCAG 2.2 AA Compliant</span>
          </div>
        }
      />

      {/* Tab Switcher */}
      <div className="flex gap-sm mb-8" role="tablist">
        <Button variant={activeTab === 'tokens' ? 'primary' : 'secondary'} onClick={() => setActiveTab('tokens')}>
          Design Tokens & Palette
        </Button>
        <Button variant={activeTab === 'components' ? 'primary' : 'secondary'} onClick={() => setActiveTab('components')}>
          Buttons, Forms & Cards
        </Button>
        <Button variant={activeTab === 'media' ? 'primary' : 'secondary'} onClick={() => setActiveTab('media')}>
          Articles, Podcasts & Stories
        </Button>
        <Button variant={activeTab === 'ai' ? 'primary' : 'secondary'} onClick={() => setActiveTab('ai')}>
          AI & Safety Primitives
        </Button>
      </div>

      {/* Toast Notification Container */}
      {showToast && (
        <div className="toast-container">
          <Toast
            type="success"
            title="Design Token Applied"
            message="CSS variables dynamically re-rendered in active theme."
            onClose={() => setShowToast(false)}
          />
        </div>
      )}

      {/* TAB 1: DESIGN TOKENS & TYPOGRAPHY */}
      {activeTab === 'tokens' && (
        <div className="flex flex-col gap-8 animate-fade-in">
          {/* Color Tokens Swatches */}
          <Card>
            <SectionHeader title="Color Palette Tokens" subtitle="HSL tailored semantic color tokens ensuring high accessibility contrast." />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-md text-center" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
                <strong>Primary Indigo</strong>
                <div className="text-small">--color-primary</div>
              </div>
              <div className="p-md text-center" style={{ backgroundColor: 'var(--color-accent-teal)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
                <strong>Teal Accent</strong>
                <div className="text-small">--color-accent-teal</div>
              </div>
              <div className="p-md text-center" style={{ backgroundColor: 'var(--color-accent-amber)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
                <strong>Amber Accent</strong>
                <div className="text-small">--color-accent-amber</div>
              </div>
              <div className="p-md text-center" style={{ backgroundColor: 'var(--color-accent-rose)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
                <strong>Rose Accent</strong>
                <div className="text-small">--color-accent-rose</div>
              </div>
              <div className="p-md text-center" style={{ backgroundColor: 'var(--color-success)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
                <strong>Success</strong>
                <div className="text-small">--color-success</div>
              </div>
              <div className="p-md text-center" style={{ backgroundColor: 'var(--color-danger)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
                <strong>Danger</strong>
                <div className="text-small">--color-danger</div>
              </div>
              <div className="p-md text-center" style={{ backgroundColor: 'var(--color-warning)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
                <strong>Warning</strong>
                <div className="text-small">--color-warning</div>
              </div>
              <div className="p-md text-center" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <strong>Secondary Surface</strong>
                <div className="text-small">--color-secondary</div>
              </div>
            </div>
          </Card>

          {/* Typography Scale */}
          <Card>
            <SectionHeader title="Typography Hierarchy" subtitle="Outfit (Headings) and Inter (Body) Google Font scale." />
            <div className="flex flex-col gap-md">
              <div><span className="caption">Display Heading (clamp 2.5rem - 4rem)</span><h1 className="display-heading">Empowering Student Wellness</h1></div>
              <div><span className="caption">Heading 1 (clamp 2rem - 3rem)</span><h1>Overcoming Exam Stress & Anxiety</h1></div>
              <div><span className="caption">Heading 2 (clamp 1.5rem - 2.25rem)</span><h2>Strategies for Time Management</h2></div>
              <div><span className="caption">Heading 3 (1.25rem)</span><h3>Digital Storytelling & Podcast Episodes</h3></div>
              <div><span className="caption">Body Large (1.125rem)</span><p className="body-lg">Higher education students face academic burnout, fear of test failure, and personal growth challenges.</p></div>
              <div><span className="caption">Body Regular (1rem)</span><p>MindCampus delivers non-clinical educational articles, audio podcasts, and visual digital stories.</p></div>
              <div><span className="caption">Body Small (0.875rem)</span><p className="body-sm text-muted">Estimated reading time: 4 minutes • Published in Academic Stress</p></div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: BUTTONS, FORMS & CARDS */}
      {activeTab === 'components' && (
        <div className="flex flex-col gap-8 animate-fade-in">
          {/* Button Variants */}
          <Card>
            <SectionHeader title="Button Variants & States" subtitle="Primary, secondary, outline, ghost, destructive, loading, and icon buttons." />
            <div className="flex flex-wrap items-center gap-md">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="primary" isLoading>Loading State</Button>
              <Button variant="primary" disabled>Disabled State</Button>
              <IconButton icon={<Heart size={18} />} aria-label="Favorite content" />
            </div>
          </Card>

          {/* Form System */}
          <Card>
            <SectionHeader title="Form Input Controls" subtitle="Accessible form controls with explicit label associations, error states, and helpers." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Student Email" placeholder="student@campus.edu" helperText="We will never share your email address." />
              <Input label="Password" type="password" error="Password must be at least 8 characters long." />
              <SearchInput value={searchVal} onChange={(e) => setSearchVal(e.target.value)} onClear={() => setSearchVal('')} />
              <Select
                label="Primary Stress Factor"
                options={[
                  { label: 'Exam Finals & Tests', value: 'exams' },
                  { label: 'Time Management', value: 'time' },
                  { label: 'Career Uncertainty', value: 'career' },
                ]}
              />
              <Textarea label="Tell us how you are feeling" placeholder="Share what is on your mind..." />
              <div>
                <Checkbox label="I understand MindCampus provides educational content only" defaultChecked />
                <div className="mt-4">
                  <RadioGroup
                    name="mood-topic"
                    label="Select Support Domain"
                    options={[
                      { label: 'Academic Stress & Anxiety', value: 'exam-stress' },
                      { label: 'Failure Resilience & Growth', value: 'resilience' },
                    ]}
                    selectedValue={selectedRadio}
                    onChange={setSelectedRadio}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Category Cards & Badges */}
          <Card>
            <SectionHeader title="Category Chips & Badges" subtitle="Interactive category selectors and status badges." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <CategoryCard name="Mental Wellness" itemCount={12} icon={<Sparkles size={20} />} isActive={activeCategory === 'wellness'} onClick={() => setActiveCategory('wellness')} />
              <CategoryCard name="Exam Stress" itemCount={8} icon={<BookOpen size={20} />} isActive={activeCategory === 'exams'} onClick={() => setActiveCategory('exams')} />
              <CategoryCard name="Time Management" itemCount={15} icon={<Clock size={20} />} isActive={activeCategory === 'time'} onClick={() => setActiveCategory('time')} />
            </div>
            <div className="flex flex-wrap items-center gap-sm mt-4">
              <Badge variant="info">Mental Health</Badge>
              <Badge variant="success">Published</Badge>
              <Badge variant="warning">Draft Pending</Badge>
              <Badge variant="danger">High Priority</Badge>
              <Tag label="StudyHabits" />
              <Tag label="ExamAnxiety" />
              <AIBadge label="AI Assisted Article" />
              <Avatar name="Alex Mercer" />
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: ARTICLES, PODCASTS & STORIES */}
      {activeTab === 'media' && (
        <div className="flex flex-col gap-8 animate-fade-in">
          {/* Article Preview Card */}
          <div>
            <SectionHeader title="Article Card Preview Primitive" subtitle="Visual cards for wellness blog posts with author metadata and reading time." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ArticleCardPreview
                title="How to Stay Calm During Exam Week: Actionable Stress Tools"
                excerpt="Finals week can feel overwhelming. Discover proven cognitive tools and rest intervals to protect your focus."
                category="Exam Stress"
                readingTimeMinutes={5}
                authorName="Dr. Sarah Jenkins"
                isAiGenerated={false}
                isBookmarked={true}
              />
              <ArticleCardPreview
                title="Bouncing Back After a Failed Test: A Resilience Guide"
                excerpt="Receiving an unexpected grade does not define your potential. Learn how to turn academic setbacks into growth."
                category="Resilience"
                readingTimeMinutes={4}
                authorName="Alex Mercer"
                isAiGenerated={true}
                isBookmarked={false}
              />
            </div>
          </div>

          {/* Podcast Card & Audio Player Preview */}
          <div>
            <SectionHeader title="Podcast Card & Audio Player Primitive" subtitle="Visual preview cards for audio podcast episodes and sticky player controls." />
            <div className="flex flex-col gap-6">
              <PodcastCardPreview
                episodeNumber={3}
                title="Student Stories — Learning From Academic Failure"
                description="In this episode, senior engineering students share how they recovered after struggling in their sophomore year."
                durationFormatted="18:45"
                category="Student Stories"
              />
              <PodcastPlayerPreview
                episodeNumber={3}
                title="Student Stories — Learning From Academic Failure"
                durationSeconds={1125}
              />
            </div>
          </div>

          {/* Story Card & Chapter Preview */}
          <div>
            <SectionHeader title="Digital Storytelling Card & Section Reader" subtitle="Visual cards for multi-section interactive student stories." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StoryCardPreview
                title="I Failed My First Semester — What Happened Next"
                description="An interactive 4-part visual story following Jordan's journey from academic probation to dean's list."
                category="Digital Story"
                quoteSnippet="Failure is not the end of the road; it's a detour leading to better strategies."
                sectionCount={4}
              />
              <StorySectionPreview
                sectionOrder={1}
                title="Chapter 1: The Unexpected Midterm Result"
                content="When I opened the grade portal and saw a D on my first physics midterm, my heart sank. I felt like I didn't belong in college."
                quote="The moment you stop blaming yourself is the moment you start building a solution."
                reflectionQuestion="Have you ever received a grade that shook your self-confidence? What was your immediate reaction?"
              />
            </div>
          </div>

          {/* Content Reading Blocks */}
          <Card>
            <SectionHeader title="Article Reading Primitives" subtitle="Callout boxes, motivational quotes, and key takeaway summary blocks." />
            <QuoteBlock quote="You don't have to carry the weight of academic expectations all by yourself." author="Campus Wellness Advisory" />
            <CalloutBlock type="warning" title="Burnout Warning Sign">
              If you experience persistent physical fatigue and brain fog, schedule 15-minute complete disconnect breaks every two hours.
            </CalloutBlock>
            <KeyTakeawayBlock
              takeaways={[
                "Break studying into 25-minute Pomodoro sessions with 5-minute breather breaks.",
                "Replace self-critical thoughts with actionable problem-solving steps.",
                "Reach out early to academic advisors or campus study groups.",
              ]}
            />
          </Card>
        </div>
      )}

      {/* TAB 4: AI & SAFETY PRIMITIVES */}
      {activeTab === 'ai' && (
        <div className="flex flex-col gap-8 animate-fade-in">
          {/* Safety Disclaimer Banner Component */}
          <div>
            <SectionHeader title="Mandatory Non-Clinical Disclaimer Banner" subtitle="Reusable disclaimer component for UI footers and AI modals." />
            <SafetyNotice />
          </div>

          {/* AI Recommendation Cards */}
          <div>
            <SectionHeader title="AI Recommendation Card Primitives" subtitle="Content recommendation cards with intent detection matching." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RecommendationCard
                detectedIntent="Exam Stress & Final Exam Anxiety"
                matchScorePercentage={94}
                recommendedTitle="Overcoming Exam Pressure with Paced Review"
                format="Article"
                guidanceTip="Pacing your review prevents cognitive overload before night-before finals."
              />
              <RecommendationCard
                detectedIntent="Low Motivation & Study Burnout"
                matchScorePercentage={88}
                recommendedTitle="Restoring Momentum After Academic Exhaustion"
                format="Podcast"
                guidanceTip="Listen during a light walk to recharge your mental energy."
              />
            </div>
          </div>

          {/* AI Conversational Mascot Messages */}
          <Card>
            <SectionHeader title="AI Conversational Mascot Primitives" subtitle="Visual message containers for student mascot interactions." />
            <UserMessage message="I feel very overwhelmed because my finals are in three days and I don't know where to start." />
            <AIMessage
              message="Feeling overwhelmed before finals is completely natural. Try breaking your review into three small 20-minute topics today rather than attempting to cover everything at once. Would you like me to recommend a short article on exam stress management?"
              disclaimer="MindCampus AI mascot provides general supportive study advice and content suggestions, not medical or psychiatric care."
            />
          </Card>

          {/* AI Response & Draft Card */}
          <AIResponseCard title="AI-Assisted Article Summary">
            <p className="text-small">
              This article outlines 3 core steps for managing test anxiety: structured study intervals, deep breathing techniques before exams, and re-framing negative academic thoughts.
            </p>
          </AIResponseCard>

          {/* Skeleton Loaders */}
          <Card>
            <SectionHeader title="Skeleton Loading Indicators" subtitle="Animated pulse loading placeholders preventing cumulative layout shift (CLS)." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </Card>
        </div>
      )}

      {/* Demo Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="MindCampus Accessible Dialog"
        footer={
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Close Modal
          </Button>
        }
      >
        <p className="text-muted mb-4">
          This accessible modal traps focus, listens for the <strong>Escape key</strong>, closes on backdrop clicks, and includes proper ARIA dialog semantics.
        </p>
        <SafetyNotice compact />
      </Modal>
    </div>
  );
};
