import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
const router = Router();
const safeUser = u => ({ id: u._id, name: u.name, email: u.email, role: u.role, department: u.department, year: u.year, interests: u.interests });
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role, department, year } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must contain at least 6 characters" });
    if (role === "admin") return res.status(400).json({ message: "Admin accounts must be assigned by the database owner" });
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email is already registered" });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: role === "faculty" ? "faculty" : "student", department, year });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: safeUser(user) });
  } catch (e) { next(e); }
});
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Incorrect email or password" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: safeUser(user) });
  } catch (e) { next(e); }
});
router.get("/me", protect, async (req, res, next) => {
  try { const user = await User.findById(req.user.id); if (!user) return res.sendStatus(404); res.json({ user: safeUser(user) }); }
  catch (e) { next(e); }
});
router.get("/students", protect, async (req, res, next) => {
  try {
    const users = await User.find({ role: "student" }).select("name department year interests").limit(100);
    res.json(users);
  } catch (e) { next(e); }
});
export default router;
