import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ROLE_LEVELS = {
  member: 1,
  librarian: 2,
  admin: 3,
  super_admin: 4
};

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};

export const authorize = (options) => (req, res, next) => {
  const { roles = [], minRole } = options;
  const userRole = req.user.role;

  if (roles.length && roles.includes(userRole)) return next();

  if (minRole && ROLE_LEVELS[userRole] >= ROLE_LEVELS[minRole]) return next();

  return res.status(403).json({ message: 'Forbidden: Access denied' });
};