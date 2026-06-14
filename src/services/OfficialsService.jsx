const OfficialsService = (year) => {
  const officialsIn2026 = [
    {
      name: "আওয়াফ আনসারী",
      designation: "কোষাধ্যক্ষ",
      image: "committee-members/2026/treasurer/awof.jpg",
    },
    {
      name: "শ্রেয়া শর্বজয়া",
      designation: "উপ-কোষাধ্যক্ষ",
      image: "committee-members/2026/treasurer/shreya.jpg",
    },
    {
      name: "তাওয়াসুম",
      designation: "দপ্তর সম্পাদক",
      image: "committee-members/2026/office-secretary/tawasum.jpg",
    },
    {
      name: "সাদিয়া রায়হান",
      designation: "উপ-দপ্তর সম্পাদক",
      image: "committee-members/2026/office-secretary/sadia.jpg",
    },
    {
      name: "আফরোজা তারিন মারজানা",
      designation: "প্রচার সম্পাদক",
      image: "committee-members/2026/press-secretary/tareen.jpg",
    },
    {
      name: "মাইশা সিদ্দিকা",
      designation: "উপ-প্রচার সম্পাদক",
      image: "committee-members/2026/press-secretary/mysha.jpg",
    },
    {
      name: "জুহাই-উর-আহমেদ শৌভিক",
      designation: "ক্রীড়া সম্পাদক",
      image: "committee-members/2026/sports-secretary/shouvik.jpg",
    },
    {
      name: "আবু আনাস মোহাম্মদ আলিফ",
      designation: "উপ-ক্রীড়া সম্পাদক",
      image: "committee-members/2026/sports-secretary/anas.jpg",
    },
    {
      name: "রেজোয়ানা আফরোজ দিপা",
      designation: "তথ্য ও প্রযুক্তি সম্পাদক",
      image: "committee-members/2026/it-secretary/dipa.jpg",
    },
    {
      name: "নুসরাত জাহান নিশি",
      designation: "উপ-তথ্য ও প্রযুক্তি সম্পাদক",
      image: "committee-members/2026/it-secretary/nishi.jpg",
    },
    {
      name: "কাজী নাদিয়া জাফরিন",
      designation: "সাংস্কৃতিক সম্পাদক",
      image: "committee-members/2026/cultural-secretary/nadia.jpg",
    },
    {
      name: "অর্পিতা দাস",
      designation: "উপ-সাংস্কৃতিক সম্পাদক",
      image: "committee-members/2026/cultural-secretary/arpita.jpg",
    },
  ];

  const officialsIn2025 = [
    {
      name: "আবির খন্দকার",
      designation: "কোষাধ্যক্ষ",
      image: "members/2025/abir.jpg"
    },
    {
      name: "আফরোজা তারিন মারজানা",
      designation: "উপ-কোষাধ্যক্ষ",
      image: "members/2025/girl.jpg"
    },
    {
      name: "নুসরাত জাহান সাদিয়া",
      designation: "দপ্তর সম্পাদক",
      image: "members/2025/nusrat.jpg"
    },
    {
      name: "সিদ্ধার্থ বণিক",
      designation: "উপ-দপ্তর সম্পাদক",
      image: "members/2025/boy.jpg"
    },
    {
      name: "মো. মাহমুদুল হাসান আবির",
      designation: "প্রচার সম্পাদক",
      image: "members/2025/md-abir.jpg"
    },
    {
      name: "আওয়াফ আনসারী",
      designation: "উপ-প্রচার সম্পাদক",
      image: "members/2025/awof.jpg"
    },
    {
      name: "সাকিব ইহসান",
      designation: "সমাজকল্যাণ সম্পাদক",
      image: "members/2025/sakib.jpg"
    },
    {
      name: "কাজী নাদিয়া জাফরিন",
      designation: "উপ-সমাজকল্যাণ সম্পাদক",
      image: "members/2025/nadia.jpg"
    },
    {
      name: "কাজী সিয়াম ফারদিন",
      designation: "তথ্য ও প্রযুক্তি সম্পাদক",
      image: "members/2025/fardin.jpg"
    },
    {
      name: "মো. আব্দুল্লাহ মাহমুদ মিরার",
      designation: "উপ-তথ্য ও প্রযুক্তি সম্পাদক",
      image: "members/2025/mirar.jpg"
    },
    {
      name: "প্রান্ত ঘোষ",
      designation: "পরিবেশ বিষয়ক সম্পাদক",
      image: "members/2025/pranto.jpg"
    },
    {
      name: "মো. নয়ন",
      designation: "উপ-পরিবেশ বিষয়ক সম্পাদক",
      image: "members/2025/nayon.jpeg"
    },
    {
      name: "মো. রাশেদুল ইসলাম",
      designation: "উপ-পরিবেশ বিষয়ক সম্পাদক",
      image: "members/2025/boy.jpg"
    },
    {
      name: "মো. সাব্বির হোসেন",
      designation: "ক্রীড়া সম্পাদক",
      image: "members/2025/sabbir.png"
    },
    {
      name: "তাওয়াসুম",
      designation: "উপ-ক্রীড়া সম্পাদক",
      image: "members/2025/tawasum.jpeg"
    },
    {
      name: "আব্দুল্লাহ আল ফাহাদ",
      designation: "উপ-ক্রীড়া সম্পাদক",
      image: "members/2025/fahad.jpg"
    },
    {
       name: "তৌহিদুর রহমান তালুকদার",
       designation: "ত্রাণ ও দুর্যোগ বিষয়ক সম্পাদক",
       image: "members/2025/boy.jpg"
    },
    {
      name: "জুহাই-উর-আহমেদ শৌভিক",
      designation: "উপ-ত্রাণ ও দুর্যোগ বিষয়ক সম্পাদক",
      image: "members/2025/juhai.jpg"
    },
    {
      name: "অর্ণা হালদার",
      designation: "উপ-সমাজকল্যাণ সম্পাদক",
      image: "members/2025/arna.jpg"
    },
    {
      name: "পৃথা সান্যাল",
      designation: "সাংস্কৃতিক সম্পাদক",
      image: "members/2025/pritha.jpeg"
    },
    {
      name: "হামিম উর রহমান তানিম",
      designation: "উপ-সাংস্কৃতিক সম্পাদক",
      image: "members/2025/tanim.jpeg"
    },
  ];
  const officialsIn2024 = [
    {
      name: "মামশুকা ফারহাত",
      designation: "কোষাধ্যক্ষ",
      image: "members/2024/mumsuka.jpg",
    },
    {
      name: "মো: আসিফ হোসেন",
      designation: "দপ্তর সম্পাদক",
      image: "members/2024/asif.jpg",
    },
    {
      name: "জুবায়ের মুন্সি",
      designation: "প্রচার সম্পাদক",
      image: "members/2024/jubayer.jpg",
    },
    {
      name: "আল - আমিন",
      designation: "পরিকল্পনা সম্পাদক",
      image: "members/2024/alamin.jpg",
    },
    {
      name: "আব্দুল্লাহ হিল কাফি",
      designation: "সমাজকল্যাণ সম্পাদক",
      image: "members/2024/boy.jpg",
    },
    {
      name: "মাঈনুল ইসলাম",
      designation: "উপ-সমাজকল্যাণ সম্পাদক",
      image: "members/2024/boy.jpg",
    },
    {
      name: "ফারহান নোশিন",
      designation: "তথ্য ও প্রযুক্তি সম্পাদক",
      image: "members/2024/farhan.jpeg",
    },
    {
      name: "রাশেদুল ইসলাম",
      designation: "উপ-তথ্য ও প্রযুক্তি সম্পাদক",
      image: "members/2024/boy.jpg",
    },
    {
      name: "উম্মে সালমা আলফী",
      designation: "আইন বিষয়ক সম্পাদক",
      image: "members/2024/alfi.jpg",
    },
    {
      name: "আমির সিফাত",
      designation: "উপ-আইন বিষয়ক সম্পাদক",
      image: "members/2024/amir.JPG",
    },
    {
      name: "পূজা দে",
      designation: "ছাত্রী বিষয়ক সম্পাদক",
      image: "members/2024/girl.jpg",
    },
    {
      name: "পৃথা সান্যাল",
      designation: "সংস্কৃতি বিষয়ক সম্পাদক",
      image: "members/2024/pritha.jpg",
    },
    {
      name: "আফরোজা তারিন মারজানা",
      designation: "উপ-সংস্কৃতি বিষয়ক সম্পাদক",
      image: "members/2024/girl.jpg",
    },
    {
      name: "আসফিয়া ইসলাম সিমলা",
      designation: "স্বাস্থ্য সম্পাদক",
      image: "members/2024/ashfia.jpg",
    },
    {
      name: "আওফ আনছারী",
      designation: "উপ-স্বাস্থ্য সম্পাদক",
      image: "members/2024/awof.jpg",
    },
    {
      name: "সৈয়দ সাদমান ইসলাম",
      designation: "দুর্যোগ ব্যবস্থাপনা সম্পাদক",
      image: "members/2024/sadman.jpg",
    },
    {
      name: "মাহমুদুল হাসান আবির",
      designation: "ক্রীড়া সম্পাদক",
      image: "members/2024/boy.jpg",
    },
    {
      name: "সিদ্ধার্থ বণিক",
      designation: "উপ-ক্রীড়া সম্পাদক",
      image: "members/2024/shiddhurtha.jpg",
    },
  ];

  const officialsIn2023 = [
    {
      name: "কাজী আদিল আহনাফ",
      designation: "কোষাধ্যক্ষ",
      image: "members/2023/adil.jpg",
    },
    {
      name: "মোঃ ইন্তেসার যুবায়ের",
      designation: "দপ্তর সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "আকিবুল ইসলাম আকিব",
      designation: "উপ-দপ্তর সম্পাদক",
      image: "members/2023/akibul.jpg",
    },
    {
      name: "সাবের হোসেন",
      designation: "প্রচার সম্পাদক",
      image: "members/2023/saber.jpg",
    },
    {
      name: "মোঃ আমিনুল ইসলাম",
      designation: "উপ-প্রচার সম্পাদক",
      image: "members/2023/aminul.jpg",
    },
    {
      name: "দেবপ্রিয় ভট্টাচার্য্য দীপু",
      designation: "সমাজ কল্যাণ সম্পাদক",
      image: "members/2023/dipu.jpg",
    },
    {
      name: "শরিফুল ইসলাম সজল",
      designation: "উপ-সমাজ কল্যাণ সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "রায়রা বিনতে রাফিক",
      designation: "তথ্য প্রযুক্তি সম্পাদক",
      image: "members/2023/girl.jpg",
    },
    {
      name: "মোঃ নাজমুল",
      designation: "উপ-তথ্য প্রযুক্তি সম্পাদক",
      image: "members/2023/nazmul.jpg",
    },
    {
      name: "কাওসার জাহান ইরিন",
      designation: "ছাত্রী বিষয়ক সম্পাদক",
      image: "members/2023/erin.jpg",
    },
    {
      name: "হাসনাত নিদ্রা",
      designation: "উপ-ছাত্রী বিষয়ক সম্পাদক",
      image: "members/2023/hasnat.JPG",
    },
    {
      name: "আবু রাহাত",
      designation: "ত্রাণ ও দুর্যোগ ব্যবস্থাপনা সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "শাফায়েত ইসলাম",
      designation: "উপ-ত্রাণ ও দুর্যোগ ব্যবস্থাপনা সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "মোঃ তায়্যেবুর রহমান",
      designation: "ক্রীড়া সম্পাদক",
      image: "members/2023/tayebur.jpg",
    },
    {
      name: "মাহিবুল আলম রিমন",
      designation: "উপ-ক্রীড়া সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "হাসিনা আক্তার",
      designation: "পরিকল্পনা সম্পাদক",
      image: "members/2023/girl.jpg",
    },
    {
      name: "নাফিয়া আলম মালিহা",
      designation: "উপ-পরিকল্পনা সম্পাদক",
      image: "members/2023/girl.jpg",
    },
    {
      name: "শাহাদাত হোসেন",
      designation: "আইন বিষয়ক সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "মোঃ আবু জায়েদ",
      designation: "উপ-আইন বিষয়ক সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "লিওন রিছিল",
      designation: "স্বাস্থ্য সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "মুশফিকুর রহমান মিজু",
      designation: "উপ-স্বাস্থ্য সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "মোসাঃ মাবিয়া আক্তার ",
      designation: "সাংস্কৃতিক বিষয়ক সম্পাদক",
      image: "members/2023/mabia.jpg",
    },
    {
      name: "মুকছেতাতুন নোভা",
      designation: "উপ-সাংস্কৃতিক বিষয়ক সম্পাদক",
      image: "members/2023/girl.jpg",
    },
    {
      name: "আনিকা তাবাসসুম রুপা",
      designation: "আতিথেয়তা বিষয়ক সম্পাদক",
      image: "members/2023/girl.jpg",
    },
    {
      name: "আব্দুল্লাহ আল আরাফাত (শুদ্ধ)",
      designation: "উপ-আতিথেয়তা বিষয়ক সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "মাহতাব আল তানবীম",
      designation: "ধর্ম বিষয়ক সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "আলভী আহমেদ খান",
      designation: "কর্পোরেট জোট সম্পাদক",
      image: "members/2023/boy.jpg",
    },
  ];

  const officialsByYearMap = {
    2026: officialsIn2026,
    2025: officialsIn2025,
    2024: officialsIn2024,
    2023: officialsIn2023,
  };

  return officialsByYearMap[year];
};

export default OfficialsService;
