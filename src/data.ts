import { Language, Voice, PresetTemplate, PricingPlan, CommunityStory, AdminStats } from './types';

export const LANGUAGES: Language[] = [
  {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    flag: '🇪🇹',
    speakers: '35M+ Native & Working',
    script: "Ge'ez Fidel (ግዕዝ)",
    description: "The primary working language of Ethiopia, written in the ancient Ge'ez syllabary with distinctive glottal stops and phonetic gemination.",
    sampleText: 'ሰላም፣ እንኳን ወደ ኢትዮቮይስ በደህና መጡ። ይህ አርቴፊሻል ኢንተለጀንስን በመጠቀም ማንኛውንም ጽሁፍ ወደ ንግግር የሚቀይር ዘመናዊ መተግበሪያ ነው።'
  },
  {
    code: 'ti',
    name: 'Tigrinya',
    nativeName: 'ትግርኛ',
    flag: '🇪🇹',
    speakers: '10M+ Across the Horn',
    script: "Ge'ez Fidel (ትግርኛ ፊደል)",
    description: "A major Semitic language spoken across Tigray and Eritrea, characterized by rich acoustic phrasing and ancient literary traditions.",
    sampleText: 'ሰላም፣ ናብ ኢትዮቮይስ ብደሓን መጻእኩም። እዚ ብናይ ኮምፒውተር ጥበብ ጽሑፍ ናብ ድምጺ ዝልውጥ ሓዲሽ መሳርሒ እዩ።'
  },
  {
    code: 'om',
    name: 'Afaan Oromoo',
    nativeName: 'Afaan Oromoo',
    flag: '🇪🇹',
    speakers: '40M+ Native Speakers',
    script: 'Qubee Latin Alphabet',
    description: 'The most widely spoken Cushitic language in Ethiopia and the Horn of Africa, written in Qubee with unique double-vowel duration tones.',
    sampleText: 'Baga nagaan gara EthioVoice dhuftan. Kun teeknooloojii ammayyaa barreeffama gara sagaleetti jijjiirudha.'
  },
  {
    code: 'en',
    name: 'English (Ethiopian Accent)',
    nativeName: 'English (ET)',
    flag: '🌐',
    speakers: 'Global Trade & Academia',
    script: 'Latin Script',
    description: 'Natural English synthesized with clear, articulate Ethiopian cadence, ideal for pan-African conferences, tourism, and global business.',
    sampleText: 'Welcome to EthioVoice. The next-generation multilingual voice synthesis platform for Ethiopia and the global diaspora.'
  }
];

