// //get value from UI popup 

//following codes works but doesn't senitize user input
// try{
//     document.getElementById('save-url').addEventListener('click', () => {
//         const userUrl = document.getElementById('url-input').value;
    
//         if (userUrl) {
//         // Save the URL using Chrome's storage API
//         chrome.storage.sync.set({ customUrl: userUrl }, () => {
//             console.log("URL saved:", userUrl);
//             alert("URL saved successfully!");
//         });
//         } else {
//         alert("Please enter a URL.");
//         }
//     });
// }
// catch (e)
// {
//     console.log("Unable to get data from UI or save it in chrome storage");
//     console.log(e);

// }
  
//check if chrome storage has custom URL if true populate user input in UI 
try{
    chrome.storage.sync.get('customUrl', function(data) {
        detectedUrl = data.customUrl || 'crm.genetec.com'; // Fallback to default if no custom URL is set

        console.log('Detected URL: ', detectedUrl);
        document.getElementById("url-input").value = detectedUrl;
    })
}
catch (e)
{
    console.log("Unable to get customUrl from chrome storage!");
    console.log(e.message);
}

// Regular expression for validating cname.domain.com format

/*

^:                         Start of the string.
([a-zA-Z0-9-]+\.)?:        Optionally match a subdomain, which can consist of alphanumeric characters (a-zA-Z0-9) or hyphens (-), followed by a dot (.).
[a-zA-Z0-9-]+:             Match the main domain name (alphanumeric characters or hyphens).
\.:                        Ensure that the domain name is followed by a dot (.).
[a-zA-Z]{2,}$:             Match the top-level domain (TLD), which consists of at least two alphabetic characters (e.g., .com, .org, .net).
$:                         End of the string.
*/
const urlRegex = /^([a-zA-Z0-9-]+\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

// Function to validate and sanitize the URL input
function sanitizeUrl(inputUrl) {
    try {
        // Step 1: Validate the URL format using the regex
        if (urlRegex.test(inputUrl)) {
            // Step 2: Remove protocol (http:// or https://) if provided
            const url = new URL('https://' + inputUrl); // Add 'https://' to ensure URL object works even if the user omits the protocol
            const hostname = url.hostname.replace(/^www\./, ''); // Optional: remove 'www.' if it exists

            // Step 3: Return only the main domain (e.g., domain.com)
            return hostname;
        } else {
            throw new Error('Invalid URL format');
        }
    } catch (error) {
        // Handle any errors that occur during validation or sanitization
        console.error('Error during URL sanitization:', error);
        return null;
    }
}

// Handle form submit or user input to update storage with sanitized URL
document.getElementById('save-url').addEventListener('click', function () {
    try {
        const userUrl = document.getElementById('url-input').value;
        
        // Sanitize the URL
        const sanitizedUrl = sanitizeUrl(userUrl);

        if (sanitizedUrl) {
            // Save the sanitized URL to chrome storage
            chrome.storage.sync.set({ customUrl: sanitizedUrl }, function () {
                console.log('Sanitized URL saved:', sanitizedUrl);
            });
            alert('URL saved successfully!');
        } else {
            throw new Error('Invalid URL. Please enter a valid URL (e.g., domain.com or www.domain.com).');
        }
    } catch (error) {
        // Handle any errors that occur during the saving process
        console.error('Error while saving the URL:', error);
        alert(error.message); // Show the error message to the user
    }
});
