// Handle Like
async function likePost(postId, btnElement) {
  const { status } = await fetchAPI(`/likes/${postId}`, { method: 'POST' });
  if (status === 201) {
    if (typeof showToast === 'function') showToast('Post liked');
    // Swap icon
    btnElement.className = 'action-btn liked';
    btnElement.innerHTML = '<i class="fa-solid fa-heart"></i>';
    btnElement.setAttribute('onclick', `unlikePost('${postId}', this)`);
  } else {
    if (typeof showToast === 'function') showToast('Failed to like post', 'error');
  }
}

// Handle Unlike
async function unlikePost(postId, btnElement) {
  const { status } = await fetchAPI(`/likes/${postId}`, { method: 'DELETE' });
  if (status === 200) {
    // Swap icon
    btnElement.className = 'action-btn';
    btnElement.innerHTML = '<i class="fa-regular fa-heart"></i>';
    btnElement.setAttribute('onclick', `likePost('${postId}', this)`);
  }
}

// Handle Comment Toggle
function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection.classList.contains('hidden')) {
    commentsSection.classList.remove('hidden');
    loadComments(postId);
  } else {
    commentsSection.classList.add('hidden');
  }
}

// Load Comments
async function loadComments(postId) {
  const list = document.getElementById(`comments-list-${postId}`);
  list.innerHTML = '<div class="text-center text-secondary" style="font-size:0.8rem; padding:10px;">Loading...</div>';
  
  const { status, data } = await fetchAPI(`/comments/${postId}`);
  if (status === 200 && data.success) {
    const comments = data.data;
    if (comments.length === 0) {
      list.innerHTML = '';
      return;
    }
    list.innerHTML = comments.map(c => `
      <div class="comment-item">
        <strong>${c.user.username}</strong> <span>${c.content}</span>
      </div>
    `).join('');
  } else {
    list.innerHTML = '<div class="text-center" style="color:var(--error-color);">Failed to load</div>';
  }
}

// Add Comment
async function addComment(e, postId) {
  e.preventDefault();
  const input = document.getElementById(`comment-input-${postId}`);
  const content = input.value;

  const { status, data } = await fetchAPI(`/comments/${postId}`, {
    method: 'POST',
    body: JSON.stringify({ content })
  });

  if (status === 201) {
    input.value = '';
    if (typeof showToast === 'function') showToast('Comment added');
    loadComments(postId);
  } else {
    if (typeof showToast === 'function') showToast(data.message || 'Failed to comment', 'error');
  }
}

// Handle Delete Post
async function deletePost(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    const { status } = await fetchAPI(`/posts/${postId}`, { method: 'DELETE' });
    if (status === 200) {
      document.getElementById(`post-${postId}`).remove();
      if (typeof showToast === 'function') showToast('Post deleted');
    } else {
      if (typeof showToast === 'function') showToast('Failed to delete post', 'error');
    }
  }
}

// Render a single post card (Instagram Style)
function renderPost(post, currentUser, likedPostIds = []) {
  const isOwner = currentUser && currentUser._id === post.user._id;
  const isLiked = likedPostIds.includes(post._id);

  return `
    <div class="post" id="post-${post._id}">
      <div class="post-header">
        <div class="user-info">
          <div class="avatar"></div>
          <a href="profile.html?id=${post.user._id}"><strong>${post.user.username}</strong></a>
        </div>
        ${isOwner ? `
          <div><button class="action-btn" onclick="deletePost('${post._id}')" style="font-size:1.1rem; color:var(--text-secondary);"><i class="fa-solid fa-trash"></i></button></div>
        ` : ''}
      </div>

      <div class="post-content" id="post-content-${post._id}">
        ${post.content}
      </div>

      <div class="post-actions">
        ${isLiked ? 
          `<button class="action-btn liked" onclick="unlikePost('${post._id}', this)"><i class="fa-solid fa-heart"></i></button>` :
          `<button class="action-btn" onclick="likePost('${post._id}', this)"><i class="fa-regular fa-heart"></i></button>`
        }
        <button class="action-btn" onclick="toggleComments('${post._id}')"><i class="fa-regular fa-comment"></i></button>
        <button class="action-btn"><i class="fa-regular fa-paper-plane"></i></button>
      </div>

      <div class="post-caption">
        <strong>${post.user.username}</strong> ${post.content}
      </div>
      <div class="post-date">${new Date(post.createdAt).toLocaleDateString()}</div>
      
      <div class="comments-section hidden" id="comments-${post._id}">
        <div id="comments-list-${post._id}"></div>
        <form class="comment-form" onsubmit="addComment(event, '${post._id}')">
          <input type="text" id="comment-input-${post._id}" class="comment-input" placeholder="Add a comment..." autocomplete="off" required>
          <button type="submit" class="comment-submit">Post</button>
        </form>
      </div>
    </div>
  `;
}
