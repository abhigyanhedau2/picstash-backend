const express = require('express');
const bodyParser = require('body-parser');
const connectToDB = require('./utils/connectToDB');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const globalErrorHandler = require('./utils/globalErrorHandler');

const userRouter = require('./routes/user-routes');
const postRouter = require('./routes/post-routes');

const app = express();

// MIDDLEWARES

// To get the req.body values 
app.use(bodyParser.json());

app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    next();
});

app.get('/', (req, res) => {
    return res.json({
        status: 'success',
        message: 'Server returned success'
    });
});

app.use('/api/v1/users/', userRouter);
app.use('/api/v1/posts/', postRouter);

app.use(globalErrorHandler);

// Connecting to DB
connectToDB();

// const port = process.env.PORT || 5000;
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

// app.listen(5000, () => {
//     console.log(`App listening on port 5000`);
// });