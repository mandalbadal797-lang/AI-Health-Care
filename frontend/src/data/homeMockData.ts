export interface ArticleMock {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readingTimeMinutes: number;
  authorName: string;
  coverImage?: string;
  isAiGenerated?: boolean;
  isBookmarked?: boolean;
  slug: string;
}

export interface PodcastMock {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  durationFormatted: string;
  category: string;
  slug: string;
}

export interface StoryMock {
  id: string;
  title: string;
  description: string;
  category: string;
  quoteSnippet: string;
  sectionCount: number;
  slug: string;
}

export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  suggestedTitles: string[];
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'exam-pressure',
    label: 'Exam Pressure',
    emoji: '📚',
    suggestedTitles: [
      'How to Stay Calm During Exam Week',
      'Podcast: Navigating Midterm Anxiety & Resetting Your Mindset',
      'Mastering Time Management Without Burnout',
    ],
  },
  {
    id: 'feeling-stressed',
    label: 'Feeling Stressed',
    emoji: '😟',
    suggestedTitles: [
      'How to Stay Calm During Exam Week',
      'Story: Learning to Ask for Help',
      'Small Habits That Make College Life Easier',
    ],
  },
  {
    id: 'low-motivation',
    label: 'Low Motivation',
    emoji: '😔',
    suggestedTitles: [
      'Bouncing Back After a Failed Test',
      'Podcast: Recovering After Academic Probation',
      'Story: I Failed My First Physics Midterm',
    ],
  },
  {
    id: 'feeling-tired',
    label: 'Feeling Tired / Burnout',
    emoji: '😴',
    suggestedTitles: [
      'Small Habits That Make College Life Easier',
      'Podcast: Building Healthy Daily Habits',
      'Mastering Time Management Without Burnout',
    ],
  },
  {
    id: 'career-confusion',
    label: 'Career Confusion',
    emoji: '🤔',
    suggestedTitles: [
      'Overcoming Imposter Syndrome in Labs',
      'Story: Balancing a Part-Time Job and Coursework',
      'When You Feel Behind Everyone Else',
    ],
  },
  {
    id: 'building-confidence',
    label: 'Building Confidence',
    emoji: '💪',
    suggestedTitles: [
      'Overcoming Imposter Syndrome in Labs',
      'Story: I Failed My First Physics Midterm',
      'Bouncing Back After a Failed Test',
    ],
  },
  {
    id: 'personal-growth',
    label: 'Personal Growth',
    emoji: '😊',
    suggestedTitles: [
      'When You Feel Behind Everyone Else',
      'Story: Learning to Ask for Help',
      'Small Habits That Make College Life Easier',
    ],
  },
];

export const FEATURED_ARTICLES: ArticleMock[] = [
  {
    id: '1',
    title: 'How to Stay Calm During Exam Week: Actionable Tools for Managing Academic Pressure',
    excerpt: 'Finals week can feel overwhelming. Discover proven cognitive pacing tools and rest intervals to protect your focus.',
    category: 'Exam Stress',
    readingTimeMinutes: 5,
    authorName: 'Dr. Sarah Jenkins',
    slug: 'stay-calm-during-exam-week',
  },
  {
    id: '2',
    title: 'When You Feel Behind Everyone Else: Overcoming Social & Academic Comparison',
    excerpt: 'Comparing your progress to classmates causes unnecessary anxiety. Learn how to focus on your unique trajectory.',
    category: 'College Life',
    readingTimeMinutes: 4,
    authorName: 'Alex Mercer',
    slug: 'overcoming-academic-comparison',
  },
  {
    id: '3',
    title: 'Small Habits That Make College Life Easier: A Practical Self-Care Guide',
    excerpt: 'Self-care doesn’t require hours of free time. Explore micro-habits that restore your energy during busy semesters.',
    category: 'Self-Care',
    readingTimeMinutes: 6,
    authorName: 'Maya Lin',
    slug: 'small-habits-college-life',
  },
];

