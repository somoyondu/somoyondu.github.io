const OrganizingExecutivesService = (year) => {
  const organizingExecutivesIn2025 = [

    {
      name: "ফারহান নোশিন",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2025/farhan.jpeg"
    },
    {
      name: "মোহাম্মদ শাহজালাল বারি",
      designation: "উপ-সাংগঠনিক সম্পাদক",
      image: "members/2025/boy.jpg"
    },
  ];
  const organizingExecutivesIn2024 = [
    {
      name: "মোঃ নাজমুল",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2024/nazmul.jpg",
    },
  {
      name: "মো. আমিনুল ইসলাম",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2024/aminul.jpg",
    },
    {
      name: "হাসনাত নিদ্রা",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2024/hasnat.JPG",
    }, 
    {
      name: "মোহাম্মদ উল্লাহ তুষার",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2024/tusher.jpeg",
    },
    {
      name: "মুশফিকুর রহমান মিজু",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2024/mizu.jpg",
    },
   {
      name: "মো: মাসুম বিল্লাহ",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2024/masum.jpg",
    }, 
   {
      name: "নাফিয়া ইসলাম মালিহা",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2024/girl.jpg",
    }, 
   {
      name: "সাইদুল ইসলাম",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2024/saidul.jpg",
    },
  ];
  
  const organizingExecutivesIn2023 = [
    {
      name: "মাহমুদুল হাসান মার্জুক",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/marzuk.png",
    },
    {
      name: "মোঃ রাকিব তরফদার",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/rakib.jpg",
    },
    {
      name: "মুন্সি রাব্বি আহমেদ (আকিব)",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/akib.jpg",
    },
    {
      name: "শচীন মন্ডল",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/sachin.jpg",
    },
    {
      name: "তাহসিন নওয়ার প্রাচী",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/girl.jpg",
    },
    {
      name: "সাইমা আফিফা খান",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/afifa.png",
    },
    {
      name: "প্রসেনজিৎ দেব পার্থ",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/prosenjeet.jpg",
    },
    {
      name: "অদ্বিতীয়া মুকুল",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/additiya.jpg",
    },
    {
      name: "উৎসব বড়ুয়া",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "মোঃ শিপলুর রহমান",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/shiplur.jpg",
    },
    {
      name: "মোঃ মানিক ইসলাম",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "আশিকুর রহমান",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/asikur.jpeg",
    },
    {
      name: "আয়হান নাভিদ নওরোজ",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/navid.jpg",
    },
    {
      name: "মোঃ নাঈম আহমেদ",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/boy.jpg",
    },
    {
      name: "ইমামুল হক",
      designation: "সাংগঠনিক সম্পাদক",
      image: "members/2023/immemul.jpg",
    },
  ];


  const organizingExecutivesIn2026 = [
    {
      name: "মোহাম্মদ শাহজালাল বারি",
      designation: "সাংগঠনিক সম্পাদক",
      image: "committee-members/2026/organizing-secretary/shahjalal.jpg",
    },
    {
      name: "সিদ্ধার্থ বণিক",
      designation: "সাংগঠনিক সম্পাদক",
      image: "committee-members/2026/organizing-secretary/shiddhurtha.jpg",
    },
  ];

  const organizingExecutivesByYearMap = {
    2026: organizingExecutivesIn2026,
    2025: organizingExecutivesIn2025,
    2024: organizingExecutivesIn2024,
    2023: organizingExecutivesIn2023,
  };

  return organizingExecutivesByYearMap[year];
};

export default OrganizingExecutivesService;
