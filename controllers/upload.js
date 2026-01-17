async function handleUploadFile(req, res) {
  console.log(req.body);
  console.log(req.file);

  if (!req.file) {                                                // for one file
    return res.status(400).json({ message: "No file chosen" });
  }

  // if (!req.files || Object.keys(req.files).length === 0) {           // for multiple files
  //   return res.status(400).json({ message: "No file chosen" });
  // }

//   return res.send("File Uploaded Successfully");
  return res.redirect("/upload");
}

module.exports = {
  handleUploadFile,
};
