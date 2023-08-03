function generateFilePublicLink(token) {
    const publicLink = `http://localhost:3000/file/public/${token}`;
    document.getElementById('publicLink').innerText = publicLink;
    document.getElementById('publicLinkDialog').style.display = 'block';

  }

  function generateFolderPublicLink(token) {
    const publicLink = `http://localhost:3000/folder/public/${token}`;
    document.getElementById('publicLink').innerText = publicLink;
    document.getElementById('publicLinkDialog').style.display = 'block';

  }



  // Function to open the public link dialog
  

  // Function to close the public link dialog
  function closePublicLinkDialog() {
    document.getElementById('publicLinkDialog').style.display = 'none';
  }