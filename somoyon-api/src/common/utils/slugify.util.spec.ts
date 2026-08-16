import { normalizeBnName, toPublicId, toSlug } from './slugify.util';

describe('slugify utils', () => {
  describe('toSlug', () => {
    it('slugifies latin text', () => {
      expect(toSlug('Iftar Mahfil 2024')).toBe('iftar-mahfil-2024');
    });

    it('never returns an empty slug for Bengali-only input', () => {
      const slug = toSlug('মো. নাজমুল', 'person');
      expect(slug).toBeTruthy();
      expect(slug.startsWith('person-') || /[a-z0-9]/.test(slug)).toBe(true);
    });

    it('is deterministic', () => {
      expect(toSlug('সাকিব ইহসান')).toBe(toSlug('সাকিব ইহসান'));
    });
  });

  describe('normalizeBnName', () => {
    it('collapses the মোঃ / মো. honorific variants', () => {
      expect(normalizeBnName('মোঃ নাজমুল')).toBe(normalizeBnName('মো. নাজমুল'));
    });

    it('ignores spacing and punctuation', () => {
      expect(normalizeBnName('এস. এম. মুসফিক হোসাইন')).toBe(
        normalizeBnName('এস.এম. মুসফিক  হোসাইন'),
      );
    });

    it('keeps genuinely different names apart', () => {
      expect(normalizeBnName('সাকিব ইহসান')).not.toBe(normalizeBnName('সাকিব মাহমুদ'));
    });
  });

  describe('toPublicId', () => {
    it('normalises legacy paths and extensions', () => {
      expect(toPublicId('members/2024/hasnat.JPG')).toBe('members/2024/hasnat');
    });
  });
});
