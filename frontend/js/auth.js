function postForm(url, data) {
  return fetch(url, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data) 
  }).then(async response => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    if (!data.success) {
      throw new Error(data.message || 'Operation failed');
    }
    return data;
  });
}

function showError(formId, message) {
  const errorDiv = document.getElementById(formId + 'Error');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

function hideError(formId) {
  const errorDiv = document.getElementById(formId + 'Error');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError('login');
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      try {
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        const form = new FormData(loginForm);
        const payload = { email: form.get('email'), password: form.get('password') };
        const res = await postForm('/MacroMunch/backend/login.php', payload);
        
        if (res.success) {
          window.location.href = '/MacroMunch/frontend/index.html';
        } else {
          showError('login', res.message || 'Login failed');
        }
      } catch (error) {
        showError('login', error.message || 'Login failed');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError('register');
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      try {
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;
        
        const form = new FormData(registerForm);
        const payload = {
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password')
        };
        
        const res = await postForm('/MacroMunch/backend/register.php', payload);
        if (res.success) {
          window.location.href = '/MacroMunch/frontend/login.html';
        } else {
          showError('register', res.message || 'Registration failed');
        }
      } catch (error) {
        showError('register', error.message || 'Registration failed');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});


