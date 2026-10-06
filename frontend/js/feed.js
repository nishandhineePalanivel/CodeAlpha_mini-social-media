document.addEventListener('DOMContentLoaded', () => {
  const createPostForm = document.getElementById('create-post-form');
  const feedContainer = document.getElementById('feed-container');
  const currentUser = getUser();

  function escapeHTML(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function renderPost(post, user, likedPostIds = []) {
    const liked = likedPostIds.includes(post._id);
    return `
      <div class="card post" id="post-${post._id}">
        <div class="post-header"><strong>${escapeHTML(post.user?.username || post.user?.name || 'user')}</strong></div>
        <div class="post-content">${escapeHTML(post.content)}</div>
        <div class="post-actions" style="display:flex;gap:16px;align-items:center;padding:8px 0">
          <button class="lk-btn" data-post-id="${post._id}" data-liked="${liked}" style="background:none;border:0;color:inherit;font-size:20px;cursor:pointer">${liked ? '♥' : '♡'}</button>
          <span class="like-count" data-post-id="${post._id}">${post.likesCount || 0}</span>
          <button class="comment-btn" data-post-id="${post._id}" style="background:none;border:0;color:inherit;font-size:20px;cursor:pointer">💬</button>
          <span class="comment-count" data-post-id="${post._id}">${post.commentsCount || 0}</span>
          <button class="share-btn" data-post-id="${post._id}" style="background:none;border:0;color:inherit;font-size:20px;cursor:pointer">↗</button>
        </div>
        <div class="post-date">${new Date(post.createdAt).toLocaleDateString()}</div>
        <div class="comments-section" id="comments-${post._id}" style="display:none">
          <div class="comments-list"></div>
          <form class="comment-form" data-post-id="${post._id}" style="display:flex;gap:8px;margin-top:8px">
            <input type="text" class="comment-input" placeholder="Add a comment..." required style="flex:1" />
            <button type="submit">Post</button>
          </form>
        </div>
      </div>`;
  }

  async function loadFeed() {
    const { status, data } = await fetchAPI('/posts');
    if (status === 200 && data.success) {
      const posts = data.data;

      const likesRes = await fetchAPI('/likes/my-likes');
      let likedPostIds = [];
      if (likesRes.status === 200 && likesRes.data.success) {
        likedPostIds = likesRes.data.data.filter(l => l.post).map(l => l.post._id);
      }

      if (posts.length === 0) {
        feedContainer.innerHTML = '<div class="card text-center text-secondary">No posts to show. Create a post!</div>';
        return;
      }

      feedContainer.innerHTML = posts.map(p => renderPost(p, currentUser, likedPostIds)).join('');
      if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
    } else {
      feedContainer.innerHTML = '<div class="text-center text-secondary">Failed to load feed.</div>';
    }
  }

  async function loadComments(postId) {
    const list = document.querySelector(`#comments-${postId} .comments-list`);
    const { status, data } = await fetchAPI(`/comments/${postId}`);
    if (status === 200 && data.success) {
      list.innerHTML = data.data.length
        ? data.data.map(c => `<p><strong>${escapeHTML(c.user?.username || c.user?.name || 'user')}</strong> ${escapeHTML(c.content)}</p>`).join('')
        : '<p class="text-secondary">No comments yet.</p>';
      const cc = document.querySelector(`.comment-count[data-post-id="${postId}"]`);
      if (cc) cc.textContent = data.commentsCount;
    } else {
      list.innerHTML = '<p class="text-secondary">Failed to load comments.</p>';
    }
  }

  if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const contentInput = document.getElementById('post-content');
      const btn = createPostForm.querySelector('button');
      btn.textContent = 'Posting...';
      btn.disabled = true;

      const { status, data } = await fetchAPI('/posts', {
        method: 'POST',
        body: JSON.stringify({ content: contentInput.value }),
      });

      btn.textContent = 'Post';
      btn.disabled = false;

      if (status === 201) {
        contentInput.value = '';
        if (typeof showToast === 'function') showToast('Post created successfully!');
        loadFeed();
      } else if (typeof showToast === 'function') {
        showToast(data.message || 'Error creating post', 'error');
      }
    });
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
        try {
          await navigator.clipboard.writeText(url);
          showToast('Link copied to clipboard');
        } catch (_) {
          prompt('Copy this link:', url);
        }
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

    const { status, data } = await fetchAPI(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content: input.value }),
    });

    btn.disabled = false;
    if (status === 201) {
      input.value = '';
      await loadComments(postId);
    } else {
      showToast(data.message || 'Failed to add comment', 'error');
    }
  });

  loadFeed();
});
