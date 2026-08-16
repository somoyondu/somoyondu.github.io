import { PublicMapper } from './public.mapper';

const cloudinaryStub: any = {
  buildUrl: (publicId: string, preset: string) =>
    `https://res.cloudinary.com/demo/image/upload/${preset}/${publicId}`,
};

describe('PublicMapper', () => {
  const mapper = new PublicMapper(cloudinaryStub);

  const media = { publicId: 'somoyon/people/nazmul', width: 800, height: 800, altBn: 'নাজমুল' };

  it('emits the legacy-compatible { name, designation, image } shape', () => {
    const result = mapper.position({
      _id: 'p1',
      person: { name: 'মো. নাজমুল', photo: media, isPublic: false },
      designation: { nameBn: 'সভাপতি', group: 'TOP_LEADER' },
      group: 'TOP_LEADER',
      displayOrder: 10,
    });

    expect(result.name).toBe('মো. নাজমুল');
    expect(result.designation).toBe('সভাপতি');
    expect(result.image).toContain('somoyon/people/nazmul');
  });

  it('prefers the year-specific photo over the person default', () => {
    const override = { publicId: 'somoyon/committee/2026/nazmul' };
    const result = mapper.position({
      _id: 'p1',
      person: { name: 'ন', photo: media },
      designation: { nameBn: 'সভাপতি' },
      photoOverride: override,
      group: 'TOP_LEADER',
    });
    expect(result.image).toContain('committee/2026');
  });

  it('hides contact details unless the person opted in', () => {
    const socials = { phone: '01700000000', email: 'a@b.com' };
    const hidden = mapper.position({
      _id: 'p1',
      person: { name: 'ন', socials, isPublic: false },
      designation: { nameBn: 'সভাপতি' },
      group: 'MEMBER',
    });
    const shown = mapper.position({
      _id: 'p2',
      person: { name: 'ন', socials, isPublic: true },
      designation: { nameBn: 'সভাপতি' },
      group: 'MEMBER',
    });

    expect(hidden.socials).toBeNull();
    expect(shown.socials).toEqual(socials);
  });

  it('returns null image data rather than throwing when a photo is missing', () => {
    const result = mapper.position({
      _id: 'p1',
      person: { name: 'ন' },
      designation: { nameBn: 'সদস্য' },
      group: 'MEMBER',
    });
    expect(result.image).toBeNull();
  });

  it('filters inactive socials and sorts by displayOrder', () => {
    const settings = mapper.settings({
      siteName: 'সময়ন',
      socials: [
        { platform: 'b', url: 'u2', displayOrder: 2, isActive: true },
        { platform: 'x', url: 'u3', displayOrder: 3, isActive: false },
        { platform: 'a', url: 'u1', displayOrder: 1, isActive: true },
      ],
      donation: { methods: [] },
      navLinks: [],
    });

    expect(settings!.socials.map((s: any) => s.platform)).toEqual(['a', 'b']);
  });
});
