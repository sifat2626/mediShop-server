const { readdirSync } = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const helmet = require("helmet");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// middlewares
app.use(cors({
    origin: [
        "https://tietheknot-3a6f0.web.app",
        "http://localhost:5173"
    ],
    credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// routes middleware
readdirSync("./routes").map((r) =>
    app.use("/api/v1", require(`./routes/${r}`))
);

// server
const port = process.env.PORT || 8000;

// Connect to DB and start server
mongoose
    .connect(process.env.DATABASE, )
    .then(() => {
        app.listen(port, () => {
            console.log(`Server Running on port ${port}`);
        });
    })
    .catch((err) => console.log('DB Connection Error:', err));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
