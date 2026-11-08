/*
 * Everyday words people search with, mapped to the store's concerns and to wording that already
 * appears in the medicines' traditional uses (content/medicines.ts). This adds no medical claims:
 * a search can only surface a medicine whose own AVVVS-listed uses contain one of the `find` words.
 *
 * `say`:  what people type (any of these, matched loosely, spelling-tolerant)
 * `concerns`: concern pages to suggest
 * `find`: words to look for in each medicine's uses
 * Pharmacist: please review alongside medicines.ts.
 */
export type Synonym = { say: string[]; concerns: string[]; find: string[] };

export const SYNONYMS: Synonym[] = [
  // pain
  { say: ['back pain', 'backache', 'lower back pain', 'lumbago'], concerns: ['pain-management'], find: ['back pain', 'backache', 'low back'] },
  { say: ['joint pain', 'arthritis', 'knee pain', 'swollen joints', 'stiff joints'], concerns: ['pain-management'], find: ['joint', 'arthritis', 'knee'] },
  { say: ['gout', 'uric acid', 'vatarakta'], concerns: ['pain-management'], find: ['gout', 'vatarakta'] },
  { say: ['sciatica', 'leg pain', 'nerve pain'], concerns: ['pain-management', 'mind-sleep-nerves'], find: ['sciatica', 'nerve pain'] },
  { say: ['neck pain', 'spondylosis', 'cervical', 'frozen shoulder', 'shoulder pain'], concerns: ['pain-management'], find: ['spondylosis', 'frozen shoulder', 'neck'] },
  { say: ['muscle pain', 'body pain', 'body ache', 'sprain', 'injury', 'sports injury'], concerns: ['pain-management'], find: ['muscle pain', 'body pains', 'body aches', 'sprain', 'injur'] },
  { say: ['massage oil', 'body oil'], concerns: ['pain-management'], find: ['massage'] },
  // digestion
  { say: ['constipation', 'hard stools', 'laxative', 'motion problem'], concerns: ['digestive-health'], find: ['constipation', 'bowel'] },
  { say: ['gas', 'bloating', 'flatulence', 'wind'], concerns: ['digestive-health'], find: ['bloating', 'wind'] },
  { say: ['indigestion', 'dyspepsia', 'stomach upset', 'no appetite', 'loss of appetite', 'hunger'], concerns: ['digestive-health'], find: ['indigestion', 'appetite', 'dyspepsia', 'digestion'] },
  { say: ['acidity', 'heartburn', 'acid reflux', 'gastric'], concerns: ['digestive-health'], find: ['acidity', 'acid peptic'] },
  { say: ['piles', 'hemorrhoids', 'haemorrhoids', 'fissure', 'fistula'], concerns: ['digestive-health'], find: ['piles', 'fissure', 'fistula'] },
  { say: ['loose motion', 'diarrhea', 'diarrhoea', 'dysentery', 'ibs'], concerns: ['digestive-health'], find: ['loose stools', 'dysentery', 'irritable bowel'] },
  { say: ['worms', 'worm infestation', 'stomach worms'], concerns: ['digestive-health', 'childrens-health'], find: ['worm'] },
  // breathing
  { say: ['cough', 'dry cough', 'wet cough', 'phlegm'], concerns: ['respiratory'], find: ['cough'] },
  { say: ['cold', 'common cold', 'runny nose', 'sneezing', 'allergic rhinitis'], concerns: ['respiratory'], find: ['cold', 'runny nose'] },
  { say: ['asthma', 'breathlessness', 'wheezing', 'breathing problem', 'bronchitis'], concerns: ['respiratory'], find: ['asthma', 'breathlessness', 'bronchitis'] },
  { say: ['sinus', 'sinusitis', 'blocked nose', 'congestion'], concerns: ['respiratory'], find: ['sinus'] },
  { say: ['sore throat', 'throat', 'hoarse voice', 'voice'], concerns: ['respiratory'], find: ['throat', 'voice'] },
  // skin and hair
  { say: ['hair fall', 'hair loss', 'hair growth', 'thinning hair', 'hair oil'], concerns: ['skin-and-hair'], find: ['hair fall', 'hair growth', 'hair health', 'thinning'] },
  { say: ['dandruff', 'itchy scalp', 'scalp'], concerns: ['skin-and-hair'], find: ['dandruff', 'scalp'] },
  { say: ['grey hair', 'gray hair', 'white hair', 'premature greying'], concerns: ['skin-and-hair'], find: ['greying'] },
  { say: ['psoriasis'], concerns: ['skin-and-hair'], find: ['psoriasis'] },
  { say: ['eczema', 'dermatitis', 'rash', 'rashes', 'hives', 'urticaria', 'itching', 'itchy skin', 'skin allergy'], concerns: ['skin-and-hair'], find: ['eczema', 'dermatitis', 'rash', 'urticaria', 'itch', 'skin allerg'] },
  { say: ['acne', 'pimples', 'boils', 'skin glow', 'complexion', 'pigmentation', 'dark circles', 'tan'], concerns: ['skin-and-hair'], find: ['acne', 'pimples', 'boils', 'complexion', 'pigmentation', 'dark circles', 'tanning', 'blemishes'] },
  { say: ['skin problem', 'skin disease', 'skin care'], concerns: ['skin-and-hair'], find: ['skin condition', 'skin'] },
  { say: ['gums', 'bleeding gums', 'bad breath', 'teeth', 'mouth ulcer'], concerns: [], find: ['gums', 'bad breath', 'teeth', 'mouth ulcers'] },
  // women
  { say: ['periods', 'period pain', 'menstrual cramps', 'irregular periods', 'heavy periods', 'menstruation'], concerns: ['womens-health'], find: ['period', 'menstrual'] },
  { say: ['white discharge', 'leucorrhoea', 'leucorrhea', 'vaginal discharge'], concerns: ['womens-health'], find: ['vaginal discharge', 'leucorrhoea'] },
  { say: ['pcos', 'pcod', 'hormonal imbalance'], concerns: ['womens-health'], find: ['pcos', 'hormonal'] },
  { say: ['menopause'], concerns: ['womens-health'], find: ['menopause'] },
  { say: ['after delivery', 'postnatal', 'post natal', 'after childbirth', 'pregnancy', 'prasava'], concerns: ['womens-health'], find: ['childbirth', 'pregnancy'] },
  { say: ['breast milk', 'lactation', 'breastfeeding'], concerns: ['womens-health'], find: ['breast-milk', 'breastfeeding'] },
  // children
  { say: ['children', 'kids', 'child', 'baby', 'infant', 'baby massage'], concerns: ['childrens-health'], find: ['children', 'babies'] },
  // fever and immunity
  { say: ['fever', 'viral fever', 'temperature', 'chills'], concerns: ['fever-and-immunity'], find: ['fever'] },
  { say: ['immunity', 'immunity booster', 'frequent illness', 'low immunity'], concerns: ['fever-and-immunity'], find: ['immunity'] },
  // metabolic
  { say: ['diabetes', 'sugar', 'blood sugar', 'prameha'], concerns: ['diabetes-and-metabolic'], find: ['diabetes', 'blood sugar'] },
  { say: ['weight loss', 'obesity', 'fat', 'overweight', 'metabolism'], concerns: ['diabetes-and-metabolic'], find: ['weight management', 'metabolism', 'weight gain'] },
  { say: ['cholesterol'], concerns: ['diabetes-and-metabolic', 'heart-and-circulation'], find: ['cholesterol'] },
  // heart
  { say: ['heart', 'bp', 'blood pressure', 'hypertension'], concerns: ['heart-and-circulation'], find: ['heart', 'blood pressure'] },
  // liver and kidney
  { say: ['liver', 'fatty liver', 'jaundice'], concerns: ['liver-and-kidney'], find: ['liver', 'jaundice'] },
  { say: ['kidney', 'kidney stone', 'stones', 'urine', 'urinary', 'uti', 'burning urine'], concerns: ['liver-and-kidney'], find: ['kidney', 'urin'] },
  { say: ['swelling', 'water retention', 'oedema', 'edema', 'puffiness'], concerns: ['liver-and-kidney'], find: ['fluid retention', 'swelling'] },
  // mind
  { say: ['sleep', 'insomnia', 'sleeplessness', 'cannot sleep'], concerns: ['mind-sleep-nerves'], find: ['sleep'] },
  { say: ['stress', 'anxiety', 'tension', 'depression', 'low mood', 'mood'], concerns: ['mind-sleep-nerves'], find: ['stress', 'anxiety', 'mood'] },
  { say: ['memory', 'concentration', 'focus', 'brain', 'studies', 'exam'], concerns: ['mind-sleep-nerves'], find: ['memory', 'concentration', 'focus', 'learning'] },
  { say: ['headache', 'migraine', 'head pain'], concerns: ['mind-sleep-nerves'], find: ['headache', 'migraine'] },
  { say: ['giddiness', 'dizziness', 'vertigo'], concerns: ['mind-sleep-nerves'], find: ['giddiness'] },
  { say: ['paralysis', 'stroke recovery', 'facial palsy', 'bells palsy'], concerns: ['mind-sleep-nerves', 'pain-management'], find: ['paralysis', 'palsy'] },
  // strength
  { say: ['weakness', 'tiredness', 'fatigue', 'energy', 'stamina', 'strength', 'tonic'], concerns: ['rejuvenation'], find: ['weakness', 'tiredness', 'stamina', 'strength', 'tonic'] },
  { say: ['anaemia', 'anemia', 'iron', 'low hemoglobin', 'low haemoglobin'], concerns: ['rejuvenation'], find: ['anaemia', 'iron'] },
  { say: ['vitality', 'male health', 'libido', 'sexual health'], concerns: ['rejuvenation'], find: ['vitality', 'libido'] },
  { say: ['nutrition', 'weight gain', 'underweight', 'health drink', 'breakfast'], concerns: ['rejuvenation', 'childrens-health'], find: ['nourishment', 'nutrition', 'body mass'] },
  { say: ['ageing', 'aging', 'anti ageing', 'rasayana', 'rejuvenation'], concerns: ['rejuvenation'], find: ['ageing', 'rejuvenat', 'rasayana'] },
];
