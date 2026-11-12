"use client";

import React from "react";
import { Book, BookStatus } from "@/types/book";
import { BookOpen, User, Calendar, Tag, ExternalLink, CheckCircle2, HandHeart, Trash2, ArrowUpRight } from "lucide-react";
import { EXPLORER_URL } from "@/config/contract";

interface BookCardProps {
  book: Book;
  currentUserAddress?: `0x${string}`;
  onClaim: (bookId: bigint) => void;
  onMarkCollected: (bookId: bigint) => void;
  onRemove: (bookId: bigint) => void;
  onViewDetails: (book: Book) => void;
  isClaimPending?: boolean;
  isActionPending?: boolean;
}

export function BookCard({
  book,
  currentUserAddress,
  onClaim,
  onMarkCollected,
  onRemove,
  onViewDetails,
  isClaimPending = false,
  isActionPending = false,
}: BookCardProps) {
  const isOwner =
    currentUserAddress &&
    book.owner.toLowerCase() === currentUserAddress.toLowerCase();

  const isClaimer =
    currentUserAddress &&
    book.claimer.toLowerCase() === currentUserAddress.toLowerCase();

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatDate = (timestamp: bigint) => {
    if (!timestamp || timestamp === BigInt(0)) return "";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (book.status) {
      case BookStatus.Available:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F5EFEB] text-[#C85A17] border border-[#E4D7C8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C85A17]" />
            <span>Available</span>
          </span>
        );
      case BookStatus.Claimed:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Claimed</span>
          </span>
        );
      case BookStatus.Collected:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Collected</span>
          </span>
        );
      case BookStatus.Removed:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <span>Withdrawn</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EADBCC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center space-x-1 text-xs font-medium text-[#6B5549] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E6D8CA]">
            <Tag className="w-3 h-3 text-[#C85A17]" />
            <span>{book.category}</span>
          </span>
          {getStatusBadge()}
        </div>

        {/* Book Title & Author */}
        <h3
          onClick={() => onViewDetails(book)}
          className="text-lg font-bold font-serif text-[#2C1810] line-clamp-2 hover:text-[#C85A17] cursor-pointer transition-colors group-hover:underline decoration-[#D3BFAB] underline-offset-4"
        >
          {book.title}
        </h3>
        <p className="text-sm text-[#6B5549] mt-1 flex items-center space-x-1 italic">
          <span>by</span>
          <span className="font-medium text-[#2C1810]">{book.author}</span>
        </p>

        {/* Description snippet */}
        <p className="text-xs text-[#8C7567] mt-3 line-clamp-2 leading-relaxed">
          {book.description || "No reader description provided."}
        </p>

        {/* Metadata info */}
        <div className="mt-4 pt-3 border-t border-[#F0E6DC] space-y-1.5 text-xs text-[#6B5549]">
          <div className="flex items-center justify-between">
            <span className="text-[#8C7567]">Listed by:</span>
            <div className="flex items-center space-x-1 font-mono">
              <span className={isOwner ? "font-bold text-[#C85A17]" : "text-[#2C1810]"}>
                {isOwner ? "You (Owner)" : shortenAddress(book.owner)}
              </span>
              <a
                href={`${EXPLORER_URL}/address/${book.owner}`}
                target="_blank"
                rel="noreferrer"
                title="View on BotchainScan"
                className="text-[#8C7567] hover:text-[#C85A17]"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {book.status === BookStatus.Claimed && book.claimer && (
            <div className="flex items-center justify-between">
              <span className="text-[#8C7567]">Claimed by:</span>
              <div className="flex items-center space-x-1 font-mono">
                <span className={isClaimer ? "font-bold text-amber-800" : "text-[#2C1810]"}>
                  {isClaimer ? "You (Claimer)" : shortenAddress(book.claimer)}
                </span>
                <a
                  href={`${EXPLORER_URL}/address/${book.claimer}`}
                  target="_blank"
                  rel="noreferrer"
                  title="View on BotchainScan"
                  className="text-[#8C7567] hover:text-[#C85A17]"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#8C7567]">
            <span>Listed:</span>
            <span>{formatDate(book.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-5 pt-3 border-t border-[#F0E6DC] flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDetails(book)}
          className="text-xs font-medium text-[#6B5549] hover:text-[#2C1810] flex items-center space-x-1 px-2 py-1.5 rounded-lg hover:bg-[#FAF7F2] transition-colors"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        {/* Dynamic Action Buttons based on status and ownership */}
        <div>
          {book.status === BookStatus.Available && (
            <>
              {isOwner ? (
                <button
                  onClick={() => onRemove(book.id)}
                  disabled={isActionPending}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                  title="Remove this listing from BookLoop"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              ) : (
                <button
                  onClick={() => onClaim(book.id)}
                  disabled={isClaimPending}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#C85A17] hover:bg-[#AF4B0E] text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <HandHeart className="w-3.5 h-3.5" />
                  <span>{isClaimPending ? "Claiming..." : "Claim Book"}</span>
                </button>
              )}
            </>
          )}

          {book.status === BookStatus.Claimed && (
            <>
              {isOwner ? (
                <button
                  onClick={() => onMarkCollected(book.id)}
                  disabled={isActionPending}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all disabled:opacity-50"
                  title="Confirm reader received the book"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Collected</span>
                </button>
              ) : isClaimer ? (
                <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  You Claimed This
                </span>
              ) : (
                <span className="text-xs font-medium text-[#8C7567]">
                  Claimed
                </span>
              )}
            </>
          )}

          {book.status === BookStatus.Collected && (
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shared</span>
            </span>
          )}

          {book.status === BookStatus.Removed && (
            <span className="text-xs font-medium text-gray-500 italic">
              Removed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

