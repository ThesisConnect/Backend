import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ms from 'ms';
import test from './routers/test';
// import cors from 'cors';

interface Error {
    status?: number
    message?: string
}

dotenv.config();

const MAX_RETRIES = 10;
let retries = 0;

const options ={
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    // autoReconnect: true 

}
const connectWithRetry = () => {
    return mongoose.connect(process.env.DATABASE_URL || '', options)
        .then(() => {
            console.log('Connected to database');
        })
        .catch(err => {
            console.error('Failed to connect to database:', err);
            if (retries < MAX_RETRIES) {
                retries++;
                const delay = ms('5s');
                console.log(`Retry in ${delay / 1000}s... (${retries}/${MAX_RETRIES})`);
                setTimeout(connectWithRetry, delay);
            } else {
                console.error('Max retries reached. Exiting.');
                process.exit(1);
            }
        });
};

connectWithRetry();


const app = express();
const PORT = Number(process.env.PORT || 3000)
// app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
    if (mongoose.connection.readyState !== 1) { // 1 means connected
        return res.status(503).send('Database not connected');
    }
    next();
});
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use("/test", test)
app.get('/', (req:Request, res:Response) => {
    res.send('<h1>Hello World</h1>')
})
//next()
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err)
    }
    res.status(err.status ?? 500).send(`<h1>${err.message ?? 'มีข้อผิดพลาดเกิดขึ้น'}</h1>`)
})
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
}
)
// mongoose.connection.on('disconnected', () => {
//     console.log('Mongoose default connection disconnected');
// });

// mongoose.connection.on('error', (err) => {
//     console.error('Mongoose encountered an error:', err);
// });



