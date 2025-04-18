const ExecutiveMembersService = (year) => {
  const executiveMembersIn2025 = [
    
  ];

  const executiveMembersIn2024 = [
    {
      name: "মোঃ আব্দুল্লাহ মাহমুদ মিরার",
      designation: "সদস্য, গ্রাফিক্স ও প্রোগ্রাম গ্রুপ",
      image: "members/2024/mirar.jpg",
    },
    {
      name: "হামীম উর রহমান তানিম",
      designation: "সদস্য, গ্রাফিক্স ও প্রোগ্রাম গ্রুপ",
      image: "members/2024/tanim.jpg",
    },
    {
      name: "মোহাম্মাদ শাহজালাল বারি",
      designation: "সদস্য, কন্টেন্ট গ্রুপ",
      image: "members/2024/boy.jpg",
    },
    {
      name: "মোঃ রিহাদুল ইসলাম রিহাদ",
      designation: "সদস্য, কন্টেন্ট গ্রুপ",
      image: "members/2024/boy.jpg",
    },
    {
      name: "জুহাই-উর- আহমেদ সৌভিক",
      designation: "সদস্য, কন্টেন্ট গ্রুপ",
      image: "members/2024/juhai.jpg",
    },
    {
      name: "আহমেদ সৌমিক হাসান",
      designation: "সদস্য, অতিথি ব্যবস্থাপনা গ্রুপ",
      image: "members/2024/soumic.jpg",
    },
    {
      name: "জুবায়ের আহনাফ তালহা",
      designation: "সদস্য, অতিথি ব্যবস্থাপনা গ্রুপ",
      image: "members/2024/boy.jpg",
    },
    {
      name: "তাবাসসুম আফসা চোহা",
      designation: "সদস্য, অতিথি ব্যবস্থাপনা গ্রুপ",
      image: "members/2024/girl.jpg",
    },
    {
      name: "দেবজ্যোতি দত্ত আঁচল",
      designation: "সদস্য, অতিথি ব্যবস্থাপনা গ্রুপ",
      image: "members/2024/auchal.jpg",
    },
    {
      name: "আফিফ হাসান",
      designation: "সদস্য, অতিথি ব্যবস্থাপনা গ্রুপ",
      image: "members/2024/boy.jpg",
    },
  ];

  const executiveMembersIn2023 = [
    {
      name: "মো: মাসুম বিল্লাহ ",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/masum.jpg",
    },
    {
      name: "মোঃ মনিরুল ইসলাম সজীব",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/monirul.jpg",
    },
    {
      name: "জুবায়ের মুন্সী",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/jubayer.jpg",
    },
    {
      name: "মামশুকা ফারহাত",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/mumsuka.jpg",
    },
    {
      name: "লামিয়া ইসলাম মীম",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/mim.jpg",
    },
    {
      name: "সৈয়দ সাদমান ইসলাম",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/sadman.jpg",
    },

    {
      name: "সিবগাত উল্লাহ্‌ খান",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/boy.jpg",
    },
    {
      name: "ফাতেমা হাসান মেহজাবিন",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/girl.jpg",
    },

    {
      name: "প্রান্ত ঘোষ",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/boy.jpg",
    },
    {
      name: "নোশিন তাবাসসুম তাহেরি",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/girl.jpg",
    },
    {
      name: "জারিন সুবা",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/girl.jpg",
    },

    {
      name: "উম্মে সালমা আলফি",
      designation: "কার্যনির্বাহী সদস্য",
      image: "members/2023/girl.jpg",
    },
  ];

  const executiveMembersByYearMap = {
    2025: executiveMembersIn2025,
    2024: executiveMembersIn2024,
    2023: executiveMembersIn2023,
  };

  return executiveMembersByYearMap[year];
};

export default ExecutiveMembersService;
