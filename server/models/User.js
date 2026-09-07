import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
        select: false, // hidden from default queries
        trim: true,
    },
    country: {
        type: String,
        required: [true, "Country is required"],
    },
    currency: {
        type: String,
        default: "INR",
        uppercase: true,
    },
    plan: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free",
    },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Encrypt password for new registration and password change
userSchema.pre('save', async function () {
    // If password hasn't been modified, skip hashing
    if (!this.isModified("password")){
        return;
    }
    // If password has been modified, perform hashing
    else {
        try {
            // Hash the password
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
        }
        catch (error) {
            // Throws an error if hashing faces problem
            throw new Error(`Failed to hash password: ${error.message}`);
        }
    }

    // Map currency if country is modified
    if (this.isModified("country")) {
        const CurrencyMap = {
            "INDIA": "INR",
            "UNITED STATES": "USD",
            "UNITED KINGDOM": "GBP",
            "EUROPEAN UNION": "EUR",
            "AUSTRALIA": "AUD",
            "CANADA": "CAD",
            "JAPAN": "JPY",
            // Add more countries and their currencies as needed
        };
        this.currency = CurrencyMap[this.country.toUpperCase()] || "INR"; // Default to INR if country not found
    }
});


// Compare the password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}


const User = mongoose.model("User", userSchema);
export default User;