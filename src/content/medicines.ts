/*
 * Product content for every AVVVS medicine, rewritten from the descriptions in Shopify.
 *
 * Rules this file follows (keep to them when editing):
 *  - Only uses already stated by AVVVS in Shopify are included, phrased as traditional Ayurvedic
 *    use ("traditionally used…", "supports…"), never as a cure.
 *  - Claims unsuitable for a pharmacy listing (named infectious diseases such as COVID-19 or
 *    tuberculosis, tumours, severe psychiatric or neurodegenerative conditions) were removed; each
 *    removal is recorded in `review` so AVVVS's pharmacist can decide.
 *  - Nothing is invented. Where Shopify had no description, only the form is described and
 *    `review` asks the pharmacist for the indications.
 *  - `review` is for the AVVVS team only and is never shown on the store.
 *
 * Status: rewritten 8 Nov 2026, awaiting review by AVVVS's pharmacist.
 */

export type MedicineContent = {
  /** Corrected display name, when it differs from the Shopify title. */
  name?: string;
  /** One or two plain sentences. */
  summary: string;
  /** Traditional uses, as AVVVS describes them. */
  uses: string[];
  /** How it is taken or applied, when it differs from the usual guidance for its form. */
  use?: string;
  /** Internal note for the pharmacist; not shown on the store. */
  review?: string;
};

/** Usual guidance for each dosage form; always deferring to the physician. */
export const FORM_GUIDE: Record<string, string> = {
  KASHAYAM: 'A kashayam is a concentrated herbal decoction. It is usually diluted with lukewarm boiled water and taken before food, in the dose and at the times your physician advises.',
  ARISHTAM: 'Arishtams and asavams are traditionally fermented herbal preparations. They are usually taken after food, mixed with an equal quantity of water, in the dose your physician advises.',
  THAILAM: 'A medicated oil for external application. Warm it gently before use and apply as your physician advises; some oils are meant for the head and others for the body.',
  CHOORNAM: 'A fine herbal powder. Depending on the medicine, it is taken with warm water, honey or another vehicle (anupana), or applied externally, as your physician advises.',
  LEHYAM: 'A herbal confection (lehyam) taken by mouth, usually with warm milk or water, in the quantity your physician advises.',
  GHRITHAM: 'A medicated ghee taken by mouth, usually with warm water or milk, in the dose your physician advises. When used for internal oleation (snehapana) before Panchakarma, it must be taken only under a physician’s supervision.',
  CAPSULE: 'Take with water, in the dose stated on the label or advised by your physician.',
  SYRUP: 'Shake well before use. Take in the dose stated on the label or advised by your physician.',
  LINIMENT: 'For external use only. Massage gently over the affected area. Do not apply to broken skin, and keep away from the eyes.',
  PROPRIETARY: 'Use as directed on the label or by your physician.',
};

const EXTERNAL = 'For external use only.';

