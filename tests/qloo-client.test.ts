import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  QlooClient,
  QlooAuthError,
  QlooRateLimitError,
  QlooTimeoutError,
  QlooValidationError,
  QlooApiError,
} from '@/lib/qloo/client';
import { globalQlooCache } from '@/lib/qloo/cache';

describe('QlooClient & Upstream API Resilience', () => {
  beforeEach(() => {
    globalQlooCache.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Configuration & Mode Handling', () => {
    it('should default to mock mode when no API key is provided', () => {
      const client = new QlooClient({ apiKey: undefined, forceMock: true });
      expect(client.isMockMode()).toBe(true);
    });

    it('should operate in live mode when an active API key is provided and forceMock is false', () => {
      const client = new QlooClient({
        apiKey: 'test_live_key_xyz',
        baseUrl: 'https://hackathon.api.qloo.com',
        forceMock: false,
      });
      expect(client.isMockMode()).toBe(false);
      expect(client.getBaseUrl()).toBe('https://hackathon.api.qloo.com');
    });

    it('should report healthy probe in mock mode', async () => {
      const client = new QlooClient({ forceMock: true });
      const health = await client.checkHealth();
      expect(health.reachable).toBe(true);
      expect(health.mode).toBe('mock');
    });
  });

  describe('Search Endpoint & Mock Fallback', () => {
    it('should reject empty or whitespace-only search queries with QlooValidationError', async () => {
      const client = new QlooClient({ forceMock: true });
      await expect(client.search({ query: '   ' })).rejects.toThrow(QlooValidationError);
    });

    it('should return canonical mock results when forceMock is enabled', async () => {
      const client = new QlooClient({ forceMock: true });
      const { entities, isMock } = await client.search({ query: 'Wong Kar-wai' });

      expect(isMock).toBe(true);
      expect(entities.length).toBeGreaterThan(0);
      expect(
        entities[0].name.toLowerCase().includes('wong') ||
          entities[0].disambiguation?.toLowerCase().includes('wong')
      ).toBe(true);
    });

    it('should cache search results and serve repeated queries from cache', async () => {
      const client = new QlooClient({ forceMock: true });
      const res1 = await client.search({ query: 'Haruki Murakami' });
      const res2 = await client.search({ query: 'Haruki Murakami' });

      expect(res1.entities).toEqual(res2.entities);
      expect(globalQlooCache.size()).toBeGreaterThan(0);
    });
  });

  describe('HTTP Execution & Upstream Error Translation', () => {
    it('should pass X-Api-Key header and return validated response in live mode', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          results: {
            entities: [
              {
                entity_id: 'ent_live_123',
                name: 'In the Mood for Love',
                subtype: 'urn:entity:movie',
                popularity: 0.92,
              },
            ],
            total: 1,
            page: 1,
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new QlooClient({
        apiKey: 'real_hackathon_token',
        baseUrl: 'https://hackathon.api.qloo.com',
        forceMock: false,
      });

      const { entities, isMock } = await client.search({ query: 'In the Mood for Love' });

      expect(isMock).toBe(false);
      expect(entities.length).toBe(1);
      expect(entities[0].name).toBe('In the Mood for Love');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/search?query=In+the+Mood+for+Love'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Api-Key': 'real_hackathon_token',
          }),
        })
      );
    });

    it('should throw QlooAuthError on HTTP 401 response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized: Invalid API key',
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new QlooClient({
        apiKey: 'bad_token',
        forceMock: false,
      });

      await expect(client.search({ query: 'A24' })).rejects.toThrow(QlooAuthError);
    });

    it('should retry on HTTP 429 and eventually throw QlooRateLimitError', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Too Many Requests',
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new QlooClient({
        apiKey: 'valid_token',
        forceMock: false,
        maxRetries: 1, // minimal retries for fast test
      });

      await expect(client.search({ query: 'A24' })).rejects.toThrow(QlooRateLimitError);
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial attempt + 1 retry
    });

    it('should throw QlooTimeoutError when request aborts due to timeout', async () => {
      const mockFetch = vi.fn().mockImplementation(() => {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        return Promise.reject(error);
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new QlooClient({
        apiKey: 'valid_token',
        forceMock: false,
        timeoutMs: 50,
      });

      await expect(client.search({ query: 'Brian Eno' })).rejects.toThrow(QlooTimeoutError);
    });

    it('should throw QlooApiError when upstream returns malformed non-conforming payload', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          unexpected_corrupted_structure: true,
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new QlooClient({
        apiKey: 'valid_token',
        forceMock: false,
      });

      await expect(client.search({ query: 'A24' })).rejects.toThrow(QlooApiError);
    });
  });

  describe('Insights Endpoint (/v2/insights)', () => {
    it('should throw QlooValidationError if signalEntities is empty', async () => {
      const client = new QlooClient({ forceMock: true });
      await expect(
        client.getInsights({
          signalEntities: [],
          filterType: 'urn:entity:movie',
        })
      ).rejects.toThrow(QlooValidationError);
    });

    it('should throw QlooValidationError if filterType is missing', async () => {
      const client = new QlooClient({ forceMock: true });
      await expect(
        client.getInsights({
          signalEntities: ['ent_1'],
          filterType: '' as any,
        })
      ).rejects.toThrow(QlooValidationError);
    });

    it('should return mock insights with explainability weights in mock mode', async () => {
      const client = new QlooClient({ forceMock: true });
      const { response, isMock } = await client.getInsights({
        signalEntities: ['ent_film_wong_kar_wai'],
        filterType: 'urn:entity:artist',
        take: 5,
      });

      expect(isMock).toBe(true);
      expect(response.results.entities.length).toBeGreaterThan(0);
      expect(response.query?.explainability).toBeDefined();
    });
  });
});
