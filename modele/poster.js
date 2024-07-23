const database_blog = require('./database_connector')

database_blog.query('SELECT * FROM poster',
    function(err, rows, fields) {
        if (err) throw err;
        console.log(rows);
    }
);



database_blog.end();
