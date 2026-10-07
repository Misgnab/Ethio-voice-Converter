/**
 * Comprehensive Ge'ez Fidel to Phonetic Natural Language Converter
 * Enables instant, natural-sounding client-side speech synthesis
 * across all modern browsers and operating systems.
 */

const GEEZ_TO_PHONETIC: Record<string, string> = {
  // ሀ (h)
  'ሀ': 'ha', 'ሁ': 'hu', 'ሂ': 'hi', 'ሃ': 'haa', 'ሄ': 'he', 'ህ': 'h', 'ሆ': 'ho',
  // ለ (l)
  'ለ': 'le', 'ሉ': 'lu', 'ሊ': 'li', 'ላ': 'la', 'ሌ': 'le', 'ል': 'l', 'ሎ': 'lo',
  // ሐ (h)
  'ሐ': 'ha', 'ሑ': 'hu', 'ሒ': 'hi', 'ሓ': 'ha', 'ሔ': 'he', 'ሕ': 'h', 'ሖ': 'ho',
  // መ (m)
  'መ': 'me', 'ሙ': 'mu', 'ሚ': 'mi', 'ማ': 'ma', 'ሜ': 'me', 'ም': 'm', 'ሞ': 'mo',
  // ሠ (s)
  'ሠ': 'se', 'ሡ': 'su', 'ሢ': 'si', 'ሣ': 'sa', 'ሤ': 'se', 'ሥ': 's', 'ሦ': 'so',
  // ረ (r)
  'ረ': 're', 'ሩ': 'ru', 'ሪ': 'ri', 'ራ': 'ra', 'ሬ': 're', 'ር': 'r', 'ሮ': 'ro',
  // ሰ (s)
  'ሰ': 'se', 'ሱ': 'su', 'ሲ': 'si', 'ሳ': 'sa', 'ሴ': 'se', 'ስ': 's', 'ሶ': 'so',
  // ሸ (sh)
  'ሸ': 'she', 'ሹ': 'shu', 'ሺ': 'shi', 'ሻ': 'sha', 'ሼ': 'she', 'ሽ': 'sh', 'ሾ': 'sho',
  // ቀ (q)
  'ቀ': 'qe', 'ቁ': 'qu', 'ቂ': 'qi', 'ቃ': 'qa', 'ቄ': 'qe', 'ቅ': 'q', 'ቆ': 'qo',
  // ቐ (qh) - Tigrinya ejective fricative
  'ቐ': 'qhe', 'ቑ': 'qhu', 'ቒ': 'qhi', 'ቓ': 'qha', 'ቔ': 'qhe', 'ቕ': 'qh', 'ቖ': 'qho',
  // በ (b)
  'በ': 'be', 'ቡ': 'bu', 'ቢ': 'bi', 'ባ': 'ba', 'ቤ': 'be', 'ብ': 'b', 'ቦ': 'bo',
  // ቨ (v)
  'ቨ': 've', 'ቩ': 'vu', 'ቪ': 'vi', 'ቫ': 'va', 'ቬ': 've', 'ቭ': 'v', 'ቮ': 'vo',
  // ተ (t)
  'ተ': 'te', 'ቱ': 'tu', 'ቲ': 'ti', 'ታ': 'ta', 'ቴ': 'te', 'ት': 't', 'ቶ': 'to',
  // ቸ (ch)
  'ቸ': 'che', 'ቹ': 'chu', 'ቺ': 'chi', 'ቻ': 'cha', 'ቼ': 'che', 'ች': 'ch', 'ቾ': 'cho',
  // ኀ (h)
  'ኀ': 'ha', 'ኁ': 'hu', 'ኂ': 'hi', 'ኃ': 'ha', 'ኄ': 'he', 'ኅ': 'h', 'ኆ': 'ho',
  // ነ (n)
  'ነ': 'ne', 'ኑ': 'nu', 'ኒ': 'ni', 'ና': 'na', 'ኔ': 'ne', 'ን': 'n', 'ኖ': 'no',
  // ኘ (ny)
  'ኘ': 'nye', 'ኙ': 'nyu', 'ኚ': 'nyi', 'ኛ': 'nya', 'ኜ': 'nye', 'ኝ': 'ny', 'ኞ': 'nyo',
  // አ (a)
  'አ': 'a', 'ኡ': 'u', 'ኢ': 'i', 'ኣ': 'aa', 'ኤ': 'e', 'እ': 'e', 'ኦ': 'o',
  // ከ (k)
  'ከ': 'ke', 'ኩ': 'ku', 'ኪ': 'ki', 'ካ': 'ka', 'ኬ': 'ke', 'ክ': 'k', 'ኮ': 'ko',
  // ኸ (kh) - Tigrinya velar fricative
  'ኸ': 'khe', 'ኹ': 'khu', 'ኺ': 'khi', 'ኻ': 'kha', 'ኼ': 'khe', 'ኽ': 'kh', 'ኾ': 'kho',
  // ወ (w)
  'ወ': 'we', 'ዉ': 'wu', 'ዊ': 'wi', 'ዋ': 'wa', 'ዌ': 'we', 'ው': 'w', 'ዎ': 'wo',
  // ዐ (a)
  'ዐ': 'a', 'ዑ': 'u', 'ዒ': 'i', 'ዓ': 'aa', 'ዔ': 'e', 'ዕ': 'e', 'ዖ': 'o',
  // ዘ (z)
  'ዘ': 'ze', 'ዙ': 'zu', 'ዚ': 'zi', 'ዛ': 'za', 'ዜ': 'ze', 'ዝ': 'z', 'ዞ': 'zo',
  // ዠ (zh)
  'ዠ': 'zhe', 'ዡ': 'zhu', 'ዢ': 'zhi', 'ዣ': 'zha', 'ዤ': 'zhe', 'ዥ': 'zh', 'ዦ': 'zho',
  // የ (y)
  'የ': 'ye', 'ዩ': 'yu', 'ዪ': 'yi', 'ያ': 'ya', 'ዬ': 'ye', 'ይ': 'y', 'ዮ': 'yo',
  // ደ (d)
  'ደ': 'de', 'ዱ': 'du', 'ዲ': 'di', 'ዳ': 'da', 'ዴ': 'de', 'ድ': 'd', 'ዶ': 'do',
  // ዸ (d' / de) - Tigrinya retroflex
  'ዸ': 'de', 'ዹ': 'du', 'ዺ': 'di', 'ዻ': 'da', 'ዼ': 'de', 'ዽ': 'd', 'ዾ': 'do',
  // ጀ (j)
  'ጀ': 'je', 'ጁ': 'ju', 'ጂ': 'ji', 'ጃ': 'ja', 'ጄ': 'je', 'ጅ': 'j', 'ጆ': 'jo',
  // ገ (g)
  'ገ': 'ge', 'ጉ': 'gu', 'ጊ': 'gi', 'ጋ': 'ga', 'ጌ': 'ge', 'ግ': 'g', 'ጎ': 'go',
  // ጘ (ng) - Tigrinya nasal
  'ጘ': 'nge', 'ጙ': 'ngu', 'ጚ': 'ngi', 'ጛ': 'nga', 'ጜ': 'nge', 'ጝ': 'ng', 'ጞ': 'ngo',
  // ጠ (t')
  'ጠ': 'te', 'ጡ': 'tu', 'ጢ': 'ti', 'ጣ': 'ta', 'ጤ': 'te', 'ጥ': 't', 'ጦ': 'to',
  // ጨ (ch')
  'ጨ': 'che', 'ጩ': 'chu', 'ጪ': 'chi', 'ጫ': 'cha', 'ጬ': 'che', 'ጭ': 'ch', 'ጮ': 'cho',
  // ጰ (p')
  'ጰ': 'pe', 'ጱ': 'pu', 'ጲ': 'pi', 'ጳ': 'pa', 'ጴ': 'pe', 'ጵ': 'p', 'ጶ': 'po',
  // ጸ (ts')
  'ጸ': 'tse', 'ጹ': 'tsu', 'ጺ': 'tsi', 'ጻ': 'tsa', 'ጼ': 'tse', 'ጽ': 'ts', 'ጾ': 'tso',
  // ፀ (ts')
  'ፀ': 'tse', 'ፁ': 'tsu', 'ፂ': 'tsi', 'ፃ': 'tsa', 'ፄ': 'tse', 'ፅ': 'ts', 'ፆ': 'tso',
  // ፈ (f)
  'ፈ': 'fe', 'ፉ': 'fu', 'ፊ': 'fi', 'ፋ': 'fa', 'ፌ': 'fe', 'ፍ': 'f', 'ፎ': 'fo',
  // ፐ (p)
  'ፐ': 'pe', 'ፑ': 'pu', 'ፒ': 'pi', 'ፓ': 'pa', 'ፔ': 'pe', 'ፕ': 'p', 'ፖ': 'po',

  // Labiovelars & Combinations
  'ቈ': 'qwa', 'ቊ': 'qwi', 'ቋ': 'qwaa', 'ቌ': 'qwe', 'ቍ': 'qw',
  'ቘ': 'qhwa', 'ቚ': 'qhwi', 'ቛ': 'qhwaa', 'ቜ': 'qhwe', 'ቝ': 'qhw',
  'ኰ': 'kwa', 'ኲ': 'kwi', 'ኳ': 'kwaa', 'ኴ': 'kwe', 'ኵ': 'kw',
  'ዀ': 'khwa', 'ዂ': 'khwi', 'ዃ': 'khwaa', 'ዄ': 'khwe', 'ዅ': 'khw',
  'ጐ': 'gwa', 'ጒ': 'gwi', 'ጓ': 'gwaa', 'ጔ': 'gwe', 'ጕ': 'gw',
  'ኈ': 'hwa', 'ኊ': 'hwi', 'ኋ': 'hwaa', 'ኌ': 'hwe', 'ኍ': 'hw',
  'ጟ': 'ngwa', 'ዿ': 'dwa',
  'ሏ': 'lwa', 'ሟ': 'mwa', 'ሯ': 'rwa', 'ሷ': 'swa', 'ሿ': 'shwa',
  'ቧ': 'bwa', 'ቷ': 'twa', 'ቿ': 'chwa', 'ኗ': 'nwa', 'ኟ': 'nywa',
  'ዟ': 'zwa', 'ዧ': 'zhwa', 'ዷ': 'dwa', 'ጇ': 'jwa', 'ጧ': 'twa',
  'ጯ': 'chwa', 'ጷ': 'pwa', 'ጿ': 'tswa', 'ፏ': 'fwa', 'ፗ': 'pwa',

  // Ge'ez Numbers
  '፩': '1 ', '፪': '2 ', '፫': '3 ', '፬': '4 ', '፭': '5 ',
  '፮': '6 ', '፯': '7 ', '፰': '8 ', '፱': '9 ', '፲': '10 ',
  '፳': '20 ', '፴': '30 ', '፵': '40 ', '፶': '50 ', '፷': '60 ',
  '፸': '70 ', '፹': '80 ', '፺': '90 ', '፻': '100 ', '፼': '10000 ',

  // Ge'ez & Tigrinya Punctuation
  '፡': ' ', '።': '. ', '፣': ', ', '፤': '; ', '፦': ': ', '፧': '? ', '፨': '. ', '፠': '. ', '፥': ', '
};

