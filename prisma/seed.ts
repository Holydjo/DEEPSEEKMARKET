import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const db = new PrismaClient();

const now = Date.now();
const days = (n: number) => new Date(now + n * 86_400_000);

type ServiceSeed = {
  name: string;
  description: string;
  priceCents: number;
  priceType?: "FIXED" | "FROM" | "HOURLY";
  durationMin?: number;
};

type ProviderSeed = {
  key: string;
  ownerName: string;
  email: string;
  phone: string;
  type: "INDEPENDENT" | "BUSINESS";
  status: "APPROVED" | "PENDING" | "REJECTED" | "DRAFT";
  displayName: string;
  legalName?: string;
  slug: string;
  category: string;
  tagline: string;
  about: string;
  addressLine: string;
  neighbourhood: string;
  lat: number;
  lng: number;
  travelRadiusKm: number;
  servesAtHome?: boolean;
  servesAtSalon?: boolean;
  servesAtShop?: boolean;
  travelsToClient?: boolean;
  languages?: string;
  responseTimeHours?: number;
  featured?: boolean;
  ratingAvg: number;
  ratingCount: number;
  photos: string[];
  services: ServiceSeed[];
  openDays: number[];
  openTime: string;
  closeTime: string;
  areas: string[];
  submittedDaysAgo?: number;
  reviewedDaysAgo?: number;
  reviewNote?: string;
};

