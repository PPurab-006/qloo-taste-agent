'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import { QlooEntity, QlooEntityType } from '@/types/qloo';
import { TasteAnchor } from '@/types/vellum';
import { SUPPORTED_CATEGORIES, getCategoryLabel } from '@/lib/constants/categories';

interface AnchorSelectorProps {
  selectedAnchors: TasteAnchor[];
  onAddAnchor: (anchor: TasteAnchor) => void;
  onRemoveAnchor: (anchorId: string) => void;
}

export function AnchorSelector({
  selectedAnchors,
  onAddAnchor,
  onRemoveAnchor,
}: AnchorSelectorProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QlooEntityType | ''>('');
  const [results, setResults] = useState<QlooEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search via /api/qloo/search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const params = new URLSearchParams({
          query: query.trim(),
          take: '8',
        });
        if (selectedCategory) {
          params.set('type', selectedCategory);
        }

        const res = await fetch(`/api/qloo/search?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to search entities');
        }

        setResults(data.entities || []);
        setShowDropdown(true);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Search request failed');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, selectedCategory]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEntity = (entity: QlooEntity) => {
    // Check if already selected
    if (selectedAnchors.some((a) => a.id === entity.entity_id)) {
      setSearchError(`"${entity.name}" is already in your taste profile.`);
      return;
    }

    if (selectedAnchors.length >= 5) {
      setSearchError('You can select a maximum of 5 taste anchors.');
      return;
    }

    const newAnchor: TasteAnchor = {
      id: entity.entity_id,
      name: entity.name,
      category: (entity.subtype as QlooEntityType) || 'urn:entity:movie',
      categoryLabel: getCategoryLabel(entity.subtype || 'urn:entity:movie'),
      disambiguation: entity.disambiguation,
      image: entity.properties?.image?.url,
      description: entity.properties?.description,
      tags: entity.tags?.map((t) => t.name),
      popularity: entity.popularity,
    };

    onAddAnchor(newAnchor);
    setQuery('');
    setShowDropdown(false);
    setSearchError(null);
  };

  return (
    <div className="panel" id="anchor-selector-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title" id="taste-anchors-title">
            1. Define Your Cultural Anchors
          </h2>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Enter 2 to 5 cultural works, artists, places, or brands you genuinely love. Vellum resolves each into canonical Qloo IDs to map your taste graph.
          </p>
        </div>
        <span className="panel-counter" id="anchor-counter">
          {selectedAnchors.length} / 5 Selected
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="search-wrapper" ref={dropdownRef}>
        <div className="search-input-group">
          <select
            className="category-select"
            id="search-category-filter"
            aria-label="Filter search by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as QlooEntityType | '')}
          >
            <option value="">All Cultural Domains</option>
            {SUPPORTED_CATEGORIES.map((cat) => (
              <option key={cat.urn} value={cat.urn}>
                {cat.label}
              </option>
            ))}
          </select>

          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              id="anchor-search-input"
              className="search-input"
              placeholder={
                selectedAnchors.length >= 5
                  ? 'Maximum 5 anchors reached. Remove one to add more.'
                  : 'Search by title, director, author, artist, or venue (e.g. Everything Everywhere, Brian Eno, Balthazar)...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setShowDropdown(true);
              }}
              disabled={selectedAnchors.length >= 5}
              autoComplete="off"
              spellCheck={false}
            />
            {isSearching && (
              <span
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--accent)',
                }}
              >
                <Loader2 size={18} className="animate-spin" />
              </span>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && results.length > 0 && (
          <div className="search-results-dropdown" id="search-results-list" role="listbox">
            {results.map((entity) => {
              const isAlreadySelected = selectedAnchors.some((a) => a.id === entity.entity_id);
              return (
                <div
                  key={entity.entity_id}
                  className="search-result-item"
                  id={`search-item-${entity.entity_id}`}
                  role="option"
                  aria-selected={isAlreadySelected}
                  tabIndex={0}
                  onClick={() => handleSelectEntity(entity)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectEntity(entity);
                    }
                  }}
                  style={{
                    opacity: isAlreadySelected ? 0.45 : 1,
                    pointerEvents: isAlreadySelected ? 'none' : 'auto',
                  }}
                >
                  <div className="search-result-info">
                    <span className="search-result-name">{entity.name}</span>
                    <span className="search-result-disambiguation">
                      {entity.disambiguation || entity.properties?.description?.slice(0, 80) || 'Cultural Entity'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="category-badge">
                      {getCategoryLabel(entity.subtype)}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      disabled={isAlreadySelected}
                    >
                      {isAlreadySelected ? 'Added' : <Plus size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Search Dropdown Empty State */}
        {showDropdown && !isSearching && query.trim().length >= 2 && results.length === 0 && (
          <div
            className="search-results-dropdown"
            style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-tertiary)' }}
          >
            No matching entities found in Qloo for &ldquo;{query}&rdquo;. Try another spelling or category filter.
          </div>
        )}
      </div>

      {/* Error alert */}
      {searchError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}
          id="search-error-banner"
        >
          <AlertCircle size={16} />
          <span>{searchError}</span>
        </div>
      )}

      {/* Active Selected Anchors */}
      <div style={{ marginTop: '1rem' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-tertiary)',
            marginBottom: '0.75rem',
          }}
        >
          Active Cultural Profile Anchors:
        </div>

        {selectedAnchors.length === 0 ? (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-medium)',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
            id="empty-anchors-notice"
          >
            No anchors selected yet. Search above or click one of the sample profiles below to start.
          </div>
        ) : (
          <div className="anchors-grid" id="selected-anchors-chips">
            {selectedAnchors.map((anchor) => (
              <div
                key={anchor.id}
                className="anchor-chip"
                id={`anchor-chip-${anchor.id}`}
              >
                <span className="category-badge">{anchor.categoryLabel}</span>
                <span style={{ fontWeight: 500 }}>{anchor.name}</span>
                <button
                  type="button"
                  className="anchor-chip-remove"
                  onClick={() => onRemoveAnchor(anchor.id)}
                  aria-label={`Remove ${anchor.name}`}
                  id={`remove-anchor-${anchor.id}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
