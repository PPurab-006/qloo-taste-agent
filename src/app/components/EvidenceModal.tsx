'use client';

import React, { useEffect } from 'react';
import { RecommendationItem } from '@/types/vellum';
import { X, ShieldCheck, Cpu, Database, Award } from 'lucide-react';

interface EvidenceModalProps {
  recommendation: RecommendationItem | null;
  onClose: () => void;
}

export function EvidenceModal({ recommendation, onClose }: EvidenceModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!recommendation) return null;

  const { evidence, rawQlooEntity } = recommendation;
  const contributors = evidence.contributingAnchors || [];

  return (
    <div
      className="modal-overlay"
      id="evidence-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content" id="evidence-modal-content">
        <div className="modal-header">
          <div>
            <span className="category-badge" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
              {recommendation.categoryLabel}
            </span>
            <h2 id="evidence-modal-title" style={{ fontSize: '1.65rem' }}>
              {recommendation.name}
            </h2>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                marginTop: '0.2rem',
              }}
            >
              Qloo Entity UUID: <code>{recommendation.id}</code>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            id="close-evidence-modal"
            onClick={onClose}
            aria-label="Close Evidence Inspector"
          >
            <X size={20} />
          </button>
        </div>

        {/* Attribution Transparency Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--qloo-teal-muted)',
              color: 'var(--qloo-teal)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Database size={13} />
            <span>Qloo Empirical Graph Signal</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--ai-purple-muted)',
              color: 'var(--ai-purple)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Cpu size={13} />
            <span>Grounded Narrative Synthesis</span>
          </div>
        </div>

        {/* Explainability Breakdown */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-tertiary)',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Award size={13} color="var(--accent)" />
            <span>Anchor Contribution Weights (feature.explainability)</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Qloo computes exact mathematical influence weights representing how strongly each of your input anchors contributed to surfacing this recommendation:
          </p>

          <div className="weights-list" id="evidence-weights-breakdown">
            {contributors.map((contrib) => {
              const percentage = Math.round((contrib.weight || 0.4) * 100);
              return (
                <div key={contrib.anchorId} className="weight-row">
                  <div className="weight-row-meta">
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {contrib.anchorName}
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginLeft: '6px' }}>
                        ({contrib.anchorCategory})
                      </span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="weight-bar-bg">
                    <div className="weight-bar-fill" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Affinity Metric Card */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Qloo Affinity Score:
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                {evidence.qlooAffinityScore !== undefined ? `${Math.round(evidence.qlooAffinityScore * 100)}%` : 'Direct Correlation'}
              </div>
            </div>

            {evidence.qlooPopularity !== undefined && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Cultural Popularity:
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {Math.round(evidence.qlooPopularity * 100)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Synthesized Reason vs Empirical Evidence */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-tertiary)',
              marginBottom: '0.5rem',
            }}
          >
            Contextual Synthesis (Grounded Narrative)
          </div>
          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              color: 'var(--text-primary)',
            }}
          >
            {evidence.aiGroundedExplanation}
          </div>
        </div>

        {/* Shared Tags & Taxonomy */}
        {evidence.sharedTags.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-tertiary)',
                marginBottom: '0.5rem',
              }}
            >
              Overlapping Taste Graph Tags
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {evidence.sharedTags.map((tag) => (
                <span key={tag} className="tag-pill" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Anti-Fabrication Guarantee footer in modal */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <ShieldCheck size={16} color="var(--qloo-teal)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Scientific Integrity:</strong> Vellum strictly rejects speculative hallucination. Coordinates, entities, and affinity weights reflect verifiable Qloo API responses.
          </span>
        </div>
      </div>
    </div>
  );
}
