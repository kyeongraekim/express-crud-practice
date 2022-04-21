const express = require('express');

const cors = require('cors');
const morgan = require('morgan');

const dotenv = require("dotenv").config()
const { DataSource } = require('typeorm');

const myDataSource = new DataSource({
	type: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    port: process.env.TYPEORM_PORT,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE
})

myDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    // .catch((err) => {
    //     console.error("Error during Data Source initialization", err)
    // })

// const router = express.Router()
const PORT = 3000;
const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// health check
app.get("/ping", (req, res) => {
  res.status(201).json({"message" : "pong"});
})

// 서비스의 당위성을 위해, 이메일, 비밀번호 validation 로직 추가하기!

app.post("/users/sign-up", (req, res) => {
	const { name, email, profile_image, password } = req.body
    
	myDataSource.manager.query(
		`INSERT INTO books(
			title,
			author,
			bookCover
		) VALUES (?, ?, ?, ?);
		`,
		[ name, email, profile_image, password ]
	); 
		(err, rows, fields) => {
        if (!err)
            res.status(201).json({ message : "successfully created" });
        else
            console.log(err);
		}
})

//Create a post
app.post('/posts', (req, res) => {
	const { title, content, userId } = req.body
    
	myDataSource.manager.query(
		`INSERT INTO posts(
			title,
			content,
			user_id
		) VALUES (?, ?, ?);
		`,
		[ title, content, userId ]
	); 
		(err, rows, fields) => {
        if (!err)
            res.status(201).json({ message : "successfully created" });
        else
            console.log(err);
		}
	})

//Get all books
app.get('/books', (req, res) => {
    myDataSource.manager.query(
		`SELECT 
            books.id,
            books.title,
            books.description,
            books.cover_image,
            authors.first_name,
            authors.last_name,
            authors.age
        FROM books_authors ba
        INNER JOIN authors ON ba.author_id = authors.id 
        INNER JOIN books ON ba.book_id = books.id`
		,(err, rows, fields) => {
        if (!err)
            res.status(200).json(rows);
        else
            console.log(err);
    })
});

//Get a post
app.get('/posts/:postId', (req, res) => {
	const { postId } = req.params;

    myDataSource.manager.query(
		`SELECT 
			users.id,
			users.name,
			posts.id,
			posts.title,
			posts.content
		FROM posts
		JOIN users ON users.id = posts.user_id
		WHERE posts.id = :postId
		`,
			{ postId }
		);
		(err, rows, fields) => {
        if (!err)
			res.status(200).json(rows);
        else
            console.log(err);
    }}
);

// Update a post 이곳 수정 필요!
app.put('/posts', (req, res) => {
	const { postId, title, content, userId } = req.body
    
	myDataSource.manager.query(
		`UPDATE posts
		SET 
			title = ?,
			content = ?,
			user_id = ? 
			WHERE id = ?;
		`,
		[ postId, title, content, userId ]
	); 
		(err, rows, fields) => {
        if (!err)
            res.status(200).json({ message : "successfully updated" });
        else
            console.log(err);
		}
	})


// Delete a post
app.delete('/posts/:postId', (req, res) => {
	const { postId } = req.params;

    myDataSource.manager.query(
		`DELETE FROM posts
		WHERE posts.id = ${postId}
		`); 
		(err, rows, fields) => {
        if (!err)
            res.status(204).json({ message : "successfully deleted" });
        else
            console.log(err);
		}
	});


const start = async () => {
	try {
	  app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
	} catch (err) {
	  console.error(err);
	}
  };

start()
