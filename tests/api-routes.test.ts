import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as healthHandler } from '@/app/api/health/route';
import { GET as searchHandler } from '@/app/api/qloo/search/route';
import { POST as curateHandler } from '@/app/api/curate/route';

describe('Serverless API Route Handlers', () => {
  describe('GET /api/health', () => {
    it('should return 200 with service health and operational mode', async () => {
      const res = await healthHandler();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe('healthy');
      expect(data.app).toContain('Vellum');
      expect(data.qloo).toBeDefined();
      expect(typeof data.qloo.reachable).toBe('boolean');
    });
  });

  describe('GET /api/qloo/search', () => {
    it('should return 400 when query parameter is omitted', async () => {
      const req = new NextRequest('http://localhost:3000/api/qloo/search');
      const res = await searchHandler(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toContain('required');
    });

    it('should return matching entities for valid search query in offline/mock mode', async () => {
      const req = new NextRequest('http://localhost:3000/api/qloo/search?query=Blade+Runner');
      const res = await searchHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.entities.length).toBeGreaterThan(0);
      expect(data.entities[0].name).toContain('Blade Runner');
    });
  });

  describe('POST /api/curate', () => {
    it('should return 400 when payload violates anchor schema (fewer than 2 anchors)', async () => {
      const req = new NextRequest('http://localhost:3000/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchors: [
            {
              id: 'ent_1',
              name: 'Blade Runner 2049',
              category: 'urn:entity:movie',
              categoryLabel: 'Film & Cinema',
            },
          ],
        }),
      });

      const res = await curateHandler(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe('Validation failed for taste profile');
      expect(data.issues.length).toBeGreaterThan(0);
    });

    it('should return 400 when duplicate anchors are submitted', async () => {
      const req = new NextRequest('http://localhost:3000/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchors: [
            {
              id: 'ent_same',
              name: 'Drive',
              category: 'urn:entity:movie',
              categoryLabel: 'Film & Cinema',
            },
            {
              id: 'ent_same',
              name: 'Drive (Duplicate)',
              category: 'urn:entity:movie',
              categoryLabel: 'Film & Cinema',
            },
          ],
        }),
      });

      const res = await curateHandler(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.issues[0].message).toContain('Duplicate taste anchors');
    });

    it('should curate complete cultural experience for valid profile', async () => {
      const req = new NextRequest('http://localhost:3000/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchors: [
            {
              id: 'F0D354AA-BA7E-49D2-8ABA-9A8250F5C852',
              name: 'Everything Everywhere All at Once',
              category: 'urn:entity:movie',
              categoryLabel: 'Film & Cinema',
              popularity: 0.98,
              tags: ['multiverse', 'existential comedy', 'a24'],
            },
            {
              id: 'B18C4421-3F71-4144-8C2A-4B6A6C7A8B91',
              name: 'Brian Eno',
              category: 'urn:entity:artist',
              categoryLabel: 'Music & Sound',
              popularity: 0.88,
              tags: ['ambient', 'generative music', 'electronic'],
            },
          ],
          location: 'London',
          mood: 'contemplative',
          discoveryDial: 'balanced',
        }),
      });

      const res = await curateHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.experience).toBeDefined();
      expect(data.experience.stops.length).toBeGreaterThanOrEqual(2);
      expect(data.experience.themeTitle).toContain('London');
    });
  });
});
