
window.addEventListener('DOMContentLoaded', () => {
    let scrollPos = 0;
    const mainNav = document.getElementById('mainNav');
    const headerHeight = mainNav.clientHeight;
    window.addEventListener('scroll', function() {
        const currentTop = document.body.getBoundingClientRect().top * -1;
        if ( currentTop < scrollPos) {
            if (currentTop > 0 && mainNav.classList.contains('is-fixed')) {
                mainNav.classList.add('is-visible');
            } else {
                console.log(123);
                mainNav.classList.remove('is-visible', 'is-fixed');
            }
        } else {
            mainNav.classList.remove(['is-visible']);
            if (currentTop > headerHeight && !mainNav.classList.contains('is-fixed')) {
                mainNav.classList.add('is-fixed');
            }
        }
        scrollPos = currentTop;
    });
})

//C'est pour afficher et cacher le bloc de commentaire de chaque poste Mr
document.querySelectorAll('.commenter-button').forEach(buttonComment => {
    buttonComment.addEventListener('click', function () {
        const postId = this.dataset.postId;
        const div_commentaire = document.getElementById("div_commentaire"+postId);
        if(div_commentaire.style.display == "none"){
            div_commentaire.style.display = "grid";
        }else{
            div_commentaire.style.display = "none";
        }
    });
});

//C'est pour la gestion des réactions et ses effets
async function react(postId, namePoster, userName, commentaire, reactionType) {
    const response = await fetch('/react', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId, namePoster, userName, commentaire, reactionType })
    });

    const result = await response.json();
    if (response.ok) {
        const countElement = document.querySelector(`.post-preview[data-post-id="${postId}"] .${reactionType}-count`);
        if (countElement) {
            countElement.textContent = parseInt(countElement.textContent) + 1;
        } else {
            console.error(`Element with selector .post-preview[data-post-id="${postId}"] .${reactionType}-count not found.`);
        }
        
        if(reactionType != "view"){
            const button = document.querySelector(`.post-preview[data-post-id="${postId}"] .${reactionType}-button`);
            if (button) {
                button.disabled = true;
            } else {
                console.error(`Button with selector .post-preview[data-post-id="${postId}"] .${reactionType}-button not found.`);
            }
        }
    } else {
        alert(result.message);
    }
}

document.querySelectorAll('.react-button').forEach(button => {
    button.addEventListener('click', function () {
        const postId = this.dataset.postId;
        const namePoster = this.dataset.namePoster;
        const userName = this.dataset.userName; 
        const reactionType = this.dataset.reactionType;
        react(postId, namePoster, userName, '', reactionType);
    });
});

document.querySelectorAll('.sendComment').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const postId = formData.get('postId');
        const userName = formData.get('userName');
        const commentaire = formData.get('commentaire');
        const reactionType = formData.get('reactionType');

        fetch(this.action, {
            method: this.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postId: postId,
                userName: userName,
                commentaire: commentaire,
                reactionType: reactionType
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Réaction ajoutée avec succès.') {
                const commentDiv = document.getElementById('div_commentaire' + postId);
                const nameParagraph = document.createElement('p');
                nameParagraph.className = 'nameCommenter';
                nameParagraph.textContent = userName;
                const commentParagraph = document.createElement('p');
                commentParagraph.className = 'commentaire';
                commentParagraph.textContent = commentaire;
                commentDiv.appendChild(nameParagraph);
                commentDiv.appendChild(commentParagraph);
                const div_no_comment = document.getElementById("no-comment" + postId);
                div_no_comment.style.display = "none";
            
                this.reset();
            } else {
                console.error(data.message);
            }
            
        })
        .catch(error => console.error('Erreur:', error));
    });
});
