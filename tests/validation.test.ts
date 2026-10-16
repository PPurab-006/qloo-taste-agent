import { describe, it, expect } from 'vitest';
import {
  TasteProfileInputSchema,
  SearchApiQuerySchema,
  QlooEntitySchema,
  QlooInsightsResponseSchema,
} from '@/lib/qloo/schemas';

describe('Validation Schemas & Reliability Guards', () => {
  describe('TasteProfileInputSchema', () => {
    it('should validate valid profiles with 2 to 5 anchors', () => {
      const validProfile = {
        anchors: [
          {
            id: 'uuid-1',
            name: 'Everything Everywhere All at Once',
            category: 'urn:entity:movie',
            categoryLabel: 'Film & Cinema',
          },
          {
            id: 'uuid-2',
            name: 'Brian Eno',
            category: 'urn:entity:artist',
            categoryLabel: 'Music & Sound',
          },
        ],
        location: 'New York',
        mood: 'avant_garde',
        discoveryDial: 'balanced',
      };

      const result = TasteProfileInputSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('should reject profiles with fewer than 2 anchors', () => {
      const invalidProfile = {
        anchors: [
          {
            id: 'uuid-1',
            name: 'Inception',
            category: 'urn:entity:movie',
            categoryLabel: 'Film & Cinema',
          },
        ],
      };

      const result = TasteProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 2 taste anchors');
      }
    });

    it('should reject profiles with more than 5 anchors', () => {
      const invalidProfile = {
        anchors: [
          { id: '1', name: 'A', category: 'urn:entity:movie', categoryLabel: 'Film' },
          { id: '2', name: 'B', category: 'urn:entity:movie', categoryLabel: 'Film' },
          { id: '3', name: 'C', category: 'urn:entity:movie', categoryLabel: 'Film' },
          { id: '4', name: 'D', category: 'urn:entity:movie', categoryLabel: 'Film' },
          { id: '5', name: 'E', category: 'urn:entity:movie', categoryLabel: 'Film' },
          { id: '6', name: 'F', category: 'urn:entity:movie', categoryLabel: 'Film' },
        ],
      };

      const result = TasteProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Maximum of 5 taste anchors');
      }
    });

    it('should reject duplicate anchor IDs to prevent artificial signal skew', () => {
      const duplicateProfile = {
        anchors: [
          { id: 'same-uuid', name: 'Brian Eno', category: 'urn:entity:artist', categoryLabel: 'Music' },
          { id: 'same-uuid', name: 'Brian Eno Duplicate', category: 'urn:entity:artist', categoryLabel: 'Music' },
        ],
      };

      const result = TasteProfileInputSchema.safeParse(duplicateProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Duplicate taste anchors are not allowed');
      }
    });
  });

  describe('SearchApiQuerySchema', () => {
    it('should accept valid search query strings', () => {
      const result = SearchApiQuerySchema.safeParse({ query: 'Blade Runner', take: 10 });
      expect(result.success).toBe(true);
    });

    it('should reject empty or whitespace-only search queries', () => {
      const result = SearchApiQuerySchema.safeParse({ query: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('QlooEntitySchema & Missing Optional Metadata Handling', () => {
    it('should successfully parse entities with missing optional fields without throwing', () => {
      const minimalEntity = {
        entity_id: 'minimal-uuid-123',
        name: 'Bare Minimum Entity',
        type: 'urn:entity',
        subtype: 'urn:entity:movie',
      };

      const result = QlooEntitySchema.safeParse(minimalEntity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
        expect(result.data.properties).toEqual({});
      }
    });

    it('should validate full entity with explainability and affinity', () => {
      const fullEntity = {
        entity_id: 'uuid-full',
        name: 'Everything Everywhere',
        type: 'urn:entity',
        subtype: 'urn:entity:movie',
        popularity: 0.95,
        tags: [{ id: 'tag-1', name: 'Multiverse', type: 'keyword' }],
        query: {
          affinity: 0.88,
          explainability: {
            'anchor-1': 0.65,
            'anchor-2': 0.35,
          },
        },
      };

      const result = QlooEntitySchema.safeParse(fullEntity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query?.affinity).toBe(0.88);
        expect(result.data.query?.explainability?.['anchor-1']).toBe(0.65);
      }
    });
  });

  describe('QlooInsightsResponseSchema', () => {
    it('should validate official Qloo Insights API response format', () => {
      const rawResponse = {
        success: true,
        results: {
          entities: [
            {
              entity_id: '1234',
              name: 'Drive',
              type: 'urn:entity',
              subtype: 'urn:entity:movie',
            },
          ],
          total: 1,
        },
        query: {
          explainability: {
            influence_by_entity: { 'anchor-uuid': 0.85 },
          },
        },
      };

      const result = QlooInsightsResponseSchema.safeParse(rawResponse);
      expect(result.success).toBe(true);
    });
  });
});
