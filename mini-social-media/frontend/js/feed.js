document.addEventListener('DOMContentLoaded', () => {
  const feedContainer = document.getElementById('feed-container');
  const createPostForm = document.getElementById('create-post-form');
  const currentUser = getUser();

  if (!currentUser) return; // Wait for redirect from api.js

  // Handle post creation
  if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = document.getElementById('post-content').value;
      const msgDiv = document.getElementById('post-message');

      try {
        const { status, data } = await fetchAPI('/posts', {
          method: 'POST',
          body: JSON.stringify({ content })
        });

        if (status === 201) {
          document.getElementById('post-content').value = '';
          msgDiv.textContent = 'Post created successfully!';
          msgDiv.className = 'alert alert-success mt-1';
          msgDiv.classList.remove('hidden');
          
          setTimeout(() => msgDiv.classList.add('hidden'), 3000);
          loadFeed(); // Reload feed
        }
      } catch (error) {
        msgDiv.textContent = 'Failed to create post';
        msgDiv.className = 'alert alert-error mt-1';
        msgDiv.classList.remove('hidden');
      }
    });
  }

  async function loadFeed() {
    feedContainer.innerHTML = '<div class="text-center">Loading posts...</div>';
    
    try {
      const { status, data } = await fetchAPI('/posts');
      
      if (status === 200 && data.success) {
        const posts = data.data;
        
        if (posts.length === 0) {
          feedContainer.innerHTML = '<div class="card text-center">No posts available yet.</div>';
          return;
        }

        // We need to know which posts the user has liked to render the buttons properly.
        // For simplicity, we could fetch likes for each post or just render 'Like' for now.
        // A better API would return `isLiked` within the post object, but since we have a separate route:
        // We will just assume they haven't liked it and let the API fail with 409 if they try again.
        // Or we fetch user's likes. Let's do a basic render:
        
        feedContainer.innerHTML = posts.map(post => renderPost(post, currentUser)).join('');
      } else {
        feedContainer.innerHTML = '<div class="alert alert-error">Failed to load feed.</div>';
      }
    } catch (error) {
      feedContainer.innerHTML = '<div class="alert alert-error">Error loading feed.</div>';
    }
  }

  // Initial load
  if (feedContainer) {
    loadFeed();
  }
});
