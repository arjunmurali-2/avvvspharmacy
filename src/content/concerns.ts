/*
 * Short introductions for each concern page. They explain how Ayurveda traditionally looks at the
 * area and what kinds of medicines are listed, without promising any result. Status: written 8 Nov
 * 2026, awaiting review by AVVVS's pharmacist. Add `faq` entries only with answers AVVVS approves;
 * they are then also published as FAQ structured data.
 */
export type ConcernIntro = { intro: string; faq?: { q: string; a: string }[] };

export const CONCERN_INTROS: Record<string, ConcernIntro> = {
  'pain-management': {
    intro: 'Ayurveda traditionally links most pain and stiffness in the joints, muscles and back to aggravated vata. The medicines here include kashayams taken by mouth and classical oils for massage, which are often used together under a physician’s guidance.',
  },
  'digestive-health': {
    intro: 'Ayurveda places digestion, or agni, at the centre of good health. The medicines here are traditionally used for appetite, indigestion, wind, constipation and the bowels, and include digestive powders (choornams), kashayams and arishtams.',
  },
  'respiratory': {
    intro: 'These medicines are traditionally used in Ayurveda for coughs, colds, sinus congestion and the chest. Breathlessness, chest pain or a cough that won’t settle should always be seen by a doctor.',
  },
  'skin-and-hair': {
    intro: 'Ayurveda traditionally sees the skin as a reflection of the blood and digestion, so skin care often combines medicines taken by mouth with oils and powders applied outside. The hair oils (kerams) here are used on the scalp.',
  },
  'womens-health': {
    intro: 'Medicines traditionally used for the menstrual cycle, for care during pregnancy and after childbirth, and around menopause. Please consult a doctor before taking any medicine while pregnant or breastfeeding.',
  },
  'childrens-health': {
    intro: 'Gentle tonics, digestives and massage oils traditionally used for children in Kerala. Doses for children differ from adults’; please ask a doctor how much to give.',
  },
  'fever-and-immunity': {
    intro: 'Medicines traditionally used in Ayurveda during and after fevers, and to support the body’s natural resilience through the seasons. A high, persistent or recurring fever needs a doctor’s attention.',
  },
  'diabetes-and-metabolic': {
    intro: 'Medicines traditionally used in Ayurveda alongside diet and daily routine for blood sugar, weight and metabolism. They are meant as supportive care: please don’t stop or change any medicine your doctor has prescribed.',
  },
  'heart-and-circulation': {
    intro: 'Medicines traditionally used in Ayurveda as supportive care for the heart and circulation. They are not a replacement for your doctor’s treatment; chest pain or breathlessness needs urgent medical care.',
  },
  'liver-and-kidney': {
    intro: 'Medicines traditionally used for the liver, the kidneys and the urinary system, and for fluid retention. Jaundice, kidney pain or blood in the urine should always be checked by a doctor.',
  },
  'mind-sleep-nerves': {
    intro: 'Medicines and oils traditionally used in Ayurveda for calm, restful sleep, memory and the nervous system, including several classical head and body oils.',
  },
  'rejuvenation': {
    intro: 'Rasayana is the branch of Ayurveda devoted to strength, vitality and healthy ageing. These tonics, ghees and confections are traditionally taken to build strength and recover after illness.',
  },
};
