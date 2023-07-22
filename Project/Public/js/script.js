// Function to handle login form submission


const handleLogin = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
  
    // Get form data
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
  
    // Create an object with the form data
    const formData = {
      email,
      password
    };
  
    try {
      // Send a POST request to the backend API for login
      const response = await fetch('/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      // Check if the request was successful
      if (response.ok) {
        const data = await response.json();
        // Handle successful login
        // console.log('abhijjnjfjfnjnandna')
        // console.log('data')
        // console.log(data)
        

        handleSuccessfulLogin(data);
      } else {
        // Handle error response from the backend
        const errorData = await response.json();
        // Display error message to the user
        document.getElementById('errorMessage').textContent = errorData.error;
      }
    } catch (error) {
      // Handle any network or server-side error
      console.error('Error:', error);
      // Display an error message to the user
      document.getElementById('errorMessage').textContent = 'An error occurred. Please try again.';
    }
  };
  
  // Function to handle successful login
  const handleSuccessfulLogin = async (data) => {
    // Store the token in local storage or session storage
    localStorage.setItem('token', data.token);

    document.cookie = `token=${data.token}; path=/;`;
    // Set the token in the Authorization header
    
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${data.token}`);
  
    // Fetch the dashboard page with the Authorization header
    // const response =  await  fetch(`/folders/null`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch data');
    // }
    window.location.href = '/dashboard'
    
  };
  
  
  // Add event listener to the login form submission
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);
  