const providerSeeds: ProviderSeed[] = [
  {
    key: "nadia",
    ownerName: "Nadia Bélanger",
    email: "nadia@example.com",
    phone: "+1 514 555 0142",
    type: "INDEPENDENT",
    status: "APPROVED",
    displayName: "Nadia Braids Studio",
    slug: "nadia-braids-studio",
    category: "braids",
    tagline: "Gentle braids, done with care — Le Plateau",
    about:
      "I’m Nadia, a braider working from my home studio in Le Plateau. I specialise in knotless braids, protective styles and gentle children’s braiding. Take your time, bring a friend, and leave with hair that feels like you.",
    addressLine: "1240 Avenue du Mont-Royal E",
    neighbourhood: "Le Plateau",
    lat: 45.5241,
    lng: -73.5806,
    travelRadiusKm: 8,
    servesAtHome: true,
    travelsToClient: true,
    languages: "English, French",
    responseTimeHours: 2,
    featured: true,
    ratingAvg: 4.9,
    ratingCount: 48,
    photos: [
      "/images/providers/nadia-1.jpg",
      "/images/providers/nadia-2.jpg",
      "/images/providers/nadia-3.jpg",
      "/images/providers/nadia-4.jpg",
    ],
    services: [
      {
        name: "Knotless braids",
        description: "Medium length · hair included · aftercare advice",
        priceCents: 12000,
        priceType: "FROM",
        durationMin: 240,
      },
      {
        name: "Box braids",
        description: "Small, medium or jumbo · hair provided",
        priceCents: 9000,
        priceType: "FROM",
        durationMin: 210,
      },
      {
        name: "Kids braids (under 12)",
        description: "Gentle styling · French or English",
        priceCents: 5500,
        priceType: "FROM",
        durationMin: 120,
      },
      {
        name: "Braids touch-up",
        description: "Refresh edges and partings · existing clients",
        priceCents: 4000,
        durationMin: 45,
      },
    ],
    openDays: [2, 3, 4, 5, 6, 0],
    openTime: "10:00",
    closeTime: "19:00",
    areas: ["Le Plateau", "Mile End", "Rosemont", "Villeray", "Little Italy"],
    submittedDaysAgo: 24,
    reviewedDaysAgo: 23,
  },
  {
    key: "atelier",
    ownerName: "Awa Diallo",
    email: "awa@example.com",
    phone: "+1 514 555 0198",
    type: "BUSINESS",
    status: "APPROVED",
    displayName: "Awa’s Hair Atelier",
    legalName: "Atelier Awa Inc.",
    slug: "awas-hair-atelier",
    category: "hair",
    tagline: "Hair that works with your life",
    about:
      "A small salon on Rosemont with four chairs and a lot of coffee. We do cuts, colour and silk presses for all hair textures, and we’ll always tell you what your hair can actually do in one appointment.",
    addressLine: "3100 Boulevard Rosemont",
    neighbourhood: "Rosemont",
    lat: 45.5487,
    lng: -73.5887,
    travelRadiusKm: 3,
    servesAtSalon: true,
    languages: "English, French, Wolof",
    responseTimeHours: 1,
    featured: true,
    ratingAvg: 4.8,
    ratingCount: 31,
    photos: [
      "/images/providers/atelier-meches-1.jpg",
      "/images/providers/atelier-meches-2.jpg",
    ],
    services: [
      {
        name: "Cut & style",
        description: "Consultation, wash, cut and finish",
        priceCents: 6500,
        priceType: "FROM",
        durationMin: 60,
      },
      {
        name: "Colour",
        description: "Single process or gloss · patch test required",
        priceCents: 12000,
        priceType: "FROM",
        durationMin: 150,
      },
      {
        name: "Silk press",
        description: "Wash, treatment and smooth finish",
        priceCents: 5500,
        durationMin: 75,
      },
      {
        name: "Kids cut",
        description: "Under 12 · wash and cut",
        priceCents: 3500,
        durationMin: 45,
      },
    ],
    openDays: [2, 3, 4, 5, 6],
    openTime: "09:00",
    closeTime: "18:00",
    areas: ["Rosemont", "Le Plateau", "Villeray"],
    submittedDaysAgo: 40,
    reviewedDaysAgo: 39,
  },
  {
    key: "propre",
    ownerName: "Marc-Olivier Gagnon",
    email: "marco@example.com",
    phone: "+1 514 555 0177",
    type: "BUSINESS",
    status: "APPROVED",
    displayName: "Maison Propre",
    legalName: "Maison Propre S.E.N.C.",
    slug: "maison-propre",
    category: "cleaning",
    tagline: "A calm home to come back to",
    about:
      "A two-person cleaning team serving Villeray and nearby neighbourhoods since 2019. We bring our own eco-friendly products, work around kids and pets, and send the same faces every visit.",
    addressLine: "780 Rue Jean-Talon E",
    neighbourhood: "Villeray",
    lat: 45.5525,
    lng: -73.6125,
    travelRadiusKm: 10,
    servesAtShop: true,
    travelsToClient: true,
    languages: "English, French",
    responseTimeHours: 3,
    featured: true,
    ratingAvg: 5.0,
    ratingCount: 22,
    photos: [
      "/images/providers/maison-propre-1.jpg",
      "/images/providers/maison-propre-2.jpg",
    ],
    services: [
      {
        name: "Standard clean",
        description: "Kitchen, bathroom, floors and dusting",
        priceCents: 9000,
        priceType: "FROM",
        durationMin: 180,
      },
      {
        name: "Deep clean",
        description: "Inside appliances, baseboards and windows",
        priceCents: 16000,
        priceType: "FROM",
        durationMin: 300,
      },
      {
        name: "Move-out clean",
        description: "Empty-home clean with a checklist for your landlord",
        priceCents: 22000,
        priceType: "FROM",
        durationMin: 360,
      },
    ],
    openDays: [1, 2, 3, 4, 5, 6],
    openTime: "08:00",
    closeTime: "18:00",
    areas: ["Villeray", "Rosemont", "Le Plateau", "Mile End"],
    submittedDaysAgo: 60,
    reviewedDaysAgo: 59,
  },
  {
    key: "aicha",
    ownerName: "Aïcha Traoré",
    email: "aicha@example.com",
    phone: "+1 514 555 0163",
    type: "INDEPENDENT",
    status: "APPROVED",
    displayName: "Beauté Aïcha",
    slug: "beaute-aicha",
    category: "beauty",
    tagline: "Soft glam, strong brows, no rush",
    about:
      "Makeup artist and brow specialist working from a quiet studio in Little Burgundy. I do bridal, editorial and everyday looks, and I’m happiest when you still look like yourself afterwards.",
    addressLine: "2050 Rue Notre-Dame O",
    neighbourhood: "Little Burgundy",
    lat: 45.4879,
    lng: -73.575,
    travelRadiusKm: 6,
    servesAtSalon: true,
    travelsToClient: true,
    languages: "English, French",
    responseTimeHours: 2,
    ratingAvg: 4.9,
    ratingCount: 27,
    photos: [
      "/images/providers/beaute-aicha-1.jpg",
      "/images/providers/beaute-aicha-2.jpg",
      "/images/providers/beaute-aicha-3.jpg",
    ],
    services: [
      {
        name: "Makeup application",
        description: "Everyday or event · lashes included",
        priceCents: 7000,
        priceType: "FROM",
        durationMin: 60,
      },
      {
        name: "Brow shaping & tint",
        description: "Wax, tweeze and tint",
        priceCents: 3500,
        durationMin: 30,
      },
      {
        name: "Express facial",
        description: "Cleanse, exfoliate and hydrate",
        priceCents: 8000,
        durationMin: 75,
      },
    ],
    openDays: [3, 4, 5, 6, 0],
    openTime: "10:00",
    closeTime: "18:00",
    areas: ["Little Burgundy", "Saint-Henri", "Le Plateau", "Centre-ville"],
    submittedDaysAgo: 33,
    reviewedDaysAgo: 32,
  },
  {
    key: "kora",
    ownerName: "Kora Mensah",
    email: "kora@example.com",
    phone: "+1 514 555 0111",
    type: "BUSINESS",
    status: "APPROVED",
    displayName: "Studio Kora",
    slug: "studio-kora",
    category: "braids",
    tagline: "Braiding studio on the Main",
    about:
      "A four-chair braiding studio in Le Plateau. We specialise in cornrows, knotless braids and twists, and we keep a playlist going while you’re in the chair. Book ahead for weekend slots.",
    addressLine: "4400 Boulevard Saint-Laurent",
    neighbourhood: "Le Plateau",
    lat: 45.5215,
    lng: -73.5772,
    travelRadiusKm: 2,
    servesAtSalon: true,
    languages: "English, French",
    responseTimeHours: 4,
    ratingAvg: 4.7,
    ratingCount: 64,
    photos: [
      "/images/providers/studio-kora-1.jpg",
      "/images/providers/studio-kora-2.jpg",
      "/images/providers/studio-kora-3.jpg",
    ],
    services: [
      {
        name: "Cornrows",
        description: "Straight backs or custom pattern",
        priceCents: 4500,
        priceType: "FROM",
        durationMin: 90,
      },
      {
        name: "Knotless braids",
        description: "Small or medium · hair included",
        priceCents: 13000,
        priceType: "FROM",
        durationMin: 270,
      },
      {
        name: "Twists",
        description: "Passion or two-strand twists",
        priceCents: 10000,
        priceType: "FROM",
        durationMin: 180,
      },
    ],
    openDays: [2, 3, 4, 5, 6, 0],
    openTime: "09:00",
    closeTime: "20:00",
    areas: ["Le Plateau", "Mile End", "Rosemont"],
    submittedDaysAgo: 52,
    reviewedDaysAgo: 51,
  },
  {
    key: "mariam",
    ownerName: "Mariam Cissé",
    email: "mariam@example.com",
    phone: "+1 514 555 0128",
    type: "INDEPENDENT",
    status: "APPROVED",
    displayName: "Mariam à Domicile",
    slug: "mariam-a-domicile",
    category: "braids",
    tagline: "Braids in your own kitchen, on your schedule",
    about:
      "I come to you. Children’s braids, box braids and simple protective styles, with everything I need in one bag. Weekends and evenings are when I work best.",
    addressLine: "Service area only — Villeray",
    neighbourhood: "Villeray",
    lat: 45.5482,
    lng: -73.6178,
    travelRadiusKm: 12,
    travelsToClient: true,
    languages: "English, French, Bambara",
    responseTimeHours: 3,
    ratingAvg: 5.0,
    ratingCount: 19,
    photos: [
      "/images/providers/mariam-1.jpg",
      "/images/providers/mariam-2.jpg",
    ],
    services: [
      {
        name: "Kids braids",
        description: "Gentle styles for under 12",
        priceCents: 5000,
        priceType: "FROM",
        durationMin: 120,
      },
      {
        name: "Box braids",
        description: "Hair included · medium length",
        priceCents: 8000,
        priceType: "FROM",
        durationMin: 210,
      },
    ],
    openDays: [5, 6, 0],
    openTime: "09:00",
    closeTime: "19:00",
    areas: ["Villeray", "Rosemont", "Le Plateau", "Hochelaga"],
    submittedDaysAgo: 29,
    reviewedDaysAgo: 28,
  },
  {
    key: "belanger",
    ownerName: "Luc Bélanger",
    email: "luc@example.com",
    phone: "+1 514 555 0135",
    type: "BUSINESS",
    status: "APPROVED",
    displayName: "Réparations Bélanger",
    slug: "reparations-belanger",
    category: "repairs",
    tagline: "Small fixes, done properly",
    about:
      "A neighbourhood repair shop on Rosemont. Phone screens, laptop tune-ups and appliance diagnostics. If we can’t fix it, we’ll tell you before you pay for a repair.",
    addressLine: "920 Rue Masson",
    neighbourhood: "Rosemont",
    lat: 45.5518,
    lng: -73.584,
    travelRadiusKm: 1,
    servesAtShop: true,
    languages: "English, French",
    responseTimeHours: 5,
    ratingAvg: 4.8,
    ratingCount: 36,
    photos: [
      "/images/providers/reparations-belanger-1.jpg",
      "/images/providers/reparations-belanger-2.jpg",
    ],
    services: [
      {
        name: "Phone screen replacement",
        description: "Most models · 60-day warranty",
        priceCents: 8000,
        priceType: "FROM",
        durationMin: 60,
      },
      {
        name: "Laptop tune-up",
        description: "Cleanup, updates and diagnostics",
        priceCents: 6500,
        durationMin: 90,
      },
      {
        name: "Appliance diagnostic",
        description: "On-site visit and written estimate",
        priceCents: 9000,
        durationMin: 45,
      },
    ],
    openDays: [1, 2, 3, 4, 5],
    openTime: "09:00",
    closeTime: "17:00",
    areas: ["Rosemont", "Villeray", "Le Plateau"],
    submittedDaysAgo: 47,
    reviewedDaysAgo: 46,
  },
  {
    key: "nails",
    ownerName: "Camille Roy",
    email: "camille@example.com",
    phone: "+1 514 555 0156",
    type: "INDEPENDENT",
    status: "APPROVED",
    displayName: "Éclat Nails",
    slug: "eclat-nails",
    category: "nails",
    tagline: "Small studio, very careful hands",
    about:
      "A one-person nail studio in Mile End. Gel manicures, pedicures and simple nail art. I keep my books small so appointments never feel rushed.",
    addressLine: "5450 Avenue du Parc",
    neighbourhood: "Mile End",
    lat: 45.5274,
    lng: -73.6032,
    travelRadiusKm: 2,
    servesAtHome: true,
    languages: "English, French",
    responseTimeHours: 2,
    ratingAvg: 4.9,
    ratingCount: 41,
    photos: ["/images/providers/eclat-nails-1.jpg"],
    services: [
      {
        name: "Gel manicure",
        description: "Shape, cuticle care and gel polish",
        priceCents: 5500,
        durationMin: 60,
      },
      {
        name: "Pedicure",
        description: "Soak, shape and polish",
        priceCents: 6500,
        durationMin: 75,
      },
      {
        name: "Nail art",
        description: "Add-on per set · simple designs",
        priceCents: 7500,
        durationMin: 90,
      },
    ],
    openDays: [2, 3, 4, 5, 6],
    openTime: "11:00",
    closeTime: "19:00",
    areas: ["Mile End", "Le Plateau", "Outremont"],
    submittedDaysAgo: 21,
    reviewedDaysAgo: 20,
  },
  {
    key: "massage",
    ownerName: "Élise Fontaine",
    email: "elise@example.com",
    phone: "+1 514 555 0184",
    type: "INDEPENDENT",
    status: "APPROVED",
    displayName: "Douceurs Massage",
    slug: "douceurs-massage",
    category: "wellness",
    tagline: "A quieter hour, in good hands",
    about:
      "Registered massage therapist working from a small studio in Outremont. Swedish, deep tissue and prenatal massage, with a focus on people who sit at a desk all day.",
    addressLine: "1100 Avenue Van Horne",
    neighbourhood: "Outremont",
    lat: 45.5152,
    lng: -73.6074,
    travelRadiusKm: 2,
    servesAtHome: true,
    languages: "English, French",
    responseTimeHours: 4,
    ratingAvg: 5.0,
    ratingCount: 17,
    photos: ["/images/providers/douceurs-massage-1.jpg"],
    services: [
      {
        name: "Swedish massage · 60 min",
        description: "Full-body relaxation",
        priceCents: 9500,
        durationMin: 60,
      },
      {
        name: "Deep tissue · 90 min",
        description: "Focused pressure for tight shoulders and back",
        priceCents: 13000,
        durationMin: 90,
      },
      {
        name: "Prenatal massage · 60 min",
        description: "Side-lying with bolsters",
        priceCents: 10000,
        durationMin: 60,
      },
    ],
    openDays: [1, 2, 3, 4, 5],
    openTime: "10:00",
    closeTime: "18:00",
    areas: ["Outremont", "Mile End", "Côte-des-Neiges"],
    submittedDaysAgo: 38,
    reviewedDaysAgo: 37,
  },
  {
    key: "lea",
    ownerName: "Léa Nguyen",
    email: "lea@example.com",
    phone: "+1 514 555 0170",
    type: "INDEPENDENT",
    status: "APPROVED",
    displayName: "Soutien Scolaire Léa",
    slug: "soutien-scolaire-lea",
    category: "tutoring",
    tagline: "Maths without the panic",
    about:
      "Secondary-school maths and French tutor, in Côte-des-Neiges. I work in short, steady sessions and send a simple summary to parents after every one.",
    addressLine: "Service area only — Côte-des-Neiges",
    neighbourhood: "Côte-des-Neiges",
    lat: 45.4988,
    lng: -73.6301,
    travelRadiusKm: 7,
    travelsToClient: true,
    languages: "English, French, Vietnamese",
    responseTimeHours: 6,
    ratingAvg: 4.9,
    ratingCount: 23,
    photos: ["/images/providers/soutien-lea-1.jpg"],
    services: [
      {
        name: "Maths tutoring",
        description: "Secondary 1–5 · 60 min",
        priceCents: 4500,
        priceType: "HOURLY",
        durationMin: 60,
      },
      {
        name: "French tutoring",
        description: "Writing and oral practice · 60 min",
        priceCents: 4000,
        priceType: "HOURLY",
        durationMin: 60,
      },
      {
        name: "Homework support",
        description: "45 min · bring your assignments",
        priceCents: 3500,
        durationMin: 45,
      },
    ],
    openDays: [1, 2, 3, 4, 6],
    openTime: "15:00",
    closeTime: "19:00",
    areas: ["Côte-des-Neiges", "Outremont", "Villeray"],
    submittedDaysAgo: 31,
    reviewedDaysAgo: 30,
  },
  {
    key: "demenagement",
    ownerName: "Samuel Okafor",
    email: "samuel@example.com",
    phone: "+1 514 555 0193",
    type: "BUSINESS",
    status: "APPROVED",
    displayName: "Petit Bémol Déménagement",
    slug: "petit-bemol-demenagement",
    category: "moving",
    tagline: "Small moves, no drama",
    about:
      "A two-truck moving crew for small apartments and offices in the south-west. We wrap furniture, label boxes and tell you honestly how long it will take.",
    addressLine: "5600 Rue Notre-Dame O",
    neighbourhood: "Saint-Henri",
    lat: 45.4778,
    lng: -73.5892,
    travelRadiusKm: 15,
    servesAtShop: true,
    travelsToClient: true,
    languages: "English, French",
    responseTimeHours: 4,
    ratingAvg: 4.8,
    ratingCount: 15,
    photos: ["/images/providers/demenagement-1.jpg"],
    services: [
      {
        name: "Small apartment move",
        description: "Studio or 1-bedroom · 2 movers, 3 hours",
        priceCents: 18000,
        priceType: "FROM",
        durationMin: 180,
      },
      {
        name: "Packing help",
        description: "Boxes, wrapping and labelling",
        priceCents: 9000,
        priceType: "FROM",
        durationMin: 120,
      },
      {
        name: "Loading only",
        description: "You drive · 2 movers by the hour",
        priceCents: 12000,
        priceType: "HOURLY",
        durationMin: 120,
      },
    ],
    openDays: [1, 2, 3, 4, 5, 6],
    openTime: "07:00",
    closeTime: "18:00",
    areas: ["Saint-Henri", "Little Burgundy", "Verdun", "Le Plateau"],
    submittedDaysAgo: 44,
    reviewedDaysAgo: 43,
  },
  {
    key: "photo",
    ownerName: "Yannick Beaulieu",
    email: "yannick@example.com",
    phone: "+1 514 555 0121",
    type: "INDEPENDENT",
    status: "APPROVED",
    displayName: "Photo Lumière",
    slug: "photo-lumiere",
    category: "photography",
    tagline: "Portraits that look like you",
    about:
      "Portrait and small-event photographer in Little Italy. Natural light, quick sessions and a gallery delivered within a week. Good with people who hate having their photo taken.",
    addressLine: "6800 Boulevard Saint-Laurent",
    neighbourhood: "Little Italy",
    lat: 45.5308,
    lng: -73.6097,
    travelRadiusKm: 10,
    travelsToClient: true,
    languages: "English, French",
    responseTimeHours: 8,
    ratingAvg: 5.0,
    ratingCount: 12,
    photos: ["/images/providers/photo-lumiere-1.jpg"],
    services: [
      {
        name: "Portrait session",
        description: "45 min · 10 edited images",
        priceCents: 15000,
        durationMin: 45,
      },
      {
        name: "Small event coverage",
        description: "2 hours · edited gallery",
        priceCents: 30000,
        priceType: "FROM",
        durationMin: 120,
      },
      {
        name: "Headshots",
        description: "30 min · 5 retouched images",
        priceCents: 12000,
        durationMin: 30,
      },
    ],
    openDays: [2, 3, 4, 5, 6],
    openTime: "10:00",
    closeTime: "17:00",
    areas: ["Little Italy", "Le Plateau", "Mile End"],
    submittedDaysAgo: 18,
    reviewedDaysAgo: 17,
  },
  {
    key: "bella",
    ownerName: "Bella Moreau",
    email: "bella@example.com",
    phone: "+1 514 555 0108",
    type: "INDEPENDENT",
    status: "APPROVED",
    displayName: "Toilettage Bella",
    slug: "toilettage-bella",
    category: "pets",
    tagline: "Calm grooming for nervous pets",
    about:
      "Mobile pet grooming in Verdun and the south-west. One pet at a time, no cages, and a lot of patience for dogs who would rather not.",
    addressLine: "Service area only — Verdun",
    neighbourhood: "Verdun",
    lat: 45.4612,
    lng: -73.5674,
    travelRadiusKm: 8,
    travelsToClient: true,
    languages: "English, French",
    responseTimeHours: 3,
    ratingAvg: 4.9,
    ratingCount: 28,
    photos: ["/images/providers/toilettage-bella-1.jpg"],
    services: [
      {
        name: "Bath & brush",
        description: "Shampoo, dry and brush-out",
        priceCents: 4500,
        priceType: "FROM",
        durationMin: 60,
      },
      {
        name: "Full groom",
        description: "Bath, trim and nails",
        priceCents: 8500,
        priceType: "FROM",
        durationMin: 120,
      },
      {
        name: "Nail trim",
        description: "Quick visit · no bath",
        priceCents: 2000,
        durationMin: 20,
      },
    ],
    openDays: [2, 3, 4, 5, 6],
    openTime: "09:00",
    closeTime: "17:00",
    areas: ["Verdun", "Saint-Henri", "Little Burgundy"],
    submittedDaysAgo: 26,
    reviewedDaysAgo: 25,
  },
  {
    key: "rose",
    ownerName: "Rose Mensah",
    email: "rose@example.com",
    phone: "+1 514 555 0211",
    type: "INDEPENDENT",
    status: "DRAFT",
    displayName: "Atelier Rose",
    slug: "atelier-rose",
    category: "hair",
    tagline: "Curls, cuts and a calm chair",
    about:
      "A small hair studio in Rosemont focused on curly cuts, shape and scalp care. I work one client at a time, with a proper consultation and a finish you can recreate at home. Opening soon.",
    addressLine: "",
    neighbourhood: "Rosemont",
    lat: 45.5472,
    lng: -73.5931,
    travelRadiusKm: 5,
    servesAtHome: true,
    languages: "English, French",
    responseTimeHours: 4,
    ratingAvg: 0,
    ratingCount: 0,
    photos: ["/images/providers/rose-1.jpg"],
    services: [
      {
        name: "Curly cut",
        description: "Dry cut, shape and styling advice",
        priceCents: 7500,
        priceType: "FROM",
        durationMin: 75,
      },
    ],
    openDays: [3, 4, 5, 6],
    openTime: "10:00",
    closeTime: "18:00",
    areas: ["Rosemont"],
  },
  {
    key: "naya",
    ownerName: "Naya Kouassi",
    email: "naya@example.com",
    phone: "+1 514 555 0149",
    type: "INDEPENDENT",
    status: "PENDING",
    displayName: "Studio Naya",
    slug: "studio-naya",
    category: "braids",
    tagline: "Protective styles, patient hands",
    about:
      "I’m opening a small braiding studio in Rosemont and I’m ready to meet a few new clients while I settle in. I specialise in knotless braids and gentle styles for children.",
    addressLine: "2600 Rue Beaubien E",
    neighbourhood: "Rosemont",
    lat: 45.5452,
    lng: -73.5918,
    travelRadiusKm: 6,
    servesAtHome: true,
    travelsToClient: true,
    languages: "English, French",
    responseTimeHours: 4,
    ratingAvg: 0,
    ratingCount: 0,
    photos: ["/images/providers/studio-naya-1.jpg"],
    services: [
      {
        name: "Knotless braids",
        description: "Hair included · medium length",
        priceCents: 11000,
        priceType: "FROM",
        durationMin: 240,
      },
      {
        name: "Kids braids",
        description: "Gentle, patient styling",
        priceCents: 5000,
        priceType: "FROM",
        durationMin: 120,
      },
    ],
    openDays: [2, 3, 4, 5, 6],
    openTime: "10:00",
    closeTime: "18:00",
    areas: ["Rosemont", "Le Plateau", "Villeray"],
    submittedDaysAgo: 1,
  },
  {
    key: "etoile",
    ownerName: "Fatou Sarr",
    email: "fatou@example.com",
    phone: "+1 514 555 0186",
    type: "BUSINESS",
    status: "PENDING",
    displayName: "Ménage Étoile",
    legalName: "Ménage Étoile Inc.",
    slug: "menage-etoile",
    category: "cleaning",
    tagline: "Detailed cleaning for busy homes",
    about:
      "A three-person cleaning team serving Verdun and the south-west. We do weekly, biweekly and one-off deep cleans, and we’re happy to work with your own products if you prefer.",
    addressLine: "4000 Rue Wellington",
    neighbourhood: "Verdun",
    lat: 45.4635,
    lng: -73.5712,
    travelRadiusKm: 10,
    servesAtShop: true,
    travelsToClient: true,
    languages: "English, French",
    responseTimeHours: 3,
    ratingAvg: 0,
    ratingCount: 0,
    photos: ["/images/providers/menage-etoile-1.jpg"],
    services: [
      {
        name: "Recurring clean",
        description: "Weekly or biweekly · 2–3 hours",
        priceCents: 9500,
        priceType: "FROM",
        durationMin: 180,
      },
    ],
    openDays: [1, 2, 3, 4, 5],
    openTime: "08:00",
    closeTime: "17:00",
    areas: ["Verdun", "Saint-Henri", "Little Burgundy"],
    submittedDaysAgo: 2,
  },
  {
    key: "tisse",
    ownerName: "Inès Tissé",
    email: "ines@example.com",
    phone: "+1 514 555 0152",
    type: "INDEPENDENT",
    status: "REJECTED",
    displayName: "Atelier Tissé",
    slug: "atelier-tisse",
    category: "hair",
    tagline: "Hair, slowly",
    about:
      "A small hair studio in Hochelaga focused on natural texture, trims and scalp care.",
    addressLine: "1800 Rue Sainte-Catherine E",
    neighbourhood: "Hochelaga",
    lat: 45.5418,
    lng: -73.5495,
    travelRadiusKm: 4,
    servesAtHome: true,
    languages: "English, French",
    ratingAvg: 0,
    ratingCount: 0,
    photos: ["/images/providers/atelier-meches-2.jpg"],
    services: [
      {
        name: "Trim & scalp treatment",
        description: "Consultation included",
        priceCents: 6000,
        durationMin: 60,
      },
    ],
    openDays: [3, 4, 5, 6],
    openTime: "10:00",
    closeTime: "18:00",
    areas: ["Hochelaga"],
    submittedDaysAgo: 4,
    reviewedDaysAgo: 2,
    reviewNote:
      "Please add at least two photos of your own work and confirm the studio address before we can approve the profile.",
  },
];

