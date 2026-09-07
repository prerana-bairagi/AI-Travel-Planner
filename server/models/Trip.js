import mongoose from 'mongoose';


const tripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    destination: {
        type: String,
        required: [true, "Destination is required"],
        trim: true,
    },
    input: {
        startDate: String,
        endDate: String,
        duration: { type: Number, default: 3 },
        numTravelers: { type: Number, default: 1 },
        travelStyle: { type: String, default: "Standard" },
        interest: [String],
        budgetMin: Number,
        budgetMax: Number,
    },
    itinerary: {
        type: mongoose.Schema.Types.Mixed, // Flexible structure for itinerary data
        required: true,
    },
    shareId: {
        type: String,
        unique: true,
        sparse: true, // Allows for null values in unique fields
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);



module.exports = mongoose.model('Trip', tripSchema);