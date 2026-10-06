function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderPost(post, currentUser, likedPostIds = []) {
  const liked = likedPostIds.includes(post._id);
  return `
    <div class="card post" id="post-${post._id}">
      <div class="post-header"><strong>${escapeHTML(post.user?.username || 'user')}</strong></div>
      <div class="post-content">${escapeHTML(post.content)}</div>
      <div class="post-actions">
        <button class="lk-btn" data-post-id="${post._id}" data-liked="${liked}">${liked ? '♥' : '♡'}</button>
        <span class="like-count" data-post-id="${post._id}">${post.likesCount || 0}</span>
        <button class="comment-btn" data-post-id="${post._id}">💬</button>
        <button class="share-btn" data-post-id="${post._id}">↗</button>
      </div>
      <div class="post-date">${new Date(post.createdAt).toLocaleDateString()}</div>
      <div class="comments-section" id="comments-${post._id}" style="display:none">
        <div class="comments-list"></div>
        <form class="comment-form" data-post-id="${post._id}">
          <input type="text" class="comment-input" placeholder="Add a comment..." required />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>`;
}

async function loadComments(postId) {
  const list = document.querySelector(`#comments-${postId} .comments-list`);
  const { status, data } = await fetchAPI(`/posts/${postId}/comments`);
  if (status === 200 && data.success) {
    list.innerHTML = data.data.length
      ? data.data.map(c => `<p><strong>${escapeHTML(c.user?.username || 'user')}</strong> ${escapeHTML(c.content)}</p>`).join('')
      : '<p class="text-secondary">No comments yet.</p>';
  } else {
    list.innerHTML = '<p class="text-secondary">Failed to load comments.</p>';
  }
}

feedContainer.addEventListener('click', async (e) => {
  const likeBtn = e.target.closest('.lk-btn');
  if (likeBtn) {
    if (likeBtn.disabled) return;
    likeBtn.disabled = true;
    const postId = likeBtn.dataset.postId;
    const isLiked = likeBtn.dataset.liked === 'true';
    const { status, data } = await fetchAPI(`/likes/${postId}`, { method: isLiked ? 'DELETE' : 'POST' });
    likeBtn.disabled = false;
    if (status >= 200 && status < 300) {
      likeBtn.dataset.liked = String(!isLiked);
      likeBtn.textContent = isLiked ? '♡' : '♥';
      const countEl = document.querySelector(`.like-count[data-post-id="${postId}"]`);
      if (countEl && data.likesCount !== undefined) countEl.textContent = data.likesCount;
    } else {
      showToast(data.message || 'Failed to like post', 'error');
    }
    return;
  }

  const commentBtn = e.target.closest('.comment-btn');
  if (commentBtn) {
    const postId = commentBtn.dataset.postId;
    const section = document.getElementById(`comments-${postId}`);
    const open = section.style.display === 'none';
    section.style.display = open ? 'block' : 'none';
    if (open) loadComments(postId);
    return;
  }

  const shareBtn = e.target.closest('.share-btn');
  if (shareBtn) {
    const url = `${location.origin}/index.html#post-${shareBtn.dataset.postId}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'MiniSocial post', url }); } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard');
    }
  }
});

feedContainer.addEventListener('submit', async (e) => {
  const form = e.target.closest('.comment-form');
  if (!form) return;
  e.preventDefault();
  const postId = form.dataset.postId;
  const input = form.querySelector('.comment-input');
  const btn = form.querySelector('button');
  btn.disabled = true;
  const { status, data } = await fetchAPI(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content: input.value }),
  });
  btn.disabled = false;
  if (status === 201) {
    input.value = '';
    loadComments(postId);
  } else {
    showToast(data.message || 'Failed to add comment', 'error');
  }
});
