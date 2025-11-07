// Script to update user role to admin
// Run this in MongoDB Compass or MongoDB shell

// Update specific user by email
db.users.updateOne(
  { email: "samankhalid0001@gmail.com" },
  { $set: { role: "admin" } }
)

// Or update by _id
db.users.updateOne(
  { _id: ObjectId("68dc50cd8ea32d8218397be6") },
  { $set: { role: "admin" } }
)