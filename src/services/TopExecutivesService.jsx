const TopExecutivesService = (year) => {
  const topExecutivesIn2026 = [
    {
      name: "মুশফিকুর রহমান মিজু",
      designation: "সহ-সভাপতি",
      image: "committee-members/2026/vice-president/mizu.jpg",
    },
    {
      name: "মো. আসিফ হোসেন",
      designation: "সহ-সভাপতি",
      image: "committee-members/2026/vice-president/asif.jpg",
    },
    {
      name: "সাকিব মাহমুদ বিজয়",
      designation: "সহ-সভাপতি",
      image: "committee-members/2026/vice-president/bijoy.jpg",
    },
    {
      name: "সাফায়াতুল ইসলাম",
      designation: "সহ-সভাপতি",
      image: "committee-members/2026/vice-president/safayetul.jpg",
    },
    {
      name: "মো. আমিনুল ইসলাম",
      designation: "সহ-সভাপতি",
      image: "committee-members/2026/vice-president/aminul.jpg",
    },
    {
      name: "মো. আল-আমিন খান",
      designation: "সহ-সভাপতি",
      image: "committee-members/2026/vice-president/al-amin.jpg",
    },
    {
      name: "তাওহীদুর রহমান তালুকদার",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "committee-members/2026/joint-secretary/tawhidur.jpg",
    },
    {
      name: "মো. সাব্বির হোসেন",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "committee-members/2026/joint-secretary/sabbir.jpg",
    },
    {
      name: "সাকিব ইহসান",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "committee-members/2026/joint-secretary/sakib.jpg",
    },
    {
      name: "প্রান্ত ঘোষ",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "committee-members/2026/joint-secretary/pranto.jpg",
    },
  ];

  const topExecutivesIn2025 = [
    {
      name: "মো. ইন্তেসার জোবায়ের",
      designation: "সহ-সভাপতি",
      image: "members/2025/intesar.jpg"
    },
    {
      name: "সাবের হোসেন",
      designation: "সহ-সভাপতি",
      image: "members/2025/saber.jpg"
    },
    {
      name: "দেবপ্রিয় ভট্টাচার্য দিপু",
      designation: "সহ-সভাপতি",
      image: "members/2025/dipu.jpg",
    }, 
    {
      name: "মো: মাসুম বিল্লাহ",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2024/masum.jpg",
    },
    {
      name: "মুশফিকুর রহমান মিজু",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2025/mizu.jpg",
    },
    {
      name: "সাকিব মাহমুদ বিজয়",
      designation: "যুগ্ম সাধারণ সম্পাদক",
      image: "members/2025/mahmud.jpg"
    },
    {
      name: "মো. আসিফ হোসেন",
      designation: "যুগ্ম সাধারণ সম্পাদক",
      image: "members/2025/asif.jpg"
    },
    {
      name: "সাদমান সাকিব খন্দকার",
      designation: "যুগ্ম সাধারণ সম্পাদক",
      image: "members/2025/sadman.jpg"
    },
    {
      name: "সাফায়াতুল ইসলাম",
      designation: "যুগ্ম সাধারণ সম্পাদক",
      image: "members/2025/safayatul.jpeg"
    },
    {
      name: "মো. আমিনুল ইসলাম",
      designation: "যুগ্ম সাধারণ সম্পাদক",
      image: "members/2025/aminul.jpg"
    },
  ];
  const topExecutivesIn2024 = [
    {
      name: "শচীন মন্ডল",
      designation: "সহ সভাপতি",
      image: "members/2024/sachin.jpg",
    },
    {
      name: "মোঃ রাকিব তরফদার",
      designation: "সহ সভাপতি",
      image: "members/2024/rakib.jpg",
    },
    {
      name: "জুয়েল সরকার",
      designation: "সহ সভাপতি",
      image: "members/2024/jewel.jpg",
    },
    {
      name: "প্রসেনজিৎ দেব পার্থ",
      designation: "সহ সভাপতি",
      image: "members/2024/prosenjeet.jpg",
    }, 
    {
      name: "অদ্বিতীয়া মুকুল",
      designation: "সহ সভাপতি",
      image: "members/2024/additiya.jpg",
    }, 
    {
      name: "নাঈম আহমেদ",
      designation: "সহ সভাপতি",
      image: "members/2024/naeem.jpg",
    }, 
    {
      name: "মোঃ হুমায়ুন রশিদ খান",
      designation: "সহ সভাপতি",
      image: "members/2024/boy.jpg",
    }, 
    {
      name: "তামান্না আক্তার",
      designation: "সহ সভাপতি",
      image: "members/2024/girl.jpg",
    }, 
    {
      name: "কাজী আদিল আহনাফ",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2024/adil.jpg",
    },
    {
      name: "মো: ইনতেসার জোবায়ের",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2024/intesar.jpg",
    },
    {
      name: "মাহিদ মুস্তাফিজ",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2024/boy.jpg",
    },
    {
      name: "কাওসার জাহান ইরিন",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2024/erin.jpg",
    },
    {
      name: "মোঃ তায়্যেবুর রহমান",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2024/tayebur.jpg",
    },
    {
      name: "দেবপ্রিয় ভট্টাচার্য দিপু",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2024/dipu.jpg",
    }, 
    {
      name: "সাবের হোসেন",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2024/saber.jpg",
    },
  ];

  const topExecutivesIn2023 = [
    {
      name: " মোঃ আশিকুর রহমান",
      designation: "সহ সভাপতি",
      image: "members/2023/ashiqur.jpg",
    },
    {
      name: "শিফা তাসনিম",
      designation: "সহ সভাপতি",
      image: "members/2023/shifa.png",
    },
    {
      name: "মেহেদি হাসান",
      designation: "সহ সভাপতি",
      image: "members/2023/boy.jpg",
    },
    {
      name: "আনিকা রয়",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2023/anika.png",
    },
    {
      name: "মোঃ আশিক উল্লাহ্‌ ফাহিদ",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2023/boy.jpg",
    },

    {
      name: "সাদমান বিন শাফায়েত",
      designation: "যুগ্ম-সাধারণ সম্পাদক",
      image: "members/2023/boy.jpg",
    },
  ];

  const topExecutivesByYearMap = {
    2026: topExecutivesIn2026,
    2025: topExecutivesIn2025,
    2024: topExecutivesIn2024,
    2023: topExecutivesIn2023,
  };

  return topExecutivesByYearMap[year];
};

export default TopExecutivesService;
