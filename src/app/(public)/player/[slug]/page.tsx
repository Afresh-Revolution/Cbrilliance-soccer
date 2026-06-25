import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlayerBySlug } from '@/lib/data/queries';
import PlayerProfileView from '@/components/players/PlayerProfileView';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) return { title: 'Player Not Found' };
  return {
    title: player.fullName,
    description: player.biography.slice(0, 160),
    openGraph: { images: [player.profilePhoto] },
  };
}

export default async function PlayerProfilePage({ params }: Props) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890';

  return <PlayerProfileView player={player} whatsapp={whatsapp} />;
}
