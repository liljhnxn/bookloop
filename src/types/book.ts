export enum BookStatus {
  Available = 0,
  Claimed = 1,
  Collected = 2,
  Removed = 3,
}

export interface Book {
  id: bigint;
  owner: `0x${string}`;
  claimer: `0x${string}`;
  title: string;
  author: string;
  description: string;
  category: string;
  status: BookStatus;
  createdAt: bigint;
  claimedAt: bigint;
  collectedAt: bigint;
}

export interface NewBookForm {
  title: string;
  author: string;
  description: string;
  category: string;
}

export const BOOK_CATEGORIES = [
  "All",
  "Fiction",
  "Non-Fiction",
  "Science Fiction & Fantasy",
  "Mystery & Thriller",
  "Technology & Programming",
  "Philosophy & Thought",
  "Biography & Memoir",
  "History",
  "Self-Improvement",
  "Arts & Poetry",
  "Science & Nature",
  "Children & Young Adult",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

