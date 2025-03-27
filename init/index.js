const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');
const { MONGO_URL } = require('../config.js');

async function connectDB() {
  await mongoose.connect(MONGO_URL);
}


const initDB = async()=>{
    await Listing.deleteMany({});
    const insertedData = await Listing.insertMany(initData.data);
    console.log("inserted data=",insertedData);
    if(insertedData){
        console.log("Initial Data inserted Successfully!!");
    }else{
        console.log("Error while inserting initial Data!!");
    }
}

module.exports={connectDB,initDB};