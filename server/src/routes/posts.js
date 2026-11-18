import { Router } from "express";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.get("/", protect, async (req, res, next) => {
  try { res.json(await Post.find().populate("author", "name role department").populate("comments.author", "name").sort({ createdAt: -1 })); } catch (e) { next(e); }
});
router.post("/", protect, async (req, res, next) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ message: "Title and message are required" });
    res.status(201).json(await Post.create({ title, body, author: req.user.id }));
  } catch (e) { next(e); }
});
router.post("/:id/comments", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.sendStatus(404);
    if (!req.body.body?.trim()) return res.status(400).json({ message: "Comment cannot be empty" });
    post.comments.push({ body: req.body.body, author: req.user.id });
    await post.save();
    res.json(await post.populate([{ path: "author", select: "name role department" }, { path: "comments.author", select: "name" }]));
  } catch (e) { next(e); }
});
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.sendStatus(404);
    if (String(post.author) !== req.user.id && req.user.role !== "admin") return res.sendStatus(403);
    await post.deleteOne(); res.json({ message: "Post deleted" });
  } catch (e) { next(e); }
});
export default router;
