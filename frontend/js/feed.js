document.addEventListener('DOMContentLoaded', () => {
  const createPostForm = document.getElementById('create-post-form');
  const feedContainer = document.getElementById('feed-container');
  const currentUser = getUser();

  // Load feed
  async function loadFeed() {
    const { status, data } = await fetchAPI('/posts');
    if (status === 200 && data.success) {
      const posts = data.data;
      
      // Get current user's likes
      const likesRes = await fetchAPI('/likes/my-likes');
      let likedPostIds = [];
      if (likesRes.status === 200 && likesRes.data.success) {
        likedPostIds = likesRes.data.data.map(like => like.post._id);
      }

      if (posts.length === 0) {
        feedContainer.innerHTML = '<div class="card text-center text-secondary">No posts to show. Start following people or create a post!</div>';
        return;
      }

      feedContainer.innerHTML = posts.map(post => renderPost(post, currentUser, likedPostIds)).join('');
    } else {
      feedContainer.innerHTML = '<div class="text-center text-secondary">Failed to load feed.</div>';
    }
  }

  if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const contentInput = document.getElementById('post-content');
      const content = contentInput.value;
      const btn = createPostForm.querySelector('button');
      
      btn.textContent = 'Posting...';
      btn.disabled = true;

      const { status, data } = await fetchAPI('/posts', {
        method: 'POST',
        body: JSON.stringify({ content })
      });

      btn.textContent = 'Post';
      btn.disabled = false;

      if (status === 201) {
        contentInput.value = '';
        if (typeof showToast === 'function') showToast('Post created successfully!');
        loadFeed(); // Reload feed to show new post
      } else {
        if (typeof showToast === 'function') showToast(data.message || 'Error creating post', 'error');
      }
    });
  }

  loadFeed();
});
