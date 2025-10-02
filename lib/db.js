import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database Connected'));

        await mongoose.connect(`${process.env.MONGO_URL}`)


    } catch (error) {
        console.log("Database Not Connected : ", error);

    }
}