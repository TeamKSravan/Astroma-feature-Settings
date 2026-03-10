import { Dimensions, Platform } from 'react-native';
import { Profile1, Profile2, Profile3, Add } from './svgpath';

export const fonts = {
  bold: 'Lato-Bold',
  semiBold: 'Lato-Regular',
  medium: 'Lato-Light',
  regular: Platform.OS === 'android' ? 'Lato-Regular' : 'Lato-Thin',
};

export const { width, height } = Dimensions.get('window');

export const zodiacSigns = [
  { name: 'Crystine', icon: Profile1 },
  { name: 'Jhon', icon: Profile2 },
  { name: 'Marry', icon: Profile3 },
  // { name: 'Add', icon: Add },
];

export const signs = [
  { label: 'Sun Sign:', value: 'Gemini' },
  { label: 'Element:', value: 'Air' },
  { label: 'Moon Sign:', value: 'Leo' },
  { label: 'Polarity:', value: 'Masculine' },
  { label: 'Modality:', value: 'Mutable' },
];

export const DigitSubscriberNumber = [
  {
    "country": "United States",
    "countryCode": "+1",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "Canada",
    "countryCode": "+1",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "Jamaica",
    "countryCode": "+1",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "Dominican Republic",
    "countryCode": "+1",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "Puerto Rico",
    "countryCode": "+1",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "Turkey",
    "countryCode": "+90",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "China",
    "countryCode": "+86",
    "subscriberDigits": 7,
    "totalNationalDigits": 11,
  },
  {
    "country": "Argentina",
    "countryCode": "+54",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "Italy",
    "countryCode": "+39",
    "subscriberDigits": 7,
    "totalNationalDigits": 9,
  },
  {
    "country": "United Kingdom",
    "countryCode": "+44",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "Ireland",
    "countryCode": "+353",
    "subscriberDigits": 7,
    "totalNationalDigits": 9,
  },
  {
    "country": "Colombia",
    "countryCode": "+57",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "Russia",
    "countryCode": "+7",
    "subscriberDigits": 7,
    "totalNationalDigits": 10,
  },
  {
    "country": "Sweden",
    "countryCode": "+46",
    "subscriberDigits": 7,
    "totalNationalDigits": 9,
  },
  {
    "country": "Belgium",
    "countryCode": "+32",
    "subscriberDigits": 7,
    "totalNationalDigits": 9,
  },
  {
    "country": "India",
    "countryCode": "+91",
    "subscriberDigits": 8,
    "totalNationalDigits": 10,
  },
  {
    "country": "Germany",
    "countryCode": "+49",
    "subscriberDigits": 8,
    "totalNationalDigits": 11,
  },
  {
    "country": "France",
    "countryCode": "+33",
    "subscriberDigits": 9,
    "totalNationalDigits": 10,
  },
  {
    "country": "Brazil",
    "countryCode": "+55",
    "subscriberDigits": 9,
    "totalNationalDigits": 11,
  },
  {
    "country": "Japan",
    "countryCode": "+81",
    "subscriberDigits": 8,
    "totalNationalDigits": 10,
  }
];

export const suggestedQuestions = [
  {
    id: '1',
    icon: '🔮',
    text: 'What does my zodiac sign say about today?',
    category: 'Future Predictions',
  },
  {
    id: '2',
    icon: '❤️',
    text: "How's my love life looking this month?",
    category: 'love',
  },
  {
    id: '3',
    icon: '💼',
    text: 'Will I see career growth this year?',
    category: 'career',
  },
  {
    id: '4',
    icon: '⚡',
    text: 'Any challenges coming in my Kundali soon?',
    category: 'Future Predictions',
  },
  {
    id: '5',
    icon: '✨',
    text: 'What are my lucky numbers?',
    category: 'Future Predictions',
  },
];

