import { fetchNotes } from "@/lib/api";
import Notes from "./Notes.client";
import css from "./NotePage.module.css";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { Tag } from "@/types/note";

export const dynamic = "force-dynamic";

interface NotesPageProps {
  params: Promise<{ slug: Tag[] }>; // динамічні параметри з URL
}

export default async function NotesPage({ params }: NotesPageProps) {
  const { slug } = await params;

  // Витягуємо тег із маршруту, якщо він є
  const tag = slug?.[0] || "";

  const queryClient = new QueryClient();

  // Попереднє завантаження нотаток із фільтром за тегом
  await queryClient.prefetchQuery({
    queryKey: ["notes", tag, 1], // включаємо тег у ключ
    queryFn: () => fetchNotes({ page: 1, perPage: 12, tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className={css.wrapper}>
        <h1 className={css.title}>{tag ? `Notes tagged: ${tag}` : "All Notes"}</h1>
        {/* Передаємо тег у клієнтський компонент */}
        <Notes initialTag={tag} />
      </div>
    </HydrationBoundary>
  );
}
