import axios from "axios";
import type { Note, NoteTag } from "@/types/note";

// ==== Config ====
const BASE_URL = "https://notehub-public.goit.study/api/notes";
const TOKEN = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;

const getAuthHeader = () => ({
  Authorization: `Bearer ${TOKEN}`,
});

// ==== Axios instance ====
const api = axios.create({
  baseURL: BASE_URL,
});

// ==== Types ====
export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  tag: NoteTag;
}

// ==== API Methods ====

// Отримання всіх нотаток
export const fetchNotes = async ({
  page = 1,
  perPage = 12,
  search = "",
  tag,
}: FetchNotesParams = {}): Promise<FetchNotesResponse> => {
  const params: Record<string, string | number> = { page, perPage };

  if (search.trim()) params.search = search;
  if (tag) params.tag = tag;

  const { data } = await api.get<FetchNotesResponse>("/", {
    params,
    headers: getAuthHeader(),
  });
  return data;
};

// Отримання нотатки за ID (залишаємо лише одну функцію)
export const fetchNoteById = async (id: string | number): Promise<Note> => {
  const { data } = await api.get<Note>(`/${id}`, {
    headers: getAuthHeader(),
  });
  return data;
};

// Створення нової нотатки
export const createNote = async (note: CreateNoteDto): Promise<Note> => {
  const { data } = await api.post<Note>("/", note, {
    headers: getAuthHeader(),
  });
  return data;
};

// Видалення нотатки за ID
export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await api.delete<Note>(`/${id}`, {
    headers: getAuthHeader(),
  });
  return data;
};

// ==== Export as service ====
const noteService = {
  fetchNotes,
  fetchNoteById,
  createNote,
  deleteNote,
};

export default noteService;