export const STATIC_MARKDOWN_RESPONSE = `## 🌟 Your Astrological Insights

Based on your birth chart, here's what the stars reveal:

### Career & Professional Life 💼

**Ascendant (Lagna): Virgo** ♍ – practical, analytical, detail-oriented, good for research, technology, service industries.

---

## 📈 Career Flow in 2025

### 1. Jan – April 2025 (Ketu–Saturn)

- Saturn is in 6th house (Aquarius, Moolthrikona) → service, competition, workplace duties.
- You may feel pressures, heavy workload, or delays but also opportunities to solidify your role.
- This is a good time for government exams, structured corporate jobs, or foreign collaborations.
- Saturn brings steady progress, but only with discipline. Expect recognition after hard effort.

**Probability of Growth:** 65%

**Advice:** Avoid shortcuts; patience and consistency will pay.

---

### 2. Jul – Dec 2025 (Ketu–Mercury)

- Saturn is in 6th house (Aquarius, Moolthrikona) → service, competition, workplace duties.
- You may feel pressures, heavy workload, or delays but also opportunities to solidify your role.
- This is a good time for government exams, structured corporate jobs, or foreign collaborations.
- Saturn brings steady progress, but only with discipline. Expect recognition after hard effort.

**Probability of Growth:** 85%

**Advice:** Upgrade skills, take bold steps, and leverage communication power.

---

## 🌟 Top 3 Best Career Periods for You

1. **April – Dec 2025** → Career breakthroughs, possible promotions/new opportunities.
2. **2026–2029 (Venus Mahadasha start)** → A golden period for wealth, leadership, projects, and recognition.
3. **2032–2038 (Venus–Mars)** → Energetic period for leadership, projects, and independent ventures.

---

### Love & Relationships ❤️

**Venus Placement:**
- **7th House Lord (Jupiter)** is in your 4th house → domestic happiness, supportive partner
- Strong emphasis on emotional connection and family values



---

### Financial Outlook 💰

**Jupiter in 2nd House of Wealth:**
- Indicates strong financial growth potential


**Lucky Financial Periods:**
- **April–June 2025:** Major gains possible
- **September–November 2025:** Good for new ventures
- **2026 onwards:** Wealth accumulation accelerates

---

### Health & Wellness 🏥

**6th House Analysis:**
- Generally strong health constitution
- Areas to watch: Digestive system, stress-related issues

  
**Best Health Practices:**
- Morning meditation and pranayama


---

### Key Predictions for 2025 ✨

- Job change or promotion: **60% probability**
- Salary increase: **March-July 2025**
- New opportunities: **Q2 and Q4 2025**

---

### Important Transits 🪐

**Saturn Transit:**
- **Saturn Return** approaching - major life lessons and maturity
- Brings discipline, responsibility, and long-term rewards
- Focus on building solid foundations


**Mercury Retrograde Periods:**
- **April 1-25, 2025:** *Avoid major decisions and signing contracts*
- **August 5-28, 2025:** *Backup important data, double-check communications*
- **November 26 - December 15, 2025:** *Delay travel plans if possible*

---

### Remedies & Recommendations 🙏

**For Career Growth:**
- Chant Mercury mantra on Wednesdays
- Donate green items to the needy
- Wear emerald or green clothing on important days
- Keep your workspace organized and clean

**For Relationship Harmony:**
- Wear white or light colors on Fridays
- Spend quality time with loved ones
- Practice active listening
- Express appreciation regularly

---

> "The stars guide us, but we write our own destiny." ✨

## ✅ Conclusion

**2025 will be a year of transition:**
- The first quarter (till April) may feel slow, but stable foundations are being built.
- From April onwards, expect one of your most career-boosting phases of the decade (Ketu–Mercury). Expect promotions, rewards, or a major step forward.

**Would you like me to also list the Top 5 career fields most suited for you based on this chart?**

**Remember:** These insights are based on your unique birth chart. Stay positive and aligned with cosmic energies! The universe is conspiring in your favor. 🌙⭐`;

export const options = [
  // { id: 1, label: 'Free Trial', cost: 0, coin: 50, productID: null },
  { id: 2, label: '1 Question', cost: 1, coin: 1, productID: Platform.OS === 'android' ? 'com.astroma.single.1' : 'com.astroma.single.1' },
  { id: 3, label: '10 Questions', cost: 5, coin: 10, productID: Platform.OS === 'android' ? 'com.astroma.pack.10' : 'com.astroma.pack.10' },
];

export const GOOGLE_API_KEY = 'AIzaSyB0FjlKAR4bnyS4M2Vs_BC-Rh-5ZW9bBGU';
