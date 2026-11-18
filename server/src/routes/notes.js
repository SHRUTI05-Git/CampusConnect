import { Router } from "express";
import Note from "../models/Note.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.get("/", protect, async (req, res, next) => {
  try { res.json(await Note.find().populate("uploader", "name role").sort({ createdAt: -1 })); } catch (e) { next(e); }
});
router.post("/", protect, async (req, res, next) => {
  try {
    const { title, subject, semester, description, resourceUrl } = req.body;
    if (!title || !subject || !resourceUrl) return res.status(400).json({ message: "Title, subject and resource URL are required" });
    res.status(201).json(await Note.create({ title, subject, semester, description, resourceUrl, uploader: req.user.id }));
  } catch (e) { next(e); }
});
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.sendStatus(404);
    if (String(note.uploader) !== req.user.id && req.user.role !== "admin") return res.sendStatus(403);
    await note.deleteOne(); res.json({ message: "Resource deleted" });
  } catch (e) { next(e); }
});
export default router;
