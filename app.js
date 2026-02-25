import express from 'express';
const app = express();

import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3030;

app.use('/', express.static('public'));

app.use((req, _res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`visit http://localhost:${port}`);
});

