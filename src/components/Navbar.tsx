"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { BookOpen, PlusCircle, Wallet, LogOut, Check, Copy, ExternalLink, AlertTriangle, Layers } from "lucide-react";
import { botchain } from "@/config/wagmi";
import { EXPLORER_URL } from "@/config/contract";

interface NavbarProps {
  onOpenCreateModal: () => void;
  activeTab: "explore" | "my-listings" | "my-claims";
  setActiveTab: (tab: "explore" | "my-listings" | "my-claims") => void;
  myListingsCount: number;
  myClaimsCount: number;
}

export function Navbar({
  onOpenCreateModal,
  activeTab,
  setActiveTab,
  myListingsCount,
  myClaimsCount,
}: NavbarProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [copied, setCopied] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);

  const isWrongNetwork = isConnected && chainId !== botchain.id;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.id === "injected") || connectors[0];
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6D8CA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("explore")}>
            <div className="w-11 h-11 rounded-xl bg-[#C85A17] flex items-center justify-center text-white shadow-md shadow-[#C85A17]/20 border border-[#9E3E0E]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold font-serif tracking-tight text-[#2C1810]">BookLoop</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-[#EFE6DD] text-[#6B5549] rounded-full border border-[#D3BFAB]">
                  Botchain Testnet
                </span>
              </div>
              <p className="text-xs text-[#6B5549] hidden md:block">
                Share a Book. Spread Knowledge.
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#EFE6DD] p-1.5 rounded-xl border border-[#DFD2C2]">
            <button
              onClick={() => setActiveTab("explore")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "explore"
                  ? "bg-white text-[#2C1810] shadow-sm font-semibold"
                  : "text-[#6B5549] hover:text-[#2C1810] hover:bg-[#FAF7F2]/60"
              }`}
            >
              Explore Books
            </button>
            <button
              onClick={() => setActiveTab("my-listings")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === "my-listings"
                  ? "bg-white text-[#2C1810] shadow-sm font-semibold"
                  : "text-[#6B5549] hover:text-[#2C1810] hover:bg-[#FAF7F2]/60"
              }`}
            >
              <span>My Listings</span>
              {isConnected && myListingsCount > 0 && (
                <span className="px-1.5 py-0.2 text-xs rounded-full bg-[#C85A17] text-white">
                  {myListingsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("my-claims")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === "my-claims"
                  ? "bg-white text-[#2C1810] shadow-sm font-semibold"
                  : "text-[#6B5549] hover:text-[#2C1810] hover:bg-[#FAF7F2]/60"
              }`}
            >
              <span>My Claimed Books</span>
              {isConnected && myClaimsCount > 0 && (
                <span className="px-1.5 py-0.2 text-xs rounded-full bg-[#3A2318] text-[#FAF7F2]">
                  {myClaimsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-3">
            {/* List Book CTA */}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#C85A17] hover:bg-[#AF4B0E] text-white shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">List a Book</span>
              <span className="sm:hidden">List</span>
            </button>

            {/* Wallet Connection */}
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#2C1810] hover:bg-[#42281D] text-[#FAF7F2] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-[#D3BFAB]" />
                <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            ) : isWrongNetwork ? (
              <button
                onClick={() => switchChain({ chainId: botchain.id })}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Switch to Botchain (968)</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-white border border-[#E6D8CA] text-[#2C1810] hover:border-[#C85A17] transition-all shadow-sm"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs">{shortenAddress(address!)}</span>
                </button>

                {walletDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-[#E6D8CA] shadow-xl py-2 z-50 text-sm text-[#2C1810]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-2 border-b border-[#F0E6DC]">
                      <p className="text-xs text-[#8C7567]">Connected Wallet</p>
                      <p className="font-mono text-xs text-[#2C1810] mt-0.5 break-all">{address}</p>
                    </div>

                    <div className="px-2 py-1">
                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-[#6B5549] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Address Copied!" : "Copy Address"}</span>
                      </button>

                      <a
                        href={`${EXPLORER_URL}/address/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-[#6B5549] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View on BohrScan</span>
                      </a>
                    </div>

                    <div className="border-t border-[#F0E6DC] pt-1 px-2">
                      <button
                        onClick={() => {
                          disconnect();
                          setWalletDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-rose-700 hover:bg-rose-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#E6D8CA]">
          <button
            onClick={() => setActiveTab("explore")}
            className={`text-xs py-1.5 px-3 rounded-lg font-medium ${
              activeTab === "explore" ? "bg-[#2C1810] text-white" : "text-[#6B5549]"
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab("my-listings")}
            className={`text-xs py-1.5 px-3 rounded-lg font-medium flex items-center space-x-1 ${
              activeTab === "my-listings" ? "bg-[#2C1810] text-white" : "text-[#6B5549]"
            }`}
          >
            <span>My Listings</span>
            {myListingsCount > 0 && <span className="text-[10px] bg-[#C85A17] text-white px-1.5 rounded-full">{myListingsCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab("my-claims")}
            className={`text-xs py-1.5 px-3 rounded-lg font-medium flex items-center space-x-1 ${
              activeTab === "my-claims" ? "bg-[#2C1810] text-white" : "text-[#6B5549]"
            }`}
          >
            <span>My Claims</span>
            {myClaimsCount > 0 && <span className="text-[10px] bg-[#3A2318] text-white px-1.5 rounded-full">{myClaimsCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

