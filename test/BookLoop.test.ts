import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { BookLoop } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BookLoop Smart Contract", function () {
  let bookLoop: BookLoop;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const BookLoopFactory = await ethers.getContractFactory("BookLoop");
    bookLoop = await BookLoopFactory.deploy();
    await bookLoop.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should start with 0 total books listed and 0 total books shared", async function () {
      expect(await bookLoop.totalBooksListed()).to.equal(0);
      expect(await bookLoop.totalBooksShared()).to.equal(0);
      expect(await bookLoop.totalBooksCount()).to.equal(0);
    });
  });

  describe("Listing Books", function () {
    it("should allow a user to list a book and emit BookListed event", async function () {
      const tx = await bookLoop.connect(owner).listBook(
        "The Great Gatsby",
        "F. Scott Fitzgerald",
        "Classic novel of the Jazz Age.",
        "Fiction"
      );

      await expect(tx)
        .to.emit(bookLoop, "BookListed")
        .withArgs(1, owner.address, "The Great Gatsby", "F. Scott Fitzgerald", "Fiction", (await ethers.provider.getBlock("latest"))?.timestamp);

      expect(await bookLoop.totalBooksListed()).to.equal(1);
      expect(await bookLoop.totalBooksCount()).to.equal(1);

      const book = await bookLoop.getBook(1);
      expect(book.id).to.equal(1);
      expect(book.owner).to.equal(owner.address);
      expect(book.claimer).to.equal(ethers.ZeroAddress);
      expect(book.title).to.equal("The Great Gatsby");
      expect(book.author).to.equal("F. Scott Fitzgerald");
      expect(book.description).to.equal("Classic novel of the Jazz Age.");
      expect(book.category).to.equal("Fiction");
      expect(book.status).to.equal(0); // Available
      expect(book.createdAt).to.be.gt(0);
      expect(book.claimedAt).to.equal(0);
      expect(book.collectedAt).to.equal(0);
    });

    it("should revert if title, author, or category is empty", async function () {
      await expect(
        bookLoop.listBook("", "Author", "Desc", "Fiction")
      ).to.be.revertedWith("Title cannot be empty");

      await expect(
        bookLoop.listBook("Title", "", "Desc", "Fiction")
      ).to.be.revertedWith("Author cannot be empty");

      await expect(
        bookLoop.listBook("Title", "Author", "Desc", "")
      ).to.be.revertedWith("Category cannot be empty");
    });
  });

  describe("Claiming Books", function () {
    beforeEach(async function () {
      await bookLoop.connect(owner).listBook(
        "1984",
        "George Orwell",
        "Dystopian social science fiction novel.",
        "Dystopia"
      );
    });

    it("should allow a different user to claim an available book", async function () {
      const tx = await bookLoop.connect(alice).claimBook(1);

      await expect(tx)
        .to.emit(bookLoop, "BookClaimed")
        .withArgs(1, alice.address, owner.address, (await ethers.provider.getBlock("latest"))?.timestamp);

      const book = await bookLoop.getBook(1);
      expect(book.status).to.equal(1); // Claimed
      expect(book.claimer).to.equal(alice.address);
      expect(book.claimedAt).to.be.gt(0);
    });

    it("should prevent the owner from claiming their own book", async function () {
      await expect(
        bookLoop.connect(owner).claimBook(1)
      ).to.be.revertedWith("Cannot claim your own book");
    });

    it("should prevent duplicate claims on an already claimed book", async function () {
      await bookLoop.connect(alice).claimBook(1);

      await expect(
        bookLoop.connect(bob).claimBook(1)
      ).to.be.revertedWith("Book is not available");
    });

    it("should revert if book does not exist", async function () {
      await expect(
        bookLoop.connect(alice).claimBook(99)
      ).to.be.revertedWith("Book does not exist");
    });
  });

  describe("Marking as Collected", function () {
    beforeEach(async function () {
      await bookLoop.connect(owner).listBook(
        "Sapiens",
        "Yuval Noah Harari",
        "A brief history of humankind.",
        "History"
      );
      await bookLoop.connect(alice).claimBook(1);
    });

    it("should allow only the original owner to mark the book as collected", async function () {
      const tx = await bookLoop.connect(owner).markAsCollected(1);

      await expect(tx)
        .to.emit(bookLoop, "BookCollected")
        .withArgs(1, owner.address, alice.address, (await ethers.provider.getBlock("latest"))?.timestamp);

      const book = await bookLoop.getBook(1);
      expect(book.status).to.equal(2); // Collected
      expect(book.collectedAt).to.be.gt(0);
      expect(await bookLoop.totalBooksShared()).to.equal(1);
    });

    it("should revert if a non-owner tries to mark as collected", async function () {
      await expect(
        bookLoop.connect(alice).markAsCollected(1)
      ).to.be.revertedWith("Only owner can mark as collected");

      await expect(
        bookLoop.connect(bob).markAsCollected(1)
      ).to.be.revertedWith("Only owner can mark as collected");
    });

    it("should revert if book is not in Claimed status", async function () {
      // List another book that is still Available
      await bookLoop.connect(owner).listBook(
        "Dune",
        "Frank Herbert",
        "Sci-fi masterpiece",
        "Sci-Fi"
      );

      await expect(
        bookLoop.connect(owner).markAsCollected(2)
      ).to.be.revertedWith("Book must be in claimed status");
    });
  });

  describe("Removing Listings", function () {
    beforeEach(async function () {
      await bookLoop.connect(owner).listBook(
        "Clean Code",
        "Robert C. Martin",
        "Handbook of Agile Software Craftsmanship.",
        "Technology"
      );
    });

    it("should allow the owner to remove an unclaimed listing", async function () {
      expect(await bookLoop.totalBooksListed()).to.equal(1);

      const tx = await bookLoop.connect(owner).removeListing(1);

      await expect(tx)
        .to.emit(bookLoop, "BookRemoved")
        .withArgs(1, owner.address, (await ethers.provider.getBlock("latest"))?.timestamp);

      const book = await bookLoop.getBook(1);
      expect(book.status).to.equal(3); // Removed
      expect(await bookLoop.totalBooksListed()).to.equal(0);
    });

    it("should revert if a non-owner attempts to remove the listing", async function () {
      await expect(
        bookLoop.connect(alice).removeListing(1)
      ).to.be.revertedWith("Only owner can remove listing");
    });

    it("should revert if trying to remove an already claimed book", async function () {
      await bookLoop.connect(alice).claimBook(1);

      await expect(
        bookLoop.connect(owner).removeListing(1)
      ).to.be.revertedWith("Can only remove available listings");
    });
  });

  describe("Query and Filter Views", function () {
    it("should return all books and filter available books accurately", async function () {
      await bookLoop.connect(owner).listBook("Book A", "Author 1", "Desc 1", "Category 1");
      await bookLoop.connect(alice).listBook("Book B", "Author 2", "Desc 2", "Category 2");
      await bookLoop.connect(owner).listBook("Book C", "Author 3", "Desc 3", "Category 1");

      expect((await bookLoop.getAllBooks()).length).to.equal(3);
      expect((await bookLoop.getAvailableBooks()).length).to.equal(3);

      // Alice claims Book A (id 1)
      await bookLoop.connect(alice).claimBook(1);

      const availableBooks = await bookLoop.getAvailableBooks();
      expect(availableBooks.length).to.equal(2);
      expect(availableBooks[0].id).to.equal(2);
      expect(availableBooks[1].id).to.equal(3);

      // Check owner books
      const ownerBooks = await bookLoop.getBooksByOwner(owner.address);
      expect(ownerBooks.length).to.equal(2);

      // Check claimer books
      const aliceClaims = await bookLoop.getBooksByClaimer(alice.address);
      expect(aliceClaims.length).to.equal(1);
      expect(aliceClaims[0].id).to.equal(1);
    });
  });
});
