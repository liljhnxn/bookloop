"use client";

import React from "react";
import { Book, BookStatus } from "@/types/book";
import {
  X,
  BookOpen,
  Calendar,
  User,
  Tag,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HandHeart,
  Trash2,
  Clock,
  Check,
} from "lucide-react";
import { EXPLORER_URL } from "@/config/contract";

interface BookDetailsModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserAddress?: `0x${string}`;
  onClaim: (bookId: bigint) => void;
  onMarkCollected: (bookId: bigint) => void;
  onRemove: (bookId: bigint) => void;
  isActionPending?: boolean;
}

export function BookDetailsModal({
  book,
  isOpen,
  onClose,
  currentUserAddress,
  onClaim,
  onMarkCollected,
  onRemove,
  isActionPending = false,
}: BookDetailsModalProps) {
  if (!isOpen || !book) return null;

  const isOwner =
    currentUserAddress &&
    book.owner.toLowerCase() === currentUserAddress.toLowerCase();

  const isClaimer =
    currentUserAddress &&
    book.claimer.toLowerCase() === currentUserAddress.toLowerCase();

  const formatDate = (timestamp: bigint) => {
    if (!timestamp || timestamp === BigInt(0)) return "Pending";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    switch (book.status) {
      case BookStatus.Available:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5EFEB] text-[#C85A17] border border-[#E4D7C8]">
            <span className="w-2 h-2 rounded-full bg-[#C85A17]" />
            <span>Available to Claim</span>
          </span>
        );
      case BookStatus.Claimed:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Claimed (Awaiting Handover)</span>
          </span>
        );
      case BookStatus.Collected:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Collected & Shared</span>
          </span>
        );
      case BookStatus.Removed:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            <span>Listing Withdrawn</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1810]/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#E6D8CA] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8C7567] hover:text-[#2C1810] hover:bg-[#EFE6DD] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Category / Status */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#6B5549] bg-white px-3 py-1 rounded-lg border border-[#E6D8CA]">
            <Tag className="w-3.5 h-3.5 text-[#C85A17]" />
            <span>{book.category}</span>
          </span>
          {getStatusBadge()}
          <span className="text-xs text-[#8C7567] font-mono ml-auto">
            Book ID: #{book.id.toString()}
          </span>
        </div>

        {/* Book Title & Author */}
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#2C1810] leading-tight">
          {book.title}
        </h2>
        <p className="text-base text-[#6B5549] mt-1.5 font-serif italic">
          Written by <span className="font-semibold text-[#2C1810]">{book.author}</span>
        </p>

        {/* Description Section */}
        <div className="mt-6 bg-white rounded-2xl p-5 border border-[#EADBCC]">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-[#8C7567] mb-2">
            Reader’s Note & Description
          </h4>
          <p className="text-sm text-[#2C1810] leading-relaxed whitespace-pre-line">
            {book.description || "The owner did not leave a custom description for this book."}
          </p>
        </div>

        {/* On-Chain Provenance / Timeline */}
        <div className="mt-6 bg-white rounded-2xl p-5 border border-[#EADBCC]">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-[#8C7567] mb-3 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>On-Chain Provenance & Timeline</span>
          </h4>

          <div className="space-y-3 text-xs text-[#6B5549]">
            {/* Owner */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F5EFEB]">
              <span className="text-[#8C7567]">Listed by:</span>
              <div className="flex items-center space-x-1.5 font-mono">
                <span className={isOwner ? "font-bold text-[#C85A17]" : "text-[#2C1810]"}>
                  {isOwner ? "You (Original Owner)" : book.owner}
                </span>
                <a
                  href={`${EXPLORER_URL}/address/${book.owner}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#8C7567] hover:text-[#C85A17]"
                  title="View on BohrScan"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Listed At */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F5EFEB]">
              <span className="text-[#8C7567]">Listed on:</span>
              <span className="text-[#2C1810] font-medium">{formatDate(book.createdAt)}</span>
            </div>

            {/* Claimed info */}
            {book.claimer && book.claimer !== "0x0000000000000000000000000000000000000000" && (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-[#F5EFEB]">
                  <span className="text-[#8C7567]">Claimed by:</span>
                  <div className="flex items-center space-x-1.5 font-mono">
                    <span className={isClaimer ? "font-bold text-amber-800" : "text-[#2C1810]"}>
                      {isClaimer ? "You (Claimer)" : book.claimer}
                    </span>
                    <a
                      href={`${EXPLORER_URL}/address/${book.claimer}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#8C7567] hover:text-[#C85A17]"
                      title="View on BohrScan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#F5EFEB]">
                  <span className="text-[#8C7567]">Claimed on:</span>
                  <span className="text-[#2C1810] font-medium">{formatDate(book.claimedAt)}</span>
                </div>
              </>
            )}

            {/* Collected info */}
            {book.status === BookStatus.Collected && (
              <div className="flex items-center justify-between">
                <span className="text-[#8C7567]">Collected on:</span>
                <span className="text-emerald-700 font-medium">{formatDate(book.collectedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-8 pt-4 border-t border-[#E6D8CA] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-medium text-[#6B5549] hover:bg-[#EFE6DD] transition-colors"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            {book.status === BookStatus.Available && (
              <>
                {isOwner ? (
                  <button
                    onClick={() => {
                      onRemove(book.id);
                      onClose();
                    }}
                    disabled={isActionPending}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Withdraw Listing</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClaim(book.id);
                      onClose();
                    }}
                    disabled={isActionPending}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#C85A17] hover:bg-[#AF4B0E] text-white shadow-sm transition-all disabled:opacity-50"
                  >
                    <HandHeart className="w-4 h-4" />
                    <span>Claim This Book</span>
                  </button>
                )}
              </>
            )}

            {book.status === BookStatus.Claimed && isOwner && (
              <button
                onClick={() => {
                  onMarkCollected(book.id);
                  onClose();
                }}
                disabled={isActionPending}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Book Received / Collected</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

