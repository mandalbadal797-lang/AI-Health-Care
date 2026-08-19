import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Bookmark,
  CheckCircle,
  Star,
  ThumbsUp,
  Filter,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Hero } from '../../components/typography/Hero';
import { Badge, BadgeVariant } from '../../components/badges/Badge';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/feedback/Skeleton';
import {
  analyticsService,
  OverviewKPIs,
  ContentPerformanceItem,
  CategoryAnalyticsItem,
  AnalyticsTrends,
  OperationalInsight,
} from '../../services/analyticsService';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/domain';

export const AdminAnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('30d');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [sortOption, setSortOption] = useState<string>('views');

  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [performance, setPerformance] = useState<ContentPerformanceItem[]>([]);
  const [categories, setCategories] = useState<CategoryAnalyticsItem[]>([]);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [insights, setInsights] = useState<OperationalInsight[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    categoryService.getCategories().then(setAllCategories).catch(() => {});
  }, []);

  const loadData = () => {
    setIsLoading(true);

    Promise.all([
      analyticsService.getOverviewKPIs({ period, type: typeFilter, category_id: categoryFilter }),
      analyticsService.getContentPerformance({ type: typeFilter, category_id: categoryFilter, sort: sortOption, limit: 20 }),
      analyticsService.getCategoryAnalytics(),
      analyticsService.getTrends(period),
      analyticsService.getInsights(),
    ])
      .then(([kpiRes, perfRes, catRes, trendRes, insightRes]) => {
        setKpis(kpiRes);
        setPerformance(perfRes.items);
        setCategories(catRes);
        setTrends(trendRes);
        setInsights(insightRes);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [period, typeFilter, categoryFilter, sortOption]);

  const getFormatBadgeVariant = (type: string): BadgeVariant => {
    if (type === 'article') return 'info';
    if (type === 'podcast') return 'success';
    return 'warning';
  };

  return (
    <div className="container py-6 animate-fade-in">
      {/* Header */}
      <Hero
        eyebrow="Admin Content Management"
        title="Content Analytics & Intelligent Insights"
        subtitle="Understand how students interact with MindCampus content and identify opportunities to improve content quality."
      />

      {/* Global Filter Bar */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
        <div className="flex items-center gap-sm flex-wrap w-full md:w-auto">
          <div className="flex items-center gap-xs text-muted text-small font-semibold">
            <Filter size={16} /> Filters:
          </div>

          <select
            className="form-input text-small"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>

          <select
            className="form-input text-small"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
          >
            <option value="all">All Content Formats</option>
            <option value="article">Blogs</option>
            <option value="podcast">Podcasts</option>
            <option value="story">Digital Stories</option>
          </select>

          <select
            className="form-input text-small"
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : undefined)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
          >
            <option value="">All Categories</option>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Button variant="ghost" size="sm" onClick={loadData} leftIcon={<RefreshCw size={14} />}>
          Refresh Analytics
        </Button>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Total Views */}
        <div className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="flex items-center justify-between">
            <span className="text-small text-muted flex items-center gap-xs font-medium">
              <Eye size={16} className="text-primary" /> Total Content Views
            </span>
            {kpis?.views_change_pct !== null && kpis?.views_change_pct !== undefined && (
              <span className={`text-xs font-semibold flex items-center ${kpis.views_change_pct >= 0 ? 'text-success' : 'text-danger'}`}>
                {kpis.views_change_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(kpis.views_change_pct)}%
              </span>
            )}
          </div>
          <span className="display-heading text-primary mt-2">
            {isLoading ? '...' : kpis?.total_views || 0}
          </span>
          <span className="caption text-muted">{kpis?.unique_viewers || 0} unique authenticated viewers</span>
        </div>

        {/* Card 2: Total Saves */}
        <div className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="flex items-center justify-between">
            <span className="text-small text-muted flex items-center gap-xs font-medium">
              <Bookmark size={16} className="text-success" /> Total Library Saves
            </span>
            {kpis?.saves_change_pct !== null && kpis?.saves_change_pct !== undefined && (
              <span className={`text-xs font-semibold flex items-center ${kpis.saves_change_pct >= 0 ? 'text-success' : 'text-danger'}`}>
                {kpis.saves_change_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(kpis.saves_change_pct)}%
              </span>
            )}
          </div>
          <span className="display-heading text-success mt-2">
            {isLoading ? '...' : kpis?.total_saves || 0}
          </span>
          <span className="caption text-muted">Saved for repeat learning</span>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <span className="text-small text-muted flex items-center gap-xs font-medium">
            <CheckCircle size={16} className="text-warning" /> Avg Completion Rate
          </span>
          <span className="display-heading text-warning mt-2">
            {isLoading ? '...' : `${kpis?.completion_rate || 0}%`}
          </span>
          <span className="caption text-muted">{kpis?.total_completions || 0} completions (≥90% progress)</span>
        </div>

        {/* Card 4: Helpful Rate & Rating */}
        <div className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <span className="text-small text-muted flex items-center gap-xs font-medium">
            <ThumbsUp size={16} style={{ color: '#8b5cf6' }} /> Helpful Rate & Rating
          </span>
          <span className="display-heading mt-2" style={{ color: '#8b5cf6' }}>
            {isLoading ? '...' : `${kpis?.helpful_rate || 0}%`}
          </span>
          <span className="caption text-muted flex items-center gap-xs">
            <Star size={12} className="fill-warning text-warning" /> {kpis?.average_rating?.toFixed(1) || '0.0'} / 5 ({kpis?.total_feedback || 0} feedback)
          </span>
        </div>
      </div>

      {/* Content Improvement Opportunities (Intelligent Insights) */}
      <div className="mb-8">
        <h3 className="text-h4 font-bold flex items-center gap-xs mb-4">
          <Sparkles size={20} className="text-primary" /> Content Improvement Opportunities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="card p-4 flex flex-col justify-between"
              style={{
                borderLeft: `4px solid ${
                  insight.type === 'opportunity' ? 'var(--color-warning)' : insight.type === 'success' ? 'var(--color-success)' : 'var(--color-primary)'
                }`,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-small" style={{ color: 'var(--color-text-main)' }}>
                    {insight.title}
                  </h4>
                  <Badge variant={insight.type === 'opportunity' ? 'warning' : insight.type === 'success' ? 'success' : 'info'}>
                    {insight.sample_size}
                  </Badge>
                </div>
                <p className="text-small text-secondary mb-2">
                  {insight.observation}
                </p>
                <div className="bg-subtle p-sm rounded text-xs text-muted">
                  <strong>Recommendation:</strong> {insight.recommendation}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border-color)' }}>
                <a href={insight.url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-ghost text-primary">
                  Review Resource <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Time-Series Trends */}
      {trends && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-h4 font-bold flex items-center gap-xs">
              <TrendingUp size={20} className="text-primary" /> Engagement & Consumption Trends
            </h3>
            <span className="caption text-muted">Daily distribution over selected period</span>
          </div>

          {/* Time Series Bar Representation */}
          <div className="flex items-end gap-1 h-36 pt-4 pb-2 px-2 bg-subtle rounded overflow-x-auto">
            {trends.dates.map((date, idx) => {
              const val = trends.views[idx] || 0;
              const maxVal = Math.max(...trends.views, 1);
              const heightPct = Math.min(100, Math.max(10, (val / maxVal) * 100));
              return (
                <div
                  key={date}
                  className="flex-1 flex flex-col items-center group relative"
                  style={{ minWidth: '12px' }}
                >
                  <div
                    className="w-full bg-primary rounded-t transition-all group-hover:bg-primary-hover"
                    style={{ height: `${heightPct}%` }}
                    title={`${date}: ${val} views`}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted mt-2">
            <span>{trends.dates[0]}</span>
            <span>{trends.dates[Math.floor(trends.dates.length / 2)]}</span>
            <span>{trends.dates[trends.dates.length - 1]}</span>
          </div>
        </div>
      )}

      {/* Content Performance Table */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="text-h4 font-bold flex items-center gap-xs">
              <BarChart3 size={20} className="text-primary" /> Content Performance Metrics
            </h3>
            <p className="text-muted text-small">Detailed metrics per published resource across all content types.</p>
          </div>

          <div className="flex items-center gap-sm">
            <span className="text-xs text-muted font-semibold">Sort by:</span>
            <select
              className="form-input text-small"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
            >
              <option value="views">Most Views</option>
              <option value="saves">Most Saves</option>
              <option value="completion_rate">Highest Completion Rate</option>
              <option value="rating">Highest Star Rating</option>
              <option value="helpful_rate">Highest Helpful Rate</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
        ) : performance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '750px' }}>
              <thead>
                <tr className="bg-subtle border-b text-small font-semibold" style={{ borderColor: 'var(--border-color)' }}>
                  <th className="p-3">Resource Title</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Saves</th>
                  <th className="p-3">Completion Rate</th>
                  <th className="p-3">Avg Rating</th>
                  <th className="p-3">Helpful Rate</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="border-b hover:bg-subtle transition-colors text-small" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="p-3">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary inline-flex items-center gap-xs">
                        {item.title} <ExternalLink size={12} />
                      </a>
                    </td>

                    <td className="p-3">
                      <Badge variant={getFormatBadgeVariant(item.type)}>
                        {item.type}
                      </Badge>
                    </td>

                    <td className="p-3 font-semibold">{item.views}</td>
                    <td className="p-3 text-secondary">{item.saves}</td>
                    <td className="p-3">
                      <span className={`font-semibold ${item.completion_rate >= 70 ? 'text-success' : item.completion_rate < 50 ? 'text-danger' : 'text-warning'}`}>
                        {item.completion_rate}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-xs text-warning font-semibold">
                        <Star size={14} className="fill-warning" /> {item.rating > 0 ? item.rating.toFixed(1) : '—'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-success">{item.helpful_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Content Performance Data" description="No metrics match your current filter selections." />
        )}
      </div>

      {/* Category Performance Breakdown */}
      <div className="card p-6">
        <h3 className="text-h4 font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
          Category Engagement Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: '600px' }}>
            <thead>
              <tr className="bg-subtle border-b text-small font-semibold" style={{ borderColor: 'var(--border-color)' }}>
                <th className="p-3">Category Name</th>
                <th className="p-3">Content Count</th>
                <th className="p-3">Total Views</th>
                <th className="p-3">Total Saves</th>
                <th className="p-3">Avg Completion</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b hover:bg-subtle transition-colors text-small" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="p-3 font-semibold text-main">{c.name}</td>
                  <td className="p-3 text-muted">{c.content_count} resources</td>
                  <td className="p-3 font-semibold">{c.views}</td>
                  <td className="p-3 text-secondary">{c.saves}</td>
                  <td className="p-3 text-success font-semibold">{c.completion_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