export const MEDICINES: Record<string, MedicineContent> = {
  'abala-sudha': {
    summary: 'A proprietary AVVVS formulation for women’s health, traditionally used to support a healthy menstrual cycle and the reproductive system.',
    uses: ['Heavy or irregular menstrual bleeding', 'Abnormal vaginal discharge', 'Painful periods', 'Hormonal imbalance and PCOS, as supportive care', 'Low-grade, lingering fever', 'Bleeding piles', 'Urinary discomfort', 'Bone health around menopause'],
    review: 'Removed from the original list: pelvic inflammatory disease, infertility and "bleeding disorders". The original text is identical to Asokarishtam; please confirm both are correct.',
  },
  'abhayarishtam': {
    name: 'Abhayarishtam (450 ml)',
    summary: 'A classical arishtam made with haritaki (abhaya), traditionally used to support digestion and regular, comfortable bowel movements.',
    uses: ['Loss of appetite and indigestion', 'Bloating and wind', 'Constipation', 'Piles, fissures and fistula, as supportive care', 'Backache'],
  },
  'ajamamsa-rasayanam': {
    summary: 'A classical rasayana (rejuvenative) lehyam, traditionally used to build strength and stamina.',
    uses: ['General weakness and low stamina', 'Muscle wasting and emaciation'],
    review: 'Removed: "motor neuron diseases".',
  },
  'amritharishtam': {
    name: 'Amritarishtam',
    summary: 'A classical arishtam made with amrita (guduchi), traditionally used in the Ayurvedic care of fevers and to support the body’s natural immunity.',
    uses: ['Fevers, including fever after childbirth', 'Seasonal cold and cough', 'Allergies', 'Chronic aches and pains', 'Joint conditions such as rheumatoid arthritis and gout', 'Skin conditions'],
    review: 'Removed: "microbial infections, viral and bacterial".',
  },
  'amrithotharam-kashayam': {
    summary: 'A classical kashayam traditionally used in the Ayurvedic care of fevers. It is understood to help digest and clear accumulated doshas (ama).',
    uses: ['Fevers', 'Amavata (joint pain and stiffness associated with ama)'],
  },
  'aragwadhadi-kashayam': {
    summary: 'A classical kashayam traditionally used for skin conditions marked by severe itching and oozing (of the kapha type).',
    uses: ['Itchy, oozing skin conditions', 'Diabetes, as supportive care alongside your doctor’s treatment', 'Vomiting', 'Fevers'],
    review: 'Removed: "toxicity".',
  },
  'aragwadharishtam': {
    summary: 'A classical arishtam prepared with aragwadha (Indian laburnum).',
    uses: [],
    review: 'Shopify shows Amritarishtam’s indications word for word, which looks like a copy-paste error, so none are shown here. Please supply the correct indications.',
  },
  'aravindasavam': {
    summary: 'A classical asavam traditionally given to children as a general tonic for strength, appetite and healthy growth.',
    uses: ['Low immunity and frequent illness', 'Tiredness and weakness', 'Poor nourishment and slow weight gain', 'Delayed milestones, as supportive care', 'Digestive complaints'],
    review: 'Removed: "developmental disorders", "mental disorders" and "rickets".',
  },
  'ardhavilwam-kashayam': {
    summary: 'A classical kashayam traditionally used to ease inflammation, pain and swelling.',
    uses: ['Inflammatory conditions with pain and swelling', 'Fluid retention and swelling of the body', 'Anaemia', 'Sluggish bowels', 'Grahani (digestive weakness) in children'],
    review: 'Simplified "anasarca", "dropsy" and "early signs of dropsy in children".',
  },
  'arimedadi-tailam': {
    name: 'Arimedadi Thailam',
    summary: 'A classical medicated oil for oral and dental care.',
    uses: ['Bleeding or swollen gums', 'Bad breath', 'Loose teeth', 'Everyday care of the gums and teeth'],
    use: 'Used as an oral rinse (gandusha) or applied to the gums, as your physician or dentist advises. Do not swallow.',
  },
  'arjunadi-kashayam': {
    summary: 'A classical kashayam prepared with arjuna.',
    uses: [],
    review: 'Shopify has no description. Please supply the indications.',
  },
  'asanadi-kashayam': {
    name: 'Asanadigana Kashayam',
    summary: 'A classical kashayam of the asanadi group of herbs, traditionally used to support healthy metabolism.',
    uses: ['Weight management (medoharam)', 'Type 2 diabetes (prameham), as supportive care alongside your doctor’s treatment', 'Skin conditions'],
  },
  'ashtachoornam': {
    summary: 'A classical digestive powder of eight ingredients, widely used to kindle appetite and digestion.',
    uses: ['Poor appetite', 'Indigestion', 'Bloating and wind'],
  },
  'ashtavargam-kashayam': {
    summary: 'A classical kashayam traditionally used in vata disorders that affect the nerves and muscles.',
    uses: ['Vata disorders', 'Recovery after paralysis of one side of the body (pakshaghata), under a physician’s care', 'Facial palsy (ardita)', 'Generalised vata conditions (sarvangavata)', 'High blood pressure, as supportive care alongside your doctor’s treatment'],
  },
  'aswaganda-cap': {
    name: 'Ashwagandha Capsule',
    summary: 'Capsules of ashwagandha, one of Ayurveda’s best-known rasayana herbs, traditionally used for strength, vitality and calm.',
    uses: ['Male vitality and reproductive health', 'Tiredness after intimacy', 'Low mood and stress', 'Focus and mental clarity', 'Restful sleep', 'Healthy growth and strength'],
    review: 'Reworded "erectile dysfunction", "desire disorders" and "seminal abnormalities" as "male vitality and reproductive health". Please confirm this is acceptable.',
  },
  'asokarishtam': {
    summary: 'A classical arishtam made with ashoka bark, traditionally used for women’s health and the menstrual cycle.',
    uses: ['Heavy or irregular menstrual bleeding', 'Abnormal vaginal discharge', 'Painful periods', 'Hormonal imbalance and PCOS, as supportive care', 'Low-grade, lingering fever', 'Bleeding piles', 'Urinary discomfort', 'Bone health around menopause'],
    review: 'Removed: pelvic inflammatory disease, infertility and "bleeding disorders". The original text is identical to Abala Sudha.',
  },
  'aswagandha-choornam': {
    summary: 'Ashwagandha root powder, traditionally used as a rasayana for strength, vitality and calm.',
    uses: ['Male vitality and reproductive health', 'Tiredness after intimacy', 'Low mood and stress', 'Focus and mental clarity', 'Restful sleep', 'Healthy growth and strength'],
    review: 'Same text as Ashwagandha Capsule in Shopify; reworded in the same way.',
  },
  'aswagandharishtam': {
    summary: 'A classical arishtam made with ashwagandha, traditionally used as a nerve tonic and for strength and stamina.',
    uses: ['Stress, anxiety and low mood', 'Tiredness, weakness and weight loss', 'Poor sleep', 'Low immunity', 'Osteoarthritis', 'Headache and giddiness', 'Male vitality and reproductive health'],
    review: 'Removed: Parkinson’s disease, Alzheimer’s disease, dementia, "nervous breakdown", "neurological disorders", contagious fevers, erectile dysfunction and male infertility (the last two are reworded as "male vitality").',
  },
  'avipathy-choornam': {
    name: 'Avipathi Choornam',
    summary: 'A classical powder with a gentle purgative action, traditionally used to balance aggravated pitta.',
    uses: ['Constipation', 'Excess pitta, with a general burning sensation in the body', 'Burning or discomfort on passing urine'],
  },
  'avlax-capsule': {
    summary: 'A proprietary AVVVS herbal capsule for easier bowel movements.',
    uses: ['Constipation', 'Troublesome wind and bloating'],
  },
  'ayushkwatha-choornam': {
    name: 'Ayush Kwath Choornam',
    summary: 'An herbal decoction powder traditionally used to support the body’s natural immunity.',
    uses: ['Supporting natural immunity, especially in the cold and wet seasons'],
    use: 'Boiled in water to make a decoction, as stated on the label or advised by your physician.',
    review: 'Reworded "protection against various infections".',
  },
  'ayyapaladi-keram': {
    name: 'Ayyappala Keram',
    summary: 'A coconut-oil-based medicated oil (keram) for the skin and scalp.',
    uses: ['Psoriasis, as supportive care', 'Other dry, scaly skin conditions', 'Dandruff'],
    use: EXTERNAL,
  },
  'balaguloochyadi-kashayam': {
    summary: 'A classical kashayam traditionally used for joint pain and inflammation.',
    uses: ['Gout (vatarakta)', 'Other forms of arthritis'],
  },
  'balajeerakadi-kashayam': {
    summary: 'A classical kashayam traditionally used for the chest, breathing and digestion.',
    uses: ['Asthma, as supportive care', 'Chronic dry cough', 'Painful, inflamed breasts while breastfeeding', 'Body aches', 'Indigestion and wind'],
  },
  'balarishtam': {
    summary: 'A classical arishtam made with bala, traditionally used as a strengthening tonic for the nerves and muscles.',
    uses: ['Tiredness, stress and weakness', 'Nerve pain', 'Muscle weakness and pain', 'Joint inflammation and rheumatoid arthritis', 'Recovery from injury or fever', 'A general burning sensation in the body'],
    review: 'Removed: "neurological disorders".',
  },
  'balaswagandhadi-thailam': {
    summary: 'A classical medicated oil of bala and ashwagandha for the head and body, traditionally used to strengthen muscles and joints.',
    uses: ['Body pains', 'Weakness of the muscles and joints', 'Osteoarthritis and rheumatoid arthritis', 'Backache and spinal stiffness', 'Recovery after paralysis, under a physician’s care', 'Cough and breathlessness, as supportive care'],
    use: `${EXTERNAL} Applied to the head and body.`,
    review: 'Removed: tuberculosis and osteoporosis.',
  },
  'bhadradharvadi-kashayam': {
    summary: 'A classical kashayam traditionally used for rheumatic complaints and the chest.',
    uses: ['Rheumatic pain and stiffness', 'Asthma and cough, as supportive care'],
  },
  'brahmi-gritham': {
    name: 'Brahmi Ghritham',
    summary: 'A classical medicated ghee made with brahmi, traditionally used to nourish the mind and nerves.',
    uses: ['Memory and concentration', 'Stress', 'Nervous system health'],
  },
  'brihathyadi-kashayam': {
    name: 'Brihatyadi Kashayam',
    summary: 'A classical kashayam with a diuretic action, traditionally used for the urinary system.',
    uses: ['Fluid retention and swelling', 'Kidney health, as supportive care', 'Urinary tract discomfort'],
  },
  'bringarajasavam': {
    name: 'Bhringarajasavam',
    summary: 'A classical asavam made with bhringaraja, traditionally used as a general tonic and for hair health.',
    uses: ['Tiredness and weakness', 'Low immunity', 'Poor nourishment and weight loss', 'Low vitality', 'Hair fall and hair health', 'Bronchitis and breathlessness, as supportive care'],
    review: 'Removed: infertility.',
  },
  'chandanasavam': {
    summary: 'A classical asavam made with sandalwood, traditionally used for its cooling effect on the urinary system and the mind.',
    uses: ['Burning or discomfort on passing urine', 'Kidney stones, as supportive care', 'Night emissions', 'Excessive sweating', 'Stress, anxiety and poor sleep', 'Tingling and nerve discomfort', 'Abnormal vaginal discharge', 'Discomfort after menopause'],
    review: 'Removed: gonorrhoea, pyospermia and hyperthyroidism.',
  },
  'chandrashooradi-kashayam': {
    name: 'Chandrasooradi Kashayam',
    summary: 'A classical kashayam traditionally used for intestinal worms, especially in children.',
    uses: ['Intestinal worm infestation'],
  },
  'chavikasavam': {
    summary: 'A classical asavam made with chavya, traditionally used for appetite and digestion.',
    uses: ['Loss of appetite and indigestion', 'Bloating, abdominal pain and cramps', 'Constipation', 'Mouth ulcers', 'Sinus congestion and cough', 'Hiccups', 'Anaemia', 'Asthma and diabetes, as supportive care'],
  },
  'chemparathyadi-keram': {
    name: 'Chemparathyadi Keram',
    summary: 'A coconut-oil-based medicated oil (keram) made with hibiscus (chemparathi), for the skin and scalp.',
    uses: ['Eczema', 'Other skin conditions of the head and body'],
    use: `${EXTERNAL} Applied to the head and body.`,
  },
  'chiruvilwadi-kashayam': {
    summary: 'A classical kashayam traditionally used for anorectal complaints and digestion.',
    uses: ['Piles', 'Anal fissure and fistula, as supportive care', 'Abdominal lumps and discomfort (gulma)', 'Poor appetite'],
  },
  'chyavanaprasam': {
    name: 'Chyavanaprash',
    summary: 'The classical rasayana confection, traditionally taken as a nourishing tonic for strength, vitality and immunity.',
    uses: ['General nourishment and rejuvenation', 'Supporting natural immunity', 'Healthy ageing', 'Recovery from weakening illness'],
  },
  'dadimadi-gritham': {
    name: 'Dadimadi Ghritham',
    summary: 'A classical medicated ghee made with pomegranate, traditionally used to strengthen digestion and nourish the body.',
    uses: ['Poor appetite, digestion and absorption', 'Anaemia', 'Piles', 'Disorders of the spleen', 'Heart health, as supportive care', 'Care during pregnancy and preparation for childbirth, under a physician’s care'],
    review: 'Removed: infertility. "Preventing complications of labour" is reworded as care during pregnancy.',
  },
  'dadimashtaka-choornam': {
    summary: 'A classical digestive powder made with pomegranate, traditionally used for appetite and digestion.',
    uses: ['Poor appetite, digestion and absorption', 'Indigestion, wind and other stomach complaints', 'Loose stools', 'Regular bowel movements'],
  },
  'danthyarishtam': {
    summary: 'A classical arishtam made with danti, traditionally used for digestion and the bowels.',
    uses: ['Indigestion', 'Chronic constipation', 'Piles and other anorectal complaints', 'Fluid retention and swelling', 'Enlargement of the spleen, as supportive care'],
    review: 'Removed: tumours and ascites.',
  },
  'dasamoola-haritaki': {
    summary: 'A classical lehyam of the ten roots (dasamoola) and haritaki, traditionally used for chronic inflammation and fluid retention.',
    uses: ['Chronic inflammatory conditions', 'Fluid retention and swelling', 'Rheumatoid arthritis', 'Weakness, weight loss and poor nourishment', 'Anaemia', 'Fever', 'Bronchial asthma, as supportive care', 'Urinary discomfort', 'Liver health', 'Constipation and bloating'],
    review: 'Removed: chronic kidney disease, drug side effects, obesity, bleeding disorders, seminal abnormalities and abdominal growths.',
  },
  'dasamoola-katuthrayam-kashayam': {
    summary: 'A classical kashayam of the ten roots (dasamoola) with the three pungents (trikatu), traditionally used for the chest and breathing.',
    uses: ['Bronchial asthma, as supportive care', 'Cough and bronchitis', 'Chest pain that comes with respiratory complaints'],
    review: 'Chest pain should always be seen by a doctor; consider whether to keep this.',
  },
  'dasamoolam-kashayam': {
    summary: 'A classical kashayam of the ten roots (dasamoola), traditionally used to balance vata and kapha together.',
    uses: ['Nerve-related complaints', 'Fluid retention and swelling', 'Muscle and joint problems'],
  },
  'dasamoolarishtam': {
    summary: 'A classical arishtam of the ten roots (dasamoola), widely used as a strengthening tonic, especially after childbirth.',
    uses: ['A general strengthening tonic', 'Care after childbirth', 'Tiredness and low immunity', 'Muscle weakness', 'Arthritis', 'Lingering fevers', 'Urinary complaints', 'Bronchitis'],
    review: 'Removed: muscular dystrophy and "neurological disorders".',
  },
  'desire-capsule': {
    summary: 'A proprietary AVVVS herbal capsule for male vitality.',
    uses: ['Male vitality and stamina', 'Low libido', 'Night emissions', 'Performance anxiety and low mood'],
    review: 'Reworded erectile dysfunction, premature ejaculation and "sexual performance". Please check against the rules on advertising remedies before publishing.',
  },
  'dhanadanayanadi-kashayam': {
    summary: 'A classical kashayam traditionally used in vata conditions affecting the nerves.',
    uses: ['Nerve-related complaints'],
  },
  'dhanwantharam-kuzhambu': {
    summary: 'A classical medicated oil-and-ghee preparation (kuzhambu), richer than Dhanwantharam Thailam, used for massage in vata conditions and in care during and after pregnancy.',
    uses: ['Vata disorders', 'Pain, swelling and stiffness of the muscles and joints', 'Arthritis, knee pain and backache', 'Spondylosis', 'Recovery after paralysis, under a physician’s care', 'Tiredness and loss of muscle strength', 'Massage during pregnancy and after childbirth'],
    use: `${EXTERNAL} Used for massage.`,
    review: 'Removed: quadriplegia, hernia, urinary retention and "gynaecological disorders".',
  },
  'dhanwantharam-thailam': {
    summary: 'One of the best-known classical oils of Kerala, used for massage in vata conditions and in care during and after pregnancy.',
    uses: ['Vata disorders', 'Pain, swelling and stiffness of the muscles and joints', 'Arthritis, knee pain and backache', 'Spondylosis', 'Recovery after paralysis, under a physician’s care', 'Tiredness and loss of muscle strength', 'Massage during pregnancy and after childbirth'],
    use: `${EXTERNAL} Used for massage.`,
    review: 'Removed: quadriplegia, hernia, urinary retention and "gynaecological disorders".',
  },
  'dhanwantharam-kashayam': {
    name: 'Dhanwantharam Kashayam',
    summary: 'A classical kashayam traditionally used to balance vata and kapha together.',
    uses: ['Nerve-related complaints', 'Fluid retention and swelling', 'Muscle and joint problems'],
    review: 'The Shopify title is misspelt "Dhanwatharam".',
  },
  'diastat-capsule': {
    summary: 'A proprietary AVVVS herbal capsule for healthy blood sugar.',
    uses: ['Type 2 diabetes, as supportive care alongside diet, exercise and your doctor’s treatment'],
    use: 'Take as directed. Do not stop or change any medicine your doctor has prescribed.',
    review: 'Diabetes is a sensitive claim under Indian advertising rules for remedies; please confirm the wording.',
  },
  'digenol-syrup': {
    summary: 'A proprietary AVVVS digestive syrup.',
    uses: ['Indigestion and loss of appetite', 'Functional dyspepsia', 'Recovery after illness'],
  },
  'drakshadi-kashayam': {
    summary: 'A classical kashayam made with grapes (draksha), traditionally used for its cooling effect in pitta conditions.',
    uses: ['Fever of the pitta type', 'A burning sensation in the body', 'Burning or discomfort on passing urine', 'Tiredness'],
  },
  'draksharishtam': {
    summary: 'A classical arishtam made with grapes (draksha), traditionally used as a gentle, nourishing tonic.',
    uses: ['A general strengthening tonic', 'Poor nourishment and anaemia', 'Stress, anxiety and poor sleep', 'Fevers', 'Cough and cold', 'Bronchial asthma, as supportive care', 'Constipation'],
    review: 'Removed: tuberculosis.',
  },
  'dhurdhurapatradi-keram-200-ml': {
    name: 'Durdurapatradi Keram (200 ml)',
    summary: 'A coconut-oil-based medicated oil (keram) for the scalp.',
    uses: ['Dandruff', 'An itchy scalp', 'Hair fall'],
    use: `${EXTERNAL} Applied to the scalp.`,
  },
  'dusparshakadi-kashayam': {
    name: 'Dusparsakadi Kashayam',
    summary: 'A classical kashayam traditionally used for conditions of apana vata, the downward-moving vata.',
    uses: ['Piles', 'Anal fistula, as supportive care', 'Constipation'],
  },
  'eladi-choornam': {
    summary: 'A classical herbal powder made with cardamom (ela), used externally for skin care.',
    uses: ['Itchy skin, rashes and skin allergies', 'Insect bites and skin irritation', 'Acne, boils and blemishes', 'Blackheads and whiteheads', 'Uneven pigmentation, tanning and dark circles', 'Dull or tired-looking skin'],
    use: `${EXTERNAL} Usually mixed into a paste with water, rose water or milk and applied to the skin, as your physician advises.`,
    review: 'Removed: poison contact, toxic chemical contact, abscess and fungal infections.',
  },
  'eladi-keram': {
    summary: 'A coconut-oil-based medicated oil (keram) made with cardamom (ela), for the skin of the head and body.',
    uses: ['Skin conditions of the vata and kapha type', 'Eczema and boils on the scalp in children', 'A healthy complexion and skin'],
    use: `${EXTERNAL} Applied to the head and body.`,
  },
  'elakanadi-kashayam': {
    summary: 'A classical kashayam traditionally used for the chest, breathing and digestion.',
    uses: ['Supporting natural immunity', 'Allergic cough, breathlessness and asthma, as supportive care', 'Allergic runny nose', 'Indigestion'],
  },
  'gandharvahasthadi-castor-oil': {
    name: 'Gandharvahastadi Castor Oil',
    summary: 'A classical castor-oil preparation used for therapeutic purgation (virechana) in vata conditions.',
    uses: ['Vata conditions', 'Backache', 'Sciatica'],
    use: 'Taken by mouth for purgation, only in the dose and at the time your physician prescribes.',
  },
  'gandharvahasthadi-kashayam': {
    summary: 'A classical kashayam made with castor root (gandharvahasta), traditionally used to calm vata and ease the bowels.',
    uses: ['Constipation', 'Poor appetite', 'Back pain', 'Sciatica', 'Nerve-related complaints'],
  },
  'gokshura-choornam': {
    summary: 'Gokshura powder, traditionally used for the kidneys and the urinary system.',
    uses: ['Kidney and urinary health', 'Burning or difficulty on passing urine', 'Kidney stones, as supportive care', 'Osteoarthritis and gout', 'Male vitality'],
  },
  'gudoochiparpatakadi-kashayam': {
    summary: 'A classical kashayam prepared with guduchi and parpataka.',
    uses: [],
    review: 'Shopify has no description. Please supply the indications.',
  },
  'guggulupachapalam-choornam': {
    summary: 'A classical herbal powder made with guggulu.',
    uses: ['Skin conditions', 'Bloating', 'Intestinal worms', 'High cholesterol and weight management, as supportive care', 'Slow-healing wounds, including varicose and diabetic ulcers, under a physician’s care', 'Anal fistula and sinus wounds, as supportive care'],
    review: 'Removed: abdominal tumour.',
  },
  'gugguluthikthakam-kashayam': {
    summary: 'A classical kashayam of bitter herbs with guggulu, widely used for inflammation of the joints, bones and skin.',
    uses: ['Inflammation of the joints, bones and connective tissue', 'Rheumatoid arthritis and gout', 'Cervical and lumbar spondylosis', 'Psoriasis, eczema, dermatitis and hives', 'Boils and scabies', 'Slow-healing wounds, abscesses and fistula, as supportive care', 'Anaemia'],
    review: 'Removed: syphilis.',
  },
  'gugguluthikthaka-ghritham': {
    name: 'Guggulutiktaka Ghritham',
    summary: 'A classical medicated ghee of bitter herbs with guggulu, traditionally used for the joints, bones and skin.',
    uses: ['Rheumatoid arthritis and other rheumatic complaints', 'Skin conditions', 'Softening of the bones', 'Anal fistula and sinus wounds, as supportive care', 'Chronic sinusitis', 'Nerve-related complaints'],
    review: 'Removed: tuberculosis and cervical lymphadenitis.',
  },
  'guloochyadi-kashayam': {
    summary: 'A classical kashayam made with guduchi, traditionally used where pitta and kapha are aggravated.',
    uses: ['Fever', 'Vomiting', 'A burning sensation in the body', 'Poor appetite'],
  },
  'hepro': {
    name: 'Hepro Capsule',
    summary: 'A proprietary AVVVS herbal capsule for liver health.',
    uses: ['Supporting healthy liver function', 'Fatty liver, as supportive care alongside your doctor’s treatment', 'Recovery after liver illness, under a doctor’s care'],
    review: 'Removed: treatment and rehabilitation claims for hepatitis A and B and cirrhosis.',
  },
  'himasagara-thailam': {
    summary: 'A classical cooling medicated oil for the head and body, traditionally used in vata conditions.',
    uses: ['Conditions of the nerves and muscles', 'Headache', 'Poor sleep', 'Low mood and tiredness'],
    use: `${EXTERNAL} Applied to the head and body.`,
  },
  'hinguvachadi-choornam': {
    summary: 'A classical digestive powder made with asafoetida (hingu), traditionally used for digestion and abdominal discomfort.',
    uses: ['Loss of appetite, aversion to food and nausea', 'Indigestion and bloating', 'Abdominal cramps and colic', 'Constipation and piles', 'Poor absorption', 'Painful or irregular periods', 'PCOS and weight management, as supportive care'],
    review: 'Removed: hydrocele, ureteric colic, urine retention and amenorrhoea.',
  },
  'indukantham-ghritham': {
    name: 'Indukantham Ghritham',
    summary: 'A classical medicated ghee, traditionally used to build strength and support natural immunity.',
    uses: ['Supporting natural immunity and strength', 'Weakness after long illness', 'Nerve-related complaints', 'Recurring fevers', 'Abdominal pain'],
    review: 'Removed: ascites.',
  },
  'indukantham-kashayam': {
    summary: 'A classical kashayam that aids digestion and calms vata.',
    uses: ['Digestion', 'Nerve-related complaints', 'Abdominal pain', 'Supporting natural immunity and strength', 'Lingering fever (jeerna jwara)'],
    review: 'Removed: ascites.',
  },
  'jatamayadi-choornam': {
    summary: 'A classical herbal powder traditionally used to ease swelling and inflammation of the joints.',
    uses: ['Gout (vatarakta)', 'Rheumatoid arthritis (amavata)', 'Rheumatic pain and swelling'],
    use: 'Usually made into a paste and applied over the affected joints, as your physician advises.',
    review: 'The original said this "cures" gout and rheumatoid arthritis; reworded. Please confirm external use.',
  },
  'jeerakarishtam': {
    name: 'Jeerakadyarishtam',
    summary: 'A classical arishtam made with cumin (jeeraka), widely used in care after childbirth and for digestion.',
    uses: ['Care after childbirth', 'Fever after childbirth', 'Low breast-milk supply', 'Loss of appetite, acidity and indigestion', 'Abdominal cramps, bloating and wind', 'Constipation', 'Period pain'],
  },
  'jeevana': {
    summary: 'A proprietary AVVVS herbal confection, taken as a nourishing tonic for all ages.',
    uses: ['General weakness and tiredness', 'Anaemia', 'Weakness in older age', 'Loss of appetite', 'Recovery after illness', 'Care after childbirth', 'Healthy growth in children'],
  },
  'jeevantyadi-kashayam': {
    summary: 'A classical kashayam traditionally used for skin conditions with boils, blisters or burning.',
    uses: ['Skin eruptions with boils or blisters, including herpes, chickenpox and measles, as supportive care', 'Itchy skin', 'A burning sensation', 'Boils and carbuncles in diabetes, under a doctor’s care'],
  },
  'kalyana-gulam': {
    summary: 'A classical herbal confection (gulam) with a gentle laxative action, suitable in every season.',
    uses: ['Constipation', 'Skin conditions', 'Piles and fistula, as supportive care', 'Jaundice, as supportive care'],
    review: 'Removed: ascites and infertility.',
  },
  'kalyanakam-ghritham': {
    name: 'Kalyanaka Ghritham',
    summary: 'A classical medicated ghee, widely used for the mind and the nervous system.',
    uses: ['Mind–body (psychosomatic) complaints', 'Memory, intellect and concentration', 'Breathlessness and anaemia, as supportive care'],
    review: 'Removed: psychosis, epilepsy and infertility.',
  },
  'kalyanakam-kashayam': {
    summary: 'A classical kashayam traditionally used for the mind and nervous system.',
    uses: ['Mind–body (psychosomatic) complaints', 'Anxiety', 'Poor sleep'],
    review: 'Removed: epilepsy, "psychic disorders" and infertility.',
  },
  'kanakasavam': {
    summary: 'A classical asavam traditionally used for the chest and breathing.',
    uses: ['Bronchitis and cough with phlegm', 'Bronchial asthma, as supportive care', 'Chronic chest complaints', 'Lingering fever'],
    review: 'Removed: tuberculosis and COPD.',
  },
  'kapikachu-choornam': {
    summary: 'Powder of kapikachu (Mucuna pruriens), traditionally used for male vitality and strength.',
    uses: ['Male vitality and reproductive health', 'Building strength and body mass', 'Weakness after long illness'],
    review: 'Removed: Parkinsonism and the sperm count, motility and viability claims (reworded).',
  },
  'karpasastyadi-thailam-200-ml': {
    name: 'Karpasasthyadi Thailam (200 ml)',
    summary: 'A classical medicated oil traditionally used for the neck, shoulders and arms, and for the scalp.',
    uses: ['Cervical spondylosis and pain radiating down the arm', 'Frozen shoulder', 'Recovery after paralysis, under a physician’s care', 'Dandruff, an itchy scalp and hair fall'],
    use: `${EXTERNAL} Applied to the body and the head.`,
  },
  'karpooradi-thalam-200-ml': {
    name: 'Karpooradi Thailam (200 ml)',
    summary: 'A classical medicated oil made with camphor (karpoora), used externally for painful, swollen joints.',
    uses: ['Rheumatic pain with swelling of the joints'],
    use: EXTERNAL,
    review: 'The Shopify title reads "Thalam"; Karpooradi is an oil (thailam). Please confirm.',
  },
  'kathakakhadiradi-kashayam': {
    name: 'Katakakhadiradi Kashayam',
    summary: 'A classical kashayam traditionally used to support healthy blood sugar and metabolism.',
    uses: ['High blood sugar and insulin resistance, as supportive care alongside your doctor’s treatment', 'Weight gain', 'Complications of diabetes affecting the nerves, eyes and skin, under a doctor’s care'],
    review: 'Diabetes is a sensitive claim under Indian advertising rules for remedies; please confirm the wording.',
  },
  'kanjunnyadi-keram': {
    name: 'Kayyunyadi Keram',
    summary: 'A coconut-oil-based medicated oil (keram) made with kayyunni (bhringaraja), for daily use on the head.',
    uses: ['Premature greying', 'Hair fall', 'Headache'],
    use: `${EXTERNAL} Applied to the scalp; suitable for regular use.`,
  },
  'khadirarishtam': {
    summary: 'A classical arishtam made with khadira (catechu), widely used for the skin.',
    uses: ['Skin conditions and allergies with itching and rashes', 'Acne', 'Dermatitis, psoriasis and urticaria', 'Sensitive skin', 'Leucoderma, as supportive care', 'Intestinal worms and skin parasites', 'Boils and abscesses'],
    review: 'Removed: leprosy, cysts and tumours.',
  },
  'kokilaksham-kashayam': {
    summary: 'A classical kashayam traditionally used for vatarakta and rheumatic complaints.',
    uses: ['Gout (vatarakta)', 'Rheumatoid arthritis', 'Rheumatic pain'],
  },
  'kolakulathadi-choornam': {
    summary: 'A classical herbal powder, used externally to ease pain and inflammation and to balance vata.',
    uses: ['Pain and inflammation of the joints and muscles', 'Vata imbalance'],
    use: `${EXTERNAL} Applied as a warm poultice or rubbed in dry (udvartana), as your physician advises.`,
    review: 'Please confirm this is sold for external use.',
  },
  'kottam-chukkadi-choornam': {
    name: 'Kottamchukkadi Choornam',
    summary: 'A classical herbal powder made with kottam and dry ginger (chukku), traditionally used to ease joint pain and swelling.',
    uses: ['Joint pain and swelling'],
    use: `${EXTERNAL} Usually made into a warm paste and applied over the affected area, as your physician advises.`,
    review: 'Please confirm this is sold for external use.',
  },
  'ksheerabala-thailam-200-ml': {
    name: 'Ksheerabala Thailam (200 ml)',
    summary: 'A classical medicated oil of milk and bala, widely used in vata conditions of the nerves and muscles.',
    uses: ['Nerve-related complaints', 'Vata conditions'],
    use: `${EXTERNAL} Applied to the body and the head.`,
  },
  'kumaryasavam': {
    summary: 'A classical asavam made with aloe vera (kumari), traditionally used for digestion and women’s health.',
    uses: ['Digestive complaints', 'Anaemia', 'Urinary complaints and kidney stones, as supportive care', 'Intestinal worms', 'Irregular periods and premenstrual discomfort', 'Recovery from wounds and burns'],
    review: 'Removed: epilepsy, dementia and "bleeding disorders".',
  },
  'kutajarishtam': {
    summary: 'A classical arishtam made with kutaja, widely used for the intestines.',
    uses: ['Loose stools and dysentery', 'Poor absorption (grahani)', 'Irritable bowel syndrome', 'Fevers', 'Bleeding from the back passage, which should always be checked by a doctor'],
    review: 'Removed: ulcerative colitis and "chronic disease".',
  },
  'lakshadi-thailam': {
    summary: 'A classical medicated oil made with lac (laksha), especially used for massage in children, during pregnancy and after childbirth.',
    uses: ['Massage for babies and children', 'Massage during pregnancy and for nursing mothers', 'Weakness after long illness'],
    use: `${EXTERNAL} Used for massage.`,
    review: 'Removed: epilepsy and "psychic problems".',
  },
  'lakshol': {
    summary: 'A proprietary AVVVS pain-relief oil for the muscles and joints, suitable for medical and sports massage.',
    uses: ['Muscle pain', 'Joint pain and inflammation', 'Low back pain', 'Arthritis', 'Sprains and stiffness', 'Sports injuries'],
    use: `${EXTERNAL} Massage gently into the skin over the affected area.`,
  },
  'lohasavam': {
    summary: 'A classical asavam prepared with iron (loha), traditionally used for anaemia and the liver.',
    uses: ['Iron-deficiency anaemia', 'Jaundice and liver health, as supportive care', 'Weight management', 'Fluid retention and swelling'],
    review: 'Removed: ascites and tumours.',
  },
  'mahamanjishtadi-kashayam': {
    summary: 'A classical kashayam made with manjishta, widely used for the skin and the blood.',
    uses: ['Skin conditions', 'Allergic dermatitis', 'Rheumatoid arthritis and gout', 'Healing of wounds'],
  },
  'mahamasha-thailam-200ml': {
    name: 'Mahamasha Thailam (200 ml)',
    summary: 'A classical medicated oil made with black gram (masha), traditionally used to tone the muscles and nerves.',
    uses: ['Nerve-related complaints', 'Recovery after paralysis or palsy, under a physician’s care', 'Sciatica', 'Muscle wasting'],
    use: EXTERNAL,
  },
  'maharasnadi-kashayam': {
    summary: 'A classical kashayam made with rasna, widely used for pain and stiffness of the nerves, muscles and joints.',
    uses: ['Recovery after paralysis or facial palsy, under a physician’s care', 'Sciatica and low back pain', 'Muscle spasm', 'Rheumatoid arthritis and gout', 'Bursitis and fibromyalgia', 'Frozen shoulder'],
  },
  'mahathikthakam-kashayam': {
    name: 'Mahatiktakam Kashayam',
    summary: 'A classical kashayam of bitter herbs.',
    uses: [],
    review: 'Shopify has no description. Please supply the indications.',
  },
  'mahathikthakam-gritham': {
    name: 'Mahatiktakam Ghritham',
    summary: 'A classical medicated ghee of bitter herbs, often chosen for pitta conditions.',
    uses: ['Skin conditions, including internal oleation (snehapana) under a physician’s supervision', 'Itching and eczema', 'Boils and abscesses', 'Recovery from burns'],
  },
  'manjishtadi-kashayam': {
    summary: 'A classical kashayam made with manjishta.',
    uses: ['Gout (vatarakta) in its early stages', 'Skin conditions', 'Urticaria and rashes'],
  },
  'menocare-capsule': {
    summary: 'A proprietary AVVVS herbal capsule for menstrual health.',
    uses: ['Painful periods', 'Irregular periods', 'Heavy periods'],
    review: 'Removed: "dysfunctional uterine bleeding" (covered by "heavy periods").',
  },
  'mezhuthailam': {
    name: 'Mezhu Thailam',
    summary: 'A classical medicated oil for the muscles and joints, suitable for medical and sports massage.',
    uses: ['Muscle pain', 'Joint inflammation', 'Low back pain', 'Arthritis', 'Sprains and stiffness'],
    use: `${EXTERNAL} Used for massage.`,
  },
  'murivenna': {
    summary: 'A classical Kerala oil for injuries, widely used on sprains, bruises and minor wounds.',
    uses: ['Injuries, sprains and bruises', 'Joint pain', 'Recovery from fractures and dislocations, after medical treatment', 'Minor cuts, wounds and burns'],
    use: EXTERNAL,
    review: '"IVDP" (disc prolapse) removed. Fractures and dislocations need medical treatment first; the wording says so.',
  },
  'musalikhadiradi-kashayam': {
    summary: 'A classical kashayam traditionally used for women’s health.',
    uses: ['Abnormal vaginal discharge (leucorrhoea)', 'Heavy periods', 'Other gynaecological complaints'],
  },
  'mustharishtam': {
    name: 'Mustarishtam',
    summary: 'A classical arishtam made with musta, traditionally used as a digestive tonic, especially for children.',
    uses: ['A general tonic for children', 'Digestive upsets during weaning', 'Loss of appetite and indigestion in children', 'Loose stools and dysentery', 'Poor absorption (grahani)', 'Irritable bowel syndrome', 'Gastroenteritis, as supportive care'],
  },
  'nadi-kashayam': {
    summary: 'A kashayam traditionally used in vata conditions affecting the nerves.',
    uses: ['Nerve-related complaints'],
  },
  'nalpamaradi-keram': {
    summary: 'A coconut-oil-based medicated oil (keram) made from the bark of four milky trees (nalpamara), used for pitta-type skin conditions and complexion.',
    uses: ['Pitta-type skin conditions', 'Eczema', 'Skin inflammation and redness'],
    use: EXTERNAL,
    review: 'Removed: erysipelas.',
  },
  'nayopayam-kashayam': {
    summary: 'A classical kashayam traditionally used for the chest and breathing.',
    uses: ['Breathlessness and asthma, as supportive care', 'Cough', 'Bronchitis'],
  },
  'neelibringadi-keram': {
    summary: 'A classical hair oil of neeli and bhringaraja in coconut oil, used to nourish the hair and scalp.',
    uses: ['Healthy hair growth', 'Hair fall', 'Premature greying', 'A cooling, refreshing feel for the eyes and head'],
    use: `${EXTERNAL} Applied to the scalp.`,
  },
  'nimbadi-choornam': {
    summary: 'A classical herbal powder made with neem (nimba), traditionally used to purify the blood and for the skin.',
    uses: ['Skin conditions', 'Purifying the blood', 'Acidity and acid peptic complaints'],
  },
  'nimbadi-kashayam': {
    summary: 'A classical kashayam made with neem (nimba), widely used to purify the blood.',
    uses: ['Skin conditions and acne', 'Urticaria', 'Fever', 'Acidity and acid peptic complaints'],
  },
  'nisakathakadi-kashayam': {
    summary: 'A classical kashayam prepared with turmeric (nisha) and kataka.',
    uses: [],
    review: 'Shopify has no description. Please supply the indications.',
  },
  'padolakaturohinyadi-kashayam': {
    summary: 'A classical kashayam made with patola and katuki, traditionally used for the liver and skin.',
    uses: ['Liver health, as supportive care', 'Jaundice, as supportive care', 'Skin conditions', 'Urticaria and rashes', 'Some types of fever'],
    review: 'Removed: "all types of hepatic disorders" and "latent toxicity".',
  },
  'palashadi-kashayam': {
    summary: 'A classical kashayam prepared with palasha.',
    uses: [],
    review: 'Shopify has no description. Please supply the indications.',
  },
  'panchakola-choornam': {
    summary: 'A classical powder of five pungent herbs (panchakola), traditionally used to kindle digestion.',
    uses: ['Poor appetite and digestion', 'Wind and bloating', 'Fever and body aches, as supportive care'],
  },
  'pachathikthakam-kashayam': {
    name: 'Panchatiktakam Kashayam',
    summary: 'A classical kashayam of five bitter herbs (panchatikta), traditionally used in the Ayurvedic care of fevers.',
    uses: ['Fever with chills', 'Lingering or recurring fever', 'Supporting natural immunity'],
    review: 'Removed: malarial fever.',
  },
  'partharishtam': {
    name: 'Parthadyarishtam',
    summary: 'A classical arishtam made with arjuna (partha), traditionally used for the heart and circulation.',
    uses: ['Heart health, as supportive care alongside your doctor’s treatment', 'High blood pressure and cholesterol, as supportive care', 'Breathlessness', 'Tiredness and anaemia'],
    review: 'Heart disease and high blood pressure are sensitive claims under Indian advertising rules for remedies; please confirm the wording.',
  },
  'patadi-kashayam': {
    summary: 'A classical kashayam prepared with patha.',
    uses: [],
    review: 'Shopify has no description. Please supply the indications.',
  },
  'pathyakshadathryadi-kashayam': {
    summary: 'A classical kashayam of haritaki, vibhitaki and amalaki with other herbs, widely used for headaches.',
    uses: ['Headaches, including migraine', 'Ear complaints', 'Chronic throat irritation'],
  },
  'patolamooladi-kashayam': {
    summary: 'A classical kashayam made with patola root, used for therapeutic purgation in chronic skin conditions.',
    uses: ['Chronic, severe skin conditions, for purgation under a physician’s supervision', 'Leucoderma, as supportive care', 'Jaundice, under a doctor’s care'],
    use: 'Has a purgative action. Take only in the dose your physician prescribes.',
  },
  'phalasarpis': {
    summary: 'A classical medicated ghee traditionally used for women’s and men’s reproductive health.',
    uses: ['Gynaecological complaints', 'Male reproductive health', 'Nourishment and intellect', 'Care before and during pregnancy, under a physician’s care (pumsavana)'],
    review: 'Removed: "enhances conception rate" and "seminal abnormalities" (reworded).',
  },
  'pindathailam': {
    name: 'Pinda Thailam',
    summary: 'A classical cooling medicated oil traditionally used for painful, hot and swollen joints.',
    uses: ['Gout (vatarakta)', 'Pain, swelling and a burning sensation in the joints', 'Improving the range of movement'],
    use: EXTERNAL,
  },
  'pippalyasavam': {
    summary: 'A classical asavam made with long pepper (pippali), traditionally used for digestion and absorption.',
    uses: ['Indigestion and poor absorption', 'Fatty liver and liver health, as supportive care', 'Wind and intestinal colic', 'Piles', 'Anaemia'],
    review: 'Removed: tuberculosis and ascites.',
  },
  'prasaranyadi-kashayam': {
    summary: 'A classical kashayam prepared with prasarani.',
    uses: [],
    review: 'Shopify has no description. Please supply the indications.',
  },
  'prasoothikasudha': {
    name: 'Prasoothika Sudha',
    summary: 'A proprietary AVVVS preparation for care after childbirth.',
    uses: ['Care after childbirth', 'Restoring energy and strength'],
  },
  'prasoothikamritha-rasayanam': {
    summary: 'A proprietary AVVVS rasayana for care after childbirth.',
    uses: ['Care after childbirth', 'Restoring energy, strength and natural beauty'],
  },
  'punarnavadi-kashayam': {
    summary: 'A classical kashayam made with punarnava, traditionally used for fluid retention.',
    uses: ['Fluid retention and generalised swelling'],
  },
  'punarnavasavam': {
    summary: 'A classical asavam made with punarnava, traditionally used for swelling, the joints and the liver.',
    uses: ['Fluid retention and swelling', 'Anaemia', 'Rheumatoid arthritis, gout and osteoarthritis', 'Liver health, as supportive care', 'Recovery from injuries, sprains and fractures, after medical treatment'],
    review: 'Removed: ascites, autoimmune disorders, chronic infections and "chronic morbid diseases".',
  },
  'pushyanuga-choornam': {
    summary: 'A classical powder widely used for women’s health and for loose stools.',
    uses: ['Heavy or irregular menstrual bleeding', 'Abnormal vaginal discharge', 'Loose stools and dysentery', 'Bleeding piles', 'Nosebleeds', 'Poor absorption (grahani)'],
    review: 'Removed: "bleeding disorders" and candidiasis.',
  },
  'rasnadi-choornam-10-gm': {
    name: 'Rasnadi Choornam (10 g)',
    summary: 'A classical herbal powder applied to the crown of the head after bathing (thalam), traditionally used for the head and sinuses.',
    uses: ['Colds and a runny nose', 'Sinus congestion and headache', 'Earache and sore throat', 'Giddiness', 'Use as thalam during Panchakarma'],
    use: `${EXTERNAL} A pinch is applied to the crown of the head after bathing.`,
  },
  'rasnadi-choornam-50-gm': {
    name: 'Rasnadi Choornam (50 g)',
    summary: 'A classical herbal powder applied to the crown of the head after bathing (thalam), traditionally used for the head and sinuses.',
    uses: ['Colds and a runny nose', 'Sinus congestion and headache', 'Earache and sore throat', 'Giddiness', 'Use as thalam during Panchakarma'],
    use: `${EXTERNAL} A pinch is applied to the crown of the head after bathing.`,
  },
  'rasnadi-kashayam': {
    summary: 'A classical kashayam made with rasna, traditionally used for pain and stiffness of the nerves, muscles and joints.',
    uses: ['Recovery after paralysis or facial palsy, under a physician’s care', 'Sciatica and low back pain', 'Muscle spasm', 'Rheumatoid arthritis and gout', 'Bursitis and fibromyalgia', 'Frozen shoulder'],
    review: 'Same text as Maharasnadi Kashayam in Shopify; please confirm.',
  },
  'rasnairandadi-kashayam': {
    summary: 'A classical kashayam made with rasna and castor root (eranda).',
    uses: ['Gout (vatarakta)', 'Rheumatic pain affecting several joints', 'Some nerve-related complaints'],
  },
  'rasnapanchakam-kashayam': {
    summary: 'A classical kashayam of five herbs led by rasna.',
    uses: ['Gout (vatarakta)', 'Rheumatic pain affecting several joints', 'Some nerve-related complaints'],
    review: 'Same text as Rasnairandadi Kashayam in Shopify; please confirm.',
  },
  'rasnasapthakam-kashayam': {
    name: 'Rasnasaptakam Kashayam',
    summary: 'A classical kashayam of seven herbs led by rasna.',
    uses: ['Rheumatic complaints', 'Back pain', 'Frozen shoulder', 'Other muscle and joint complaints'],
  },
  'rasonadi-kashayam': {
    summary: 'A classical kashayam made with garlic (rasona).',
    uses: ['Breathlessness', 'Heart health, as supportive care alongside your doctor’s treatment', 'Painful wind'],
  },
  'red-irons-syrup': {
    name: 'Red Irons Syrup',
    summary: 'A proprietary AVVVS iron supplement.',
    uses: ['Iron-deficiency anaemia', 'Extra nourishment for children', 'Pregnancy and breastfeeding, on a doctor’s advice', 'Recovery after illness', 'Older people, and people who are physically very active'],
  },
  'red-irons-capsule': {
    summary: 'A proprietary AVVVS iron supplement in capsule form.',
    uses: ['Iron-deficiency anaemia', 'Extra nourishment', 'Pregnancy and breastfeeding, on a doctor’s advice', 'Recovery after illness', 'Older people, and people who are physically very active'],
    review: 'The Shopify text ends with a sentence from Brihatyadi Kashayam ("An excellent diuretic…"); it has been dropped. Please fix it in Shopify too.',
  },
  'relieve-o': {
    name: 'Relieve-O Capsule',
    summary: 'A proprietary AVVVS herbal capsule traditionally used to support recovery from seasonal fevers and colds.',
    uses: ['Seasonal fever, as supportive care', 'Common cold', 'Sinus congestion', 'Supporting natural immunity'],
    review: 'Removed: COVID-19 and viral infections. Disease-specific claims of this kind are not permitted for this product.',
  },
  'rich-meal': {
    summary: 'A balanced, easily digested and tasty health food from AVVVS, for all ages and suitable as an everyday breakfast.',
    uses: ['Daily nutrition, with protein, carbohydrates and vitamins', 'Poor nourishment', 'Extra iron and vitamins in the diet', 'Healthy growth and brain development in children'],
    use: 'Mix with warm milk or water as directed on the pack.',
  },
  'rujanth-linment': {
    name: 'Rujanth Liniment',
    summary: 'A proprietary AVVVS pain-relief liniment for the muscles, joints and nerves.',
    uses: ['Muscle, joint and nerve pain', 'Swelling', 'Cervical spondylosis', 'Rheumatoid arthritis and osteoarthritis', 'Injuries and sprains'],
    review: '"Fractures" removed; they need medical treatment.',
  },
  'rujanth-capsule': {
    summary: 'A proprietary AVVVS herbal capsule for pain and inflammation.',
    uses: ['Muscle, joint and nerve pain', 'Swelling', 'Cervical spondylosis', 'Rheumatoid arthritis and osteoarthritis', 'Recovery from injuries and sprains'],
    review: '"Fractures" removed; they need medical treatment.',
  },
  'sahacharabaladi-kashayam': {
    summary: 'A classical kashayam made with sahachara and bala, traditionally used for the lower back and legs.',
    uses: ['Weakness of the legs, under a physician’s care', 'Sciatica', 'Backache'],
  },
  'sahacharadi-kashayam': {
    summary: 'A classical kashayam made with sahachara, traditionally used for the lower back and legs.',
    uses: ['Weakness of the legs, under a physician’s care', 'Sciatica', 'Backache'],
    review: 'Same text as Sahacharabaladi Kashayam in Shopify; please confirm.',
  },
  'sahacharadi-thailam': {
    summary: 'A classical medicated oil made with sahachara, traditionally used in vata conditions of the limbs.',
    uses: ['Vata conditions', 'Cramps and stiffness of the limbs'],
    use: EXTERNAL,
  },
  'sapthasaram-kashayam': {
    name: 'Saptasaram Kashayam',
    summary: 'A classical kashayam of seven herbs, traditionally used for menstrual and digestive complaints.',
    uses: ['Heavy or irregular periods', 'Painful periods', 'Constipation', 'Colicky abdominal pain'],
  },
  'saraswatharishtam': {
    name: 'Saraswatarishtam',
    summary: 'A classical arishtam made with brahmi, traditionally used for the mind, memory and voice.',
    uses: ['Memory and concentration', 'Learning and studies', 'Tiredness', 'Anxiety and poor sleep', 'Voice and speech', 'Supporting natural immunity'],
    review: 'Removed: epilepsy, schizophrenia, autism spectrum disorders, Alzheimer’s disease, dementia, phobia, "mental disorders", "developmental disorders", infertility and atrophy.',
  },
  'saribadyasavam': {
    summary: 'A classical asavam made with sariba (Indian sarsaparilla), traditionally used to purify the blood and for the skin.',
    uses: ['Acne, pimples and boils', 'Dermatitis, eczema and psoriasis', 'Fungal skin infections such as ringworm, as supportive care', 'Itching in the genital area', 'Rheumatoid arthritis and gout', 'Slow-healing wounds, including diabetic ulcers, under a doctor’s care', 'Cracked heels'],
    review: 'Removed: "genital infections" (itching kept), abscess and fistula.',
  },
  'satavari-gulam': {
    name: 'Shatavari Gulam',
    summary: 'A classical herbal confection made with shatavari, widely used for women’s health and to cool aggravated vata and pitta.',
    uses: ['Burning or discomfort on passing urine', 'Heavy or irregular periods', 'Abnormal vaginal discharge and burning', 'Low breast-milk supply', 'Giddiness', 'A burning sensation in the abdomen or feet', 'Women’s reproductive health'],
    review: 'Removed: jaundice, phthisis, chronic nephritis, albuminuria, "bleeding disorders", female infertility and "female sexual problems" (reworded).',
  },
  'slepan-capsule': {
    name: 'Slepan Capsule',
    summary: 'A proprietary AVVVS herbal capsule for calm and restful sleep.',
    uses: ['Stress and anxiety', 'Poor sleep', 'Tension headache'],
  },
  'sukumara-ghritham': {
    name: 'Sukumara Ghritham',
    summary: 'A classical medicated ghee widely used for women’s health.',
    uses: ['Heavy or irregular periods', 'Painful periods'],
    review: 'Removed: hernia.',
  },
  'sukumaram-kashayam': {
    summary: 'A classical kashayam widely used for women’s health and general weakness.',
    uses: ['Gynaecological complaints', 'Painful periods', 'General weakness', 'Rheumatic complaints'],
    review: 'Removed: hernia.',
  },
  'thaleesadi-choornam': {
    name: 'Talisadi Choornam',
    summary: 'A classical powder made with talisa leaf, traditionally used for the chest and for appetite.',
    uses: ['Cough and bronchitis', 'Breathlessness and asthma, as supportive care', 'Loss of appetite and taste', 'Disorders of the spleen'],
  },
  'thikthaka-gritam': {
    name: 'Tiktaka Ghritham',
    summary: 'A classical medicated ghee of bitter herbs, traditionally used for the skin and in Panchakarma.',
    uses: ['Internal oleation (snehapana) and basti, under a physician’s supervision', 'Psoriasis, eczema and itching', 'Fungal skin infections, as supportive care', 'Boils and carbuncles', 'Recovery from burns and blisters', 'A burning sensation', 'Abnormal vaginal discharge', 'Eye and ear complaints, as supportive care'],
    review: 'Removed: leprosy, syphilis, herpes, malaria, communicable fevers, psychosis, microbial infections and sinus ulcers.',
  },
  'thriphaladi-keram': {
    name: 'Triphaladi Keram',
    summary: 'A coconut-oil-based medicated oil (keram) made with triphala, for the head.',
    uses: ['Recurring colds and allergic runny nose', 'Hair fall, breakage and thinning', 'Dandruff and other scalp complaints', 'Supporting the eyes, ears and throat'],
    use: `${EXTERNAL} Applied to the scalp.`,
  },
  'thikthakam-kashayam': {
    name: 'Tiktakam Kashayam',
    summary: 'A classical kashayam of bitter herbs, traditionally used for the skin and the liver.',
    uses: ['Chronic skin conditions such as psoriasis, eczema and atopic dermatitis', 'Leucoderma and melasma, as supportive care', 'Slow-healing wounds, including diabetic wounds, under a doctor’s care', 'Liver health and jaundice, under a doctor’s care', 'Irritable bowel syndrome and poor absorption', 'Excessive thirst, a burning sensation and giddiness'],
    review: 'Removed: gangrene, cervical lymphadenitis, hepatitis, psychotic conditions, intoxication, heart disease, cataract, abscess and fistulae.',
  },
  'thriphala-choornam': {
    name: 'Triphala Choornam',
    summary: 'The classical powder of three fruits (amalaki, haritaki and vibhitaki), one of Ayurveda’s best-known rasayanas.',
    uses: ['Gentle, regular bowel movements', 'Appetite and digestion', 'Rejuvenation and natural immunity', 'Eye care, as your physician advises', 'External use, as your physician advises'],
  },
  'trivrit-lehyam': {
    summary: 'A classical herbal confection made with trivrit, valued as a gentle laxative.',
    uses: ['Constipation', 'Skin conditions', 'Piles'],
  },
  'vaishwanara-choornam': {
    name: 'Vaiswanara Choornam',
    summary: 'A classical digestive powder, widely used to kindle appetite.',
    uses: ['Poor appetite', 'Easier bowel movements'],
  },
  'varanadi-kashayam': {
    summary: 'A classical kashayam made with varana, widely used for weight management and metabolism.',
    uses: ['Weight management', 'Digestion and metabolism', 'Migraine', 'Cysts, as supportive care under a doctor’s care'],
  },
  'varasanadi-kashayam': {
    summary: 'A classical kashayam traditionally used to correct digestion and metabolism.',
    uses: ['Urinary complaints', 'Skin conditions', 'Weight management', 'Digestion and metabolism'],
  },
  'vasaguloochyadi-kashayam': {
    summary: 'A classical kashayam made with vasa and guduchi, traditionally used for the liver and blood.',
    uses: ['Jaundice, as supportive care', 'Anaemia', 'Liver health'],
    review: 'Removed: "bleeding disorders" and "all hepatic conditions".',
  },
  'vasarishtam': {
    summary: 'A classical arishtam made with vasa (malabar nut), traditionally used for the chest and breathing.',
    uses: ['Cough and bronchitis', 'Breathlessness and asthma, as supportive care', 'Allergic runny nose', 'Pain, inflammation and muscle stiffness'],
    review: 'Removed: eosinophilia, haemoptysis (coughing blood needs urgent medical care) and "bleeding disorders".',
  },
  'vidaryadi-kashayam': {
    summary: 'A classical kashayam made with vidari, traditionally used to nourish and build strength where vata and pitta are aggravated.',
    uses: ['Building strength and body mass', 'Weakness after long illness', 'Chronic bronchitis and breathlessness, as supportive care'],
    review: 'Removed: COPD.',
  },
  'yashti-madhu-capsule': {
    name: 'Yashtimadhu Capsule',
    summary: 'Capsules of yashtimadhu (liquorice root), traditionally used for the throat, voice and chest.',
    uses: ['Hoarse or weak voice', 'Dry cough and sore throat', 'Breathlessness, as supportive care', 'Supporting natural immunity', 'Discomfort around menopause', 'Low mood'],
    review: 'Removed: LDL cholesterol, tuberculosis, nasal and uterine bleeding, piles and slurred speech.',
  },
  'yavadi-kashayam': {
    summary: 'A classical kashayam prepared with barley (yava).',
    uses: [],
    review: 'Shopify has no description. Please supply the indications.',
  },
};

export const medicineContent = (handle: string): MedicineContent | undefined => MEDICINES[handle];

/** The corrected display name, falling back to the Shopify title in title case. */
export function medicineName(handle: string, title: string): string {
  const n = MEDICINES[handle]?.name;
  if (n) return n;
  return title.toLowerCase().replace(/\s+/g, ' ').trim().replace(/(^|[\s\-(/&])([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase());
}
