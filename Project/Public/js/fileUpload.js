// Add event listener to the form submission


const uploadButton = document.getElementById('uploadButton');
uploadButton.addEventListener('click', handleUpload);



// Add event listener to the file input field


// Function to handle form submission
  function handleUpload(event) {
    event.preventDefault(); // Prevent default form submission behavior
  console.log('fjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj')
    // Get the selected file from the input field
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    //const file = event.target.files[0];
    const url = window.location.href;
    console.log(url)
    let folderId = url.split('/').pop();
    if(folderId === "undefined" || folderId === "null" ||  folderId === "dashboard")
      folderId = null

    // Create a FormData object to send the file data in the request
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId" , folderId)

    
    console.log(folderId)
    console.log(formData)
    // Send a POST request to the server with the file data
    fetch('/files/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response from the server after successful upload
        console.log('File uploaded:', data);
        location.reload()
        // Perform any additional actions as needed
      })
      .catch(error => {
        // Handle any errors that occurred during the upload process
        console.error('Error uploading file:', error);
      });
  }
