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
  
  function unshareUser(usermail) {
    const itemId = window.location.href.split('/').pop();
    const token = localStorage.getItem('token');
    const parts = window.location.href.split("/");
    const key = parts[parts.length - 3];
    let url;
    console.log(key)
    if(key==='file')
    url = '/file/unshare';
    else if(key==='folder')
    url = '/folder/unshare'

    console.log(url)
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ itemId , email: usermail }),
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        location.reload();
      })
      .catch(error => {
        console.error('Error unsharing item:', error);
        alert('Failed to unshare item. Please try again.');
      });
  }
  
  
  