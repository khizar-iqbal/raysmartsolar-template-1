/**
 * City data — each city page is built from this, but every page adds
 * its own hand-written local sections. Sources: FACTS.md §4, §5, §6.
 */

export interface City {
  slug: string;
  name: string;
  /** Roman-Urdu warmth used sparingly in copy */
  greeting: string;
  disco: {
    code: string;
    fullName: string;
    areas: string;
    netMeteringReality: string;
    sheddingReality: string;
  };
  /** kWh generated per kW installed per year (Global Solar Atlas) */
  yieldPerKwYear: number;
  yieldConfidence: 'high' | 'medium' | 'interpolated';
  /** ~monthly units per kW, derived (yield/12), rounded */
  monthlyUnitsPerKw: number;
  climateNote: string;
  neighbourhoods: string[];
  metaDescription: string;
}

export const cities: City[] = [
  {
    slug: 'lahore',
    name: 'Lahore',
    greeting: 'Lahore, apna sheher.',
    disco: {
      code: 'LESCO',
      fullName: 'Lahore Electric Supply Company',
      areas: 'Lahore, Kasur, Sheikhupura, Okara and Nankana Sahib districts',
      netMeteringReality:
        'LESCO is Pakistan’s highest-volume DISCO for solar applications and has carried a real backlog in 2026 — practical approval timelines have run 10–15 weeks. We file complete paperwork, follow it up in person, and tell you the honest timeline before you pay anything.',
      sheddingReality:
        'Urban Lahore’s scheduled load-shedding is modest (around 2 hours in the 2026 plans), but summer voltage dips and unannounced feeder trips are a year-round reality — and high-loss feeders see much longer cuts.',
    },
    yieldPerKwYear: 1411,
    yieldConfidence: 'high',
    monthlyUnitsPerKw: 118,
    climateNote:
      'Smog season (late October–January) can cut daily output by 30–50% on the worst days, and dust builds fast year-round. We size systems on honest annual numbers and include a cleaning plan — not summer-only marketing math.',
    neighbourhoods: [
      'DHA',
      'Gulberg',
      'Johar Town',
      'Allama Iqbal Town',
      'Model Town',
      'Wapda Town',
      'Bahria Town',
      'Askari',
      'Valencia',
      'Cantt',
    ],
    metaDescription:
      'Solar installation in Lahore with LESCO net-metering/net-billing paperwork handled end-to-end. Honest pricing by kW, Tier-1 panels, smog-season-aware sizing. Office in Allama Iqbal Town.',
  },
  {
    slug: 'karachi',
    name: 'Karachi',
    greeting: 'Karachi — roshniyon ka sheher.',
    disco: {
      code: 'K-Electric',
      fullName: 'K-Electric',
      areas: 'Karachi and adjacent areas including Dhabeji, Gharo, Uthal, Vinder and Bela',
      netMeteringReality:
        'K-Electric runs its own process — online portal, facilitation centre at Civic Centre, site inspection typically 2–4 weeks after acceptance. A 10 kW residential case commonly completes in 4–6 weeks: faster than most Punjab DISCOs right now.',
      sheddingReality:
        'K-Electric was exempt from the April 2026 national shedding plan, but applies its own loss-based cuts — low-loss areas see almost none, high-loss feeders can see multi-hour outages. Karachi’s bigger constants: heat, humidity, and some of Pakistan’s highest effective tariffs.',
    },
    yieldPerKwYear: 1600,
    yieldConfidence: 'medium',
    monthlyUnitsPerKw: 133,
    climateNote:
      'Karachi generates roughly 10–15% more per kW than Lahore across the year — but sea air is brutal on cheap mounting hardware. We use marine-grade (hot-dip galvanised or anodised aluminium) structures and corrosion-rated fasteners near the coast.',
    neighbourhoods: [
      'DHA',
      'Clifton',
      'Gulshan-e-Iqbal',
      'North Nazimabad',
      'PECHS',
      'Bahria Town',
      'Malir',
      'Korangi',
      'Scheme 33',
      'Gulistan-e-Johar',
    ],
    metaDescription:
      'Solar installation in Karachi with the K-Electric net-metering process handled for you. Marine-grade mounting for sea air, honest pricing by kW, Tier-1 panels and lithium backup.',
  },
  {
    slug: 'islamabad',
    name: 'Islamabad & Rawalpindi',
    greeting: 'Islamabad aur Pindi — dono ka khayal.',
    disco: {
      code: 'IESCO',
      fullName: 'Islamabad Electric Supply Company',
      areas: 'Islamabad, Rawalpindi, Attock, Jhelum and Chakwal',
      netMeteringReality:
        'IESCO has historically been one of the smoother DISCOs for solar approvals. There was real confusion in February 2026 when net-billing circulars landed mid-transition — the grandfathering amendment has since settled it, and we’ll tell you exactly which rules apply to your case.',
      sheddingReality:
        'The twin cities sit in the better-served band of the grid, but the April 2026 plan still scheduled ~2 hours of evening cuts, and hillier sectors see weather-related trips. Backup demand here is driven as much by work-from-home reliability as by outage hours.',
    },
    yieldPerKwYear: 1501,
    yieldConfidence: 'high',
    monthlyUnitsPerKw: 125,
    climateNote:
      'Islamabad yields ~6% more per kW than Lahore (clearer air, cooler panels work better). Monsoon hail is rare but real — we spec panels with tested impact ratings and mount angles that shed debris.',
    neighbourhoods: [
      'F-sectors',
      'G-sectors',
      'E-11',
      'Bahria Town',
      'DHA Phase 1–5',
      'Gulraiz',
      'Satellite Town',
      'Chaklala',
      'PWD',
      'Media Town',
    ],
    metaDescription:
      'Solar installation in Islamabad and Rawalpindi with IESCO paperwork handled end-to-end. Higher yields than Punjab’s plains, honest pricing by kW, Tier-1 hardware, lithium backup.',
  },
  {
    slug: 'faisalabad',
    name: 'Faisalabad',
    greeting: 'Faisalabad — mehnat ka sheher.',
    disco: {
      code: 'FESCO',
      fullName: 'Faisalabad Electric Supply Company',
      areas: 'Faisalabad, Jhang, Toba Tek Singh, Chiniot, Sargodha, Khushab, Mianwali and Bhakkar',
      netMeteringReality:
        'FESCO is regularly rated among the better ex-WAPDA DISCOs on recovery and process discipline, and keeps its tariff schedules current. Solar applications still need complete, correctly-sequenced paperwork — that part is on us.',
      sheddingReality:
        'Faisalabad was included in the April 2026 national shedding plan (~2 hours evening), and industrial feeders juggle load in peak summer. For factories here, every un-generated unit is production lost — which is exactly why textile units led Pakistan’s commercial solar wave.',
    },
    yieldPerKwYear: 1500,
    yieldConfidence: 'medium',
    monthlyUnitsPerKw: 125,
    climateNote:
      'Central Punjab sun with slightly less smog than Lahore. Textile-area dust and lint mean panels here reward a regular cleaning cadence — we build it into the maintenance plan.',
    neighbourhoods: [
      'D Ground',
      'Peoples Colony',
      'Madina Town',
      'Susan Road',
      'Eden Valley',
      'Wapda City',
      'Jaranwala Road',
      'Sargodha Road industrial belt',
      'Khurrianwala',
      'Small D-type industrial estates',
    ],
    metaDescription:
      'Solar installation in Faisalabad for homes and textile/industrial units, with FESCO paperwork handled. Honest pricing by kW, Tier-1 panels, commercial ROI modelling.',
  },
  {
    slug: 'multan',
    name: 'Multan',
    greeting: 'Multan — suraj ka apna sheher.',
    disco: {
      code: 'MEPCO',
      fullName: 'Multan Electric Power Company',
      areas: 'all of South Punjab — 13 districts including Multan, Bahawalpur, D.G. Khan and Rahim Yar Khan',
      netMeteringReality:
        'MEPCO covers a huge, largely rural territory, so file quality decides your timeline — incomplete applications sit. We submit complete files, track them weekly, and are straight with you about how long MEPCO is actually taking when you sign.',
      sheddingReality:
        'South Punjab’s rural feeders carry more loss-based shedding than urban Punjab — parts of MEPCO territory see the longest cuts in the province. That, plus 45°C+ summers, makes hybrid systems with backup the default request here rather than the upgrade.',
    },
    yieldPerKwYear: 1500,
    yieldConfidence: 'interpolated',
    monthlyUnitsPerKw: 125,
    climateNote:
      'Multan’s sun is fierce — but panels lose efficiency as they heat, so real-world summer output per kW is closer to Lahore’s than the sunshine suggests. We use N-type panels with better temperature coefficients and ventilated mounting to claw back those losses.',
    neighbourhoods: [
      'Cantt',
      'Gulgasht',
      'Model Town',
      'Shah Rukn-e-Alam',
      'Wapda Town',
      'DHA Multan',
      'Buch Villas',
      'New Multan',
      'Vehari Road',
      'Industrial Estate',
    ],
    metaDescription:
      'Solar installation in Multan and South Punjab with MEPCO paperwork handled. Heat-tolerant N-type panels, hybrid backup for long rural outages, honest pricing by kW.',
  },
];

export const cityBySlug = (slug: string) => cities.find((c) => c.slug === slug);
