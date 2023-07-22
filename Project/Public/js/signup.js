
  document.addEventListener('DOMContentLoaded', () => {

    // Function to handle signup form submission
const handleSignup = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
  
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // Create an object with the form data
    const formData = {
      name,
      email,
      password
    };
  
    try {
      // Send a POST request to the backend API for signup
      const response = await fetch('http://localhost:3000/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      // Check if the request was successful
      if (response.ok) {
        const data = await response.json();
        // Handle successful signup
        //document.getElementById('userNamePlaceholder').textContent=name;
        handleSuccessfulSignup(data.token);
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
  
  // Function to handle successful signup
  const handleSuccessfulSignup = (token) => {
    // Store the token in local storage or session storage
    // const headers = {
    //   'Content-Type': 'application/json',
    //   Authorization: `Bearer ${token}` // Include the token in the Authorization header
    // };
    
    localStorage.setItem('token', token);

    // Redirect the user to the dashboard or any other desired page
    console.log('jhjjhh')
    document.cookie = `token=${token}; path=/;`;
    
    window.location.href = '/dashboard';

  };
  
  // Add event listener to the signup form submission
  const signupForm = document.getElementById('signupForm');
  signupForm.addEventListener('submit', handleSignup);
  

 });