export const LATEST_ARTICLES: ArticleMock[] = [
  {
    id: '4',
    title: 'Bouncing Back After a Failed Test: A Student Resilience Roadmap',
    excerpt: 'Receiving an unexpected grade does not define your academic potential. Learn how to analyze mistakes without despair.',
    category: 'Failure & Resilience',
    readingTimeMinutes: 5,
    authorName: 'Alex Mercer',
    isAiGenerated: true,
    slug: 'bouncing-back-after-failed-test',
  },
  {
    id: '5',
    title: 'Mastering Time Management Without Burnout: The 25-5 Technique',
    excerpt: 'Structure your study hours into high-focus blocks paired with essential mental breather intervals.',
    category: 'Time Management',
    readingTimeMinutes: 4,
    authorName: 'Prof. David Ross',
    slug: 'time-management-without-burnout',
  },
  {
    id: '6',
    title: 'Overcoming Imposter Syndrome in Engineering & CS Labs',
    excerpt: 'Feeling like you don’t belong in technical courses is common. Here is how to build self-efficacy in STEM.',
    category: 'Confidence',
    readingTimeMinutes: 7,
    authorName: 'Maya Lin',
    slug: 'imposter-syndrome-cs-labs',
  },
];

export const PODCAST_EPISODES: PodcastMock[] = [
  {
    id: 'p1',
    episodeNumber: 1,
    title: 'Navigating Midterm Anxiety & Resetting Your Mindset',
    description: 'In this opening episode, campus counselors discuss actionable breathing techniques and cognitive reframing.',
    durationFormatted: '14:20',
    category: 'Academic Stress',
    slug: 'navigating-midterm-anxiety',
  },
  {
    id: 'p2',
    episodeNumber: 2,
    title: 'Student Stories — Recovering After Academic Probation',
    description: 'Senior students share their honest experiences recovering after a difficult freshman semester.',
    durationFormatted: '18:45',
    category: 'Student Stories',
    slug: 'recovering-after-probation',
  },
  {
    id: 'p3',
    episodeNumber: 3,
    title: 'Building Healthy Daily Habits During Finals Week',
    description: 'Practical advice on nutrition, sleep hygiene, and study pacing during high-stress exam periods.',
    durationFormatted: '12:10',
    category: 'Self-Care',
    slug: 'healthy-habits-finals-week',
  },
];

export const DIGITAL_STORIES: StoryMock[] = [
  {
    id: 's1',
    title: 'I Failed My First Physics Midterm — What Happened Next',
    description: 'An interactive 4-part visual story following Jordan’s journey from academic probation to the dean’s list.',
    category: 'Resilience',
    quoteSnippet: 'Failure isn’t the end of the road; it’s a detour leading to better study strategies.',
    sectionCount: 4,
    slug: 'failed-first-physics-midterm',
  },
  {
    id: 's2',
    title: 'Learning to Ask for Help: How Campus Counseling Changed My Junior Year',
    description: 'A student narrative on overcoming stigma and seeking guidance during severe academic stress.',
    category: 'Personal Growth',
    quoteSnippet: 'Seeking guidance early is a mark of strength, not weakness.',
    sectionCount: 3,
    slug: 'learning-to-ask-for-help',
  },
  {
    id: 's3',
    title: 'Balancing a Part-Time Job and Computer Science Coursework',
    description: 'Practical time-blocking and energy management techniques shared by a working student.',
    category: 'College Life',
    quoteSnippet: 'Pacing yourself is the key to sustainable college progress.',
    sectionCount: 5,
    slug: 'balancing-job-and-cs-coursework',
  },
];

export const HOME_CATEGORIES = [
  { id: '1', name: 'Mental Wellness', count: 14 },
  { id: '2', name: 'Academic Stress', count: 18 },
  { id: '3', name: 'Exam Pressure', count: 12 },
  { id: '4', name: 'Study Habits', count: 16 },
  { id: '5', name: 'Time Management', count: 15 },
  { id: '6', name: 'Confidence', count: 10 },
  { id: '7', name: 'College Life', count: 11 },
  { id: '8', name: 'Career Stress', count: 9 },
  { id: '9', name: 'Failure & Resilience', count: 13 },
  { id: '10', name: 'Self-Care', count: 17 },
];
