document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  let timeoutId;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeoutId);
    const query = e.target.value.trim();

    if (!query) {
      searchResults.innerHTML = '<div class="text-center text-secondary mt-2">Find your friends...</div>';
      return;
    }

    searchResults.innerHTML = `
      <div class="user-result-card">
        <div class="skeleton-header" style="width:100%; padding:0;">
          <div class="skeleton skeleton-avatar"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    `;

    timeoutId = setTimeout(async () => {
      const { status, data } = await fetchAPI(`/users/search?q=${query}`);
      
      if (status === 200 && data.success) {
        const users = data.data;
        if (users.length === 0) {
          searchResults.innerHTML = '<div class="text-center text-secondary mt-2">No users found.</div>';
          return;
        }

        searchResults.innerHTML = users.map(user => `
          <div class="user-result-card">
            <div class="user-info">
              <div class="avatar"></div>
              <div>
                <a href="profile.html?id=${user._id}" style="font-weight:600; font-size:0.95rem;">${user.username}</a>
                <div style="font-size:0.85rem; color:var(--text-secondary);">${user.name}</div>
              </div>
            </div>
            <a href="profile.html?id=${user._id}" class="btn btn-outline" style="width:auto; padding:4px 12px; font-size:0.85rem;">View</a>
          </div>
        `).join('');
      } else {
        searchResults.innerHTML = '<div class="text-center text-secondary mt-2">Error searching users.</div>';
      }
    }, 500); // 500ms debounce
  });
});
