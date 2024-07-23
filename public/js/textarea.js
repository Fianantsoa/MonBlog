function wrapText(tag) {
    const textarea = document.getElementById('contenu');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const after = text.substring(end);
    var newText;
    if(tag == "h2"){
        newText = before + `<${tag} class="section-heading">` + selectedText + `</${tag}>` + after;
    }if(tag == "blockquote"){
        newText = before + `<${tag} class="blockquote">` + selectedText + `</${tag}>` + after;
    }
    else{
        newText = before + `<${tag}>` + selectedText + `</${tag}>` + after;
    }
    textarea.value = newText;
}

function insertTag(tag) {
    const textarea = document.getElementById('contenu');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + `<${tag}>` + after;
    
    textarea.value = newText;
}