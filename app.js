const express = require('express');
const path = require('path');
const session = require('express-session');
const database_blog = require('./modele/database_connector');
const app = express();
const route = require('./router/routeurs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bodyParser = require('body-parser');                                                                                                             

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('views'));

app.use(session({
    secret: 'MonSecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));


app.post('/react', (req, res) => {
    const { postId, userName, commentaire, reactionType } = req.body;
    console.log("Request body:", req.body);
  
    if (!postId || !userName || !reactionType) {
      return res.status(400).json({ message: 'Données de requête manquantes.' });
    }
  
    let reactionColumn;
    switch (reactionType) {
      case 'liker':
        reactionColumn = 'liker';
        break;
      case 'antilike':
        reactionColumn = 'antilike';
        break;
      case 'view':
        reactionColumn = 'view';
        break;
      case 'commenter':
        reactionColumn = 'commentaire';
        break;
      case 'subscriber':
        reactionColumn = 'subscriber';
        break;
      default:
        return res.status(400).json({ message: 'Type de réaction invalide.' });
    }
  
    const react = () => {
      const query = `SELECT ${reactionColumn} FROM poster WHERE id = ?`;
      database_blog.query(query, [postId], (err, rows) => {
        if (err) {
          console.error('Erreur du serveur:', err);
          return res.status(500).json({ message: 'Erreur du serveur.', error: err });
        }
  
        if (rows.length === 0) {
          return res.status(404).json({ message: 'Post non trouvé.' });
        }
  
        const post = rows[0];
        const existingReactions = post[reactionColumn] ? post[reactionColumn].split(',') : [];
  
        if (reactionColumn != 'commentaire') {
          if (existingReactions.includes(userName)) {
            return res.status(400).json({ message: 'Vous avez déjà réagi.' });
          }
          existingReactions.push(userName);
        } else {
          existingReactions.push(`${userName}:::${commentaire}`);
        }
  
        const updatedReactions = existingReactions.join(',');
        const updateQuery = `UPDATE poster SET ${reactionColumn} = ? WHERE id = ?`;
        database_blog.query(updateQuery, [updatedReactions, postId], (err, result) => {
          if (err) {
            console.error('Erreur du serveur:', err);
            return res.status(500).json({ message: 'Erreur du serveur.', error: err });
          }
          res.status(200).json({ message: 'Réaction ajoutée avec succès.' });
        });
      });
    };
    react();
  });
  

app.get('/poster', (req, res) => {
    const name = req.query.name;
    res.render(route['/poster'], { name: name });
});

app.post('/poster', upload.single('image'), (req, res) => {
    const { title, undertitle, pseudoPoster, contenu } = req.body;
    const image = req.file.buffer;
    const date = new Date();
    
    const sql = 'INSERT INTO poster (image, titre, undertitre, pseudoPoster, contenu, date) VALUES (?, ?, ?, ?, ?, ?)';
    database_blog.query(sql, [image, title, undertitle, pseudoPoster, contenu, date], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion du post:', err);
            res.status(500).send('Erreur lors de l\'insertion du post');
            return;
        }
        res.redirect('/index');
    });
});

app.get('/post', (req, res) => {
    const postId = req.query.id;
    const name = req.query.name;
    const query = 'SELECT * FROM poster WHERE id = ?';

    database_blog.query(query, [postId], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.render('post', { post: results[0], user: name });
        } else {
            res.status(404).send('Post not found');
        }
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email=?';
    database_blog.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des données utilisateur :', err);
            res.status(500).send('<script>alert("Erreur serveur"); window.location.href="/login";</script>');
            return;
        }

        if (result.length === 0) {
            res.status(401).send('<script>alert("Email ou mot de passe incorrect"); window.location.href="/login";</script>');
            return;
        }

        const user = result[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Erreur lors de la vérification du mot de passe :', err);
                res.status(500).send('<script>alert("Erreur lors de la vérification du mot de passe"); window.location.href="/login";</script>');
                return;
            }

            if (!isMatch) {
                res.status(401).send('<script>alert("Email ou mot de passe incorrect"); window.location.href="/login";</script>');
                return;
            }

            req.session.user = {
                id: user.id,
                name: user.name,
                pseudo: user.pseudo,
                email: user.email
            };

            res.redirect('/index');
        });
    });
});

app.get('/desconnect', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion :', err);
            res.status(500).send('<script>alert("Erreur lors de la déconnexion"); window.location.href="/login";</script>');
            return;
        }
        res.redirect('/login');
    });
});

app.post('/signUp', (req, res) => {
    const { name, pseudo, email, password, repassword } = req.body;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error('Erreur lors du hachage du mot de passe :', err);
            return res.status(500).send('Erreur lors du hachage du mot de passe');
        }

        const sql = 'INSERT INTO users (name, pseudo, email, password) VALUES (?, ?, ?, ?)';
        database_blog.query(sql, [name, pseudo, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
                return res.status(500).send('Erreur lors de l\'insertion de l\'utilisateur');
            }
            res.redirect('/login');
        });
    });
});

app.get('*', (req, res) => {
    if(route[req.url]){
        if (req.url === '/' || req.url === '/index') {
            if (!req.session.user) {
                res.status(401).send('<script>alert("Vous devez être connecté pour accéder à cette page"); window.location.href="/login";</script>');
                return;
            }
        
            database_blog.query('SELECT * FROM poster', (err, rows) => {
                if (err) {
                    res.send("<p>Impossible de prendre les données</p>");
                } else {
                    res.render('index', { posts: rows, user: req.session.user });
                }
            });
        } else {
            res.render(route[req.url]);
        }
    } else {
        res.send("<p>Fichier introuvable</p>");
    }
});
app.listen(3000);
console.log("Demarrage sur le server de port: 3000");