export const VOICES: Voice[] = [
  // Amharic Voices
  {
    id: 'v-selam',
    name: 'Selam',
    nativeName: 'ሰላም',
    language: 'am',
    gender: 'female',
    accent: 'Addis Ababa Urban',
    region: 'Addis Ababa',
    persona: 'Conversationalist',
    description: 'Warm, relatable urban tone suited for daily conversation, customer service, and social media narration.',
    sampleText: 'ሰላም እንዴት ናችሁ? ዛሬ ደስ የሚል ዜና ይዤላችሁ መጥቻለሁ።',
    isPopular: true,
    pitch: 1.1,
    speed: 1.0
  },
  {
    id: 'v-dawit',
    name: 'Dawit',
    nativeName: 'ዳዊት',
    language: 'am',
    gender: 'male',
    accent: 'Gondar Deep Tone',
    region: 'Gondar',
    persona: 'News Broadcaster',
    description: 'Resonant, authoritative baritone for prime-time news, historical documentaries, and corporate announcements.',
    sampleText: 'የተከበራችሁ አድማጮቻችን፣ ዛሬ በዋና ከተማችን የተካሄደውን ታላቅ የኢኮኖሚ ጉባኤ ዜና እንከታተል።',
    isPopular: true,
    pitch: 0.9,
    speed: 1.0
  },
  {
    id: 'v-almaz',
    name: 'Almaz',
    nativeName: 'አልማዝ',
    language: 'am',
    gender: 'female',
    accent: 'Shewa Storyteller',
    region: 'Shewa',
    persona: 'Audiobook Narrator',
    description: 'Rich, lyrical cadence with gentle pauses, ideal for classic Ethiopian novels, fables, and cultural podcasts.',
    sampleText: 'በድሮ ዘመን በአንድ ውብ መንደር ውስጥ፣ አንድ ጥበበኛ አዛውንት ይኖሩ ነበር...',
    pitch: 1.0,
    speed: 0.95
  },
  {
    id: 'v-meron',
    name: 'Meron',
    nativeName: 'ሜሮን',
    language: 'am',
    gender: 'female',
    accent: 'Wollo Melodic',
    region: 'Wollo',
    persona: 'Poetic & Expressive',
    description: 'Bright, melodic pronunciation highlighting emotional poetry (ቅኔ) and lyrical prose.',
    sampleText: 'የሀገሬ ፍቅር በልቤ ውስጥ እንደ ጽጌረዳ ያብባል፣ ውበቷም በመላው ዓለም ያበራል።',
    pitch: 1.15,
    speed: 1.0
  },
  {
    id: 'v-abebe',
    name: 'Abebe',
    nativeName: 'አበበ',
    language: 'am',
    gender: 'male',
    accent: 'Debre Berhan Academic',
    region: 'North Shewa',
    persona: 'Lecturer & Teacher',
    description: 'Steady, deliberate pacing optimized for textbooks, educational lessons, and university lectures.',
    sampleText: 'በዛሬው የሳይንስ ትምህርታችን ስለ ሥነ-ህይወትና ስለ የተፈጥሮ ሚዛን ጥበቃ በሰፊው እንማራለን።',
    pitch: 0.95,
    speed: 0.92
  },

  // Tigrinya Voices
  {
    id: 'v-hagos',
    name: 'Hagos',
    nativeName: 'ሓጎስ',
    language: 'ti',
    gender: 'male',
    accent: 'Mekelle Broadcaster',
    region: 'Tigray',
    persona: 'News & Documentary',
    description: 'Crisp, articulate Tigrinya delivery with natural rhythmic cadences for journalistic broadcasts.',
    sampleText: 'ክቡራት ሰማዕትና፣ ሎሚ ኣብ ከተማ መቐለ ዝተኻየደ ዓቢይ ናይ ሰላምን ምዕባለን ዋዕላ ክነቕርበልኩም ኢና።',
    isPopular: true,
    pitch: 0.92,
    speed: 1.0
  },
  {
    id: 'v-rahel',
    name: 'Rahel',
    nativeName: 'ራሄል',
    language: 'ti',
    gender: 'female',
    accent: 'Urban Tigrinya',
    region: 'Horn Region',
    persona: 'Contemporary Voice',
    description: 'Modern, vibrant tone suited for educational podcasts, health advice, and everyday communications.',
    sampleText: 'ሰላም ጥዕና ይሃበልና፣ ከመይ ቀኒኹም? ንሎሚ ዘዳለናዮ መደብ ትምህርቲ ሒዝና ቀሪብና ኣለና።',
    pitch: 1.12,
    speed: 1.0
  },
  {
    id: 'v-berhanu',
    name: 'Berhanu',
    nativeName: 'ብርሃኑ',
    language: 'ti',
    gender: 'male',
    accent: 'Axum Classical',
    region: 'Axum',
    persona: 'Liturgical & Historical',
    description: 'Deep, resonant, traditional inflection honoring ancient heritage, scripture reading, and epic folklore.',
    sampleText: 'ታሪኽ ኣኽሱም ጥንታዊ ስልጣነናን ቅርሰናን ኮይኑ ንዘመናት ጸኒዑ ዝነበረ ናይ ክብረት መርኣያ እዩ።',
    pitch: 0.88,
    speed: 0.9
  },

  // Afaan Oromoo Voices
  {
    id: 'v-chala',
    name: 'Chala',
    nativeName: 'Caalaa',
    language: 'om',
    gender: 'male',
    accent: 'Finfinne Radio',
    region: 'Central Oromia',
    persona: 'Broadcast Host',
    description: 'Energetic, confident pacing with impeccable Qubee vowel phonetics for news and public media.',
    sampleText: 'Kabajamtoota hordoftoota keenya, oduuwwan biyya keessaa fi idil-addunyaa qabannee dhiyaanneerra.',
    isPopular: true,
    pitch: 0.96,
    speed: 1.0
  },
  {
    id: 'v-bontu',
    name: 'Bontu',
    nativeName: 'Boontuu',
    language: 'om',
    gender: 'female',
    accent: 'Wollega Warm',
    region: 'Western Oromia',
    persona: 'Educator & Storyteller',
    description: 'Gentle, melodious pronunciation highlighting classic storytelling and school literature.',
    sampleText: 'Akkam jirtu ijoollee keenya, har\'a oduu durii bareedduu tokko waliin ilaalla.',
    isPopular: true,
    pitch: 1.1,
    speed: 0.98
  },
  {
    id: 'v-gemechu',
    name: 'Gemechu',
    nativeName: 'Gammachuu',
    language: 'om',
    gender: 'male',
    accent: 'Bale Pastoral',
    region: 'South-East Oromia',
    persona: 'Elder & Folklorist',
    description: 'Rich, measured voice capturing the wisdom of the Gadaa system, proverbs (Mammaaksa), and historical lore.',
    sampleText: 'Mammaaksi Oromoo beekumsa fi seenaa guddaa of keessaa qaba. Beekaan nama obsa qabuudha.',
    pitch: 0.89,
    speed: 0.92
  },

  // English Voices
  {
    id: 'v-michael',
    name: 'Michael',
    nativeName: 'Michael (ET)',
    language: 'en',
    gender: 'male',
    accent: 'Addis International',
    region: 'Addis Ababa',
    persona: 'Pan-African Professional',
    description: 'Refined international English with a gentle Ethiopian warmth, perfect for global business presentations and diplomacy.',
    sampleText: 'Good morning and welcome to the Pan-African Technology and Innovation Summit here in Addis Ababa.',
    isPopular: true,
    pitch: 0.98,
    speed: 1.0
  },
  {
    id: 'v-beth',
    name: 'Beth',
    nativeName: 'Beth (ET)',
    language: 'en',
    gender: 'female',
    accent: 'Bilingual Tech',
    region: 'Addis Ababa',
    persona: 'Digital Guide',
    description: 'Clear, modern, and accessible voice ideal for software documentation, tutorials, and navigation.',
    sampleText: 'This interface allows you to upload any manuscript or textbook and receive real-time audio playback in seconds.',
    pitch: 1.08,
    speed: 1.0
  }
];

