/**
 * Every piece of copy that was hardcoded in the public site's JSX, lifted
 * verbatim so the migrated site reads identically on day one. Admins can edit
 * all of it from /settings afterwards.
 */
export const DEFAULT_SETTINGS = {
  siteName: 'সময়ন',
  tagline: 'বন্ধনে আমরা',

  hero: {
    headline: 'সময়ন',
    subheadline: 'বন্ধনে আমরা',
    body: 'খিলক্ষেত, ভাটারা, বাড্ডা ও গুলশান-বনানী থানাধীন অঞ্চলে বসবাসরত ঢাকা বিশ্ববিদ্যালয়ের শিক্ষার্থীদের একটি সংগঠন। শিক্ষা, ঐক্য এবং ভ্রাতৃত্ব এই তিনটি স্লোগানকে সামনে রেখে আমাদের এই অগ্রযাত্রা।',
    ctaText: 'আজই দান করুন',
  },

  about: {
    title: 'আমাদের সম্পর্কে',
    body: 'কলাভবন থেকে টিএসসি, কার্জন থেকে ভিসিচত্বর কিংবা সেন্ট্রাল লাইব্রেরি থেকে হাকিম চত্বর সবখানেই জড়ানো "মায়া" নামক চাঁদরটা চির অম্লান হয়েই থাকুক। এই মায়ার নামই ঢাকা বিশ্ববিদ্যালয়। প্রাণের এই জায়গা থেকে ভ্রাতৃত্বের বন্ধন তৈরি করার লক্ষ্যে খিলক্ষেত, ভাটারা, বাড্ডা ও গুলশান-বনানী থানাধীন অঞ্চলে বসবাসরত ঢাকা বিশ্ববিদ্যালয়ের শিক্ষার্থীদের একটি সংগঠন, সময়ন। বিশ্ববিদ্যালয়ের এলাকাভিত্তিক সংগঠনের অন্যতম, সময়ন প্রতিনিয়ত ছাত্রকল্যাণ থেকে শুরু করে, দরিদ্রদের সহায়তায় সার্বক্ষণিক কাজ করে যাচ্ছে।',
  },

  foundingBlurb: {
    title: 'প্রতিষ্ঠাতা সদস্যগণ',
    body: 'শিক্ষা, ঐক্য এবং ভ্রাতৃত্ব এই তিনটি স্লোগানকে সামনে রেখে আমাদের এই অগ্রযাত্রা। এই যাত্রাকে ত্বরান্বিত করতে ২০২৩ সালে প্রতিষ্ঠাতা সদস্যদের বহুদিনের লালিত স্বপ্ন বাস্তবায়নে প্রতিষ্ঠিত হয় সময়ন।',
  },

  advisoryBlurb: {
    title: 'আমাদের উপদেষ্টামণ্ডলী',
    body: 'সময়নের মূল লক্ষ্য সামাজিক কার্যক্রমে নিজেদেরকে নিবেদিত করা। পাশাপাশি বিশ্ববিদ্যালয়ের সাধারণ শিক্ষার্থীদের যেকোন প্রয়োজনে পাশে দাঁড়ানো। এরই ধারাবাহিকতায় আমাদের অভিভাবকগণ আমাদের মাথার উপর ছায়া হয়ে আছেন।',
  },

  galleryBlurb: {
    title: 'গ্যালারি',
    subtitle: 'একনজরে সময়নের কার্যক্রম',
  },

  contact: {
    email: 'somoyon.du@gmail.com',
    phone: '+880 1329 600796',
    facebookPage: 'https://www.facebook.com/somoyondu',
  },

  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/somoyondu', displayOrder: 1, isActive: true },
    { platform: 'twitter', url: 'https://www.twitter.com/somoyondu', displayOrder: 2, isActive: true },
    { platform: 'instagram', url: 'https://www.instagram.com/somoyondu', displayOrder: 3, isActive: true },
    { platform: 'linkedin', url: 'https://www.linkedin.com/somoyondu', displayOrder: 4, isActive: true },
    { platform: 'youtube', url: 'https://www.youtube.com/somoyondu', displayOrder: 5, isActive: false },
  ],

  donation: {
    isEnabled: true,
    title: 'দান',
    description:
      'বিভিন্ন সামাজিক কার্যক্রমে সময়ন সার্বক্ষণিক নিয়োজিত আছে। আপনার অনুদান আমরা পৌঁছে দিবো দুঃস্থদের কাছে। সমাজকল্যাণমূলক বিভিন্ন কাজে নিয়োজিত থাকুন সময়নের মাধ্যমে।',
    footerTitle: 'প্রয়োজনে পাশে থাকুন',
    footerCta: 'আজই দান করুন',
    methods: [
      { name: 'Rocket', number: '016114930633', type: 'Personal', displayOrder: 1, isActive: true, legacyIcon: 'rocket.png' },
      { name: 'bKash', number: '01329600796', type: 'Personal', displayOrder: 2, isActive: true, legacyIcon: 'bkash.png' },
      { name: 'Nagad', number: '016114930633', type: 'Personal', displayOrder: 3, isActive: true, legacyIcon: 'nagad.png' },
    ],
  },

  navLinks: [
    { id: 'about', title: 'আমাদের সম্পর্কে', href: '/#about', displayOrder: 1, isActive: true },
    { id: 'gallery', title: 'গ্যালারি', href: '/#gallery', displayOrder: 2, isActive: true },
    { id: 'executives', title: 'কার্যনির্বাহী পরিষদ', href: '/#executives', displayOrder: 3, isActive: true },
    { id: 'advisors', title: 'উপদেষ্টা', href: '/#advisors', displayOrder: 4, isActive: true },
    { id: 'events', title: 'ইভেন্টস', href: '/events', displayOrder: 5, isActive: false },
    { id: 'notices', title: 'নোটিশ', href: '/notices', displayOrder: 6, isActive: false },
  ],

  seo: {
    defaultTitle: 'সময়ন — বন্ধনে আমরা',
    defaultDescription:
      'খিলক্ষেত, ভাটারা, বাড্ডা ও গুলশান-বনানী থানাধীন অঞ্চলে বসবাসরত ঢাকা বিশ্ববিদ্যালয়ের শিক্ষার্থীদের সংগঠন সময়ন।',
    siteUrl: 'https://somoyondu.netlify.app',
  },

  maintenanceMode: false,
};
