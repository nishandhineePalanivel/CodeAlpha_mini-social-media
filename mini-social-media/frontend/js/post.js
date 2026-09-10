// Global functions for post interactions that can be used in feed and profile
async function likePost(postId, btnElement) {
  const { status, data } = await fetchAPI(`/posts/${postId}/like`, { method: 'POST' });
  if (status === 201) {
    // Reload likes count and toggle button
    btnElement.classList.add('liked');
    btnElement.textContent = '❤️ Un-like';
    btnElement.onclick = () => unlikePost(postId, btnElement);
  } else if (status === 409) {
    alert('Already liked');
  }
}

async function unlikePost(postId, btnElement) {
  const { status, data } = await fetchAPI(`/posts/${postId}/like`, { method: 'DELETE' });
  if (status === 200) {
    btnElement.classList.remove('liked');
    btnElement.textContent = '🤍 Like';
    btnElement.onclick = () => likePost(postId, btnElement);
  }
}

async function deletePost(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    const { status, data } = await fetchAPI(`/posts/${postId}`, { method: 'DELETE' });
    if (status === 200) {
      document.getElementById(`post-${postId}`).remove();
    } else {
      alert(data.message || 'Error deleting post');
    }
  }
}

async function editPost(postId) {
  const newContent = prompt('Edit your post:');
  if (newContent) {
    const { status, data } = await fetchAPI(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({ content: newContent })
    });
    
    if (status === 200) {
      document.getElementById(`post-content-${postId}`).textContent = newContent;
    } else {
      alert(data.message || 'Error updating post');
    }
  }
}

async function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection.classList.contains('hidden')) {
    commentsSection.classList.remove('hidden');
    loadComments(postId);
  } else {
    commentsSection.classList.add('hidden');
  }
}

async function loadComments(postId) {
  const container = document.getElementById(`comments-list-${postId}`);
  container.innerHTML = 'Loading comments...';
  
  const { status, data } = await fetchAPI(`/posts/${postId}/comments`);
  if (status === 200 && data.success) {
    const comments = data.data;
    const currentUser = getUser();
    
    if (comments.length === 0) {
      container.innerHTML = '<p class="text-center text-secondary">No comments yet.</p>';
      return;
    }

    container.innerHTML = comments.map(comment => `
      <div class="comment" id="comment-${comment._id}">
        <div class="comment-content">
          <div class="comment-header">
            <strong>${comment.user.name}</strong> <span>@${comment.user.username}</span>
            ${currentUser && currentUser._id === comment.user._id ? 
              `<button class="action-btn" style="color: var(--error-color)" onclick="deleteComment('${comment._id}', '${postId}')">Delete</button>` 
              : ''}
          </div>
          <p>${comment.text}</p>
        </div>
      </div>
    `).join('');
  }
}

async function addComment(e, postId) {
  e.preventDefault();
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value;
  
  if (!text.trim()) return;

  const { status, data } = await fetchAPI(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });

  if (status === 201) {
    input.value = '';
    loadComments(postId); // Reload to show new comment
  }
}

async function deleteComment(commentId, postId) {
  if (confirm('Delete this comment?')) {
    const { status, data } = await fetchAPI(`/comments/${commentId}`, { method: 'DELETE' });
    if (status === 200) {
      document.getElementById(`comment-${commentId}`).remove();
    }
  }
}

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
        ${isOwner ? `<div><button class="action-btn" onclick="deletePost('${post._id}')" style="font-size:0.9rem;">🗑️</button></div>` : ''}
      </div>

      <div class="post-content" id="post-content-${post._id}">
        ${post.content}
      </div>

      <div class="post-actions">
        ${isLiked ? 
          `<button class="action-btn liked" onclick="unlikePost('${post._id}', this)">❤️</button>` :
          `<button class="action-btn" onclick="likePost('${post._id}', this)">🤍</button>`
        }
        <button class="action-btn" onclick="toggleComments('${post._id}')">💬</button>
      </div>

      <div class="post-caption">
        <strong>${post.user.username}</strong> ${post.content}
      </div>
      <div class="post-date">${new Date(post.createdAt).toLocaleDateString()}</div>
      
      <div class="comments-section hidden" id="comments-${post._id}">
        <form style="display: flex; gap: 10px; margin: 10px 15px;" onsubmit="addComment(event, '${post._id}')">
          <input type="text" id="comment-input-${post._id}" class="form-control" placeholder="Add a comment..." required style="background:transparent; border:none; border-bottom:1px solid #dbdbdb; border-radius:0;">
          <button type="submit" style="background:none; border:none; color:#0095f6; font-weight:bold; cursor:pointer;">Post</button>
        </form>
        <div id="comments-list-${post._id}" style="padding: 0 15px; margin-top: 10px; font-size: 0.9rem;"></div>
      </div>
    </div>
  `;
}
