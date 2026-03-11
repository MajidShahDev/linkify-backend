// models/Counter.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // "url" for URL counter
  seq: { type: Number, default: 0 },
},
{ versionKey: false }
);
const Counter = mongoose.model("Counter", counterSchema);
export default Counter

// MongoDB automatically creates an index on _id, so query will be fast.
// here _id is used of objectId because _id will identify different counters
// e.g "url" and also it will use primary index
// for fast lookup, also we can write clean quearies with findById(), and
// its common practice for counters in mongoDB.