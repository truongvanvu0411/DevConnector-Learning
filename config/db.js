const mongoose = require ('mongoose')
const config =require ('config')
const db = config.get('mongoURL')


const connectDB = async () => {
    try {
        await mongoose.connect(db);
        console.log("Server Connected...");
    } catch(err) {
        console.log(err.message);

        //Exit process rapid when have async pending
        process.exit(1)
    }
    
}

module.exports = connectDB;
