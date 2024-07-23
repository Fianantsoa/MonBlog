function react(reactionColumn) {
    const oppositeReactionColumn = reactionColumn === 'liker' ? 'antilike' : 'liker';
    const query = `SELECT ${reactionColumn}, ${oppositeReactionColumn} FROM poster WHERE id = ?`;
    
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
        const oppositeReactions = post[oppositeReactionColumn] ? post[oppositeReactionColumn].split(',') : [];

        if (oppositeReactions.includes(userName)) {
            const updatedOppositeReactions = oppositeReactions.filter(name => name !== userName).join(',');

            const updateOppositeQuery = `UPDATE poster SET ${oppositeReactionColumn} = ? WHERE id = ?`;
            database_blog.query(updateOppositeQuery, [updatedOppositeReactions, postId], (err, result) => {
                if (err) {
                    console.error('Erreur du serveur:', err);
                    return res.status(500).json({ message: 'Erreur du serveur.', error: err });
                }
            });
        }

        if (existingReactions.includes(userName)) {
            return res.status(400).json({ message: 'Vous avez déjà réagi.' });
        }

        existingReactions.push(userName);
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
}

app.post('/like', (req, res) => {
    const { postId, userName } = req.body;
    react('liker');
});

app.post('/antilike', (req, res) => {
    const { postId, userName } = req.body;
    react('antilike');
});
