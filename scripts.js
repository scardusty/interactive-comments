let utils = {};

var rawComments = {};

var currentUserData = '';

let url = 'data.json';

utils.get = (url) => {
    return new Promise(function(resolve,reject) {
        var req = new XMLHttpRequest();
    
        req.open('GET', url);

        req.onload = function () {
            if (req.status == 200) {
                //console.log(req.response);
                resolve(req.response);
            }
            else {
                reject(Error('promise error with ' + req.status));
            }
        };
        req.onerror = function(err) {
            console.log('Network error with '+url+': ' + err);
        };
        req.send();
    });
}; //utils.get

utils.getJSON = async function(url) {
    let string = null;
    try {
       string = await utils.get(url);
    }
    catch (e) {
        alert('error: ' + e);
    };
    
    let data = JSON.parse(string);
    
    return data;
};//utils.getJSON

utils.get(url).then(function (data) {
    console.log(data + 'got');
}).catch( function (e) {
    
    alert('error - ' + e);
});

async function init() {
    let root = document.getElementById('testdiv');
    
    let url = 'data.json';
    
    let theComments = await utils.getJSON(url);
    console.log('this is ' + theComments);
    
    rawComments = theComments;
    
    root.appendChild(buildThread(theComments));
};//end json stuff

function buildThread (theData) { //convert JSON into thread
    let html = document.getElementById('testdiv');
    
    currentUserData = theData.currentUser;
    console.log(theData);
    let currentUserImg = currentUserData.image.png;
    let currentUser = currentUserData.username;
    
    let comments = theData.comments;
    console.log('theData.comments is ' + theData.comments);
    
    ulThread = document.createElement('ul');
    ulThread.classList.add('comments');
    
    let commentThread = createComments(comments);
    let addCommentBox = addCommentForm(false);
    
    ulThread.appendChild(commentThread);
    ulThread.appendChild(addCommentBox);
    
    return ulThread;
};

function createComments (comments) {
    
    let frag = document.createDocumentFragment();
    let currentUser = currentUserData.username;
    let comments2 = comments;
    
    for (comment of comments2)   {
        let singleComment = buildComment(comment);
        frag.appendChild(singleComment);
    }
    
    return frag;
};

function buildComment(comment) {

    let currentUser = currentUserData.username;
    let liComment = document.createElement('li');
    let id = comment.id; 
    let userData = comment.user;
    let username = userData.username;
    let userImg = userData.image.png;
    let date = comment.createdAt;
    let replies = comment.replies;
    let votes = comment.score;
    let replyingTo = comment.replyingTo;
    let actionButtons = getActionButtons(id, currentUser, userData);

    liComment.id = 'comment-' + id;

    //adding classes to comment li
    if (currentUser == username) {

        if (comment.replyingTo != null) {
            liComment.classList.add('comment', 'is-you', 'is-child');
            console.log('comment ' + id + ' is you and a child.');
        }
        else {
            liComment.classList.add('comment','is-you', 'level-1');
            console.log('comment ' + id + ' is you but NOT a child.');
        }
    } 
    else {
        if (comment.replyingTo != null) {
            liComment.classList.add('comment', 'is-child');
            console.log('comment ' + id + ' is NOT you but is a child.');
        }
        else {
            liComment.classList.add('comment', 'level-1');
            console.log('comment ' + id + ' is NOT you and NOT a child.');
        }
    }

    //Comment Content
    let commentWrapper = document.createElement('div');
    commentWrapper.classList.add('comment-wrapper');
    let commentText = document.createElement('div');
    commentText.classList.add('comment-text');
    let commentHead = document.createElement('div');
    commentHead.classList.add('comment-head');

    let commentVotes = getCount(votes);

    let userImgBox = document.createElement('img');
    userImgBox.src= userImg;
    let usernameBox = document.createElement('p');
    usernameBox.classList.add('name');
    usernameBox.innerHTML = username;
    let dateBox = document.createElement('p');
    dateBox.classList.add('date');
    dateBox.innerHTML = date;

    liComment.appendChild(commentWrapper);
    commentWrapper.appendChild(commentVotes);
    commentWrapper.appendChild(commentText);
    commentText.appendChild(commentHead);
    commentHead.appendChild(userImgBox);
    commentHead.appendChild(usernameBox);                 
    commentHead.appendChild(dateBox);                
    commentHead.appendChild(actionButtons);

    let commentBody = comment.content;
    let commentBodyBox = document.createElement('p');
    if (replyingTo != undefined) {
        let replyingTo = comment.replyingTo;
        let atUsername = document.createElement('span');
        atUsername.classList.add('at-username');
        atUsername.innerHTML = '@' + replyingTo + ' ';
        commentBodyBox.appendChild(atUsername);
    };
    commentBodyBox.innerHTML += commentBody;
    commentBodyBox.classList.add('comment-body');
    commentText.appendChild(commentBodyBox);

    if (replies != null && replies.length > 0) {
        console.log('comment ' + id + ' has replies');
        let repliesBox = document.createElement('ul');
        repliesBox.classList.add('replies');

        let repliesThread = createComments(replies);

        repliesBox.appendChild(repliesThread);
        liComment.appendChild(repliesBox);
    }
    else { 
        console.log('comment ' + id + ' does not have replies');
    }

    return liComment;
};

