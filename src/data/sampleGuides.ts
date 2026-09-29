import { SampleGuide } from '../types';

export const SAMPLE_GUIDES: SampleGuide[] = [
  {
    id: 'essential-medicines',
    title: 'Essential OTC Medicines & Common Symptoms Index',
    fileName: 'Essential_Medicines_Symptom_Index.pdf',
    description: 'Standard reference catalog listing over-the-counter pharmaceuticals, indications, common ailments, and active ingredients.',
    pageCount: 3,
    content: [
      {
        pageNumber: 1,
        wordCount: 198,
        text: `ESSENTIAL MEDICINES REFERENCE GUIDE
SECTION 1: ANALGESICS & ANTIPYRETICS (PAIN & FEVER RELIEF)

1. PARACETAMOL (ACETAMINOPHEN)
- Indications: Mild to moderate pain, headache, tension headache, migraine relief, fever reduction, body aches associated with cold and flu.
- Classification: Analgesic and antipyretic.
- Notes in Document: Generally well tolerated on an empty stomach. Always adhere to maximum daily limits to prevent liver stress.

2. IBUPROFEN
- Indications: Acute pain, throbbing headache, fever, inflammation, menstrual cramps, toothache, muscle soreness, and joint stiffness.
- Classification: Non-steroidal anti-inflammatory drug (NSAID).
- Notes in Document: Best taken with food or milk to minimize gastric upset. Not recommended for individuals with active stomach ulceration.

SECTION 2: UPPER RESPIRATORY TRACT SYMPTOMS (COLD & COUGH)

3. DEXTROMETHORPHAN HYDROBROMIDE
- Indications: Temporary relief of dry, hacking, non-productive cough caused by minor throat irritation, common cold, or inhaled irritants.
- Classification: Central cough suppressant (antitussive).
- Notes in Document: Intended for tickly coughs without mucus accumulation.`
      },
      {
        pageNumber: 2,
        wordCount: 215,
        text: `ESSENTIAL MEDICINES REFERENCE GUIDE
SECTION 3: ALLERGIES, RHINITIS & COLD SYMPTOMS

4. CETIRIZINE HYDROCHLORIDE
- Indications: Seasonal allergic rhinitis, sneezing, runny nose, itchy watery eyes, nasal congestion, itching, hives, hay fever, and allergic skin reactions.
- Classification: Second-generation H1-receptor antihistamine.
- Notes in Document: Less sedating than first-generation antihistamines, though drowsiness may occasionally occur in sensitive individuals.

5. PHENYLEPHRINE / PSEUDOEPHEDRINE
- Indications: Nasal congestion, sinus pressure, stuffy nose resulting from common cold, sinus inflammation, or upper respiratory allergies.
- Classification: Systemic decongestant.
- Notes in Document: May elevate blood pressure or pulse rate; individuals with hypertension should review packaging carefully.

SECTION 4: GASTROINTESTINAL RELIEF (STOMACH PAIN & INDIGESTION)

6. ALUMINUM HYDROXIDE & MAGNESIUM HYDROXIDE
- Indications: Relief of stomach pain, heartburn, acid indigestion, sour stomach, and acid reflux.
- Classification: Antacid suspension or chewable tablet.
- Notes in Document: Provides rapid buffering of gastric acidity.`
      },
      {
        pageNumber: 3,
        wordCount: 220,
        text: `ESSENTIAL MEDICINES REFERENCE GUIDE
SECTION 5: DIGESTIVE DISTURBANCES & HYDRATION

7. ORAL REHYDRATION SALTS (ORS)
- Indications: Prevention and treatment of dehydration caused by acute diarrhea, food poisoning, heat exhaustion, and vomiting.
- Classification: Electrolyte replacement therapy.
- Notes in Document: Essential fluid replenishment comprising glucose, sodium chloride, potassium chloride, and trisodium citrate. Dissolve in clean drinking water.

8. LOPERAMIDE HYDROCHLORIDE
- Indications: Symptomatic control of acute non-specific diarrhea, traveler's diarrhea, and loose bowel movements.
- Classification: Synthetic opioid-receptor agonist for intestinal motility reduction.
- Notes in Document: Slows intestinal transit; should not be taken in cases of bloody stool or high bacterial fever.

SECTION 6: THROAT CARE

9. DICHLOROBENZYL ALCOHOL & AMYLMETACRESOL
- Indications: Sore throat, painful swallowing, scratchy pharyngeal irritation caused by dry air or viral colds.
- Classification: Antiseptic throat lozenge.`
      }
    ]
  },
  {
    id: 'first-aid-formulary',
    title: 'Family First Aid & Emergency Formulary',
    fileName: 'Family_First_Aid_Formulary.pdf',
    description: 'Clinical household summary for acute minor symptoms, nausea, motion sickness, sprains, and burns.',
    pageCount: 2,
    content: [
      {
        pageNumber: 1,
        wordCount: 165,
        text: `FAMILY FIRST AID & EMERGENCY FORMULARY - PAGE 1
TOPICAL AND SYSTEMIC FORMULATIONS FOR HOME CARE

1. DIMENHYDRINATE
- Indications: Motion sickness, nausea, vomiting, dizziness, travel-related malaise in car or boat travel.
- Classification: Antiemetic and antihistaminic agent.
- Note: Causes noticeable drowsiness; refrain from operating vehicles or complex equipment.

2. HYDROCORTISONE CREAM (1%)
- Indications: Minor skin irritation, allergic contact dermatitis, insect bites, itching, localized rash, and eczema flares.
- Classification: Mild topical corticosteroid.
- Note: For external application only. Avoid direct eye contact or prolonged application to broken skin.`
      },
      {
        pageNumber: 2,
        wordCount: 172,
        text: `FAMILY FIRST AID & EMERGENCY FORMULARY - PAGE 2
RESPIRATORY AND DIGESTIVE QUICK REFERENCE

3. GUAIFENESIN
- Indications: Chest congestion, wet productive cough with thick mucus, bronchial secretions from bronchitis or cold.
- Classification: Expectorant.
- Note: Promotes thinning of bronchial mucus to facilitate easier coughing and airway clearance. Drink ample warm water.

4. SIMETHICONE
- Indications: Abdominal fullness, bloating, painful gas pressure, stomach distension, and flatulence.
- Classification: Antifoaming agent.
- Note: Breaks surface tension of gas bubbles allowing easier elimination.`
      }
    ]
  },
  {
    id: 'scanned-guide-empty',
    title: 'Scanned Document (Image Only / No OCR)',
    fileName: 'Scanned_Prescription_Archive.pdf',
    description: 'Sample scanned paper image without embedded digital text stream, to demonstrate safe unreadable PDF handling.',
    pageCount: 1,
    isScannedOnly: true,
    content: [
      {
        pageNumber: 1,
        wordCount: 0,
        text: ''
      }
    ]
  }
];
