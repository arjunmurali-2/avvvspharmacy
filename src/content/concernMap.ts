/*
 * Starting categories: which medicines appear under each concern, worked out from the uses AVVVS
 * itself lists for each medicine (see medicines.ts). A medicine can sit under several concerns.
 *
 * This is the fallback. As soon as products in Shopify carry `concern-<slug>` tags, the store uses
 * those tags instead, concern by concern. `npm run tag-concerns` copies this map into Shopify as
 * tags once AVVVS's pharmacist has approved it.
 *
 * Not yet placed anywhere, because Shopify has no description for them: arjunadi-kashayam,
 * gudoochiparpatakadi-kashayam, mahathikthakam-kashayam, nisakathakadi-kashayam,
 * palashadi-kashayam, patadi-kashayam, prasaranyadi-kashayam, yavadi-kashayam and
 * aragwadharishtam (whose Shopify text belongs to another medicine).
 */

export const CONCERN_MAP: Record<string, string[]> = {
  'pain-management': [
    'amritharishtam', 'amrithotharam-kashayam', 'ardhavilwam-kashayam', 'aswagandharishtam', 'balaguloochyadi-kashayam',
    'balarishtam', 'balaswagandhadi-thailam', 'bhadradharvadi-kashayam', 'dasamoola-haritaki', 'dasamoolam-kashayam',
    'dasamoolarishtam', 'dhanwantharam-kuzhambu', 'dhanwantharam-thailam', 'dhanwantharam-kashayam',
    'gandharvahasthadi-castor-oil', 'gandharvahasthadi-kashayam', 'gokshura-choornam', 'gugguluthikthakam-kashayam',
    'gugguluthikthaka-ghritham', 'jatamayadi-choornam', 'karpasastyadi-thailam-200-ml', 'karpooradi-thalam-200-ml',
    'kokilaksham-kashayam', 'kolakulathadi-choornam', 'kottam-chukkadi-choornam', 'lakshol', 'mahamanjishtadi-kashayam',
    'mahamasha-thailam-200ml', 'maharasnadi-kashayam', 'manjishtadi-kashayam', 'mezhuthailam', 'murivenna', 'pindathailam',
    'punarnavasavam', 'rasnadi-kashayam', 'rasnairandadi-kashayam', 'rasnapanchakam-kashayam', 'rasnasapthakam-kashayam',
    'rujanth-linment', 'rujanth-capsule', 'sahacharabaladi-kashayam', 'sahacharadi-kashayam', 'sahacharadi-thailam',
    'saribadyasavam', 'sukumaram-kashayam', 'vasarishtam',
  ],
  'digestive-health': [
    'abhayarishtam', 'ardhavilwam-kashayam', 'ashtachoornam', 'avipathy-choornam', 'avlax-capsule', 'balajeerakadi-kashayam',
    'chandrashooradi-kashayam', 'chavikasavam', 'chiruvilwadi-kashayam', 'dadimadi-gritham', 'dadimashtaka-choornam',
    'danthyarishtam', 'dasamoola-haritaki', 'digenol-syrup', 'dusparshakadi-kashayam', 'elakanadi-kashayam',
    'gandharvahasthadi-kashayam', 'guggulupachapalam-choornam', 'hinguvachadi-choornam', 'indukantham-kashayam',
    'jeerakarishtam', 'kalyana-gulam', 'kumaryasavam', 'kutajarishtam', 'mustharishtam', 'nimbadi-choornam',
    'nimbadi-kashayam', 'panchakola-choornam', 'pippalyasavam', 'rasonadi-kashayam', 'sapthasaram-kashayam',
    'thaleesadi-choornam', 'thriphala-choornam', 'trivrit-lehyam', 'vaishwanara-choornam', 'varanadi-kashayam',
    'varasanadi-kashayam',
  ],
  'respiratory': [
    'amritharishtam', 'balajeerakadi-kashayam', 'balaswagandhadi-thailam', 'bhadradharvadi-kashayam', 'bringarajasavam',
    'chavikasavam', 'dasamoola-katuthrayam-kashayam', 'draksharishtam', 'elakanadi-kashayam', 'kanakasavam',
    'nayopayam-kashayam', 'pathyakshadathryadi-kashayam', 'rasnadi-choornam-10-gm', 'rasnadi-choornam-50-gm',
    'rasonadi-kashayam', 'relieve-o', 'thaleesadi-choornam', 'thriphaladi-keram', 'vasarishtam', 'vidaryadi-kashayam',
    'yashti-madhu-capsule',
  ],
  'skin-and-hair': [
    'amritharishtam', 'aragwadhadi-kashayam', 'asanadi-kashayam', 'ayyapaladi-keram', 'bringarajasavam',
    'chemparathyadi-keram', 'dhurdhurapatradi-keram-200-ml', 'eladi-choornam', 'eladi-keram', 'guggulupachapalam-choornam',
    'gugguluthikthakam-kashayam', 'gugguluthikthaka-ghritham', 'jeevantyadi-kashayam', 'kalyana-gulam', 'kanjunnyadi-keram',
    'karpasastyadi-thailam-200-ml', 'khadirarishtam', 'mahamanjishtadi-kashayam', 'mahathikthakam-gritham',
    'manjishtadi-kashayam', 'nalpamaradi-keram', 'neelibringadi-keram', 'nimbadi-choornam', 'nimbadi-kashayam',
    'padolakaturohinyadi-kashayam', 'patolamooladi-kashayam', 'saribadyasavam', 'thikthaka-gritam', 'thikthakam-kashayam',
    'thriphaladi-keram', 'trivrit-lehyam', 'varasanadi-kashayam',
  ],
  'womens-health': [
    'abala-sudha', 'asokarishtam', 'balajeerakadi-kashayam', 'chandanasavam', 'dadimadi-gritham', 'dasamoolarishtam',
    'dhanwantharam-kuzhambu', 'dhanwantharam-thailam', 'hinguvachadi-choornam', 'jeerakarishtam', 'jeevana', 'kumaryasavam',
    'lakshadi-thailam', 'menocare-capsule', 'musalikhadiradi-kashayam', 'phalasarpis', 'prasoothikasudha',
    'prasoothikamritha-rasayanam', 'pushyanuga-choornam', 'sapthasaram-kashayam', 'satavari-gulam', 'sukumara-ghritham',
    'sukumaram-kashayam', 'yashti-madhu-capsule',
  ],
  'childrens-health': [
    'aravindasavam', 'ardhavilwam-kashayam', 'chandrashooradi-kashayam', 'eladi-keram', 'jeevana', 'lakshadi-thailam',
    'mustharishtam', 'red-irons-syrup', 'rich-meal',
  ],
  'fever-and-immunity': [
    'amritharishtam', 'amrithotharam-kashayam', 'aragwadhadi-kashayam', 'aravindasavam', 'aswagandharishtam',
    'ayushkwatha-choornam', 'chyavanaprasam', 'dasamoolarishtam', 'drakshadi-kashayam', 'draksharishtam',
    'elakanadi-kashayam', 'guloochyadi-kashayam', 'indukantham-ghritham', 'indukantham-kashayam', 'kanakasavam',
    'kutajarishtam', 'nimbadi-kashayam', 'pachathikthakam-kashayam', 'relieve-o', 'thriphala-choornam',
    'yashti-madhu-capsule',
  ],
  'diabetes-and-metabolic': [
    'aragwadhadi-kashayam', 'asanadi-kashayam', 'chavikasavam', 'diastat-capsule', 'guggulupachapalam-choornam',
    'kathakakhadiradi-kashayam', 'lohasavam', 'partharishtam', 'varanadi-kashayam', 'varasanadi-kashayam',
  ],
  'heart-and-circulation': [
    'ashtavargam-kashayam', 'dadimadi-gritham', 'partharishtam', 'rasonadi-kashayam',
  ],
  'liver-and-kidney': [
    'avipathy-choornam', 'brihathyadi-kashayam', 'chandanasavam', 'dasamoola-haritaki', 'drakshadi-kashayam',
    'gokshura-choornam', 'hepro', 'kumaryasavam', 'lohasavam', 'padolakaturohinyadi-kashayam', 'pippalyasavam',
    'punarnavadi-kashayam', 'punarnavasavam', 'satavari-gulam', 'thikthakam-kashayam', 'vasaguloochyadi-kashayam',
  ],
  'mind-sleep-nerves': [
    'ashtavargam-kashayam', 'aswaganda-cap', 'aswagandha-choornam', 'aswagandharishtam', 'balarishtam', 'brahmi-gritham',
    'chandanasavam', 'dasamoolam-kashayam', 'dhanadanayanadi-kashayam', 'dhanwantharam-kashayam', 'draksharishtam',
    'gandharvahasthadi-kashayam', 'himasagara-thailam', 'kalyanakam-ghritham', 'kalyanakam-kashayam',
    'ksheerabala-thailam-200-ml', 'mahamasha-thailam-200ml', 'maharasnadi-kashayam', 'nadi-kashayam',
    'pathyakshadathryadi-kashayam', 'rasnadi-kashayam', 'saraswatharishtam', 'slepan-capsule',
  ],
  'rejuvenation': [
    'ajamamsa-rasayanam', 'aswaganda-cap', 'aswagandha-choornam', 'balarishtam', 'bringarajasavam', 'chyavanaprasam',
    'dasamoolarishtam', 'desire-capsule', 'draksharishtam', 'jeevana', 'kapikachu-choornam', 'red-irons-capsule',
    'red-irons-syrup', 'rich-meal', 'thriphala-choornam', 'vidaryadi-kashayam',
  ],
};

/** The same map turned round: concern slugs for each medicine. */
export const CONCERNS_BY_HANDLE: Record<string, string[]> = Object.entries(CONCERN_MAP).reduce((acc, [slug, handles]) => {
  for (const h of handles) (acc[h] ??= []).push(slug);
  return acc;
}, {} as Record<string, string[]>);
