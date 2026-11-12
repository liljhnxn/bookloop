"use client";

import React, { useState } from "react";
import { X, BookOpen, AlertCircle, Loader2, Sparkles, Check } from "lucide-react";
import { BOOK_CATEGORIES } from "@/types/book";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, author: string, description: string, category: string) => Promise<void>;
  isLoading: boolean;
  isConnected: boolean;
  onConnectWallet: () => void;
}

export function CreateListingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  isConnected,
  onConnectWallet,
}: CreateListingModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<string>("Fiction");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a book title.");
      return;
    }
    if (!author.trim()) {
      setError("Please provide the author's name.");
      return;
    }
    if (!category.trim() || category === "All") {
      setError("Please select a specific book category.");
      return;
    }

    try {
      await onSubmit(title.trim(), author.trim(), description.trim(), category);
      // Reset form on success
      setTitle("");
      setAuthor("");
      setDescription("");
      setCategory("Fiction");
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Failed to list book on-chain.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1810]/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E6D8CA] shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8C7567] hover:text-[#2C1810] hover:bg-[#EFE6DD] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#C85A17] flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-[#2C1810]">
              List a Book for Giving
            </h2>
            <p className="text-xs text-[#6B5549]">
              Every book listed is saved permanently on Botchain Mainnet.
            </p>
          </div>
        </div>

        {/* Not connected warning */}
        {!isConnected ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center my-4">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-amber-900 mb-1">
              Wallet Required
            </h3>
            <p className="text-xs text-amber-700 mb-4">
              Please connect your Web3 wallet (MetaMask) to write your book listing onto the blockchain.
            </p>
            <button
              onClick={onConnectWallet}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#2C1810] text-[#FAF7F2] hover:bg-[#42281D] shadow-sm transition-all"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-[#2C1810] mb-1">
                Book Title <span className="text-[#C85A17]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Picture of Dorian Gray"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3BFAB] bg-white text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A17]/40 placeholder:text-[#8C7567]/60"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-medium text-[#2C1810] mb-1">
                Author <span className="text-[#C85A17]">*</span>
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Oscar Wilde"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3BFAB] bg-white text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A17]/40 placeholder:text-[#8C7567]/60"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#2C1810] mb-1">
                Category / Genre <span className="text-[#C85A17]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3BFAB] bg-white text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A17]/40"
              >
                {BOOK_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description / Reader Note */}
            <div>
              <label className="block text-xs font-medium text-[#2C1810] mb-1">
                Reader Note & Condition <span className="text-xs text-[#8C7567]">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Hardcover edition, excellent condition. A thrilling philosophical classic that kept me reading late into the night."
                disabled={isLoading}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D3BFAB] bg-white text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A17]/40 placeholder:text-[#8C7567]/60 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#6B5549] hover:bg-[#EFE6DD] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#C85A17] hover:bg-[#AF4B0E] text-white shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming on Botchain...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publish Listing</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

