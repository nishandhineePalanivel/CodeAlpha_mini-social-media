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

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

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

        const isFollowing = followers.some(f => f.follower && f.follower._id === currentUser._id);

        profileContainer.innerHTML = `
          <div class="profile-header">
            <div class="profile-avatar-large"></div>
            <div class="profile-info">
              <div class="profile-top">
                <h2>${esc(user.username)}</h2>
                ${isOwnProfile
                  ? `<button class="btn btn-outline" id="show-edit-btn">Edit Profile</button>`
                  : `<button class="btn ${isFollowing ? 'btn-outline' : ''}" id="follow-btn">
                      ${isFollowing ? 'Following' : 'Follow'}
                     </button>`
                }
              </div>
              <div class="profile-stats">
                <span><strong id="posts-count">0</strong> posts</span>
                <span><strong>${followers.length}</strong> followers</span>
                <span><strong>${following.length}</strong> following</span>
              </div>
              <div class="profile-bio">
                <strong>${esc(user.name)}</strong>
                ${user.bio ? `<div>${esc(user.bio)}</div>` : ''}
              </div>
            </div>
          </div>
        `;

        if (isOwnProfile) {
          document.getElementById('show-edit-btn').addEventListener('click', () => {
            editFormContainer.classList.remove('hidden');
            document.getElementById('edit-name').value = user.name;
            document.getElementById('edit-bio').value = user.bio || '';
          });
        } else {
          const followBtn = document.getElementById('follow-btn');
          followBtn.addEventListener('click', async () => {
            followBtn.disabled = true;
            if (isFollowing) {
              const res = await fetchAPI(`/users/${profileUserId}/follow`, { method: 'DELETE' });
              if (res.status === 200) loadProfile(); else followBtn.disabled = false;
            } else {
              const res = await fetchAPI(`/users/${profileUserId}/follow`, { method: 'POST' });
              if (res.status === 201) loadProfile(); else followBtn.disabled = false;
            }
          });
        }

        loadUserPosts(); // re-sync the post count after the header re-renders
      } else {
        profileContainer.innerHTML = '<div class="text-center text-secondary">User not found.</div>';
      }
    } catch (err) {
      profileContainer.innerHTML = '<div class="text-center text-secondary">Error loading profile.</div>';
    }
  }

  async function loadUserPosts() {
    const { status, data } = await fetchAPI(`/posts?userId=${profileUserId}`);

    if (status === 200 && data.success) {
      const posts = data.data;

      const countEl = document.getElementById('posts-count');
      if (countEl) countEl.textContent = posts.length;

      if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="text-center text-secondary mt-2"><i class="fa-solid fa-camera" style="font-size:3rem; margin-bottom:15px; display:block;"></i>No posts yet.</div>';
        return;
      }

      const likesRes = await fetchAPI('/likes/my-likes');
      const likedPostIds = likesRes.status === 200
        ? likesRes.data.data.filter(l => l.post).map(l => l.post._id)
        : [];

      postsContainer.innerHTML = posts.map(post => renderPost(post, currentUser, likedPostIds)).join('');
    } else {
      postsContainer.innerHTML = '<div class="text-center text-secondary">Failed to load posts.</div>';
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
        const updatedUser = { ...currentUser, name, bio };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        editFormContainer.classList.add('hidden');
        if (typeof showToast === 'function') showToast('Profile updated');
        loadProfile();
      } else {
        if (typeof showToast === 'function') showToast(data.message || 'Error updating profile', 'error');
      }
    });

    cancelEditBtn.addEventListener('click', () => {
      editFormContainer.classList.add('hidden');
    });
  }

  loadProfile();
});
