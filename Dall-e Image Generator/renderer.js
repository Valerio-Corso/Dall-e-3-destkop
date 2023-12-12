const { OpenAI } = require('openai');
const { ipcRenderer } = require('electron');
const fs = require('fs');

var image;
var mask;

document.getElementById('generate').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value;
    const prompt = document.getElementById('prompt').value;
    // const resolution = document.getElementById('resolution').value;
    const loadingIndicator = document.getElementById('loading');
    const resultImage = document.getElementById('result');

    if (!apiKey) {
        alert("Please enter the API key.");
        return;
    }

    // if (!resolution) {
    //     alert("Please enter the resolution.");
    //     return;
    // }

    loadingIndicator.style.display = 'block'; // Show loading indicator
    resultImage.style.display = 'none'; // Hide previous image if any

    try {
        const openai = new OpenAI({
            apiKey: apiKey, // Use the apiKey variable here
            dangerouslyAllowBrowser: true
        });

        // Correct method to create an image
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024"
        });

        if (response.data && response.data.length > 0) {
            const image_url = response.data[0].url;
            resultImage.src = image_url;
            resultImage.style.display = 'block';
            document.getElementById('save').style.display = 'block'; // Show the save button
        } else {
            console.error('No image data received');
        }
    } catch (error) {
        console.error('Error generating image:', error);
    } finally {
        loadingIndicator.style.display = 'none'; // Hide loading indicator
    }
});

document.getElementById('edit').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value;
    const prompt = document.getElementById('prompt').value;
    // const resolution = document.getElementById('resolution').value;
    const loadingIndicator = document.getElementById('loading');
    const resultImage = document.getElementById('result');

    if (!apiKey) {
        alert("Please enter the API key.");
        return;
    }

    // if (!resolution) {
    //     alert("Please enter the resolution.");
    //     return;
    // }

    loadingIndicator.style.display = 'block'; // Show loading indicator
    resultImage.style.display = 'none'; // Hide previous image if any

    try {
        const openai = new OpenAI({
            apiKey: apiKey, // Use the apiKey variable here
            dangerouslyAllowBrowser: true
        });

        // Correct method to create an image
        const response = await openai.images.edit({
            model: "dall-e-2",
            prompt: prompt,
            image: fs.createReadStream('./corgi.png'),
            mask: fs.createReadStream('./mask.png'),
            n: 1,
            size: "1024x1024"
        });

        if (response.data && response.data.length > 0) {
            const image_url = response.data[0].url;
            resultImage.src = image_url;
            resultImage.style.display = 'block';
            document.getElementById('save').style.display = 'block'; // Show the save button
        } else {
            console.error('No image data received');
        }
    } catch (error) {
        console.error('Error generating image:', error);
    } finally {
        loadingIndicator.style.display = 'none'; // Hide loading indicator
    }
});

document.getElementById('save').addEventListener('click', async () => {
    const resultImage = document.getElementById('result');
    const imageURL = resultImage.src;

    try {
        const { canceled, filePath } = await ipcRenderer.invoke('save-dialog');
        if (!canceled && filePath) {
            // Fetch and save the image
            fetch(imageURL)
                .then(response => response.blob())
                .then(blob => blob.arrayBuffer())
                .then(arrayBuffer => {
                    ipcRenderer.send('write-file', { filePath, buffer: arrayBuffer });
                })
                .catch(error => console.error('Failed to save the image:', error));
        }
    } catch (error) {
        console.error('Failed to show save dialog:', error);
    }
});

function loadImage() {
    const imageInput = document.getElementById('imageInput');
    const imageContainer = document.getElementById('imageContainer');

    const file = imageInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const imageUrl = event.target.result;
            image = imageUrl;

            // Display the image
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = 'Loaded Image';
            imageElement.style.maxWidth = '100%';
            imageContainer.innerHTML = ''; // Clear previous content
            imageContainer.appendChild(imageElement);

            // You can use 'imageUrl' as needed (e.g., send to server, process, etc.)
        };

        reader.readAsDataURL(file);
    } else {
        imageContainer.innerHTML = 'No image selected';
    }
}

// Event listener for image input change
document.getElementById('imageInput').addEventListener('change', loadImage);


function loadMaskImage() {
    const imageInput = document.getElementById('maskImageInput');
    const imageContainer = document.getElementById('maskImageContainer');

    const file = imageInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const imageUrl = event.target.result;
            mask = imageUrl;

            // Display the image
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = 'Loaded Image';
            imageElement.style.maxWidth = '100%';
            imageContainer.innerHTML = ''; // Clear previous content
            imageContainer.appendChild(imageElement);
            console.log(imageUrl);

            // You can use 'imageUrl' as needed (e.g., send to server, process, etc.)
        };

        reader.readAsDataURL(file);
    } else {
        imageContainer.innerHTML = 'No image selected';
    }
}

// Event listener for image input change
document.getElementById('maskImageInput').addEventListener('change', loadMaskImage);

