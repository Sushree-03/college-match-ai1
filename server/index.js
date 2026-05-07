require("dotenv").config();

const express = require("express");
const cors = require("cors");
const supabase = require("./config/supabase");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

app.get("/api/colleges", async (req, res) => {
  const { data, error } = await supabase
    .from("colleges")
    .select("*");

  console.log(data);
  console.log(error);

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});