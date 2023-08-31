import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ms from 'ms';
import chalk from 'chalk';
import router from './routers/routers';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoute from './Authentication/authRoute';
import jwtMiddleware from './middleware/jwtMiddleware';
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
            console.log(chalk.greenBright('✔ Connected to database ✔'));
        })
        .catch(err => {
            console.error(chalk.redBright('✖ Failed to connect to database:'), err);
            if (retries < MAX_RETRIES) {
                retries++;
                const delay = ms('5s');
                console.warn(chalk.yellow(`⏳ Retry in ${delay / 1000}s... (${retries}/${MAX_RETRIES})`));
                setTimeout(connectWithRetry, delay);
            } else {
                console.error(chalk.bgRed('✖ Max retries reached. Exiting.'));
                process.exit(1);
            }
        });
};

connectWithRetry();
const corsOptions = {
  origin: function (origin:any, callback:any) {
    callback(null, true); // Allow all origins
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // The HTTP methods you want to allow
  credentials: true // This allows session cookies to be sent and received
  
};

const app = express();
const PORT = Number(process.env.PORT || 3000)
app.use(cors(corsOptions));
app.use(cookieParser());
app.use((req: Request, res: Response, next: NextFunction) => {
    if (mongoose.connection.readyState !== 1) { // 1 means connected
        return res.status(503).send('Database not connected');
    }
    next();
});
// app.use(express.urlencoded({ extended: false }))

app.use(express.json());
app.get('/', (req:Request, res:Response) => {
    res.send('<h1>Hello World</h1>')
})
app.use('/auth',authRoute)
app.use('/',jwtMiddleware, router)


//next()
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err)
    }
    res.status(err.status ?? 500).send(`<h1>${err.message ?? 'มีข้อผิดพลาดเกิดขึ้น'}</h1>`)
})
app.listen(PORT, () => {
    console.log(chalk.greenBright.bold(`✔ Server started at ${chalk.underline.white(`http://localhost:${PORT}`)}`))

}
)
// mongoose.connection.on('disconnected', () => {
//     console.log('Mongoose default connection disconnected');
// });

// mongoose.connection.on('error', (err) => {
//     console.error('Mongoose encountered an error:', err);
// });



