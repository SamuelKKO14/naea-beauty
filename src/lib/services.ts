export type Service = {
  id: string;
  name: string;
  category: "Cils" | "Sourcils" | "Sourire";
  duration: string;
  price: number;
  description: string;
  image?: string;
};

export const SERVICES: Service[] = [
  {
    id: "rehaussement-cils-simple",
    name: "Réhaussement de cils",
    category: "Cils",
    duration: "1h",
    price: 20,
    description:
      "Un regard ouvert et magnétique sans extension : courbure naturelle qui dure 6 à 8 semaines.",
    image: "/services/cils-simple.png",
  },
  {
    id: "rehaussement-cils-teinture",
    name: "Réhaussement de cils + teinture",
    category: "Cils",
    duration: "1h",
    price: 25,
    description:
      "Le réhaussement, sublimé par une teinture qui intensifie votre regard. Fini le mascara.",
    image: "/services/cils-teinture.png",
  },
  {
    id: "browlift",
    name: "Browlift",
    category: "Sourcils",
    duration: "1h",
    price: 20,
    description:
      "Vos sourcils redessinés, lissés et structurés pour un effet laminé naturel et durable.",
    image: "/services/browlift.png",
  },
  {
    id: "browlift-restructuration",
    name: "Browlift + restructuration",
    category: "Sourcils",
    duration: "1h",
    price: 30,
    description:
      "Browlift complet avec restructuration de la ligne (sans épilation) pour un dessin parfait.",
    image: "/services/browlift.png",
  },
  {
    id: "blanchiment-dentaire",
    name: "Blanchiment dentaire « Ultra White »",
    category: "Sourire",
    duration: "1h",
    price: 50,
    description:
      "Un sourire éclatant en une seule séance, en toute sécurité. Résultat visible immédiatement.",
    image: "/services/dents.png",
  },
  {
    id: "retouche-blanchiment",
    name: "Retouche blanchiment",
    category: "Sourire",
    duration: "1h",
    price: 30,
    description:
      "Pour entretenir l’éclat de votre sourire après une première séance.",
    image: "/services/dents.png",
  },
];

export const CATEGORIES: { name: Service["category"]; tagline: string }[] = [
  { name: "Cils", tagline: "Un regard de braise" },
  { name: "Sourcils", tagline: "Un dessin sur-mesure" },
  { name: "Sourire", tagline: "Une lumière retrouvée" },
];
