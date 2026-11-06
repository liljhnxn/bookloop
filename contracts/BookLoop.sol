// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BookLoop
 * @dev Decentralized book-sharing platform where users can list books they want to give away
 *      and allow others to claim them. All listings and claims are stored directly on-chain.
 *      Tagline: "Share a Book. Spread Knowledge."
 */
contract BookLoop {
    enum BookStatus {
        Available,
        Claimed,
        Collected,
        Removed
    }

    struct Book {
        uint256 id;
        address owner;
        address claimer;
        string title;
        string author;
        string description;
        string category;
        BookStatus status;
        uint256 createdAt;
        uint256 claimedAt;
        uint256 collectedAt;
    }

    uint256 private _bookIdCounter;
    uint256 public totalBooksListed;
    uint256 public totalBooksShared; // Incremented when marked as Collected

    // Mapping from book ID to Book details
    mapping(uint256 => Book) private _books;

    // Events
    event BookListed(
        uint256 indexed bookId,
        address indexed owner,
        string title,
        string author,
        string category,
        uint256 timestamp
    );

    event BookClaimed(
        uint256 indexed bookId,
        address indexed claimer,
        address indexed owner,
        uint256 timestamp
    );

    event BookCollected(
        uint256 indexed bookId,
        address indexed owner,
        address indexed claimer,
        uint256 timestamp
    );

    event BookRemoved(
        uint256 indexed bookId,
        address indexed owner,
        uint256 timestamp
    );

    /**
     * @dev List a new book to give away.
     */
    function listBook(
        string calldata title,
        string calldata author,
        string calldata description,
        string calldata category
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(author).length > 0, "Author cannot be empty");
        require(bytes(category).length > 0, "Category cannot be empty");

        _bookIdCounter++;
        uint256 newBookId = _bookIdCounter;

        _books[newBookId] = Book({
            id: newBookId,
            owner: msg.sender,
            claimer: address(0),
            title: title,
            author: author,
            description: description,
            category: category,
            status: BookStatus.Available,
            createdAt: block.timestamp,
            claimedAt: 0,
            collectedAt: 0
        });

        totalBooksListed++;

        emit BookListed(
            newBookId,
            msg.sender,
            title,
            author,
            category,
            block.timestamp
        );

        return newBookId;
    }

    /**
     * @dev Claim an available book.
     * Prevents self-claiming and duplicate claims.
     */
    function claimBook(uint256 bookId) external {
        require(bookId > 0 && bookId <= _bookIdCounter, "Book does not exist");
        Book storage book = _books[bookId];

        require(book.status == BookStatus.Available, "Book is not available");
        require(book.owner != msg.sender, "Cannot claim your own book");

        book.status = BookStatus.Claimed;
        book.claimer = msg.sender;
        book.claimedAt = block.timestamp;

        emit BookClaimed(bookId, msg.sender, book.owner, block.timestamp);
    }

    /**
     * @dev Mark a claimed book as collected.
     * Only the original book owner can perform this.
     */
    function markAsCollected(uint256 bookId) external {
        require(bookId > 0 && bookId <= _bookIdCounter, "Book does not exist");
        Book storage book = _books[bookId];

        require(msg.sender == book.owner, "Only owner can mark as collected");
        require(book.status == BookStatus.Claimed, "Book must be in claimed status");

        book.status = BookStatus.Collected;
        book.collectedAt = block.timestamp;
        totalBooksShared++;

        emit BookCollected(bookId, book.owner, book.claimer, block.timestamp);
    }

    /**
     * @dev Remove an unclaimed listing.
     * Only the original owner can remove it while it is still Available.
     */
    function removeListing(uint256 bookId) external {
        require(bookId > 0 && bookId <= _bookIdCounter, "Book does not exist");
        Book storage book = _books[bookId];

        require(msg.sender == book.owner, "Only owner can remove listing");
        require(book.status == BookStatus.Available, "Can only remove available listings");

        book.status = BookStatus.Removed;

        if (totalBooksListed > 0) {
            totalBooksListed--;
        }

        emit BookRemoved(bookId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get total number of books ever created.
     */
    function totalBooksCount() external view returns (uint256) {
        return _bookIdCounter;
    }

    /**
     * @dev Fetch single book details by ID.
     */
    function getBook(uint256 bookId) external view returns (Book memory) {
        require(bookId > 0 && bookId <= _bookIdCounter, "Book does not exist");
        return _books[bookId];
    }

    /**
     * @dev Fetch all books ever listed.
     */
    function getAllBooks() external view returns (Book[] memory) {
        Book[] memory allBooks = new Book[](_bookIdCounter);
        for (uint256 i = 1; i <= _bookIdCounter; i++) {
            allBooks[i - 1] = _books[i];
        }
        return allBooks;
    }

    /**
     * @dev Fetch all available books for discovery.
     */
    function getAvailableBooks() external view returns (Book[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _bookIdCounter; i++) {
            if (_books[i].status == BookStatus.Available) {
                count++;
            }
        }

        Book[] memory availableBooks = new Book[](count);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= _bookIdCounter; i++) {
            if (_books[i].status == BookStatus.Available) {
                availableBooks[currentIndex] = _books[i];
                currentIndex++;
            }
        }
        return availableBooks;
    }

    /**
     * @dev Fetch all books listed by a specific owner.
     */
    function getBooksByOwner(address user) external view returns (Book[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _bookIdCounter; i++) {
            if (_books[i].owner == user) {
                count++;
            }
        }

        Book[] memory userBooks = new Book[](count);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= _bookIdCounter; i++) {
            if (_books[i].owner == user) {
                userBooks[currentIndex] = _books[i];
                currentIndex++;
            }
        }
        return userBooks;
    }

    /**
     * @dev Fetch all books claimed by a specific user.
     */
    function getBooksByClaimer(address user) external view returns (Book[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _bookIdCounter; i++) {
            if (_books[i].claimer == user) {
                count++;
            }
        }

        Book[] memory userClaims = new Book[](count);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= _bookIdCounter; i++) {
            if (_books[i].claimer == user) {
                userClaims[currentIndex] = _books[i];
                currentIndex++;
            }
        }
        return userClaims;
    }
}