export const PRESETS: PresetTemplate[] = [
  {
    id: 'p-dam',
    title: 'Renaissance Dam (ታላቁ ህዳሴ ግድብ)',
    titleNative: 'የታላቁ የኢትዮጵያ ህዳሴ ግድብ ታሪክ',
    category: 'National Heritage',
    language: 'am',
    text: 'ታላቁ የኢትዮጵያ ሕዳሴ ግድብ በዓባይ ወንዝ ላይ የተገነባ የህዝባችን የጋራ አሻራና የልማት ተምሳሌት ነው። ንጹህና አስተማማኝ የኤሌክትሪክ ኃይል በማመንጨት የሀገራችንን የኢኮኖሚ እድገት ያፋጥናል።'
  },
  {
    id: 'p-fikr',
    title: 'Fikr Eske Meqabr (ፍቅር እስከ መቃብር)',
    titleNative: 'ከክላሲክ ልቦለድ የተወሰደ',
    category: 'Literature',
    language: 'am',
    text: 'የሰው ልጅ በህይወቱ ውስጥ ብዙ ነገሮችን ያልፋል። ነገር ግን እውነተኛ ፍቅርና ቅንነት ሁልጊዜ በልብ ውስጥ የማይጠፋ ፋና ሆነው ይኖራሉ።'
  },
  {
    id: 'p-tig-wisdom',
    title: 'Tigray Heritage (ጥንታዊ ቅርሶች)',
    titleNative: 'ናይ ትግራይ ታሪኽን ቅርሰን',
    category: 'History',
    language: 'ti',
    text: 'ጥንታዊት ከተማ ኣኽሱም፣ ውቁብ ሓወልትታትን ጥንታዊ ቅርስታትን ዝሓዘለት ታሪኻዊት ዓዲ እያ። ንትውልዲ ዝተረከበ ታሪኽና ክንዕቅቦን ከነማዕብሎን ይግባእ።'
  },
  {
    id: 'p-tig-education',
    title: 'Tigrinya Proverbs (ምስላታት ትግርኛ)',
    titleNative: 'ናይ ኣቦታት ምስላታትን ትምህርትን',
    category: 'Literature',
    language: 'ti',
    text: 'ምስላ ትግርኛ ከምዚ ይብል፡ "ሓበራዊ ጻዕሪ ንዘይከኣል የኽእል፡ ሓድነት ድማ ንዓወትን ሰላምን መሰረት እዩ።" ኩሉ ሰብ ብትግሃት እንተሰሪሑ ሃገር ትለምዕ።'
  },
  {
    id: 'p-oromo-mammaaksa',
    title: 'Oromo Proverbs (Mammaaksa)',
    titleNative: 'Ogummaa fi Mammaaksa Oromoo',
    category: 'Wisdom',
    language: 'om',
    text: 'Mammaaksi Oromoo: "Harki wal dhiqaa, walitti garagalee fuula dhiqa." Tokkummaa fi waliin hojjechuun bu\'uura guddinaati.'
  },
  {
    id: 'p-oromo-gadaa',
    title: 'Sirna Gadaa (Gadaa Heritage)',
    titleNative: 'Aadaa fi Seenaa Sirna Gadaa',
    category: 'Heritage',
    language: 'om',
    text: 'Sirni Gadaa sirna dimokraasii ammayyaa duratti Oromoon ittiin bulaa turee fi qabeenya aadaa addunyaa ti. Nageenya, wal-qixxummaa fi misooma hawaasaaf bu\'uura cimaadha.'
  },
  {
    id: 'p-proverb',
    title: 'Ethiopian Proverbs (የአበው ምክር)',
    titleNative: 'ጥበብ የተሞሉ ምሳሌያዊ አነጋገሮች',
    category: 'Culture',
    language: 'am',
    text: 'ድር ቢያብር አንበሳ ያስር። አንዲት ዛፍ ብቻዋን ደን አትሆንም፤ ህዝብ ከተባበረ የማይሻገረው ተራራና የማይፈታው ችግር የለም።'
  },
  {
    id: 'p-news-broadcast',
    title: 'Evening News Brief (የምሽት ዜና)',
    titleNative: 'የአዲስ አበባ የምሽት ዜና ማጠቃለያ',
    category: 'News',
    language: 'am',
    text: 'ይህ የአዲስ አበባ የሰዓቱ ዜና ነው። ዛሬ በኢትዮጵያ አየር መንገድ አዳዲስ አለም አቀፍ መስመሮች መከፈታቸውን ተከትሎ የቱሪዝም ፍሰቱ በከፍተኛ ደረጃ መጨመሩ ተገለጸ።'
  },
  {
    id: 'p-african-union',
    title: 'Pan-African Vision & Union',
    titleNative: 'The Diplomatic Capital of Africa',
    category: 'International',
    language: 'en',
    text: 'Headquartered in the vibrant diplomatic capital of Addis Ababa, the African Union represents over one billion citizens united in a common aspiration for peace, technological sovereignty, and inclusive sustainable development across the continent.'
  },
  {
    id: 'p-oromo-gadaa-philosophy',
    title: 'Gadaa Democratic Philosophy',
    titleNative: 'Sirna Gadaa fi Nageenya',
    category: 'Heritage',
    language: 'om',
    text: 'Sirni Gadaa Oromoo sirna dimokiraasii fi bulchiinsa hawaasaa kan addunyaarratti fakkeenya ta\'uu danda\'udha. Nageenya, wal-qixxummaa fi eegumsa uumamaatiif iddoo guddaa kenna.'
  },
  {
    id: 'p-tig-geez',
    title: 'Axumite Wisdom & Inscriptions',
    titleNative: 'ጥበብን ስነ-ጽሑፍን ኣኽሱም',
    category: 'Literature',
    language: 'ti',
    text: 'ስነ-ጽሑፍ ግዕዝን ትግርኛን ንዘመናት ዝተሰነደ ታሪኽ ህዝብታት ቀርኒ ኣፍሪቃ ዝሓዘ ሃብቲ እዩ። ብድምጽን ብቴክኖሎጂን ህያው ኮይኑ ንዘለኣለም ይነብር።'
  },
  {
    id: 'p-tig-development',
    title: 'Tigrinya Civic & Educational Discourse',
    titleNative: 'ትምህርትን መሰረተ-ልምዓትን',
    category: 'Education',
    language: 'ti',
    text: 'ኣብያተ-ትምህርትታትን ላዕለዎት ትካላትን ኣብ ምምሕዳር መሰረተ-ልምዓትን ምዕባለታትን ብተጠቃምነቶም ዓቢይ ግደ ኣለወን። ቋንቋታትን ባህልታትን ንምዕቃብ ብዘይተሓለለ ጻዕሪ ምስራሕ ኣድላዪ እዩ።'
  },
  {
    id: 'p-oromo-development',
    title: 'Oromo Community Leadership & Science',
    titleNative: 'Ittigaafatamummaa fi Misooma',
    category: 'Education',
    language: 'om',
    text: 'Barbaachisummaa fi ittigaafatamummaa misooma naannoo fi qorannoowwaniin hordoftootasaaniitiif ibsameera. Wal-harkaa-fuudhiinsi beekumsaa fi teeknooloojii guddina biyyaatiif bu\'uura cimaadha.'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Community Free',
    priceEtb: 0,
    priceUsd: 0,
    billingPeriod: 'Forever Free',
    description: 'Perfect for students, individuals, and anyone discovering Ethiopian speech synthesis.',
    features: [
      '20 audio syntheses per day',
      'All 4 core languages (Amharic, Tigrinya, Oromo, English)',
      '6 Standard voice narrators',
      'Standard MP3/WAV download',
      'Direct web speech accessibility',
      'Community forum support'
    ],
    buttonText: 'Start Synthesizing Free',
    buttonVariant: 'secondary'
  },
  {
    id: 'creator',
    name: 'Creator Pro',
    priceEtb: 99,
    priceUsd: 3.99,
    billingPeriod: 'per month',
    popular: true,
    description: 'Designed for content creators, educators, authors, and local professionals.',
    features: [
      'Unlimited audio conversions',
      'All 12+ Premium HD Studio voices',
      'Optical OCR manuscript & book scanner',
      'Full Document & Audiobook Reader mode',
      'Lossless 48kHz HD WAV export',
      'Pronunciation & pause optimizer',
      'Instant Telebirr & Chapa checkout',
      'Priority synthesis processing'
    ],
    buttonText: 'Upgrade with Telebirr / Chapa',
    buttonVariant: 'primary'
  },
  {
    id: 'enterprise',
    name: 'Publisher & API',
    priceEtb: 499,
    priceUsd: 18.99,
    billingPeriod: 'per month',
    description: 'High-throughput access for media houses, universities, publishers, and developers.',
    features: [
      'REST API access with 100,000 chars/mo',
      'Custom Voice Cloning capability',
      'Bulk batch file synthesis',
      'Team shared workspace & library',
      'Commercial broadcasting license',
      '99.9% uptime SLA guarantee',
      'Dedicated technical account manager'
    ],
    buttonText: 'Contact Sales / API Key',
    buttonVariant: 'accent'
  }
];

