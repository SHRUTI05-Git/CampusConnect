import { Router } from "express";
import Event from "../models/Event.js";
import { protect, allowRoles } from "../middleware/auth.js";
const router = Router();
router.get("/", protect, async (req, res, next) => {
  try { res.json(await Event.find().populate("createdBy", "name role").sort({ date: 1 })); } catch (e) { next(e); }
});
router.post("/", protect, allowRoles("faculty", "admin"), async (req, res, next) => {
  try {
    const { title, description, date, venue } = req.body;
    if (!title || !date) return res.status(400).json({ message: "Title and date are required" });
    res.status(201).json(await Event.create({ title, description, date, venue, createdBy: req.user.id }));
  } catch (e) { next(e); }
});
router.post("/:id/register", protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.sendStatus(404);
    if (!event.attendees.some(id => String(id) === req.user.id)) event.attendees.push(req.user.id);
    await event.save(); res.json({ message: "Registration successful", event });
  } catch (e) { next(e); }
});
router.delete("/:id", protect, allowRoles("faculty", "admin"), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.sendStatus(404);
    if (String(event.createdBy) !== req.user.id && req.user.role !== "admin") return res.sendStatus(403);
    await event.deleteOne(); res.json({ message: "Event deleted" });
  } catch (e) { next(e); }
});
export default router;
