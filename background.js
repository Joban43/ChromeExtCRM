console.log("Hello there!");
console.log("Hope you know what you are doing...")

//Detecting CRM.genetec.com 
//working: tested
// chrome.webNavigation.onCompleted.addListener((details) =>
// {
//     const siteName = details.url;
//     if (siteName.includes("krebsonsecurity.com"))
//     {   console.log(siteName);

//     }
    
// });
let detectedUrl = 'crm.genetec.com';

try{
    chrome.storage.sync.get('customUrl', function(data) {
        detectedUrl = data.customUrl || 'crm.genetec.com'; // Fallback to default if no custom URL is set

        console.log('Detected URL: ', detectedUrl);
    })
}
catch (e)
{
    console.log("Unable to get customUrl from chrome storage!");
    console.log(e.message);
}


chrome.downloads.onCreated.addListener((downloadItem) => {
    console.log("Download started with ID:", downloadItem.id);
  
    chrome.downloads.onChanged.addListener((delta) => {
      if (delta.id === downloadItem.id && delta.filename) {
        const filename = delta.filename.current;
        console.log("Filename assigned:", filename);

        // Use a regular expression to match filenames like azure.txt, azure(1).txt, etc.
        const azureFilePattern = /.*azure.*\.txt'?$/i;
  
        // Check if the filename ends with .azure.txt and URL contains the specified domain
        if (azureFilePattern.test(filename) && downloadItem.url.includes(detectedUrl)) {
          console.log("Detected .azure.txt file from" + detectedUrl + ":", filename);
  
          // Cancel the download
          chrome.downloads.cancel(downloadItem.id, () => {
            console.log("Download canceled for .azure.txt file:", filename);
  
            // Attempt to fetch the .azure.txt file content to extract the URL
            fetch(downloadItem.url)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.text();
              })
              .then(text => {
                try {
                  // Parse the JSON content of the .azure.txt file
                  const jsonData = JSON.parse(text);
                  console.log(jsonData);
                  const actualFileUrl = jsonData.Url;
  
                  if (actualFileUrl) {
                    console.log("Extracted URL from .azure.txt:", actualFileUrl);
  
                    // Download the actual file
                    chrome.downloads.download({ url: actualFileUrl }, (downloadId) => {
                      console.log("Started download for actual file with ID:", downloadId);
                      
                    });
                  } else {
                    console.error("No URL found in the JSON data.");
                  }
                } catch (error) {
                  console.error("Error parsing JSON content:", error);
                }
              })
              .catch(error => {
                console.error("Failed to fetch or process .azure.txt file:", error);
              });
          });
        } else {
          console.log("File did not meet the criteria for processing.");
        }
      }
    });
  });
  