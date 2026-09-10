document.addEventListener('DOMContentLoaded', () => {
  const profileContainer = document.getElementById('profile-container');
  const postsContainer = document.getElementById('user-posts-container');
  const editFormContainer = document.getElementById('edit-profile-form-container');
  const editForm = document.getElementById('edit-profile-form');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  
  const currentUser = getUser();
  
  // Get user ID from URL, default to current user
  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get('id') || currentUser?._id;

  if (!profileUserId) {
    window.location.href = 'login.html';
    return;
  }

  const isOwnProfile = currentUser && currentUser._id === profileUserId;

  async function loadProfile() {
    try {
      const [userRes, followersRes, followingRes] = await Promise.all([
        fetchAPI(`/users/${profileUserId}`),
        fetchAPI(`/users/${profileUserId}/followers`),
        fetchAPI(`/users/${profileUserId}/following`)
      ]);

      if (userRes.status === 200) {
        const user = userRes.data.data;
        const followers = followersRes.data.data || [];
        const following = followingRes.data.data || [];
        
        const isFollowing = followers.some(f => f.follower._id === currentUser._id);

        profileContainer.innerHTML = `
          <div class="profile-avatar"></div>
          <h2>${user.name}</h2>
          <p class="text-secondary">@${user.username}</p>
          <p class="mt-1">${user.bio || 'No bio yet.'}</p>
          
          <div class="profile-stats">
            <div><strong>${followers.length}</strong> Followers</div>
            <div><strong>${following.length}</strong> Following</div>
          </div>
          
          <div class="mt-2">
            ${isOwnProfile 
              ? `<button class="btn btn-outline" id="show-edit-btn">Edit Profile</button>`
              : `<button class="btn ${isFollowing ? 'btn-outline' : ''}" id="follow-btn">
                  ${isFollowing ? 'Following' : 'Follow'}
                 </button>`
            }
          </div>
        `;

        // Attach event listeners
        if (isOwnProfile) {
          document.getElementById('show-edit-btn').addEventListener('click', () => {
            editFormContainer.classList.remove('hidden');
            document.getElementById('edit-name').value = user.name;
            document.getElementById('edit-bio').value = user.bio;
          });
        } else {
          const followBtn = document.getElementById('follow-btn');
          followBtn.addEventListener('click', async () => {
            if (isFollowing) {
              const res = await fetchAPI(`/users/${profileUserId}/follow`, { method: 'DELETE' });
              if (res.status === 200) loadProfile(); // reload to update counts
            } else {
              const res = await fetchAPI(`/users/${profileUserId}/follow`, { method: 'POST' });
              if (res.status === 201) loadProfile();
            }
          });
        }

      } else {
        profileContainer.innerHTML = '<div class="alert alert-error">User not found.</div>';
      }
    } catch (err) {
      profileContainer.innerHTML = '<div class="alert alert-error">Error loading profile.</div>';
    }
  }

  async function loadUserPosts() {
    postsContainer.innerHTML = '<div class="text-center">Loading posts...</div>';
    const { status, data } = await fetchAPI(`/posts?userId=${profileUserId}`);
    
    if (status === 200 && data.success) {
      const posts = data.data;
      if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="card text-center">No posts available yet.</div>';
        return;
      }
      postsContainer.innerHTML = posts.map(post => renderPost(post, currentUser)).join('');
    } else {
      postsContainer.innerHTML = '<div class="alert alert-error">Failed to load posts.</div>';
    }
  }

  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('edit-name').value;
      const bio = document.getElementById('edit-bio').value;

      const { status, data } = await fetchAPI(`/users/${profileUserId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, bio })
      });

      if (status === 200) {
        // Update local storage user data
        const updatedUser = { ...currentUser, name, bio };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        editFormContainer.classList.add('hidden');
        loadProfile(); // Reload
      } else {
        alert(data.message || 'Error updating profile');
      }
    });

    cancelEditBtn.addEventListener('click', () => {
      editFormContainer.classList.add('hidden');
    });
  }

  // Init
  loadProfile();
  loadUserPosts();
});
