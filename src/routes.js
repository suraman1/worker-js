const { Router }  = require("express");
const { producer } = require("./worker");
const router = Router();


router.get("/", async (req, res) => {
  await producer("send_email", { to: "Bob" });
  res.json({ status: "ok", message: "Email sent!" });
});

router.get("/delay", async (req, res) => {
  await producer("send_email", { to: "Bob" }, 10);
  res.json({ status: "ok", message: "Email sent!" });
});

module.exports = router;