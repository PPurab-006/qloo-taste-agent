'use client';

import React from 'react';
import { CuratedExperience, RecommendationItem } from '@/types/vellum';
import { Clock, MapPin, Sparkles, BookOpen, BarChart2 } from 'lucide-react';

interface ExperienceCuratorViewProps {
  experience: CuratedExperience | null;
  isLoading: boolean;
  onInspectRecommendation: (rec: RecommendationItem) => void;
}

export function ExperienceCuratorView({
  experience,
  isLoading,
  onInspectRecommendation,
}: ExperienceCuratorViewProps) {
  if (isLoading) {
    return (
      <div
        className="panel"
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
        }}
        id="curator-loading-state"
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)',
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={24} className="animate-pulse" />
        </div>
        <h3 style={{ marginBottom: '0.5rem' }}>Synthesizing Cultural Experience...</h3>
        <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.9rem' }}>
          Querying Qloo multi-domain taste graph, resolving explainability weights, and structuring a grounded itinerary.
        </p>
      </div>
    );
  }

  if (!experience) {
    return null;
  }

  return (
    <div className="panel" id="curated-experience-section">
      <div className="panel-header">
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--accent)',
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <BookOpen size={13} />
            <span>Curated Cultural Itinerary</span>
          </div>
          <h2 className="panel-title" id="experience-title" style={{ fontSize: '1.75rem' }}>
            {experience.themeTitle}
          </h2>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <span>📍 {experience.location}</span>
            <span>·</span>
            <span>Mood: {experience.mood.replace('_', ' ')}</span>
            <span>·</span>
            <span>Dial: {experience.discoveryDial}</span>
          </div>
        </div>
      </div>

      {/* Editorial Curator Preface */}
      <div
        style={{
          background: 'var(--bg-surface-elevated)',
          borderLeft: '3px solid var(--accent)',
          padding: '1.25rem 1.5rem',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          fontFamily: 'var(--font-serif)',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
          marginBottom: '2rem',
        }}
        id="curator-preface"
      >
        &ldquo;{experience.curatorPreface}&rdquo;
      </div>

      {/* Itinerary Stops */}
      <div className="itinerary-container" id="itinerary-stops-list">
        {experience.stops.map((stop, index) => {
          const rec = stop.recommendation;
          const topAnchor = rec.evidence.contributingAnchors[0];

          return (
            <div key={`${stop.title}-${index}`} className="itinerary-stop" id={`itinerary-stop-${index}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span className="itinerary-stop-time">
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {stop.timeSlot}
                </span>

                <span className="category-badge" style={{ alignSelf: 'flex-start' }}>
                  {rec.categoryLabel}
                </span>

                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    id={`stop-inspect-${index}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.6rem',
                    }}
                    onClick={() => onInspectRecommendation(rec)}
                  >
                    <BarChart2 size={12} />
                    <span>Evidence</span>
                  </button>
                </div>
              </div>

              <div className="itinerary-stop-content">
                <h3 className="itinerary-stop-title">{rec.name}</h3>

                {rec.location && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <MapPin size={12} />
                    <span>{rec.location}</span>
                  </div>
                )}

                <p className="itinerary-stop-note">{stop.curatorNote}</p>

                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="evidence-pill empirical">Qloo Taste Signal</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Anchored by: <strong>{topAnchor ? topAnchor.anchorName : 'Profile'}</strong>
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {stop.connectionToProfile}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cluster summary info */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Empirical Signal Density: </span>
          <span style={{ color: 'var(--qloo-teal)', fontWeight: 600 }}>
            {experience.overallAffinitiesSummary.empiricalCoveragePercent}%
          </span>
        </div>

        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Primary Taste Cluster: </span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {experience.overallAffinitiesSummary.strongestCorrelation}
          </span>
        </div>
      </div>
    </div>
  );
}
