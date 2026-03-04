import { fetchPages } from "../../../../../lib/api";
import { Reader } from "../../../../../components/Reader";

export default async function ReaderPage({ params }: { params: Promise<{ source: string; chapterId: string }> }) {
  const { source, chapterId } = await params;
  const pages = await fetchPages(source, chapterId);
  return (
    <main className="min-h-screen px-4 py-6 md:px-10">
      <Reader pages={pages} />
    </main>
  );
}
