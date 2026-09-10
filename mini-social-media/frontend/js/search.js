document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  const currentUser = getUser();

  if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (!query) return;

      searchResults.innerHTML = '<div class="text-center mt-2">Searching...</div>';

      try {
        const { status, data } = await fetchAPI(`/users/search?q=${encodeURIComponent(query)}`);
        
        if (status === 200 && data.success) {
          const users = data.data;
          
          if (users.length === 0) {
            searchResults.innerHTML = '<div class="card text-center mt-2">No users found.</div>';
            return;
          }

          searchResults.innerHTML = users.map(user => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div class="user-info">
                <div class="avatar"></div>
                <div class="user-names">
                  <h4>${user.name}</h4>
                  <span>@${user.username}</span>
                </div>
              </div>
              <a href="profile.html?id=${user._id}" class="btn btn-outline">View Profile</a>
            </div>
          `).join('');
        }
      } catch (err) {
        searchResults.innerHTML = '<div class="alert alert-error mt-2">Error searching users.</div>';
      }
    });
  }
});
