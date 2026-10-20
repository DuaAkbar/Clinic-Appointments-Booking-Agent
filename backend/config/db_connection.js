import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
console.log(dotenv.config());


const ConnectToDb = async () => {
  try {
    const myConnection = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Database has been Connected!");
    console.log(myConnection.connection.host);
    
  } catch (e) {
    console.log(e.message);
    console.log("Database has not Connected!");
    process.exit();
  }
};

export default ConnectToDb;
