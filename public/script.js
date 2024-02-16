function uploadPhoto() {
    const photoInput = document.getElementById('photoInput');
    const photoFile = photoInput.files[0];

    if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);

        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.text())
        .then(message => {
            alert(message);
            location.reload();
        })
        .catch(error => {
            console.error('Error uploading photo:', error);
            alert('Error uploading photo. Please try again.');
        });
    } else {
        alert('Please choose a photo to upload.');
    }
}
