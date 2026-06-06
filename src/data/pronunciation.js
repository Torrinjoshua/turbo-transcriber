export const PRONUNCIATION_RULES = [
  {
    id: 'vowels',
    title: 'Vowels — Pure & Consistent',
    description:
      'Bemba has five vowels — a, e, i, o, u — and unlike English, each is always pronounced the same way. There are no silent vowels or shifting sounds.',
    rules: [
      {
        sound: 'a',
        description: 'Always like the "a" in "father" — open, round, warm.',
        examples: ['Mayo (Ma-yo) — mother', 'Tata (Ta-ta) — father', 'Amenshi (A-men-shee) — water'],
      },
      {
        sound: 'e',
        description: 'Always like the "e" in "they" or "café" — never like "bed".',
        examples: ['Mwebo (Mway-bo) — and you', 'Pacibelenge — Friday', 'Mwabombeni — well done'],
      },
      {
        sound: 'i',
        description: 'Always like the "ee" in "meet" — short and crisp.',
        examples: ['Icipinda (Ee-chee-peen-da) — room', 'Ibili (Ee-bee-lee) — two', 'Iyayi (Ee-ya-yee) — no'],
      },
      {
        sound: 'o',
        description: 'Always like the "o" in "go" — pure, not diphthong.',
        examples: ['Isoko (Ee-so-ko) — market', 'Insoko (In-so-ko)', 'Ubwalo — courtyard'],
      },
      {
        sound: 'u',
        description: 'Always like the "oo" in "moon" — round and full.',
        examples: ['Ulupwa (Oo-loo-pwa) — family', 'Ubwali (Oo-bwa-lee) — nshima', 'Ukumona (Oo-koo-mo-na) — to see'],
      },
    ],
  },
  {
    id: 'consonants',
    title: 'Key Consonant Sounds',
    description:
      'Most Bemba consonants will feel familiar, but a few key sounds require special attention — particularly the nasal consonants and the click-like ng\'.',
    rules: [
      {
        sound: "ng'",
        description:
          "The apostrophe signals a distinct nasal sound — like the 'ng' in 'singing' but at the start of a word. It's not two sounds — it's one.",
        examples: ["Ng'anda (N-gan-da) — house", "Ng'anga — healer/wise one", "Ng'ona — crocodile"],
      },
      {
        sound: 'sh',
        description: 'Pronounced exactly as in English "shoe" — soft and consistent.',
        examples: ['Muli shani? — How are you?', 'Shaleleni — goodbye', 'Insula (In-soo-la) — salt'],
      },
      {
        sound: 'ch / c',
        description:
          'In Bemba, the letter "c" is pronounced like "ch" in "church" when followed by certain vowels.',
        examples: ['Icipanda (Ee-chee-pan-da) — plate', 'Icialo — welcome', 'Chibichi — green'],
      },
      {
        sound: 'bw',
        description: 'A combined sound — lips form "b" then immediately round for "w". Sounds like "bw" in "beware" said quickly.',
        examples: ['Ubwali (Oo-bwa-lee) — nshima', 'Ubwengo (Oo-bwen-go) — wisdom', 'Bwino (Bwee-no) — fine/well'],
      },
      {
        sound: 'fw',
        description: 'A rare sound — start to say "f" then add "w". Like blowing gently through pursed lips.',
        examples: ['Ukufwaya (Oo-koo-fwa-ya) — to want', 'Ukufwa (Oo-koo-fwa) — to die/extinguish'],
      },
      {
        sound: 'mb / nd / ng',
        description:
          'Bemba has prenasalised consonants — the nasal sound (m or n) and the consonant blend into a single beat.',
        examples: ['Mwabombeni — well done (m+b blend)', 'Ng\'anda — house (ng\' nasal)', 'Kanshi — so then (n+sh)'],
      },
    ],
  },
  {
    id: 'tone',
    title: 'Tone & Stress',
    description:
      'Bemba is a tonal language — the pitch at which you say a syllable can change the meaning of a word. While full tonal mastery takes time, here are the key patterns to know.',
    rules: [
      {
        sound: 'High tone',
        description:
          'Some syllables carry a higher pitch. In written Bemba, these are sometimes marked with an accent (á). For learners, focus on listening and mimicry rather than rules.',
        examples: ['Listen carefully to native speakers', 'Repeat phrases whole, not syllable by syllable', 'Context often resolves tonal ambiguity'],
      },
      {
        sound: 'Word stress',
        description:
          'In most Bemba words, the stress falls on the second-to-last syllable (penultimate). This is the default rhythm of the language.',
        examples: ['Natotela → Na-to-TE-la', 'Amenshi → A-MEN-shi', 'Ukusambilila → Oo-koo-sam-BEE-lee-la'],
      },
      {
        sound: 'Rhythm',
        description:
          'Bemba has a steady, flowing rhythm. Each syllable gets roughly equal time — there are no swallowed syllables as in English. Speak steadily and clearly.',
        examples: ['Every vowel is heard', 'No syllable is skipped or rushed', 'The language flows like water — mbwembwe'],
      },
    ],
  },
  {
    id: 'tips',
    title: 'Practical Tips for Learners',
    description:
      'Learning Bemba as a heritage speaker or diaspora learner is a journey of reconnection. These tips will help you build confidence.',
    rules: [
      {
        sound: 'Listen first',
        description:
          'Before trying to speak, listen to the rhythm and melody of the language. Bemba has a musical quality — absorb it before analysing it.',
        examples: ['Listen to Zambian music', 'Call elders and let them speak', 'Notice patterns before rules'],
      },
      {
        sound: 'Speak whole phrases',
        description:
          'Bemba words live in phrases. "Muli shani? Bwino, mwebo?" is one exchange — learn it as a unit, not word by word.',
        examples: ['Greetings come as a set', 'Phrases carry more meaning than isolated words', 'Practice exchanges, not just vocabulary'],
      },
      {
        sound: 'Embrace imperfection',
        description:
          'Native Bemba speakers deeply appreciate any attempt to speak the language. Imperfect Bemba, spoken with heart, is always welcome. Ubwengo (wisdom) comes with time.',
        examples: ['Mistakes are signs of courage', "\"Nishibe te\" (I don't know) is a valid answer", 'Every word learned is roots reclaimed'],
      },
    ],
  },
]