const categorySeeds = [
  { slug: "hair", name: "Hair", blurb: "Cuts, colour, styling and blowouts.", icon: "scissors", sortOrder: 1 },
  { slug: "braids", name: "Braids", blurb: "Knotless, box braids, twists and protective styles.", icon: "waves", sortOrder: 2 },
  { slug: "beauty", name: "Beauty", blurb: "Makeup, brows, skincare and lash services.", icon: "sparkles", sortOrder: 3 },
  { slug: "nails", name: "Nails", blurb: "Manicures, pedicures and nail art.", icon: "hand", sortOrder: 4 },
  { slug: "cleaning", name: "Cleaning", blurb: "Home, move-out and recurring cleaning.", icon: "home", sortOrder: 5 },
  { slug: "repairs", name: "Repairs", blurb: "Phones, appliances, furniture and small fixes.", icon: "wrench", sortOrder: 6 },
  { slug: "tutoring", name: "Tutoring", blurb: "School support and language lessons.", icon: "graduation", sortOrder: 7 },
  { slug: "moving", name: "Moving", blurb: "Packing, loading and small moves.", icon: "truck", sortOrder: 8 },
  { slug: "photography", name: "Photography", blurb: "Portraits, events and content.", icon: "camera", sortOrder: 9 },
  { slug: "wellness", name: "Wellness", blurb: "Massage and self-care.", icon: "flower", sortOrder: 10 },
  { slug: "pets", name: "Pets", blurb: "Grooming and pet care.", icon: "paw", sortOrder: 11 },
  { slug: "events", name: "Events", blurb: "Small events and celebrations.", icon: "party", sortOrder: 12 },
];

