import { fetchNotes } from "@/lib/api";
import Notes from "./Notes.client";
import css from "./NotePage.module.css";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", "", 1], // search = "", page = 1
    queryFn: () => fetchNotes({ page: 1, perPage: 12 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className={css.wrapper}>
        <h1 className={css.title}>All Notes</h1>
        <Notes />
      </div>
    </HydrationBoundary>
  );
}