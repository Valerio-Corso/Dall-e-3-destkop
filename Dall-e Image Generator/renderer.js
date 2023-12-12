const { OpenAI } = require('openai');
const { ipcRenderer } = require('electron');

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
