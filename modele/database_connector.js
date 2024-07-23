var mysql = require('mysql');

var database_blog = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database : "database_blog"
});

database_blog.connect(function(err) {
  if (err) throw err;
  console.log("Connected à la base de \"donnée database_blog!\"");
});


module.exports = database_blog;