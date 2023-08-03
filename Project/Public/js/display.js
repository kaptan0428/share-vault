// // Function to fetch and display folders and files


async function fetchFiles(parentFolderId) {
    try {
      const token = localStorage.getItem('token'); // Get the bearer token from local storage
  
      const response = await fetch('/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the bearer token in the request headers
        },
        body: JSON.stringify({ folderId: parentFolderId }),
      });
      const data = await response.json();
      return data.files;
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  }
  

// async function fetchFoldersAndFiles(parentId, targetList) {
//     try {
//       // Fetch folders and files from the server
//         const token = localStorage.getItem('token')
      
//       let parentFolderId = null;
//       if (parentId) {
//         parentFolderId = parentId;
//       }
//       //else {parentFolderId=localStorage.getItem('currentFolder')}
//       console.log(parentFolderId)
//       const response = await fetch('/folders/subfolders', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`

//         },
//         body: JSON.stringify({ parentFolderId })
//       });
      
//       const data = await response.json();
  
//       // Clear existing list
//       targetList.innerHTML = '';

  
//       // Display folders
//       data.folders.forEach(folder => {
//         const folderItem = document.createElement('li');
//         folderItem.innerHTML = `${folder.name} <button onclick="deleteFolder('${folder._id}')">Delete</button>`;
//         targetList.appendChild(folderItem);
  
//         // Check if the folder has subfolders
//         if (folder.subfolders.length > 0) {
//           const nestedList = document.createElement('ul');
//           folderItem.appendChild(nestedList);
  
//           // Add click event listener to folder items
//           folderItem.addEventListener('click', () => {

//             fetchFoldersAndFiles(folder._id, nestedList);
//           });
//         }
//       });
  
//       // Display files
//       const files = await fetchFiles(parentId);
//       const fileList = document.getElementById('fileList')
//       fileList.innerHTML = ''
//       files.forEach(file => {
        
//         const fileItem = document.createElement('li');
//         fileItem.innerHTML = `${file.filename} <button onclick="deleteFile('${file._id}')">Delete</button>`;
//         fileList.appendChild(fileItem);
//       });
//     } catch (error) {
//       console.error('Error fetching folders and files:', error);
//     }
//   }
  
  //Function to delete a folder
  async function deleteFolder(folderId) {
    try {
        console.log('bharrrr')
      // Send a DELETE request to delete the folder
      const response = await fetch(`/folders/${folderId}`, { method: 'DELETE' });
      const data = await response.json();
      console.log(data); // Handle success or error response
      // Refresh the folder and file lists
      location.reload();
    } catch (error) {
      console.error('Error deleting folder:', error);
    } 
  }
  
  // Function to delete a file
  async function deleteFile(fileId) {
    try {
      // Send a DELETE request to delete the file
      const response = await fetch(`/files/${fileId}`, { method: 'DELETE' });
      const data = await response.json();
      console.log(data); // Handle success or error response
      // Refresh the folder and file lists
      location.reload()
      //fetchFiles(null);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  
  // Recursive function to handle folder clicks
  // function handleFolderClick(event) {
  //   const folderId = event.target.dataset.folderId;
  //   const targetList = event.target.querySelector('ul');
  
  //   if (targetList) {
  //     // Target list exists, fetch and display subfolders and files
  //     fetchFoldersAndFiles(folderId, targetList);
  //   } else {
  //     // Target list doesn't exist, do nothing
  //   }
  // }
  
  // Attach event listener to top-level folder items
  // const folderItems = document.querySelectorAll('#folderList > li');
  // folderItems.forEach(item => {
  //   item.addEventListener('click', handleFolderClick);
  // });
  
  // Fetch and display root-level folders and files on page load
  // document.addEventListener('DOMContentLoaded', () => {
  //   fetchFoldersAndFiles(null, document.getElementById('folderList'));
  // });

  document.addEventListener('DOMContentLoaded', () => {
    addClickEventListeners();
  });


// jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj

// Function to navigate to the server-rendered folder page
function navigateToFolderPage(folderId) {
  console.log(folderId)  
  window.location.href = `/folder/${folderId}`;
}
 
// Recursive function to handle folder clicks
function handleFolderClick(folderItem) {
  const folderId = folderItem.getAttribute('id');;
  navigateToFolderPage(folderId);
}

// Function to add click event listeners to folder items
async function addClickEventListeners() {

  let folderId=null;

  await fetch(`/folder/${folderId}`);
  
  //const response

  const folderItems = document.querySelectorAll('.folderitem');

  
  folderItems.forEach(folderItem => {
    folderItem.addEventListener('click', () => {
      handleFolderClick(folderItem);

    });
  });
}



 function restoreFolder(folderId){

  const token = localStorage.getItem('token');
  console.log(token)
  console.log(folderId)
  fetch(`/folders/restore/${folderId}` , {
    method : 'POST',
    headers : {
      'Authorization' : `Bearer ${token}`
    }
  }) .then((response) => response.json())
  .then((data)=>{
    console.log(data.message);
    location.reload()
  })
  .catch(error => {
    alert('Error moving folder to Recycle Bin:', error);
    
  });

}

function restoreFile(fileId){

  const token = localStorage.getItem('token');
  console.log(token)
  console.log(fileId)
  fetch(`/files/restore/${fileId}` , {
    method : 'POST',
    headers : {
      'Authorization' : `Bearer ${token}`
    }
  }) .then((response) => response.json())
  .then((data)=>{
    console.log(data.message);
    location.reload()
  })
  .catch(error => {
    alert('Error moving folder to Recycle Bin:', error);
    
  });

}









  