import { useState, useEffect, useContext } from "react"; // Import UserContext
import { UserContext } from "../../context/userContext.jsx";
import "./books.css";
import BookListItem from "../../components/BookListItem";
const apiUrl = `${import.meta.env.VITE_API_URL}/books`;

export default function Books() {
  const { userData } = useContext(UserContext); // Check if the user is logged in
  const [books, setBooks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { userId } = userData || {};

  // Fetch books from the server
  async function fetchBooks() {
    setErrorMessage("");
    try {
      const response = await fetch(`${apiUrl}`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      } else if (response.status === 404) {
        setErrorMessage("Books not found.");
        setBooks([]);
      } else {
        setErrorMessage("An error occurred. Please try again.");
        setBooks([]);
      }
    } catch (error) {
      setBooks([]);
      console.error("Error fetching books:", error);
      setErrorMessage("An internal error occurred. Please try again.");
    }
  }

  // Borrow book function
  async function handleBorrow(bookId) {
    console.log(bookId);

    if (!userId) {
      setErrorMessage("You must be logged in to borrow a book.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId, userId }),
      });
      if (response.ok) {
        fetchBooks(); // Refresh available quantity
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Failed to borrow book. Try again.");
      }
    } catch (error) {
      console.error("Error during borrowing:", error);
      setErrorMessage("An internal error occurred. Please try again.");
    }
  }
  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="books-container">
      <h2>Books List</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {books.length > 0 ? (
        <ul>
          {books.map((book) => {
            const availableQty = book.available_quantity;
            return (
              <BookListItem
                key={book.id}
                book={book}
                availableQty={availableQty}
                borrow={handleBorrow}
              />
            );
          })}
        </ul>
      ) : (
        <p>No books available.</p>
      )}
    </div>
  );
}