/**
 * Converts Ge'ez Fidel text into pronounceable natural phonetic text for speech engines
 */
export function transliterateGeezToPhonetic(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (GEEZ_TO_PHONETIC[char]) {
      result += GEEZ_TO_PHONETIC[char];
    } else {
      result += char;
    }
  }
  // Clean up duplicate spaces
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Checks if a string contains Ge'ez script characters
 */
export function isGeezScript(text: string): boolean {
  return /[\u1200-\u137F]/.test(text);
}

export interface PronunciationRule {
  id: string;
  original: string;
  replacement: string;
  language?: string;
  enabled: boolean;
}

const STORAGE_KEY = 'ethiovoice_custom_pronunciations';

/**
 * Retrieves saved user-defined pronunciation overrides from localStorage
 */
export function getSavedPronunciations(): PronunciationRule[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with common examples
      const initial: PronunciationRule[] = [
        { id: 'rule-1', original: 'ኢትዮጵያ', replacement: 'ኢትዮጵያ (Ityopp\'ya)', language: 'am', enabled: false },
        { id: 'rule-2', original: 'ትግራይ', replacement: 'ትግራይ (Tegray)', language: 'ti', enabled: false }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves a new or updated pronunciation rule
 */
export function savePronunciationRule(rule: Omit<PronunciationRule, 'id'> & { id?: string }): PronunciationRule[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedPronunciations();
    const id = rule.id || 'rule-' + Date.now().toString(36);
    const existingIndex = current.findIndex((r) => r.id === id || r.original.trim() === rule.original.trim());
    
    let updated: PronunciationRule[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...rule, id: current[existingIndex].id };
    } else {
      updated = [{ ...rule, id }, ...current];
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Deletes a pronunciation rule by ID
 */
export function deletePronunciationRule(id: string): PronunciationRule[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedPronunciations();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Applies custom pronunciation rules and Ethiopian script normalization
 */
export function applyPronunciationRules(text: string, rules?: PronunciationRule[]): string {
  if (!text) return '';
  const activeRules = (rules || getSavedPronunciations()).filter((r) => r.enabled && r.original.trim());
  let output = text;
  
  for (const rule of activeRules) {
    if (rule.original.trim() && rule.replacement.trim()) {
      // Escape regex special characters in original
      const escaped = rule.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      output = output.replace(new RegExp(escaped, 'g'), rule.replacement);
    }
  }
  return output;
}

/**
 * Normalizes Ethiopian punctuation for natural prosody
 */
export function normalizeEthiopianPunctuation(text: string, language: string = 'am'): string {
  if (!text) return '';
  let normalized = text;
  
  if (language === 'am' || language === 'ti') {
    // Spaced glottalic stops and commas
    normalized = normalized
      .replace(/\s*፡\s*/g, ' ')
      .replace(/\s*፣\s*/g, '፣ ')
      .replace(/\s*።\s*/g, '። ')
      .replace(/\s*፤\s*/g, '፤ ')
      .replace(/\s*፦\s*/g, '፦ ')
      .replace(/\s+/g, ' ')
      .trim();
  } else if (language === 'om') {
    // Qubee double vowels and glottal apostrophe spacing
    normalized = normalized
      .replace(/\s*'\s*/g, "'")
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*\.\s*/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return normalized;
}
