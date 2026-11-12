"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnect,
} from "wagmi";
import { BOOKLOOP_ABI, BOOKLOOP_ADDRESS, EXPLORER_URL } from "@/config/contract";
import { Book, BookStatus, BOOK_CATEGORIES } from "@/types/book";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { BookCard } from "@/components/BookCard";
import { CreateListingModal } from "@/components/CreateListingModal";
import { BookDetailsModal } from "@/components/BookDetailsModal";
import { NotificationToast, ToastMessage } from "@/components/NotificationToast";
import {
  Search,
  BookOpen,
  Filter,
  Layers,
  HeartHandshake,
  AlertCircle,
  Sparkles,
  Inbox,
  RefreshCw,
  Info,
} from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Navigation tab: 'explore' | 'my-listings' | 'my-claims'
  const [activeTab, setActiveTab] = useState<"explore" | "my-listings" | "my-claims">("explore");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "claimed" | "collected">("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "pending" | "success" | "error", title: string, message?: string, txHash?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message, txHash }]);
    if (type !== "pending") {
      setTimeout(() => {
        dismissToast(id);
      }, 7000);
    }
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Smart Contract Reads
  const {
    data: allBooksData,
    isLoading: isLoadingBooks,
    refetch: refetchBooks,
  } = useReadContract({
    address: BOOKLOOP_ADDRESS,
    abi: BOOKLOOP_ABI,
    functionName: "getAllBooks",
    query: {
      enabled: BOOKLOOP_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  const { data: totalListedData, refetch: refetchTotalListed } = useReadContract({
    address: BOOKLOOP_ADDRESS,
    abi: BOOKLOOP_ABI,
    functionName: "totalBooksListed",
    query: {
      enabled: BOOKLOOP_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  const { data: totalSharedData, refetch: refetchTotalShared } = useReadContract({
    address: BOOKLOOP_ADDRESS,
    abi: BOOKLOOP_ABI,
    functionName: "totalBooksShared",
    query: {
      enabled: BOOKLOOP_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Convert raw contract data to Book[]
  const books: Book[] = useMemo(() => {
    if (!allBooksData || !Array.isArray(allBooksData)) return [];
    return allBooksData
      .map((item: any) => ({
        id: BigInt(item.id),
        owner: item.owner as `0x${string}`,
        claimer: item.claimer as `0x${string}`,
        title: item.title,
        author: item.author,
        description: item.description,
        category: item.category,
        status: Number(item.status) as BookStatus,
        createdAt: BigInt(item.createdAt),
        claimedAt: BigInt(item.claimedAt),
        collectedAt: BigInt(item.collectedAt),
      }))
      .filter((b) => b.status !== BookStatus.Removed); // Exclude removed books from standard view
  }, [allBooksData]);

  // Contract Writes
  const {
    writeContractAsync,
    isPending: isWritePending,
    data: txHash,
  } = useWriteContract();

  // Transaction Receipt Watcher
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  useEffect(() => {
    if (isTxSuccess && txHash) {
      refetchBooks();
      refetchTotalListed();
      refetchTotalShared();
      addToast(
        "success",
        "Transaction Confirmed!",
        "Your on-chain action was successfully written to Botchain.",
        txHash
      );
    }
  }, [isTxSuccess, txHash]);

  // Contract Operations
  const handleListBook = async (
    title: string,
    author: string,
    description: string,
    category: string
  ) => {
    if (BOOKLOOP_ADDRESS === "0x0000000000000000000000000000000000000000") {
      throw new Error("Contract address is not configured. Please deploy the contract first.");
    }
    const pendingToastId = addToast(
      "pending",
      "Confirm in Wallet",
      "Waiting for signature to list book on Botchain..."
    );
    try {
      const hash = await writeContractAsync({
        address: BOOKLOOP_ADDRESS,
        abi: BOOKLOOP_ABI,
        functionName: "listBook",
        args: [title, author, description, category],
      });
      dismissToast(pendingToastId);
      addToast(
        "pending",
        "Listing Submitted",
        "Writing listing to Botchain Mainnet...",
        hash
      );
      setIsCreateModalOpen(false);
    } catch (err: any) {
      dismissToast(pendingToastId);
      addToast(
        "error",
        "Listing Failed",
        err?.shortMessage || err?.message || "Transaction rejected or failed."
      );
      throw err;
    }
  };

  const handleClaimBook = async (bookId: bigint) => {
    if (!isConnected) {
      const injectedConnector = connectors.find((c) => c.id === "injected") || connectors[0];
      if (injectedConnector) connect({ connector: injectedConnector });
      return;
    }
    const pendingToastId = addToast(
      "pending",
      "Confirm Claim in Wallet",
      "Please confirm the claim transaction in MetaMask..."
    );
    try {
      const hash = await writeContractAsync({
        address: BOOKLOOP_ADDRESS,
        abi: BOOKLOOP_ABI,
        functionName: "claimBook",
        args: [bookId],
      });
      dismissToast(pendingToastId);
      addToast("pending", "Claim Submitted", "Confirming book claim on-chain...", hash);
    } catch (err: any) {
      dismissToast(pendingToastId);
      addToast("error", "Claim Failed", err?.shortMessage || err?.message || "Could not claim book.");
    }
  };

  const handleMarkCollected = async (bookId: bigint) => {
    const pendingToastId = addToast(
      "pending",
      "Confirm Handover",
      "Marking book as collected on-chain..."
    );
    try {
      const hash = await writeContractAsync({
        address: BOOKLOOP_ADDRESS,
        abi: BOOKLOOP_ABI,
        functionName: "markAsCollected",
        args: [bookId],
      });
      dismissToast(pendingToastId);
      addToast("pending", "Collection Submitted", "Updating book status to Collected...", hash);
    } catch (err: any) {
      dismissToast(pendingToastId);
      addToast("error", "Failed", err?.shortMessage || err?.message || "Could not mark as collected.");
    }
  };

  const handleRemoveListing = async (bookId: bigint) => {
    const pendingToastId = addToast(
      "pending",
      "Withdrawing Listing",
      "Confirm listing removal in wallet..."
    );
    try {
      const hash = await writeContractAsync({
        address: BOOKLOOP_ADDRESS,
        abi: BOOKLOOP_ABI,
        functionName: "removeListing",
        args: [bookId],
      });
      dismissToast(pendingToastId);
      addToast("pending", "Removal Submitted", "Withdrawing book from BookLoop...", hash);
    } catch (err: any) {
      dismissToast(pendingToastId);
      addToast("error", "Removal Failed", err?.shortMessage || err?.message || "Could not remove listing.");
    }
  };

  // Filtered views
  const myListings = useMemo(() => {
    if (!address) return [];
    return books.filter((b) => b.owner.toLowerCase() === address.toLowerCase());
  }, [books, address]);

  const myClaims = useMemo(() => {
    if (!address) return [];
    return books.filter((b) => b.claimer.toLowerCase() === address.toLowerCase());
  }, [books, address]);

  const displayedBooks = useMemo(() => {
    let list = books;

    if (activeTab === "my-listings") {
      list = myListings;
    } else if (activeTab === "my-claims") {
      list = myClaims;
    }

    // Category filter
    if (selectedCategory !== "All") {
      list = list.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Status filter
    if (statusFilter === "available") {
      list = list.filter((b) => b.status === BookStatus.Available);
    } else if (statusFilter === "claimed") {
      list = list.filter((b) => b.status === BookStatus.Claimed);
    } else if (statusFilter === "collected") {
      list = list.filter((b) => b.status === BookStatus.Collected);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [books, myListings, myClaims, activeTab, selectedCategory, statusFilter, searchQuery]);

  const isContractNotSet = BOOKLOOP_ADDRESS === "0x0000000000000000000000000000000000000000";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C1810]">
      {/* Navbar */}
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myListingsCount={myListings.length}
        myClaimsCount={myClaims.length}
      />

      {/* Contract configuration banner if not deployed */}
      {isContractNotSet && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 text-amber-950 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Smart Contract Not Yet Deployed:</strong> Deploy BookLoop to Botchain Testnet using{" "}
                <code className="bg-amber-200/80 px-1.5 py-0.5 rounded font-mono text-xs">
                  npm run deploy:botchain
                </code>{" "}
                and configure <code className="bg-amber-200/80 px-1.5 py-0.5 rounded font-mono text-xs">NEXT_PUBLIC_CONTRACT_ADDRESS</code>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero
        totalBooksListed={totalListedData ? Number(totalListedData) : books.length}
        totalBooksShared={totalSharedData ? Number(totalSharedData) : books.filter(b => b.status === BookStatus.Collected).length}
        onExploreClick={() => {
          setActiveTab("explore");
          const el = document.getElementById("browse-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onListClick={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main id="browse-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Section Header & Subheading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#C85A17] uppercase tracking-wider mb-1">
              {activeTab === "explore" && <span>Community Library</span>}
              {activeTab === "my-listings" && <span>Personal Shelf</span>}
              {activeTab === "my-claims" && <span>Reading Journey</span>}
            </div>
            <h2 className="text-3xl font-bold font-serif text-[#2C1810]">
              {activeTab === "explore" && "Browse All Books"}
              {activeTab === "my-listings" && "My Listed Books"}
              {activeTab === "my-claims" && "My Claimed Books"}
            </h2>
            <p className="text-sm text-[#6B5549] mt-1">
              {activeTab === "explore" && "Discover titles offered by readers everywhere. Free to claim on Botchain."}
              {activeTab === "my-listings" && "Manage books you've listed to give away. Mark as collected when handed over."}
              {activeTab === "my-claims" && "Keep track of books you've claimed from the community library."}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                refetchBooks();
                refetchTotalListed();
                refetchTotalShared();
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#6B5549] bg-white border border-[#E6D8CA] hover:border-[#D3BFAB] hover:text-[#2C1810] shadow-sm transition-all"
              title="Refresh on-chain data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EADBCC] shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C7567] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by book title, author, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D3BFAB] bg-[#FAF7F2]/50 text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A17]/40 placeholder:text-[#8C7567]/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7567] hover:text-[#2C1810]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#E6D8CA] text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === "all" ? "bg-white text-[#2C1810] shadow-sm font-semibold" : "text-[#6B5549]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("available")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === "available" ? "bg-white text-[#C85A17] shadow-sm font-semibold" : "text-[#6B5549]"
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setStatusFilter("claimed")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === "claimed" ? "bg-white text-amber-800 shadow-sm font-semibold" : "text-[#6B5549]"
                }`}
              >
                Claimed
              </button>
              <button
                onClick={() => setStatusFilter("collected")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === "collected" ? "bg-white text-emerald-800 shadow-sm font-semibold" : "text-[#6B5549]"
                }`}
              >
                Collected
              </button>
            </div>
          </div>

          {/* Category Horizontal Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <span className="text-xs font-semibold text-[#8C7567] flex items-center space-x-1 pl-1 flex-shrink-0">
              <Filter className="w-3 h-3 text-[#C85A17]" />
              <span>Genre:</span>
            </span>
            {BOOK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-[#2C1810] text-[#FAF7F2] border-[#2C1810] font-medium shadow-sm"
                    : "bg-[#FAF7F2] text-[#6B5549] border-[#E6D8CA] hover:border-[#D3BFAB] hover:text-[#2C1810]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {isLoadingBooks ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-2 border-[#C85A17] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-[#6B5549]">
              Reading book catalog directly from Botchain Testnet...
            </p>
          </div>
        ) : displayedBooks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCC] max-w-lg mx-auto my-6 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FAF7F2] flex items-center justify-center text-[#8C7567] border border-[#E6D8CA]">
              <BookOpen className="w-8 h-8 text-[#C85A17]" />
            </div>

            <h3 className="text-lg font-bold font-serif text-[#2C1810] mb-2">
              {activeTab === "explore" && "No Books Found"}
              {activeTab === "my-listings" && "No Books Listed Yet"}
              {activeTab === "my-claims" && "No Books Claimed Yet"}
            </h3>

            <p className="text-xs text-[#6B5549] max-w-xs mx-auto mb-6 leading-relaxed">
              {activeTab === "explore" &&
                (searchQuery || selectedCategory !== "All" || statusFilter !== "all"
                  ? "No books matched your active search filters. Try clearing your search or choosing another category."
                  : "Be the pioneer reader to share a book with the community on Botchain!")}
              {activeTab === "my-listings" &&
                "You haven't listed any books to give away yet. Share one from your shelf today!"}
              {activeTab === "my-claims" &&
                "You haven't claimed any books yet. Explore the community library and claim a title!"}
            </p>

            {activeTab === "my-listings" ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#C85A17] text-white hover:bg-[#AF4B0E] transition-all"
              >
                List Your First Book
              </button>
            ) : activeTab === "my-claims" ? (
              <button
                onClick={() => setActiveTab("explore")}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#2C1810] text-[#FAF7F2] hover:bg-[#42281D] transition-all"
              >
                Browse Available Books
              </button>
            ) : (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#C85A17] text-white hover:bg-[#AF4B0E] transition-all"
              >
                Share a Book Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedBooks.map((book) => (
              <BookCard
                key={book.id.toString()}
                book={book}
                currentUserAddress={address}
                onClaim={handleClaimBook}
                onMarkCollected={handleMarkCollected}
                onRemove={handleRemoveListing}
                onViewDetails={(b) => setSelectedBookForDetails(b)}
                isClaimPending={isWritePending || isTxConfirming}
                isActionPending={isWritePending || isTxConfirming}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#E6D8CA] bg-[#FAF7F2] py-8 text-center text-xs text-[#6B5549]">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-2 font-serif text-sm font-semibold text-[#2C1810]">
            <BookOpen className="w-4 h-4 text-[#C85A17]" />
            <span>BookLoop — Share a Book. Spread Knowledge.</span>
          </div>
          <p className="text-[11px] text-[#8C7567]">
            Decentralized book-sharing on Botchain Mainnet (Chain ID 677) • Native Token: BOT • No fees, 100% peer-to-peer.
          </p>
          <div className="pt-2 flex items-center justify-center space-x-4 text-[11px]">
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#C85A17] transition-colors"
            >
              BotchainScan Explorer
            </a>
            <span>•</span>
            <span className="font-mono text-[#8C7567]">
              RPC: https://rpc.botchain.ai
            </span>
          </div>
        </div>
      </footer>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleListBook}
        isLoading={isWritePending || isTxConfirming}
        isConnected={isConnected}
        onConnectWallet={() => {
          const injectedConnector = connectors.find((c) => c.id === "injected") || connectors[0];
          if (injectedConnector) connect({ connector: injectedConnector });
        }}
      />

      {/* Book Details Modal */}
      <BookDetailsModal
        book={selectedBookForDetails}
        isOpen={!!selectedBookForDetails}
        onClose={() => setSelectedBookForDetails(null)}
        currentUserAddress={address}
        onClaim={handleClaimBook}
        onMarkCollected={handleMarkCollected}
        onRemove={handleRemoveListing}
        isActionPending={isWritePending || isTxConfirming}
      />

      {/* Transaction & Action Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