export const COMMUNITY_STORIES: CommunityStory[] = [
  {
    id: 's-1',
    author: 'Dr. Yonas Mengistu',
    role: 'Linguistics Department Head',
    location: 'Addis Ababa University',
    story: "EthioVoice is a massive leap forward for Ge'ez phonology. Capturing the nuance between explosive consonants and subtle gemination in Amharic has been a hurdle for a decade. The fidelity here is astonishing.",
    avatarLetter: 'Y',
    languageUsed: 'Amharic & Ge\'ez',
    useCase: 'Academic Research & Phonetics'
  },
  {
    id: 's-2',
    author: 'Hawine Bekele',
    role: 'Primary School Teacher',
    location: 'Adama, Oromia',
    story: "I use EthioVoice to turn Qubee reading materials into audiobooks for children in rural classrooms. Children who struggle to read now listen and follow along with joy. It has transformed my classroom engagement.",
    avatarLetter: 'H',
    languageUsed: 'Afaan Oromoo',
    useCase: 'Rural Educational Literacy'
  },
  {
    id: 's-3',
    author: 'Teklehaimanot G.',
    role: 'Independent Audiobook Producer',
    location: 'Mekelle, Tigray',
    story: "Producing Tigrinya audiobooks traditionally required renting expensive studios in Addis or abroad. With the Hagos and Rahel voices, I produced a 10-chapter cultural history series in 3 days. My listeners love it.",
    avatarLetter: 'T',
    languageUsed: 'Tigrinya',
    useCase: 'Commercial Audiobooks'
  },
  {
    id: 's-4',
    author: 'Salem & David T.',
    role: 'Diaspora Parents',
    location: 'Silver Spring, Maryland, USA',
    story: "Raising kids born outside Ethiopia makes mother-tongue preservation tough. We create daily customized bedtime stories using EthioVoice so our daughters hear genuine Addis accents every evening.",
    avatarLetter: 'S',
    languageUsed: 'Amharic & English',
    useCase: 'Diaspora Language Preservation'
  }
];

export const INITIAL_ADMIN_STATS: AdminStats = {
  dailyActiveUsers: 842,
  totalConversions: 24650,
  revenueChapa: 48950,
  revenueTelebirr: 96300,
  conversionTrend: [
    { date: '05/18', count: 520 },
    { date: '05/19', count: 610 },
    { date: '05/20', count: 690 },
    { date: '05/21', count: 780 },
    { date: '05/22', count: 840 },
    { date: '05/23', count: 910 },
    { date: '05/24', count: 1045 }
  ],
  languageStats: {
    amharic: 14250,
    oromo: 5120,
    tigrinya: 3480,
    english: 1800
  }
};