let refCounter = 1000;
function reference() {
  refCounter += 1;
  return `HD-${refCounter.toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

async function main() {
  console.log("Resetting database…");
  await db.review.deleteMany();
  await db.bookingRequest.deleteMany();
  await db.savedProvider.deleteMany();
  await db.adminAction.deleteMany();
  await db.providerPhoto.deleteMany();
  await db.service.deleteMany();
  await db.openingHour.deleteMany();
  await db.serviceArea.deleteMany();
  await db.provider.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  await db.category.deleteMany();

  const providerPassword = await hashPassword("Provider123!");
  const customerPassword = await hashPassword("Customer123!");
  const adminPassword = await hashPassword("Admin123!");

  console.log("Creating categories…");
  const categories = await Promise.all(
    categorySeeds.map((category) => db.category.create({ data: category })),
  );
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  console.log("Creating people…");
  const admin = await db.user.create({
    data: {
      name: "Amélie Rousseau",
      email: "admin@holydo.market",
      passwordHash: adminPassword,
      phone: "+1 514 555 0100",
      role: "ADMIN",
    },
  });

  const customerSeeds = [
    { name: "Amina Kone", email: "amina@example.com", phone: "+1 514 555 0301" },
    { name: "Sarah Martel", email: "sarah@example.com", phone: "+1 514 555 0302" },
    { name: "Joséphine Roy", email: "josephine@example.com", phone: "+1 514 555 0303" },
    { name: "Maya Tremblay", email: "maya@example.com", phone: "+1 514 555 0304" },
    { name: "Karim Benali", email: "karim@example.com", phone: "+1 514 555 0305" },
  ];
  const customers = [];
  for (const customer of customerSeeds) {
    customers.push(
      await db.user.create({
        data: { ...customer, passwordHash: customerPassword, role: "CUSTOMER" },
      }),
    );
  }
  const customerByName = new Map(customers.map((customer) => [customer.name, customer]));

  console.log("Creating providers…");
  const providers = new Map<string, { id: string; services: { id: string; name: string }[] }>();

  for (const seed of providerSeeds) {
    const category = categoryMap.get(seed.category);
    if (!category) throw new Error(`Unknown category ${seed.category}`);

    const owner = await db.user.create({
      data: {
        name: seed.ownerName,
        email: seed.email,
        passwordHash: providerPassword,
        phone: seed.phone,
        role: "PROVIDER",
      },
    });

    const hours = Array.from({ length: 7 }, (_, day) => ({
      dayOfWeek: day,
      opensAt: seed.openTime,
      closesAt: seed.closeTime,
      isClosed: !seed.openDays.includes(day),
    }));

    const provider = await db.provider.create({
      data: {
        userId: owner.id,
        slug: seed.slug,
        type: seed.type,
        status: seed.status,
        displayName: seed.displayName,
        legalName: seed.legalName,
        tagline: seed.tagline,
        about: seed.about,
        categoryId: category.id,
        addressLine: seed.addressLine,
        city: "Montréal",
        neighbourhood: seed.neighbourhood,
        lat: seed.lat,
        lng: seed.lng,
        travelRadiusKm: seed.travelRadiusKm,
        servesAtHome: seed.servesAtHome ?? false,
        servesAtSalon: seed.servesAtSalon ?? false,
        servesAtShop: seed.servesAtShop ?? false,
        travelsToClient: seed.travelsToClient ?? false,
        phone: seed.phone,
        email: seed.email,
        languages: seed.languages ?? "English, French",
        responseTimeHours: seed.responseTimeHours ?? 4,
        featured: seed.featured ?? false,
        ratingAvg: seed.ratingAvg,
        ratingCount: seed.ratingCount,
        submittedAt: seed.submittedDaysAgo ? days(-seed.submittedDaysAgo) : null,
        reviewedAt: seed.reviewedDaysAgo ? days(-seed.reviewedDaysAgo) : null,
        reviewedByUserId:
          seed.status === "APPROVED" || seed.status === "REJECTED" ? admin.id : null,
        reviewNote: seed.reviewNote,
        services: {
          create: seed.services.map((service, index) => ({
            name: service.name,
            description: service.description,
            priceCents: service.priceCents,
            priceType: service.priceType ?? "FIXED",
            durationMin: service.durationMin,
            sortOrder: index,
            categoryId: category.id,
          })),
        },
        photos: {
          create: seed.photos.map((url, index) => ({
            url,
            alt: `${seed.displayName} — photo ${index + 1}`,
            sortOrder: index,
          })),
        },
        hours: { create: hours },
        areas: {
          create: seed.areas.map((label) => ({ label, city: "Montréal" })),
        },
      },
      include: { services: true },
    });

    providers.set(seed.key, {
      id: provider.id,
      services: provider.services.map((service) => ({ id: service.id, name: service.name })),
    });
  }

  console.log("Creating reviews and request history…");
  const reviewSeeds: Array<{
    provider: string;
    author: string;
    rating: number;
    body: string;
    daysAgo: number;
    service?: string;
  }> = [
    {
      provider: "nadia",
      author: "Sarah Martel",
      rating: 5,
      daysAgo: 14,
      service: "Knotless braids",
      body: "Nadia took her time and explained every step. My knotless braids lasted eight weeks and still looked neat. The studio is calm and clean, and she was great with my daughter too.",
    },
    {
      provider: "nadia",
      author: "Joséphine Roy",
      rating: 5,
      daysAgo: 32,
      service: "Kids braids (under 12)",
      body: "She came to my place for my daughter’s birthday braids. Punctual, patient, and the style was even better than the photo I sent.",
    },
    {
      provider: "nadia",
      author: "Amina Kone",
      rating: 5,
      daysAgo: 61,
      service: "Box braids",
      body: "First time with Nadia and I’ll be back. Clear pricing, gentle hands, and she checked in the next day to make sure everything felt comfortable.",
    },
    {
      provider: "atelier",
      author: "Amina Kone",
      rating: 5,
      daysAgo: 9,
      service: "Silk press",
      body: "Awa listened to what I wanted and did not rush the press. It held for over a week in humid weather.",
    },
    {
      provider: "atelier",
      author: "Karim Benali",
      rating: 4,
      daysAgo: 22,
      service: "Cut & style",
      body: "Good cut, friendly team. The salon was busy so my appointment started a little late, but they made up for it.",
    },
    {
      provider: "propre",
      author: "Maya Tremblay",
      rating: 5,
      daysAgo: 7,
      service: "Deep clean",
      body: "They cleaned things I had given up on. Everything smelled fresh but not chemical, and they were careful around my cat.",
    },
    {
      provider: "propre",
      author: "Sarah Martel",
      rating: 5,
      daysAgo: 18,
      service: "Standard clean",
      body: "Reliable, thorough and easy to communicate with. The same two people came both times, which makes a big difference.",
    },
    {
      provider: "aicha",
      author: "Joséphine Roy",
      rating: 5,
      daysAgo: 12,
      service: "Makeup application",
      body: "Aïcha understood the brief immediately. The makeup photographed beautifully but still looked like my skin.",
    },
    {
      provider: "aicha",
      author: "Amina Kone",
      rating: 5,
      daysAgo: 27,
      service: "Brow shaping & tint",
      body: "My brows have never looked better. She explained how to keep the shape and didn’t overfill them.",
    },
    {
      provider: "kora",
      author: "Karim Benali",
      rating: 4,
      daysAgo: 11,
      service: "Cornrows",
      body: "Clean work and a good atmosphere. Bring a snack — sessions are long.",
    },
    {
      provider: "kora",
      author: "Sarah Martel",
      rating: 5,
      daysAgo: 25,
      service: "Knotless braids",
      body: "Really neat partings and no tension headaches. The studio is easy to get to by metro.",
    },
    {
      provider: "mariam",
      author: "Maya Tremblay",
      rating: 5,
      daysAgo: 6,
      service: "Kids braids",
      body: "Mariam has endless patience. My daughter sat through the whole appointment and loved the result.",
    },
    {
      provider: "belanger",
      author: "Karim Benali",
      rating: 5,
      daysAgo: 15,
      service: "Phone screen replacement",
      body: "Fixed my screen in under an hour and explained what to do if the touch sensitivity acted up. Honest pricing.",
    },
    {
      provider: "nails",
      author: "Amina Kone",
      rating: 5,
      daysAgo: 5,
      service: "Gel manicure",
      body: "Beautiful work and a very calm little studio. Two weeks later and the gel is still perfect.",
    },
    {
      provider: "massage",
      author: "Sarah Martel",
      rating: 5,
      daysAgo: 16,
      service: "Deep tissue · 90 min",
      body: "Élise found every knot in my shoulders and checked in about pressure throughout. I left feeling like a different person.",
    },
    {
      provider: "lea",
      author: "Maya Tremblay",
      rating: 5,
      daysAgo: 8,
      service: "Maths tutoring",
      body: "My son actually looks forward to his sessions now. Léa sends a short summary after each one, which helps us follow along.",
    },
    {
      provider: "demenagement",
      author: "Karim Benali",
      rating: 5,
      daysAgo: 19,
      service: "Small apartment move",
      body: "They arrived on time, wrapped everything and finished faster than the estimate. Nothing was damaged.",
    },
    {
      provider: "photo",
      author: "Joséphine Roy",
      rating: 5,
      daysAgo: 21,
      service: "Headshots",
      body: "Yannick made the whole thing feel easy. The gallery came back in four days and the photos look like me on a good day.",
    },
    {
      provider: "bella",
      author: "Maya Tremblay",
      rating: 5,
      daysAgo: 4,
      service: "Full groom",
      body: "My dog is anxious and Bella was incredibly calm with her. No cages, no rushing, and she looks wonderful.",
    },
  ];

  for (const review of reviewSeeds) {
    const provider = providers.get(review.provider);
    if (!provider) continue;
    const author = customerByName.get(review.author);
    if (!author) continue;
    const service = provider.services.find((item) => item.name === review.service);

    const completed = await db.bookingRequest.create({
      data: {
        reference: reference(),
        providerId: provider.id,
        serviceId: service?.id,
        customerUserId: author.id,
        name: author.name,
        email: author.email,
        phone: author.phone ?? "+1 514 555 0000",
        preferredDate: days(-review.daysAgo - 2),
        preferredWindow: "AFTERNOON",
        status: "COMPLETED",
        createdAt: days(-review.daysAgo - 4),
        respondedAt: days(-review.daysAgo - 3),
      },
    });

    await db.review.create({
      data: {
        providerId: provider.id,
        authorUserId: author.id,
        bookingRequestId: completed.id,
        rating: review.rating,
        body: review.body,
        isVerified: true,
        createdAt: days(-review.daysAgo),
      },
    });
  }

  console.log("Creating live requests…");
  const amina = customerByName.get("Amina Kone")!;
  const sarah = customerByName.get("Sarah Martel")!;
  const maya = customerByName.get("Maya Tremblay")!;
  const karim = customerByName.get("Karim Benali")!;

  const liveRequests = [
    {
      provider: "nadia",
      customer: amina,
      service: "Knotless braids",
      date: 3,
      window: "MORNING",
      status: "PENDING",
      message:
        "Hi Nadia — first time booking with you. I have medium-length natural hair and a sensitive scalp. Would Saturday morning work?",
    },
    {
      provider: "nadia",
      customer: sarah,
      service: "Box braids",
      date: 6,
      window: "AFTERNOON",
      status: "ACCEPTED",
      message: "Same length as last time, please. I can come after 2 pm.",
      providerNote: "Saturday at 2 pm works. See you at the studio — I’ll confirm the address by email.",
    },
    {
      provider: "propre",
      customer: maya,
      service: "Deep clean",
      date: 4,
      window: "MORNING",
      status: "PENDING",
      message: "Two-bedroom apartment, one cat. The kitchen is the priority.",
    },
    {
      provider: "atelier",
      customer: karim,
      service: "Cut & style",
      date: 5,
      window: "EVENING",
      status: "PENDING",
      message: "I’d like a trim and a simple style for a wedding on the weekend.",
    },
    {
      provider: "aicha",
      customer: amina,
      service: "Makeup application",
      date: 8,
      window: "AFTERNOON",
      status: "ACCEPTED",
      message: "Soft glam for a dinner. I’ll send a reference photo.",
      providerNote: "Friday afternoon is available. Send the reference and I’ll confirm the studio details.",
    },
  ];

  for (const request of liveRequests) {
    const provider = providers.get(request.provider);
    if (!provider) continue;
    const service = provider.services.find((item) => item.name === request.service);
    await db.bookingRequest.create({
      data: {
        reference: reference(),
        providerId: provider.id,
        serviceId: service?.id,
        customerUserId: request.customer.id,
        name: request.customer.name,
        email: request.customer.email,
        phone: request.customer.phone ?? "+1 514 555 0000",
        preferredDate: days(request.date),
        preferredWindow: request.window,
        message: request.message,
        providerNote: request.providerNote ?? null,
        status: request.status,
        createdAt: days(-1),
        respondedAt: request.status === "ACCEPTED" ? new Date() : null,
      },
    });
  }

  console.log("Creating saved providers…");
  await db.savedProvider.createMany({
    data: [
      { userId: amina.id, providerId: providers.get("nadia")!.id },
      { userId: amina.id, providerId: providers.get("kora")!.id },
    ],
  });

  console.log("Creating approval history…");
  const adminActions = [
    { provider: "nadia", action: "APPROVE", note: "Identity and portfolio checked. Clear pricing." },
    { provider: "atelier", action: "APPROVE", note: "Business registration verified." },
    { provider: "propre", action: "APPROVE", note: "Insurance certificate on file." },
    { provider: "aicha", action: "APPROVE", note: "Portfolio and ID checked." },
    { provider: "tisse", action: "REJECT", note: "Needs more original photos and address confirmation." },
  ];
  for (const action of adminActions) {
    const provider = providers.get(action.provider);
    if (!provider) continue;
    await db.adminAction.create({
      data: {
        adminUserId: admin.id,
        providerId: provider.id,
        action: action.action,
        note: action.note,
      },
    });
  }

  const counts = {
    categories: categories.length,
    providers: providerSeeds.length,
    approved: providerSeeds.filter((p) => p.status === "APPROVED").length,
    pending: providerSeeds.filter((p) => p.status === "PENDING").length,
    draft: providerSeeds.filter((p) => p.status === "DRAFT").length,
    reviews: reviewSeeds.length,
    requests: await db.bookingRequest.count(),
    saved: await db.savedProvider.count(),
  };
  console.log("Seed complete:", counts);
  console.log("Admin: admin@holydo.market / Admin123!");
  console.log("Customer: amina@example.com / Customer123!");
  console.log("Provider (approved): nadia@example.com / Provider123!");
  console.log("Provider (pending): naya@example.com / Provider123!");
  console.log("Provider (draft): rose@example.com / Provider123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
