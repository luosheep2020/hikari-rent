import Link from 'next/link';

interface MessagesPageProps {
  searchParams: Promise<{
    rentalId?: string | string[];
    agentId?: string | string[];
  }>;
}

export default async function MessagesPage({
                                             searchParams,
                                           }: MessagesPageProps) {
  const params = await searchParams;

  const rentalId = Array.isArray(params.rentalId)
    ? params.rentalId[0]
    : params.rentalId;

  return (
    <section
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      <h1>メッセージ</h1>
      <p>チャット画面はこれから実装します。</p>

      {rentalId && (
        <Link href={`/rentals/${encodeURIComponent(rentalId)}`}>
          物件の詳細に戻る →
        </Link>
      )}
    </section>
  );
}
