import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const jwtMiddleware = (req:Request, res:Response, next:NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded;  // Set the user info in the request
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };

export default jwtMiddleware;