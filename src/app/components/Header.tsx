'use client';

import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface HeaderProps {
  isMockMode: boolean;
  systemReachable: boolean;
  latencyMs?: number;
}

export function Header({ isMockMode, systemReachable, latencyMs }: HeaderProps) {
  return (
    <header className="vellum-header" id="vellum-masthead">
      <div className="vellum-container">
        <div className="header-content">
          <div className="brand-wrapper">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
              }}
            >
              <Compass size={18} />
            </div>
            <a href="/" className="brand-title" id="brand-link">
              Vellum
            </a>
            <span className="brand-subtitle">Cultural Intelligence Engine</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              className="status-badge"
              id="upstream-status-badge"
              title={
                isMockMode
                  ? 'Operating in transparent Mock/Demo mode with verified canonical entities and Qloo schemas'
                  : `Connected live to Qloo Cultural Graph Gateway (${latencyMs || 0}ms)`
              }
            >
              <span
                className={`status-indicator ${isMockMode ? 'mock' : systemReachable ? 'live' : 'mock'}`}
                aria-hidden="true"
              />
              <span>
                {isMockMode
                  ? 'Demo / Fixture Mode'
                  : systemReachable
                    ? 'Qloo Gateway Active'
                    : 'Gateway Degraded'}
              </span>
            </div>

            <a
              href="#workbench"
              className="btn-secondary"
              id="nav-curate-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={14} color="var(--accent)" />
              <span>Explore Tastes</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
