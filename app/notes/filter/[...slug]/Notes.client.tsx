"use client";

import { useState } from "react";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { fetchNotes } from "@/lib/api";

import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import type { Tag } from "@/types/note";
import css from "./NotePage.module.css";

// ===== Типізація пропсів =====
interface NotesProps {
  initialTag:Tag | undefined;
}

export default function Notes({ initialTag }: NotesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // ===== Завантаження нотаток з фільтром за тегом =====
  const { data, isLoading, error } = useQuery({
    queryKey: ["notes", initialTag, debouncedSearchTerm, currentPage],
    queryFn: () =>
      fetchNotes({
        page: currentPage,
        perPage: 12,
        search: debouncedSearchTerm,
        tag: initialTag || undefined, // якщо тег пустий, не передаємо його
      }),
    placeholderData: keepPreviousData,
  });

  // ===== Обробники =====
  const handlePageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreateNote = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleNoteCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    setIsModalOpen(false);
  };

  // ===== Дані для рендеру =====
  const notes = data?.notes || [];
  const totalPages = data?.totalPages || 0;

  // ===== Рендер помилки =====
  if (error) {
    return (
      <div className={css.error}>
        Error loading notes. Please try again later.
      </div>
    );
  }

  // ===== Основний рендер =====
  return (
    <div className={css.container}>
      <div className={css.toolbar}>
        <SearchBox value={searchTerm} onChange={handleSearchChange} />
        <button className={css.button} onClick={handleCreateNote}>
          Create note +
        </button>
      </div>

      {isLoading && <div className={css.loading}>Loading notes...</div>}

      {notes.length > 0 && <NoteList notes={notes} />}

      {!isLoading && notes.length === 0 && (
        <div className={css.empty}>
          {searchTerm
            ? "No notes found for your search."
            : initialTag
            ? `No notes found for tag "${initialTag}".`
            : "No notes yet. Create your first note!"}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          pageCount={totalPages}
          currentPage={currentPage - 1}
          onPageChange={handlePageChange}
        />
      )}

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <NoteForm onCancel={handleCloseModal} onSubmit={handleNoteCreated} />
        </Modal>
      )}
    </div>
  );
}
