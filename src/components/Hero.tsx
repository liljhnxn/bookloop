"use client";

import React from "react";
import { BookOpen, Sparkles, HeartHandshake, ShieldCheck, ArrowRight, Library } from "lucide-react";

interface HeroProps {
  totalBooksListed: number;
  totalBooksShared: number;
  onExploreClick: () => void;
  onListClick: () => void;
}

export function Hero({
  totalBooksListed,
  totalBooksShared,
  onExploreClick,
  onListClick,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 border-b border-[#E6D8CA]/60">
      {/* Subtle literary background motifs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C85A17]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#EFE6DD] rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EFE6DD] text-[#6B5549] text-xs font-semibold uppercase tracking-wider mb-6 border border-[#DFD2C2]">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A17]" />
            <span>Share a Book. Spread Knowledge.</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-[#2C1810] tracking-tight leading-[1.15]">
            Every Book Deserves <br className="hidden sm:inline" />
            <span className="text-[#C85A17] italic">Another Reader.</span>
          </h1>

          {/* Subtitle / Community Concept */}
          <p className="mt-6 text-base sm:text-lg text-[#6B5549] leading-relaxed font-sans max-w-2xl mx-auto">
            BookLoop is a decentralized community library where literature lives on.
            Pass on books that shaped you, claim your next literary discovery,
            and keep stories circulating freely—verified transparently on Botchain.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onListClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#C85A17] hover:bg-[#AF4B0E] text-white font-medium shadow-md shadow-[#C85A17]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Give Away a Book</span>
            </button>
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#2C1810] font-medium border border-[#D3BFAB] shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Library className="w-5 h-5 text-[#8C7567]" />
              <span>Browse Library</span>
              <ArrowRight className="w-4 h-4 text-[#8C7567]" />
            </button>
          </div>

          {/* Live On-Chain Counter Cards */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            
            {/* Counter 1: Total Listed */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#EADBCC] shadow-sm text-center">
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#C85A17] border border-[#E6D8CA]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2C1810]">
                {totalBooksListed}
              </div>
              <p className="text-xs font-medium text-[#8C7567] mt-0.5">
                Total Books Listed
              </p>
            </div>

            {/* Counter 2: Books Shared */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#EADBCC] shadow-sm text-center">
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#2C1810] border border-[#E6D8CA]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2C1810]">
                {totalBooksShared}
              </div>
              <p className="text-xs font-medium text-[#8C7567] mt-0.5">
                Books Shared & Collected
              </p>
            </div>

            {/* Counter 3: Botchain Verified */}
            <div className="col-span-2 md:col-span-1 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#EADBCC] shadow-sm text-center">
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-emerald-700 border border-[#E6D8CA]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-[#2C1810]">
                Botchain 968
              </div>
              <p className="text-xs font-medium text-[#8C7567] mt-0.5">
                100% On-Chain Records
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