function getActionButtons (id, currentUserData, opUserData) {
    
    let actionButtonsBox = document.createElement('p');
    actionButtonsBox.classList.add('action-buttons');
    
    const replyButton = document.createElement('span');
    replyButton.classList.add('reply-button');
    replyButton.innerHTML = document.getElementById('reply-button-svg').innerHTML + ` Reply`;
    
    const deleteButton = document.createElement('span');
    deleteButton.classList.add('delete-button');
    deleteButton.innerHTML = document.getElementById('delete-button-svg').innerHTML + ` Delete`;
    
    const editButton = document.createElement('span');
    editButton.classList.add('edit-button');
    editButton.innerHTML = document.getElementById('edit-button-svg').innerHTML + ` Edit`;
    
    if (currentUserData !== opUserData.username) {
        console.log('they arent equal. current username =' + currentUserData.username + '. op username = ' + opUserData.username +'.');
        actionButtonsBox.appendChild(replyButton); 
    }
    actionButtonsBox.appendChild(deleteButton);
    actionButtonsBox.appendChild(editButton);
    
    replyButton.onclick = function () {
        let theComment = document.getElementById('comment-'+id);
        let repliesContainer = theComment.getElementsByTagName('ul');
        
        if (repliesContainer.length < 1) {
            let repliesContainer = document.createElement('ul');
            repliesContainer.classList.add('replies', 'comments');
            theComment.appendChild(repliesContainer);
            repliesContainer.appendChild(addCommentForm(true, opUserData)); 
        }
        else {
            let repliesContainer = theComment.getElementsByTagName('ul');
            repliesContainer = repliesContainer[0];
            
            if (theComment.querySelectorAll('.add-comment').length < 1) {
                let commentForm = addCommentForm(true, opUserData);
                repliesContainer.appendChild(commentForm);
            }
        }
    } 
    
    deleteButton.onclick = function () {
        let theComment = document.getElementById('comment-'+id);
        let popup = document.getElementById('delete-popup');
        let yesButton = document.getElementById('yes-delete');
        let cancelButton = document.getElementById('cancel');
        let screen = document.getElementById('screen');
        popup.style.display = 'flex';
        screen.style.display= 'block';
        
        yesButton.onclick = function () {
            popup.style.display = 'none';
            screen.style.display= 'none';
            theComment.remove();
        };
        
        cancelButton.onclick = function () {
            
            popup.style.display = 'none';
            screen.style.display= 'none';
        };
        
        screen.onclick = function () {
            
            popup.style.display = 'none';
            screen.style.display= 'none';
        };
        
        
    };
    
    editButton.onclick = function () {
        let theComment = document.getElementById('comment-'+id);
        let commentContainer = theComment.querySelector('.comment-text');
        let commentBody = theComment.querySelector('.comment-body');
        let commentContent = commentBody.innerText;
        commentContainer.removeChild(commentBody);//remove comment p
        let textareaWrapper = document.createElement('p');//create edit box
        textareaWrapper.classList.add('add-text', 'edit');
        let textarea = document.createElement('textarea');
        textarea.value = commentContent; //put comment text in edit box
        textareaWrapper.appendChild(textarea);
        commentContainer.appendChild(textareaWrapper);
        
        let updateButton = document.createElement('input');
        updateButton.type = 'button';
        updateButton.classList.add('update');
        updateButton.value = 'Update';
        textareaWrapper.appendChild(updateButton);
        
        updateButton.onclick = function () {
            let atUsername = commentContent.replace(/ .*/,''); // get replyingTo username (first word) of commentText
            let replyingTo = document.createElement('span');
            commentContent = textarea.value;
            commentContent = commentContent.slice(atUsername.length); // crop username from comment
            replyingTo.classList.add('at-username');
            replyingTo.innerHTML = atUsername;
            commentBody.innerHTML = '';
            commentBody.appendChild(replyingTo);
            commentBody.innerHTML += ' ' + commentContent;
            commentContainer.removeChild(textareaWrapper);
            commentContainer.appendChild(commentBody);
        };
    };
    
    return actionButtonsBox;
    
};

