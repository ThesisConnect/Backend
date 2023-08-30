import dotenv from 'dotenv';
dotenv.config();
export = process.env.NODE_ENV! === 'development';