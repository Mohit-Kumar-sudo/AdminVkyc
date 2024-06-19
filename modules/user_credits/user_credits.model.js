import mongoose, { Schema, SchemaTypes } from "mongoose";

const UserCreditsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },
    credits: {
      type: Number,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const UserCredits = mongoose.model("user_credits", UserCreditsSchema);

const addCredits = function(data) {
  const query = data;
  const userExist = UserCredits.findOne({userId:mongoose.Types.ObjectId(query.userId)})
  if(userExist){
   return
  } else {
    const newData = new UserCredits(query);
    const result = newData.save();
    return result;
  }
};

const updateCredits = function(data) {
  const query = UserCredits.updateOne(
    { userId: mongoose.Types.ObjectId(data.userId) },
    { $set: { credits: data.credits } }
  );
  return query;
};

const getCredits = function(data){
    const query = UserCredits.findOne({userId: mongoose.Types.ObjectId(data)})
    return query;
}

module.exports = {
  addCredits,
  updateCredits,
  getCredits
};
