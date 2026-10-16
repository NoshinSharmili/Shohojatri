import {
  Blocks,
  Ear,
  Eye,
  Gift,
  Hand,
  History,
  Lightbulb,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  PersonStanding,
  Pointer,
  ScanFace,
  Smile,
  Star,
  Sun,
  ToyBrick,
  Users,
  Volume2,
  Waves,
} from "lucide-react";

import type { ScoredTask } from "@/lib/screening/results";

// Stand-ins until the per-item illustrations arrive (design handoff §7).
const DOMAIN_ICONS: Record<string, LucideIcon> = {
  response_to_name: Megaphone,
  eye_contact: Eye,
  joint_attention: Pointer,
  requesting: Hand,
  sharing: Gift,
  social_smile: Smile,
  imitation: PersonStanding,
  pretend_play: ToyBrick,
  peer_interest: Users,
  showing_off: Star,
  understanding: Lightbulb,
  language: MessageCircle,
  social_referencing: ScanFace,
  repetitive_movement: Waves,
  repetitive_play: Blocks,
  sensory_sound: Volume2,
  sensory_other: Sun,
  regression: History,
  hearing: Ear,
};

/** The games, as on the Part 2 intro (and the result design's observation rows). */
export const TASK_ICONS: Record<ScoredTask, LucideIcon> = {
  rtn: Ear,
  joint_attention: Hand,
  imitation: PersonStanding,
  gaze_preference: Eye,
  free_play: Blocks,
};

export const domainIcon = (domain: string): LucideIcon => DOMAIN_ICONS[domain] ?? MessageCircle;

export function DomainIcon({ domain, className }: { domain: string; className?: string }) {
  const Icon = DOMAIN_ICONS[domain] ?? MessageCircle;
  return <Icon aria-hidden className={className} />;
}
