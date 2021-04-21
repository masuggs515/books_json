process.env.NODE_ENV = "test"

const request = require("supertest");

const app = require("../app");
const db = require("../db");


let isbn;


beforeEach(async () => {
    await db.query(`DELETE FROM books`)
    let result = await db.query(`
    INSERT INTO 
        books (isbn, amazon_url,author,language,pages,publisher,title,year)   
        VALUES(
        '123432122', 
        'https://amazon.com/taco', 
        'Elie', 
        'English', 
        100,  
        'Nothing publishers', 
        'my first book', 2008) 
        RETURNING isbn`);

    isbn = result.rows[0].isbn
});

afterAll(async () => {
    await db.end()
});

describe("GET /", () => {
    test("Get list of books", async () => {
        const results = await request(app).get('/books');
        const books = results.body.books[0];
        expect(books).toHaveProperty("isbn");
        expect(books).toHaveProperty("year");
    })
});

describe("GET /:isbn", () => {
    test("Get book information", async () => {
        const results = await request(app).get(`/books/${isbn}`);
        const book = results.body.book;
        expect(book).toHaveProperty("isbn");
        expect(book).toHaveProperty("year");
        expect(book.isbn).toEqual(isbn);
    })
});

describe("POST /", () => {
    test("Add new book", async () => {
        const results = await request(app).post(`/books/`)
        .send({
            "isbn": "0691161512",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Michael Suggs",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking Hidden Math in Video Games",
            "year": 2017
        });
        const book = results.body.book;
        expect(book).toHaveProperty("isbn");
        expect(book).toHaveProperty("year");
        expect(results.status).toBe(201);
        expect(book.isbn).toEqual("0691161512");
    })
});

describe("PUT /:isbn", () => {
    test("Add new book", async () => {
        const results = await request(app).put(`/books/${isbn}`)
        .send({
            "isbn": isbn,
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Michael Suggs",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking Hidden Math in Video Games",
            "year": 2017
        });
        const book = results.body.book;
        expect(book).toHaveProperty("isbn");
        expect(book).toHaveProperty("year");
        expect(book.isbn).toEqual(isbn);
        expect(book.author).toEqual("Michael Suggs");
    })
});

describe("DELETE /:isbn", () => {
    test("Get list of books", async () => {
        const results = await request(app).delete(`/books/${isbn}`);
        const message = results.body;
        expect(message).toEqual({ message: "Book deleted" });
    })
});

