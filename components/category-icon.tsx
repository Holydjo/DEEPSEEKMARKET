import {
  Brush,
  Camera,
  Flower2,
  GraduationCap,
  Hand,
  Home,
  PartyPopper,
  PawPrint,
  Scissors,
  Sparkles,
  Truck,
  Waves,
  Wrench,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  scissors: Scissors,
  waves: Waves,
  sparkles: Sparkles,
  hand: Hand,
  home: Home,
  wrench: Wrench,
  graduation: GraduationCap,
  truck: Truck,
  camera: Camera,
  flower: Flower2,
  paw: PawPrint,
  party: PartyPopper,
  brush: Brush,
} satisfies Record<string, React.ComponentType<LucideProps>>;

export function CategoryIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? Sparkles;
  return <Icon {...props} />;
}
