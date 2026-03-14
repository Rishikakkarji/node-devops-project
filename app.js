const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");

const app = express();

const PORT = process.env.PORT || 8090;

const MONGO_URI = process.env.MONGO_URI;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

mongoose.connect(MONGO_URI)
.then(()=> console.log("MongoDB connected"))
.catch(err => console.log(err));

const redisClient = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
  }
});

redisClient.connect();

redisClient.on("connect", ()=>{
  console.log("Redis connected");
});

app.get("/", (req,res)=>{
  res.json({
    message:"Application running successfully"
  });
});

app.get("/health", async(req,res)=>{
  try{

    await redisClient.ping();

    res.json({
      status:"OK",
      mongodb: mongoose.connection.readyState === 1 ? "connected":"disconnected",
      redis:"connected"
    });

  }catch(err){

    res.status(500).json({
      status:"ERROR"
    });

  }
});

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
});
