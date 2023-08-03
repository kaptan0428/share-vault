// Get references to the buttons
const logoutButton = document.getElementById('logoutButton');
const logoutAllButton = document.getElementById('logoutAllButton');
const profileButton = document.getElementById('profileButton')
const folderButton = document.getElementById('createFolderButton')
const sharedButton = document.getElementById('sharedButton')
const binButton = document.getElementById('recycleBinButton') 

// Add event listeners to the buttons
logoutButton.addEventListener('click', handleLogoutClick);
logoutAllButton.addEventListener('click', handleLogoutAllClick);
profileButton.addEventListener('click', handleProfileClick);
folderButton.addEventListener('click',createFolder)
sharedButton.addEventListener('click',getSharedItems)
binButton.addEventListener('click', getRecycleBin)

// Event handler for logout button
function handleLogoutClick() {
  // Get the JWT token from wherever it is stored (e.g., local storage, cookies)
  const token = localStorage.getItem('token'); 

  // Make a POST request to the server for logout
  fetch('/users/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` // Include the JWT token in the request headers
    },
    
  })
    .then(response => {
      if (response.ok) {
        // Logout successful, perform further actions (e.g., redirect)
        console.log('Logout successful');
        window.location.href = '/'
        // Add your code here to handle successful logout
      } else {
        // Logout failed, handle the error
        console.error('Logout failed');
        // Add your code here to handle failed logout
      }
    })
    .catch(error => {
      console.error('Logout error:', error);
      // Add your code here to handle logout error
    });
}

// Event handler for logout all button
function handleLogoutAllClick() {
  // Get the JWT token from wherever it is stored (e.g., local storage, cookies)
  const token = localStorage.getItem('token'); // Replace with the actual method to retrieve the token

  // Make a POST request to the server for logout all
  fetch('/users/logoutAll', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` // Include the JWT token in the request headers
    },
   
  })
    .then(response => {
      if (response.ok) {
        // Logout all successful, perform further actions (e.g., redirect)
        console.log('Logout all successful');
        window.location.href = '/'
        // Add your code here to handle successful logout all
      } else {
        // Logout all failed, handle the error
        console.error('Logout all failed');
        // Add your code here to handle failed logout all
      }
    })
    .catch(error => {
      console.error('Logout all error:', error);
      // Add your code here to handle logout all error
    });
}


// Event handler for profile button
function handleProfileClick() {

  const token = localStorage.getItem('token'); 
    // Make a GET request to the server for user profile
    fetch('/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}` // Include the JWT token in the request headers
      },
      credentials: 'same-origin' // Include this line if using sessions or cookies
    })
      .then(response => {
        if (response.ok) {

        
          // Profile request successful, handle the response
          return response.json();
        } else {
          // Profile request failed, handle the error
          console.error('Profile request failed');
          // Add your code here to handle failed profile request
        }
      })
      .then(data => {
        // Handle the profile data
        console.log('Profile data:', data);
        // Display the profile data in the UI
        displayProfileData(data);
      })
      .catch(error => {
        console.error('Profile request error:', error);
        // Add your code here to handle profile request error
      });
  }
  
  // Function to display the profile data in the UI
  function displayProfileData(profileData) {
    // Assuming you have an element with the ID "profileContainer" in your HTML
    const profileContainer = document.getElementById('profileContainer');
  
    // Clear any previous content
    profileContainer.innerHTML = '';
  
    // Create HTML elements to display the profile data
    const nameElement = document.createElement('p');
    nameElement.textContent = `Name: ${profileData.name}`;
  
    const emailElement = document.createElement('p');
    emailElement.textContent = `Email: ${profileData.email}`;
  
    // Append the elements to the profile container
    profileContainer.appendChild(nameElement);
    profileContainer.appendChild(emailElement);
  }



  // Function to handle the creation of a folder
function createFolder() {
  // Prompt the user to enter the folder name
  const folderName = prompt("Enter the folder name:");


  // Check if the user entered a folder name
  if (folderName) {
    // Get the parent folder ID from the input field or any other way you're collecting it
    const currentURL = window.location.href;

    let parentFolderId=null
  
   if(currentURL.includes('http://localhost:3000/dashboard'))
  {
    parentFolderId=null;

  }
  else
  {
     const url = window.location.href;

    // Extract the user ID from the URL
    parentFolderId = url.split('/').pop();
  }
   

    // Retrieve the bearer token from the local storage
    const token = localStorage.getItem('token');

    // Prepare the data for the API request
    const data = {
      name: folderName,
      parentFolder: parentFolderId
    };

    // Send the API request to create the folder
    fetch('/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Folder created:', data.folder);
        console.log(data.folder.parentFolder)
        location.reload()               
        //addClickEventListeners()
        // Perform any necessary actions after folder creation, such as updating the UI or refreshing the folder list
      })
      .catch(error => {
        console.error('Error creating folder:', error);
        // Handle the error scenario, such as displaying an error message to the user
      });
  }
}




// client/js/share.js
function shareItem(itemID) {
  console.log(itemID)
  const email = prompt('Enter the email ID of the user you want to share with:');
  if (!email) return; // User canceled the prompt

  const token = localStorage.getItem('token');

  // Send the sharing request to the server
  fetch('/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
      
    },
    body: JSON.stringify({ fileId: itemID, email }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message); // Show a success message to the user
    })
    .catch((error) => {
      console.error('Error sharing item:', error);
      alert('Failed to share item. Please try again.');
    });
}

function shareFolder(itemID) {
  console.log(itemID)
  const email = prompt('Enter the email ID of the user you want to share with:');
  if (!email) return; // User canceled the prompt

  const token = localStorage.getItem('token');

  // Send the sharing request to the server
  fetch('/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ folderId: itemID, email }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      if(data.message)
      alert(data.message);
      else
      alert(data.error)
    })
    .catch((error) => {
      console.log('hdhdhdhd ')
      console.error('Error sharing item:', error);
      alert('Failed to share item. Please try again.');
    });
}


function getSharedItems(){

  window.location.href = '/users/shared'  
}

function fileSharedUsers(fileId)
{
  window.location.href = `/file/sharedUsers/${fileId}`;
}

function folderSharedUsers(folderId)
{
  window.location.href = `/folder/sharedUsers/${folderId}`;

}

function unshareUser(folderId,usermail)
{
  fetch('/folders/unshare',{
    method : 'POST',
    headers : {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
      
    },
    body : {
      folderId,
      mail : usermail

    }
  })
  .then((response) =>{response.json})
  .then((data) => {
    alert(data.message); 
  })
  .catch((error) => {
    console.error('Error sharing item:', error);
    alert('Failed to share item. Please try again.');
  });
}



function moveFolderToBin(folderId)
{
  const token = localStorage.getItem('token')
  fetch(`/folder/moveToBin/${folderId}` , {
    method : 'GET',
    headers : {
      'Content-Type': 'application/json',
      'Authorization' : `Bearer ${token}`
    }
  })
  .then(data => {
    console.log(data.message);
    
  })
  .catch(error => {
    console.error('Error moving folder to Recycle Bin:', error);
    
  });
}
function moveFileToBin(fileId)
{
  const token = localStorage.getItem('token')
  fetch(`/file/moveToBin/${fileId}` , {
    method : 'GET',
    headers : {
      'Content-Type': 'application/json',
      'Authorization' : `Bearer ${token}`
    }
  })
  .then(data => {
    console.log(data.message);
    
  })
  .catch(error => {
    console.error('Error moving folder to Recycle Bin:', error);
    
  });
}

function getRecycleBin(){

  window.location.href = '/recycleBin';
}






  