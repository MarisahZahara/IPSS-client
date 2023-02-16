import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.REACT_APP_JWT;

export const createToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY);
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};