function getCount (count) {
    const plusButtonSVG = `<svg width="11" height="11"><path d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z" fill="#C5C6EF"></svg>`;
    const minusButtonSVG = `<svg width="11" height="3"><path d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z" fill="#C5C6EF"/></svg>`;
    
    let countBox = document.createElement('div');
    countBox.classList.add('count');
    
    let plusButton = document.createElement('div');
    plusButton.classList.add('plus');
    plusButton.innerHTML = plusButtonSVG;
    
    let minusButton = document.createElement('div');
    minusButton.classList.add('minus');
    minusButton.innerHTML = minusButtonSVG;
    
    let voteBox = document.createElement('div');
    voteBox.classList.add('vote-number');
    
    const ogVoteNumber = parseInt(count); // to limit voting, keep track of original vote count
    let voteNumber = parseInt(count); //the vote count that can be changed
    voteBox.innerHTML = voteNumber;
    
    countBox.appendChild(plusButton);
    countBox.appendChild(voteBox);
    countBox.appendChild(minusButton);
    
    plusButton.onclick = function () {
        if (ogVoteNumber >= voteNumber) {
            voteNumber++;
            voteBox.innerHTML = voteNumber;
        }
    };
    
    minusButton.onclick = function () {
        if (ogVoteNumber <= voteNumber) {
            voteNumber--;
            voteBox.innerHTML = voteNumber;
        }
    };
    
    return countBox;
};

function addCommentForm (isReply = false, opUserData = '') {
    
    //addCommentUl = document.createElement('ul');
    //addCommentUl.classList.add('comments');
    
    var frag = document.createDocumentFragment();
    
    var addCommentBox = document.createElement('li');
    addCommentBox.classList.add('add-comment', 'comment');
    
    frag.appendChild(addCommentBox);
    
    var commentForm = document.createElement('form');
    commentForm.classList.add('comment-wrapper');
    
    function handleForm(event) { event.preventDefault(); } 
    commentForm.addEventListener('submit', handleForm);
    
    var userImg = document.createElement('img');
    userImg.src = currentUserData.image.png;
    userImg.classList.add('add-icon');
    
    let textBox = document.createElement('p');
    textBox.classList.add('add-text');
    var textarea = document.createElement('textarea');
    textarea.placeholder = 'Add a comment...';
    if (isReply == true) {
        textarea.value = '@' + opUserData.username + ' '; 
    }
                            
    textBox.appendChild(textarea);
    
    let submitButtonBox = document.createElement('div');
    submitButtonBox.classList.add('submit-reply');
    var submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'send';
    
    submitButton.onclick = function () {
        var theComment;
        if (isReply == true) {
            theComment = addComment(true);
        } else {
            theComment = addComment(false); 
        }
        let commentsData = rawComments.comments;
        console.log(commentsData);
        let parentUl = addCommentBox.parentElement;
        parentUl.insertBefore(theComment, addCommentBox);
        if (isReply == true) {
            parentUl.removeChild(addCommentBox);
        }
        
    };
        
    submitButtonBox.appendChild(submitButton);
    
    commentForm.appendChild(userImg);
    commentForm.appendChild(textBox);
    commentForm.appendChild(submitButtonBox);
    
    addCommentBox.appendChild(commentForm);
    
    //addCommentUl.appendChild(addCommentBox);
    
    function addComment (isReply = false) {
        //let parent = parentUl;
        let totalComments = document.querySelectorAll('.comment');
        let subtractComments = document.querySelectorAll('.add-comment');
        let commentCount = totalComments.length - subtractComments.length;
        var commentBody = textarea.value;
        let commentDate = new Date().toLocaleDateString();
        let commentId = (parseInt(commentCount + 1));
        
        if (isReply == true) {
            if (commentBody.charAt(0) == '@') {
                var replyingTo = commentBody.replace(/ .*/,''); // get replyingTo username (first word) of commentBody
                commentBody = commentBody.slice(replyingTo.length); // crop username from comment
                replyingTo = replyingTo.slice(1); //get @ out of replyingTo username
            }
        }
        
        let userImgData = {png: currentUserData.image.png, webp: currentUserData.image.webp};
        let user = { image: userImgData, username: currentUserData.username };
        
        let commentData = { id: commentId,
          content: commentBody,
          createdAt: commentDate,
          score: 0,
          replyingTo: replyingTo,
          user: user };
        
        console.log(commentData);
        rawComments.comments.push(commentData);
        
        return buildComment(commentData);
    };
    
    return frag;
};

init();